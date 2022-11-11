/**
 * Интерфейс парсера логов
 */
export interface IEventParser<T> {
  /**
   * Парсер массива параметров события (из одной строки файла логирования). 
   * Берет только первые параметры, предназначенные этому контроллеру.
   * @param event - массив параметров события
   * @param isFull - признак полной записи
   * Возвращает кортеж из двух элементов:
   * 1. массив с оставшимися необработанными параметрами
   * 2. структурированные данные типа T 
   */
  parseEvent(event: string[], isFull:boolean): [string[], T]
  /**
   * Возвращает последние данные после обработки парсером файла логирования
   */
  getLastData(): T
  /**
   * Создает хранилище данных для сохранения событий из файла логирования.
   * Хранилище содержит данные за один день, заданный меткой времени.
   * @param timestamp - метка времени
   */
  createLogDataSet(timestamp: number): ILogDataSet<T>
}

/**
 * Интерфейс хранилища данных логирования за день
 */
export interface ILogDataSet<T> {
  /**
   * Добавление данных события в хранилище данных
   * @param data - данные события
   * @param time - время события
   */
  push(data: T, time: number): void
}

export type TimeInterval = {
  begin: number
  end: number
}

export interface ILogController<T> {
  ext: string
  getDataSet(timestamp:number):ILogDataSet<T>
  getParser(timestamp: number): {name: string, parser: IEventParser<T>, dataset: ILogDataSet<T>}
  createEventParser(): IEventParser<T>
  //addLogDataSet(timestamp: number, d: ILogDataSet<T>): void
  //getRegData(timeinterval: TimeInterval, tstep: number): TOut
}

export interface ILoadController {
  loadLog(timestamp: number): void
  getLogByTimestamp(
    type: string, 
    timestamp: number, 
    onLoad: (t: string)=>void, 
    onError: ()=>void, 
    onFinally: ()=>void
    ): void
}