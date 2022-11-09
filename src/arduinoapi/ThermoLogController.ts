import DateTime from "src/utils/datetime"
import { ILoadController, ILogController, TimeInterval } from "./ILogController"
import { ThermoDataSet, ThermoEventParser } from "./ThermoEventParser"
import { TickerEventParser } from "./TickerEventParser"

export type TViewData = {
  flag: number
  value?: number
}

export type TViewDataSet = {
  //flag: number
  min: number
  max: number
  zdata: TViewData[]
}

export type TThermoViewDataSet = {
  t: TViewDataSet
  h: TViewDataSet
  p: TViewDataSet
}

export type TThermoColors = {
  t: string
  h: string
  p: string
}

function parseThermoLogData(textdata: string, timestamp: number): ThermoDataSet {
   
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


export class ThermoLogController implements ILogController<TThermoViewDataSet> {

  public id: string
  
  private datasets: ThermoDataSet[] = []
  private colors: TThermoColors
  private ext: string
  private loadController: ILoadController 
  private onload = ()=>{}
  
  constructor(id: string, colors: TThermoColors) {
    this.id = this.ext = id
    this.colors = colors
    //this.onload = parent.onload
  }
  /*
  load(timestamp: number) {
    this.loadController.getLogByTimestamp(this.ext, timestamp, text=>{
      this.datasets[timestamp] = parseThermoLogData(text, timestamp)
    }, ()=>{
      this.datasets[timestamp] = []
    }, ()=>{
      this.onload()
    })
	}
*/
  getRegData(timeinterval: TimeInterval, tstep: number) {
		let a: TThermoViewDataSet = {
      t: {zdata:[], min:Number.MAX_VALUE, max:-Number.MAX_VALUE},
      h: {zdata:[], min:Number.MAX_VALUE, max:-Number.MAX_VALUE},
      p: {zdata:[], min:Number.MAX_VALUE, max:-Number.MAX_VALUE}
    }
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.t.zdata.push({flag:0})
      a.h.zdata.push({flag:0})
      a.p.zdata.push({flag:0})
		}

		for(let t=DateTime.getBeginDayTimestamp(timeinterval.begin);t<timeinterval.end;t+=86400) {
			if(typeof(this.datasets[t]) === 'undefined') {}//this.load(t)
			else /*if(this.timeslots[t].length)*/ {
          a.t = this.datasets[t]?.temperature.fillzdata(timeinterval,tstep,a.t)
          a.p = this.datasets[t]?.humidity.fillzdata(timeinterval,tstep,a.p)
          a.h = this.datasets[t]?.power.fillzdata(timeinterval,tstep,a.h)
			}
		}      
		return a
	}
}
