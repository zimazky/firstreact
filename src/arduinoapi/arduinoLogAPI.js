import ThermalSensorLogParser from './ThermalSensorLogParser.js'
import HydroSensorLogParser from './HydroSensorLogParser.js'
import TickerLogParser from './TickerLogParser.js'

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

  constructor(url, threads = 8, timezone = 3) {
    this.threads = threads
    this.queue = []
		this.url = url
    this.timezone = timezone
	}

	// Функция загрузки LOG-файла
	getLogByName(name, onLoad = ()=>{}, onError = ()=>{}, onFinally = ()=>{}) {
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
      .then((text)=>{
        onLoad(text)
      })
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
	getLogByTimestamp(type, timestamp, onLoad = ()=>{}, onError = ()=>{}, onFinally = ()=>{}) {
    //не загружать будущие таймслоты
		if (timestamp>getBeginDayTimestamp(Date.now()/1000, this.timezone)) return 3
    const name = getYYYYMMDD(timestamp, this.timezone)+'.'+type
    return this.getLogByName(name, onLoad, onError, onFinally)
  }


  static parseThermalSensorData = function(textdata, [tDS = [], hDS = [], pDS = []] ) {
   
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
      if(data.temperature != undefined) tDS.push({flag: data.temperature.flag, time, value: data.temperature.value})
      if(data.humidity != undefined) hDS.push({flag: data.humidity.flag, time, value: data.humidity.value})
      if(data.power != undefined) pDS.push({flag: data.power.flag, time, value: data.power.value})
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    if(tDS.data.length != 0) tDS.push({flag: Z.f, time: T.time, value: Z.temperature/10.})
    if(hDS.data.length != 0) hDS.push({flag: Z.f, time: T.time, value: Z.humidity/10.})
    if(pDS.data.length != 0) pDS.push({flag: 1, time: T.time, value: Z.power})

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

}


