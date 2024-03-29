import LogLoader from "../LogLoader"
import ArduinoLogAPI from "../arduinoLogAPI"
import { ILogController, TimeInterval } from "../ILogController"
import { TickerEventParser } from "../LLogController/TickerEventParser"
import { ThermoDataSet, ThermoEventData, ThermoEventParser } from "./ThermoEventParser"
import DateTime from "../../utils/datetime"
import IrregularDataset from "../../utils/IrregularDS"

export class ThermalSensorData implements ILogController<ThermoEventData> {
  id: number
  ext: string
  logLoader: LogLoader
  colors: {t: string, h: string, p: string}
  isShowPower: boolean
  timeslots: ThermoDataSet[]
  begin: number
  end: number
  
  static DATASET_NAMES = ['Temperature', 'Humidity', 'Power']

  constructor(id: number, parent: ArduinoLogAPI, [tcolor,hcolor,pcolor], begin: number, end: number) {
    this.id = id
    this.ext = 'Z'+id
    this.logLoader = parent.logLoader
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
    this.logLoader.getLogByTimestamp(this.ext, timestamp, text=>{
      this.parseThermoLogData(text, timestamp)
    }, ()=>{
      if(this.timeslots[timestamp] === undefined) this.timeslots[timestamp] = null
    })
	}

  getRegData(timeinterval: TimeInterval, tstep: number, load: (t:number)=>void) {
		const a = ThermalSensorData.DATASET_NAMES.map(()=>
      IrregularDataset.createzdata(timeinterval, tstep))
		
		for(let t=DateTime.getBeginDayTimestamp(timeinterval.begin); t<timeinterval.end; t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') load(t)
			else if(this.timeslots[t] !== null) {
        this.timeslots[t].temperature.fillzdata(timeinterval, tstep, a[0])
        this.timeslots[t].humidity.fillzdata(timeinterval, tstep, a[1])
        this.timeslots[t].power.fillzdata(timeinterval, tstep, a[2])
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
      if(time === 0) return
      const data = Z.parseEventOld(event)
      dataset.push(data, time)
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    const data = Z.getLastData()
    const time = T.getLastTime()
    dataset.push(data, time)
  }
}

