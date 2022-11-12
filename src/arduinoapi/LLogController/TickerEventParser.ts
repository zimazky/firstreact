import { ILogDataSet, IEventParser } from "../ILogController"
import IrregularDataset from '../../utils/IrregularDS'

export type TickerEventData = {
  time: number
  loopcounter: number
}

export class TickerDataSet implements ILogDataSet<TickerEventData> {

  loopcounter: IrregularDataset

  constructor(timestamp: number) {
    this.loopcounter = new IrregularDataset(timestamp)
  }
  push(data: TickerEventData, time: number): void {
    if(data.loopcounter != undefined) this.loopcounter.push({flag: 1, value: data.loopcounter, time})
  }
}

export class TickerEventParser implements IEventParser<TickerEventData>{
  private time = 0
  private loopcounter = 0
  
  public parseEventOld(event: string[]): number {
    const flag = +event[0]
    if(flag & 128) { // строка с полными данными
      this.time = 0
    }
    let ptime = +event[1]
    // исправление ошибки в логах, отрицательная корректировка времени выводится как положительное число
    ptime = ptime > 2147483647 ? ptime-4294967296 : ptime
    if(ptime<0) console.log(ptime, this.time)
    this.time += ptime
    return this.time
  }

  public parseEvent(event: string[], isFull: boolean): 
  [string[], TickerEventData] {
    if(isFull) { // строка с полными данными
      this.time = 0
      this.loopcounter = 0
    }
    let ptime = +event[1]
    // исправление ошибки в логах, отрицательная корректировка времени выводится как положительное число
    ptime = ptime > 2147483647 ? ptime-4294967296 : ptime
    if(ptime<0) console.log(ptime, this.time)
    this.time += ptime
    this.loopcounter += +event[2]
    return [event.slice(3), {time: this.time, loopcounter: this.loopcounter}]
  }

  public getLastData(): TickerEventData {
    return {time: this.time, loopcounter: this.loopcounter}
  }

  public getLastTime(): number {
    return this.time
  }

  public createLogDataSet(timestamp: number): TickerDataSet {
    return new TickerDataSet(timestamp)
  }

}
