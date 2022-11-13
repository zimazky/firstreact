import LogLoader from "../LogLoader"
import ArduinoLogAPI from "../arduinoLogAPI"
import { HydroDataSet, HydroEventData, HydroEventParser } from "./HydroEventParser"
import { ILogController, TimeInterval } from "../ILogController"
import { TickerEventParser } from "../LLogController/TickerEventParser"
import DateTime from "../../utils/datetime"
import IrregularDataset from "../../utils/IrregularDS"

export class HydroSensorData implements ILogController<HydroEventData> {
  id: number
  ext: string
  logLoader: LogLoader
  color: string
  isShowPower: boolean
  timeslots: HydroDataSet[]
  begin: number
  end: number

  constructor(id: number, parent: ArduinoLogAPI, color: string, begin: number, end: number) {
    this.id = id
    this.ext = 'H'+id
    this.logLoader = parent.logLoader
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
    this.logLoader.getLogByTimestamp(this.ext, timestamp, text=>{
      this.parseHydroLogData(text, timestamp)
    }, ()=>{
      if(this.timeslots[timestamp] === undefined) this.timeslots[timestamp] = null
    })
	}

  getRegData(timeinterval: TimeInterval, tstep: number, load: (t:number)=>void) {
		const a = IrregularDataset.createzdata(timeinterval, tstep)

		for(let t=DateTime.getBeginDayTimestamp(timeinterval.begin); t<timeinterval.end; t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') load(t)
			else if(this.timeslots[t] !== null) {
          this.timeslots[t].pressure.fillzdata(timeinterval, tstep, a)
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

