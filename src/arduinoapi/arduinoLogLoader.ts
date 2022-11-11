import { ThermoEventParser, ThermoEventData } from './ThermoController/ThermoEventParser'
import { HydroEventParser, HydroEventData } from './HydroSystemController/HydroEventParser'
import { TickerEventParser, TickerEventData } from './Ticker/TickerEventParser'
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

type TQueue = {
  name: string
  onLoad: (t:string)=>void
  onError: ()=>void
}

type TLogDataInternal = ThermoEventData | HydroEventData | TickerEventData

enum LoadStatus {
    OK,
    Busy,
    Queued,
    NotYet
}

export default class ArduinoLogLoader {

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
	getLogByName(name: string, onLoad = (t?:string)=>{}, onError = ()=>{}, onFinally = ()=>{}): LoadStatus {
  	//ограничиваем одновременную загрузку таймслотов
    if (this.queue.length>=this.threads) return LoadStatus.Busy
    //не загружать которые в очереди
		if(this.queue.includes(name)) return LoadStatus.Queued
    this.queue.push(name)
    //console.log(this.queue)
    console.log(`loading ${name}`)
    fetch(this.url+name)
    .then(r=>{
      if(r.ok) return r.text()
      // Исключение сработает только если не сетевая ошибка
      throw Error(`status=${r.status}`)
    })
    .then(t=>onLoad(t))
    .catch(e=>{
      console.log(`loading error ${name}: ${e.message}`)
      onError()
    })
    .finally(()=>{
      this.queue = this.queue.filter(s=>s!=name)
      onFinally()
    })
    return LoadStatus.OK
	}
	
  // Функция загрузки LOG-файла по timestamp
	getLogByTimestamp(type:string, timestamp:number, onLoad = (t?:string)=>{}, onError = ()=>{}, onFinally = ()=>{}) {
    //не загружать будущие таймслоты
		if (timestamp>getBeginDayTimestamp(Date.now()/1000,this.timezone)) return LoadStatus.NotYet
    const name = getYYYYMMDD(timestamp,this.timezone)+'.'+type
    return this.getLogByName(name, onLoad, onError, onFinally)
  }

  loadLogsByTimestamp(exts:string[], timestamp:number, onLoad = (t?:string)=>{}, onError = ()=>{}, onFinally = ()=>{}) {
    //не загружать будущие таймслоты
		if (timestamp>getBeginDayTimestamp(Date.now()/1000,this.timezone)) return LoadStatus.NotYet
    const ymd = getYYYYMMDD(timestamp,this.timezone)
    const names = exts.map(t=>ymd+'.'+t)
    this.getLogByName(ymd+'.L', onLoad, ()=>{
      names.forEach(n=>this.getLogByName(n, onLoad, onError, onFinally))
      onError()
    }, onFinally)
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


