import ThermalSensorLogParser from './ThermalSensorLogParser'
import HydroSensorLogParser from './HydroSensorLogParser'
import TickerLogParser from './TickerLogParser'
import IrregularFloatDataset from '../utils/irregularDS.js'


function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

function getYYYYMMDD(timestamp, timezone) {
  const date = new Date((timestamp+timezone*3600)*1000)
  var d = date.getUTCDate()
  var m = date.getUTCMonth()+1
  var y = date.getUTCFullYear()
  return y+((m<10)?'0':'')+m+((d<10)?'0':'')+d
}

export default class ArduinoLogAPI {
  static ERRORS = ['OK','Busy','Queued','NotYet']

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
	getLogByName(name: string, onLoad = (text:string|void)=>{}, onError = ()=>{}, onFinally = ()=>{}) {
  	//ограничиваем одновременную загрузку таймслотов
    if (this.queue.length>=this.threads) return 1
    //не загружать которые в очереди
		if(this.queue.includes(name)) return 2
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
    return 0
	}
	
  // Функция загрузки LOG-файла по timestamp
	getLogByTimestamp(type:string, timestamp:number, onLoad = ()=>{}, onError = ()=>{}, onFinally = ()=>{}) {
    //не загружать будущие таймслоты
		if (timestamp>getBeginDayTimestamp(Date.now()/1000, this.timezone)) return 3
    const name = getYYYYMMDD(timestamp, this.timezone)+'.'+type
    return this.getLogByName(name, onLoad, onError, onFinally)
  }


  static parseThermalSensorData = function(textdata: string, [tDS, hDS, pDS]:IrregularFloatDataset[] ) {
   
    if(!textdata) return [tDS, hDS, pDS]

    const strings = textdata.split('\n')
    let T = new TickerLogParser()
    let Z = new ThermalSensorLogParser()
    strings.forEach(string => {
      const event = string.split(';')
      if(event.length <= 2) return
      let time = T.parseEventOld(event)
      if(time == 0) return
      let data = Z.parseEventOld(event)
      if(data.temperature != undefined) tDS.push({...data.temperature, time})
      if(data.humidity != undefined) hDS.push({...data.humidity, time})
      if(data.power != undefined) pDS.push({...data.power, time})
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    let data = Z.getLastData()
    let time = T.getLastTime()
    if(tDS.data.length != 0) tDS.push({...data.temperature, time})
    if(hDS.data.length != 0) hDS.push({...data.humidity, time})
    if(pDS.data.length != 0) pDS.push({...data.power, time})

    return [tDS, hDS, pDS]
  }

  static parseHydroSensorData = function(textdata, pressureDataset=[]) {
    
    if(!textdata) return pressureDataset

    const strings = textdata.split('\n')
    let T = new TickerLogParser()
    let H0 = new HydroSensorLogParser()
    strings.forEach(string => {
      let event = string.split(';')
      if(event.length <= 2) return
      let time = T.parseEventOld(event)
      if(time == 0) return
      let data = H0.parseEventOld(event)
      if(data) pressureDataset.push({flag: data.flag, time, value: data.pressure})
    })
    return pressureDataset;
  }

  /**
   * Парсинг лога нового формата
   * @param textdata 
   * @param logController 
   * @returns 
   */

  /*
  static parseLogData = function(textdata: string, logController: any ) {
   
    if(!textdata) return

    const strings = textdata.split('\n')
    let isFull = false
    if(strings[0].startsWith('F')) isFull = true

    let T = new TickerLogParser()
    let Z1 = new ThermalSensorLogParser()
    let Z2 = new ThermalSensorLogParser()
    let Z3 = new ThermalSensorLogParser()
    let H0 = new HydroSensorLogParser()
    strings.forEach(string => {
      isFull = false
      if(string.startsWith('F')) {
        isFull = true
        return
      }
      const [id, ...row] = string.split(';')
      switch(id[0]) {
        case 'Z':
          const event
          if(event.length <= 2) return
          let time = T.parseEventOld(event)
          if(time == 0) return
          let data = Z1.parseEventOld(event)
    
      }

      if(event.length <= 2) return
      let time = T.parseEventOld(event)
      if(time == 0) return
      let data = Z.parseEventOld(event)
      if(data.temperature != undefined) tDS.push({...data.temperature, time})
      if(data.humidity != undefined) hDS.push({...data.humidity, time})
      if(data.power != undefined) pDS.push({...data.power, time})
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    let data = Z.getLastData()
    let time = T.getLastTime()
    if(tDS.data.length != 0) tDS.push({...data.temperature, time})
    if(hDS.data.length != 0) hDS.push({...data.humidity, time})
    if(pDS.data.length != 0) pDS.push({...data.power, time})

    return [tDS, hDS, pDS]
  }
*/

}


