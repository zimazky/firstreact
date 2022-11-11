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

/** Тип записи очереди загрузки */
type TQueue = {
  /** Имя файла */
  name: string
  /** Обработчик данных после загрузки */
  onLoad: (t:string)=>void
  /** Обработчик при ошибке */
  onError: ()=>void
  /** Заключительный обработчик при любом исходе загрузки файла */
  onFinally: ()=>void
}

enum LoadStatus {
    OK,
    Busy,
    Queued,
    NotYet
}

export default class ArduinoLogLoader {

  private threadsLimit: number
  private queue: TQueue[] = []
  private url: string
  private inProcess: string[] = []
  private timezone: number

  constructor(url: string, threadsLimit = 8, timezone = 3) {
    this.threadsLimit = threadsLimit
    this.queue = []
		this.url = url
    this.timezone = timezone
	}

  /** Загрузка и обработка следующего файла из очереди */
  loadNext() {
    const q = this.queue.shift()
    if(q == undefined) return
    //console.log(q.name, this.queue.length, this.inProcess.length)
    this.inProcess.push(q.name)
    fetch(this.url + q.name)
    .then(r=>{
      if(r.ok) return r.text()
      // Исключение сработает только если не сетевая ошибка
      throw Error(`status=${r.status}`)
    })
    .then(t=>q.onLoad(t))
    .catch(e=>{
      console.log(`loading error ${q.name}: ${e.message}`)
      q.onError()
    })
    .finally(()=>{
      this.inProcess = this.inProcess.filter(s=>s!=q.name)
      q.onFinally()
      this.loadNext()
    })
  }

	// Функция загрузки LOG-файла
	getLogByName(name: string, onLoad = (t?:string)=>{}, onError = ()=>{}, onFinally = ()=>{}): LoadStatus {
    //уже есть в очереди
    if (this.queue.some(q => q.name == name) || this.inProcess.includes(name)) return LoadStatus.Queued
    this.queue.push({name, onLoad, onError, onFinally})
    //ограничиваем одновременную загрузку
    while(this.queue.length>0 && this.inProcess.length<this.threadsLimit) {
      this.loadNext()
    }
    return LoadStatus.OK
	}
	
  // Функция загрузки LOG-файла по timestamp
	getLogByTimestamp(type:string, timestamp:number, onLoad = (t?:string)=>{}, onError = ()=>{}, onFinally = ()=>{}) {
    //не загружать будущие таймслоты
		if (timestamp>getBeginDayTimestamp(Date.now()/1000,this.timezone)) return LoadStatus.NotYet
    const name = getYYYYMMDD(timestamp,this.timezone)+'.'+type
    return this.getLogByName(name, onLoad, onError, onFinally)
  }
}


