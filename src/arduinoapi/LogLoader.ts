import DateTime from '../utils/datetime'

export default class LogLoader {

  private threadsLimit: number
  private queue: TQueue[] = []
  private url: string
  private inProcess: string[] = []
  onload = ()=>{}

  constructor(url: string, threadsLimit = 8) {
    this.threadsLimit = threadsLimit
    this.queue = []
		this.url = url
	}

  /** Функция загрузки LOG-файла по timestamp*/
  getLogByTimestamp(type:string, timestamp:number, resolve: (t:string)=>void, reject = ()=>{}) {
    //не загружать будущие таймслоты
    if (timestamp>DateTime.getBeginDayTimestamp(Date.now()/1000)) return LoadStatus.NotYet
    const name = DateTime.YYYYMMDD(timestamp)+'.'+type
    return this.getLogByName(name, resolve, reject)
  }
  
  /** Положить файл в очередь обработки и запустить обработку */
  getLogByName(name: string, resolve: (t:string)=>void, reject: ()=>void): LoadStatus {
    //уже есть в очереди
    if (this.queue.some(q => q.name == name) || this.inProcess.includes(name)) return LoadStatus.Queued
    this.queue.push({name, resolve, reject})
    //ограничиваем одновременную загрузку
    while(this.queue.length>0 && this.inProcess.length<this.threadsLimit) {
      this.loadNext()
    }
    return LoadStatus.OK
  }
  
  /** Загрузка и обработка следующего файла из очереди */
  private loadNext = ()=>{
    const q = this.queue.shift()
    if(q === undefined) return
    //console.log(q.name, this.queue.length, this.inProcess.length)
    this.inProcess.push(q.name)
    fetch(this.url + q.name)
    .then(r=>{
      if(r.ok) return r.text()
      // Исключение сработает только если не сетевая ошибка
      throw Error(`status=${r.status}`)
    })
    .then(t=>q.resolve(t))
    .catch(e=>{
      console.log(`loading error ${q.name}: ${e.message}`)
      q.reject()
    })
    .finally(()=>{
      this.inProcess = this.inProcess.filter(s=>s!=q.name)
      this.onload()
      this.loadNext()
    })
  }
}

/** Тип записи очереди загрузки */
type TQueue = {
  /** Имя файла */
  name: string
  /** Обработчик данных после загрузки */
  resolve: (t:string)=>void
  /** Обработчик при ошибке */
  reject: ()=>void
}

enum LoadStatus {
    /** Помещен в очередь */
    OK,
    /** Обработка очереди занята (Не используется) */
    Busy,
    /** Файл уже в очереди */
    Queued,
    /** Запрошенная дата лога еще не наступила */
    NotYet
}

