import { ThermoEventParser, ThermoEventData, ThermoDataSet } from './ThermoEventParser'
import { HydroEventParser, HydroEventData, HydroDataSet } from './HydroEventParser'
import { TickerEventParser, TickerEventData } from './TickerEventParser'
import IrregularFloatDataset from '../utils/irregularDS.js'
import { ILogDataSet, IEventParser } from './ILogController'
//import DateTime from '../utils/datetime'

function getBeginDayTimestamp(timestamp: number, timezone: number) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

function getYYYYMMDD(timestamp: number, timezone: number) {
  const date = new Date((timestamp+timezone*3600)*1000)
  var d = date.getUTCDate()
  var m = date.getUTCMonth()+1
  var y = date.getUTCFullYear()
  return y+((m<10)?'0':'')+m+((d<10)?'0':'')+d
}

type TLogDataInternal = ThermoEventData | HydroEventData | TickerEventData

enum LoadStatus {
    OK,
    Busy,
    Queued,
    NotYet
}

export default class ArduinoLogAPI {

  private threads: number
  private queue: string[]
  private url: string
  private timezone: number

  constructor(url: string, threads = 8, timezone = 3) {
    this.threads = threads
    this.queue = []
		this.url = url
    this.timezone = timezone
	}

	// Функция загрузки LOG-файла
	getLogByName(name: string, onLoad = (text:string|void)=>{}, onError = ()=>{}, onFinally = ()=>{}): LoadStatus {
  	//ограничиваем одновременную загрузку таймслотов
    if (this.queue.length>=this.threads) return LoadStatus.Busy
    //не загружать которые в очереди
		if(this.queue.includes(name)) return LoadStatus.Queued
    this.queue.push(name)
    //console.log(this.queue)
    //console.log(name)
    fetch(this.url+name)
      .then(r=>r.text())
      .catch(error=>{
        console.log('loading error ' + name)
        console.log(error)
      })
      .then(text=>onLoad(text))
      .catch((error)=>{
        console.log('parsing error ' + name)
        console.log(error)
        onError()
      })
      .finally(()=>{
				this.queue = this.queue.filter(s=>s!=name)
        onFinally()
      })
    return LoadStatus.OK
	}
	
  // Функция загрузки LOG-файла по timestamp
	getLogByTimestamp(type:string, timestamp:number, onLoad = ()=>{}, onError = ()=>{}, onFinally = ()=>{}) {
    //не загружать будущие таймслоты
		if (timestamp>getBeginDayTimestamp(Date.now()/1000,this.timezone)) return LoadStatus.NotYet
    const name = getYYYYMMDD(timestamp,this.timezone)+'.'+type
    return this.getLogByName(name, onLoad, onError, onFinally)
  }


  static parseThermalSensorData(textdata: string, timestamp: number): ThermoDataSet {
   
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

  static parseHydroSensorData(textdata: string, timestamp: number): HydroDataSet {

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

  static parsers: {[i: string]: IEventParser<TLogDataInternal>} = {
    'Z2': new ThermoEventParser(),
    'Z3': new ThermoEventParser(),
    'H0': new HydroEventParser(),
    'T': new TickerEventParser()
  }

  static dataHolders: {[i: string]: ILogDataSet<TLogDataInternal>} = {

  }
  /**
   * Парсинг лога нового формата
   * @param textdata 
   * @param timestamp 
   * @returns 
   */
  static parseLogData(textdata: string, timestamp: number ) {
   
    let dataHolders: {[i: string]: ILogDataSet<TLogDataInternal>}
    for(let key in this.parsers) {
      dataHolders[key] = this.parsers[key].createLogDataSet(timestamp)
    }
    if(!textdata) return dataHolders

    const strings = textdata.split('\n')
    let isFull = false
    strings.forEach(string => {
      if(string.startsWith('F')) { isFull = true; return }
      let events = string.split(';')
      if(events.length <= 3) return // отбрасываем случайные ошибки
      let d: {[i: string]: TLogDataInternal}
      while(events.length > 0) {
        const [nextevents, data] = this.parsers[events[0]]?.parseEvent(events, isFull) ?? [events.slice(1)]
        if(data != undefined) d[events[0]] = data
      }
      const time = (<TickerEventData> d['T']).time
      for(let key in this.parsers) {
        dataHolders[key].push(d[key], time)
      }
      isFull = false
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    const time = (<TickerEventData> this.parsers['T'].getLastData()).time
    for(let key in this.parsers) {
      dataHolders[key].push(this.parsers[key].getLastData(), time)
    }
    return dataHolders
  }


}


