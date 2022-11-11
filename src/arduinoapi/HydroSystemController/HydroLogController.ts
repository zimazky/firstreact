import ArduinoLogLoader from "../arduinoLogLoader"
import ArduinoLogAPI from "../arduinoLogAPI"
import { HydroDataSet, HydroEventParser } from "./HydroEventParser"
import { TimeInterval } from "../ILogController"
import { TickerEventParser } from "../Ticker/TickerEventParser"

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

export class HydroSensorData {
  id: number
  ext: string
  controller: ArduinoLogLoader
  timezone: number
  onload: (t?: string)=>void
  color: string
  isShowPower: boolean
  timeslots: HydroDataSet[]


  constructor(id: number, parent: ArduinoLogAPI, color: string) {
    this.id = id
    this.ext = 'H'+id
    this.controller = parent.logLoader
    this.timezone = parent.timezone
    this.color = color
    this.onload = parent.onload
    this.timeslots = []
  }

  load(timestamp: number) {
    this.controller.getLogByTimestamp(this.ext, timestamp, text=>{
      this.timeslots[timestamp] = parseHydroLogData(text, timestamp)
    }, ()=>{
      this.timeslots[timestamp] = new HydroDataSet(timestamp)
    }, ()=>{
      this.onload()
    })
	}

  getRegData(timeinterval: TimeInterval, tstep: number) {
		let a = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.zdata.push({flag:0})
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin,this.timezone);t<timeinterval.end;t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') this.load(t)
			else /*if(this.timeslots[t].flag != 0)*/ {
          a = this.timeslots[t]?.pressure?.fillzdata(timeinterval,tstep,a)
			}
		}
		return a
	}
}

function parseHydroLogData(textdata: string, timestamp: number): HydroDataSet {

  const strings = textdata.split('\n')
  const T = new TickerEventParser()
  const H0 = new HydroEventParser()
  const dataHolder = H0.createLogDataSet(timestamp)
  if(!textdata) return dataHolder

  strings.forEach(string => {
    const event = string.split(';')
    if(event.length <= 2) return
    const time = T.parseEventOld(event)
    if(time == 0) return
    const data = H0.parseEventOld(event)
    dataHolder.push(data, time)
  })
  return dataHolder;
}
