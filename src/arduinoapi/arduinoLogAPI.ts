import ArduinoLogLoader from './arduinoLogLoader'
import { HydroSensorData } from './HydroSystemController/HydroLogController'
import { TimeInterval } from './ILogController'
import { ThermalSensorData } from './ThermoController/ThermoLogController'
import { TickerEventParser } from './Ticker/TickerEventParser'

export default class ArduinoLogAPI {
  logLoader: ArduinoLogLoader
  thermoSensors: ThermalSensorData[]
  hydroSensors: HydroSensorData[]
  onload: ()=>void
  timezone: number

  constructor(url: string, onload=()=>{}, threads=8, timezone=3) {
    this.logLoader = new ArduinoLogLoader(url,threads,timezone)
    this.thermoSensors = []
    this.hydroSensors = []
    this.onload = onload
    this.timezone = timezone
  }
  setOnLoad(fn: ()=>{}) { this.onload = fn }
  addThermalSensor(id: number, [tcolor,hcolor,pcolor], begin: number) {
    this.thermoSensors.push(new ThermalSensorData(id, this, [tcolor,hcolor,pcolor], begin))
  }
  addHydroSensor(id: number, color: string, begin: number) {
    this.hydroSensors.push(new HydroSensorData(id,this,color, begin))
  }
  getThermalSensorsRegData(timeinterval: TimeInterval, tstep: number) {
    return this.thermoSensors.map(d=>d.getRegData(timeinterval,tstep,this.load))
  }
  getHydroSensorsRegData(timeinterval: TimeInterval, tstep: number) {
    return this.hydroSensors.map(d=>d.getRegData(timeinterval,tstep,this.load))
  }
  load = (timestamp:number)=>{
    this.logLoader.getLogByTimestamp('L', timestamp, text=>{
      this.parseLogData(text, timestamp)
    }, ()=>{}, ()=>{
      this.onload()
    })
    
    this.thermoSensors.forEach(t=>t.load(timestamp))
    this.hydroSensors.forEach(t=>t.load(timestamp))
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
      const tindex = events.findIndex(e=>e == 'T')
      if(tindex<0) return // не найден блок данных тикера
      const [_, tdata] = T.parser.parseEvent(events.slice(tindex),isFull)
      //console.log(tdata)
      //console.log(events)

      events = events.slice(0,tindex)
      //if(events.length <= 2) return // отбрасываем случайные ошибки
      while(events.length > 0) {
        //console.log(events)
        const id = events[0]
        const z = Z.find(t=>t.name==id)
        if(z!==undefined) {
          //console.log(events)
          const [nextevents, data] = z.parser.parseEvent(events, isFull)
          z.dataset.push(data, tdata.time)
          //console.log(data)
          events = nextevents
          continue
        }
        const h = H.find(t=>t.name==id)
        if(h!==undefined) {
          const [nextevents, data] = h.parser.parseEvent(events, isFull)
          h.dataset.push(data, tdata.time)
          //console.log(data)
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
    // console.log(this.hydroSensors)
    // console.log(this.thermoSensors)

  }


}
