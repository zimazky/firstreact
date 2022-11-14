import ArduinoLogAPI from "../arduinoLogAPI"
import LogLoader from "../LogLoader"
import { HydroSensorData } from "../HydroSystemController/HydroLogController"
import { ILogController } from "../ILogController"
import { ThermalSensorData } from "../ThermoController/ThermoLogController"
import { TickerDataSet, TickerEventData, TickerEventParser } from "./TickerEventParser"

export class LLogController implements ILogController<TickerEventData> {
  id = 0
  ext = 'L'
  begin: number
  end: number
  timeslots: TickerDataSet[]
  logLoader: LogLoader
  thermoSensors: ThermalSensorData[]
  hydroSensors: HydroSensorData[]

  constructor(parent: ArduinoLogAPI, begin: number, end: number) {
    this.logLoader = parent.logLoader
    this.timeslots = []
    this.begin = begin
    this.end = end
    this.thermoSensors = parent.thermoSensors
    this.hydroSensors = parent.hydroSensors
  }

  createEventParser(): TickerEventParser {
    return new TickerEventParser()
  }

  getDataSet(timestamp: number): TickerDataSet {
    if(this.timeslots[timestamp] === undefined) this.timeslots[timestamp] = new TickerDataSet(timestamp)
    return this.timeslots[timestamp]
  }

  createDataSet(timestamp: number): TickerDataSet {
    if(this.timeslots[timestamp] !== undefined) return null
    this.timeslots[timestamp] = new TickerDataSet(timestamp)
    return this.timeslots[timestamp]
  }

  getParser(timestamp: number) {
    return { name: this.ext, parser: this.createEventParser(), dataset: this.getDataSet(timestamp)} 
  }


  load = (timestamp:number)=>{
    if(timestamp>=this.begin && timestamp<=this.end) {
      this.logLoader.getLogByTimestamp(this.ext, timestamp, text=>{
        this.parseLogData(text, timestamp)
      })
    }
    else {
      this.thermoSensors.forEach(t=>t.load(timestamp))
      this.hydroSensors.forEach(t=>t.load(timestamp))
    }
    //console.log(this.thermoSensors)
    //console.log(this.hydroSensors)
  }


  /**
   * Парсинг лога нового формата
   * @param textdata 
   * @param timestamp 
   * @returns 
   */
  parseLogData(textdata: string, timestamp: number ) {
  
    const Z = this.thermoSensors.map(t=>t.getParser(timestamp))
    const H = this.hydroSensors.map(t=>t.getParser(timestamp))
    const T = {name: 'T', parser: new TickerEventParser()}

    if(!textdata) return

    const strings = textdata.split('\n')
    let isFull = false
    strings.forEach(string => {
      if(string.startsWith('F')) { isFull = true; return }
      let events = string.split(';')
      const tindex = events.findIndex(e=>e.startsWith('T'))
      if(tindex<0) return // не найден блок данных тикера
      const [_, tdata] = T.parser.parseEvent(events.slice(tindex),isFull)

      events = events.slice(0,tindex)
      while(events.length > 0) {
        const id = events[0]
        const z = Z.find(t=>id.startsWith(t.name))
        if(z!==undefined) {
          const [nextevents, data] = z.parser.parseEvent(events, isFull)
          z.dataset.push(data, tdata.time)
          events = nextevents
          continue
        }
        const h = H.find(t=>id.startsWith(t.name))
        if(h!==undefined) {
          const [nextevents, data] = h.parser.parseEvent(events, isFull)
          h.dataset.push(data, tdata.time)
          events = nextevents
          continue
        }
        events = events.slice(1)
      }
      isFull = false
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    const time = T.parser.getLastTime()
    Z.forEach(t=>t.dataset.push(t.parser.getLastData(), time))
    H.forEach(t=>t.dataset.push(t.parser.getLastData(), time))
  }

}