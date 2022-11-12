import ArduinoLogLoader from "../arduinoLogLoader"
import ArduinoLogAPI from "../arduinoLogAPI"
import { HydroDataSet, HydroEventData, HydroEventParser } from "./HydroEventParser"
import { ILogController, TimeInterval } from "../ILogController"
import { TickerEventParser } from "../LLogController/TickerEventParser"

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

export class HydroSensorData implements ILogController<HydroEventData> {
  id: number
  ext: string
  controller: ArduinoLogLoader
  timezone: number
  color: string
  isShowPower: boolean
  timeslots: HydroDataSet[]
  begin: number
  end: number

  constructor(id: number, parent: ArduinoLogAPI, color: string, begin: number, end: number) {
    this.id = id
    this.ext = 'H'+id
    this.controller = parent.logLoader
    this.timezone = parent.timezone
    this.color = color
    this.timeslots = []
    this.begin = begin
    this.end = end
  }

  createEventParser(): HydroEventParser {
    return new HydroEventParser()
  }

  getDataSet(timestamp: number): HydroDataSet {
    if(this.timeslots[timestamp] === undefined) this.timeslots[timestamp] = new HydroDataSet(timestamp)
    return this.timeslots[timestamp]
  }

  createDataSet(timestamp: number): HydroDataSet {
    if(this.timeslots[timestamp] !== undefined) return null
    this.timeslots[timestamp] = new HydroDataSet(timestamp)
    return this.timeslots[timestamp]
  }

  getParser(timestamp: number) {
    return { name: this.ext, parser: this.createEventParser(), dataset: this.getDataSet(timestamp)} 
  }

  load(timestamp: number) {
    if(timestamp<this.begin || timestamp>this.end || this.timeslots[timestamp] !== undefined) return
    this.controller.getLogByTimestamp(this.ext, timestamp, text=>{
      this.parseHydroLogData(text, timestamp)
    }, ()=>{
      if(this.timeslots[timestamp] === undefined) this.timeslots[timestamp] = null
    })
	}

  getRegData(timeinterval: TimeInterval, tstep: number, load: (t:number)=>void) {
		let a = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.zdata.push({flag:0})
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin,this.timezone);t<timeinterval.end;t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') load(t)
			else if(this.timeslots[t] !== null) {
          a = this.timeslots[t].pressure.fillzdata(timeinterval,tstep,a)
			}
		}
		return a
	}

  parseHydroLogData(textdata: string, timestamp: number) {

    const strings = textdata.split('\n')
    const T = new TickerEventParser()
    const H0 = new HydroEventParser()
    const dataset = this.createDataSet(timestamp)
    if(dataset===null) return
    if(!textdata) return
  
    strings.forEach(string => {
      const event = string.split(';')
      if(event.length <= 2) return
      const time = T.parseEventOld(event)
      if(time == 0) return
      const data = H0.parseEventOld(event)
      dataset.push(data, time)
    })
  }
  
}

