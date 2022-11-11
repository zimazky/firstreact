import ArduinoLogLoader from "../arduinoLogLoader"
import ArduinoLogAPI from "../arduinoLogAPI"
import { TimeInterval } from "../ILogController"
import { TickerEventParser } from "../Ticker/TickerEventParser"
import { ThermoDataSet, ThermoEventParser } from "./ThermoEventParser"

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

export class ThermalSensorData {
  id: number
  ext: string
  controller: ArduinoLogLoader
  timezone: number
  onload: (t?: string)=>void
  colors: {t:string, h: string, p: string}
  isShowPower: boolean
  timeslots: ThermoDataSet[]
  
  static DATASET_NAMES = ['Temperature', 'Humidity', 'Power']

  constructor(id: number, parent: ArduinoLogAPI, [tcolor,hcolor,pcolor]) {
    this.id = id
    this.ext = 'Z'+id
    this.controller = parent.logLoader
    this.timezone = parent.timezone
    this.onload = parent.onload
    this.colors = {t:tcolor,h:hcolor,p:pcolor}
    this.isShowPower = false
    this.timeslots = []
  }
  
  load(timestamp: number) {
    this.controller.getLogByTimestamp(this.ext, timestamp, text=>{
      this.timeslots[timestamp] = parseThermoLogData(text, timestamp)
    }, ()=>{
      this.timeslots[timestamp] = new ThermoDataSet(timestamp)
    }, ()=>{
      this.onload()
    })
	}

  getRegData(timeinterval: TimeInterval, tstep: number) {
		let a = ThermalSensorData.DATASET_NAMES.map(()=>({zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}))
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.forEach(d=>d.zdata.push({flag:0}))
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin, this.timezone); t<timeinterval.end; t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') this.load(t)
			else /*if(this.timeslots[t].length)*/ {
          a[0] = this.timeslots[t]?.temperature?.fillzdata(timeinterval,tstep,a[0])
          a[1] = this.timeslots[t]?.humidity?.fillzdata(timeinterval,tstep,a[1])
          a[2] = this.timeslots[t]?.power?.fillzdata(timeinterval,tstep,a[2])
			}
		}      
		return a
	}
}

function parseThermoLogData(textdata: string, timestamp: number): ThermoDataSet {
   
  const strings = textdata.split('\n')
  const T = new TickerEventParser()
  const Z = new ThermoEventParser()
  const dataHolder = Z.createLogDataSet(timestamp)
  if(!textdata) return dataHolder

  strings.forEach(string => {
    const event = string.split(';')
    if(event.length <= 2) return
    const time = T.parseEventOld(event)
    if(time == 0) return
    const data = Z.parseEventOld(event)
    dataHolder.push(data, time)
  })
  // добавляем завершающие данные (на случай, если не было изменений в конце дня)
  const data = Z.getLastData()
  const time = T.getLastTime()
  dataHolder.push(data, time)
  return dataHolder
}
