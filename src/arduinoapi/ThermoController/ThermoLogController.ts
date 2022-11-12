import ArduinoLogLoader from "../arduinoLogLoader"
import ArduinoLogAPI from "../arduinoLogAPI"
import { ILogController, TimeInterval } from "../ILogController"
import { TickerEventParser } from "../LLogController/TickerEventParser"
import { ThermoDataSet, ThermoEventData, ThermoEventParser } from "./ThermoEventParser"

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

export class ThermalSensorData implements ILogController<ThermoEventData> {
  id: number
  ext: string
  controller: ArduinoLogLoader
  timezone: number
  onload: (t?: string)=>void
  colors: {t:string, h: string, p: string}
  isShowPower: boolean
  timeslots: ThermoDataSet[]
  begin: number
  end: number
  
  static DATASET_NAMES = ['Temperature', 'Humidity', 'Power']

  constructor(id: number, parent: ArduinoLogAPI, [tcolor,hcolor,pcolor], begin: number, end: number) {
    this.id = id
    this.ext = 'Z'+id
    this.controller = parent.logLoader
    this.timezone = parent.timezone
    this.colors = {t:tcolor,h:hcolor,p:pcolor}
    this.isShowPower = false
    this.timeslots = []
    this.begin = begin
    this.end = end
  }
  
  createEventParser(): ThermoEventParser {
    return new ThermoEventParser()
  }

  getDataSet(timestamp: number): ThermoDataSet {
    if(this.timeslots[timestamp] === undefined) this.timeslots[timestamp] = new ThermoDataSet(timestamp)
    return this.timeslots[timestamp]
  }

  createDataSet(timestamp: number): ThermoDataSet {
    if(this.timeslots[timestamp] !== undefined) return null
    this.timeslots[timestamp] = new ThermoDataSet(timestamp)
    return this.timeslots[timestamp]
  }

  getParser(timestamp: number) {
    return { name: this.ext, parser: this.createEventParser(), dataset: this.getDataSet(timestamp) } 
  }


  load(timestamp: number) {
    if(timestamp<this.begin || timestamp>this.end || this.timeslots[timestamp] !== undefined) return
    this.controller.getLogByTimestamp(this.ext, timestamp, text=>{
      this.parseThermoLogData(text, timestamp)
    }, ()=>{
      if(this.timeslots[timestamp] === undefined) this.timeslots[timestamp] = null
    })
	}

  getRegData(timeinterval: TimeInterval, tstep: number, load: (t:number)=>void) {
		let a = ThermalSensorData.DATASET_NAMES.map(()=>({zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}))
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.forEach(d=>d.zdata.push({flag:0}))
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin, this.timezone); t<timeinterval.end; t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') load(t)
			else if(this.timeslots[t] !== null) {
          a[0] = this.timeslots[t].temperature.fillzdata(timeinterval,tstep,a[0])
          a[1] = this.timeslots[t].humidity.fillzdata(timeinterval,tstep,a[1])
          a[2] = this.timeslots[t].power.fillzdata(timeinterval,tstep,a[2])
			}
		}      
		return a
	}

  parseThermoLogData(textdata: string, timestamp: number) {
   
    const strings = textdata.split('\n')
    const T = new TickerEventParser()
    const Z = new ThermoEventParser()
    const dataset = this.createDataSet(timestamp)
    if(dataset === null) return
    if(!textdata) return
  
    strings.forEach(string => {
      const event = string.split(';')
      if(event.length <= 2) return
      const time = T.parseEventOld(event)
      if(time == 0) return
      const data = Z.parseEventOld(event)
      dataset.push(data, time)
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    const data = Z.getLastData()
    const time = T.getLastTime()
    dataset.push(data, time)
  }
}

