import DateTime from "src/utils/datetime"
import { ZDataSet } from "src/utils/IrregularDS"
import { ILoadController, ILogController, TimeInterval } from "./ILogController"
import { ThermoDataSet, ThermoEventData, ThermoEventParser } from "./ThermoEventParser"
import { TickerEventParser } from "./TickerEventParser"

export type TViewData = {
  flag: number
  value?: number
}

export type TThermoViewDataSet = {
  t: ZDataSet
  h: ZDataSet
  p: ZDataSet
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


export class ThermoLogController implements ILogController<ThermoEventData> {

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

  createEventParser() {
    return new ThermoEventParser()
  }

  addLogDataSet(timestamp: number, d: ThermoDataSet) {
    this.datasets[timestamp] = d
  }

  getRegData(timeinterval: TimeInterval, tstep: number) {
		let a: TThermoViewDataSet = {
      t: {zdata: [], min: Number.MAX_VALUE, max: -Number.MAX_VALUE},
      h: {zdata: [], min: Number.MAX_VALUE, max: -Number.MAX_VALUE},
      p: {zdata: [], min: Number.MAX_VALUE, max: -Number.MAX_VALUE}
    }
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.t.zdata.push({flag: 0, value: 0})
      a.h.zdata.push({flag: 0, value: 0})
      a.p.zdata.push({flag: 0, value: 0})
		}

		for(let t=DateTime.getBeginDayTimestamp(timeinterval.begin);t<timeinterval.end;t+=86400) {
			if(typeof(this.datasets[t]) === 'undefined') {}//this.load(t)
			else /*if(this.timeslots[t].length)*/ {
          a.t = this.datasets[t]?.temperature.fillzdata(timeinterval, tstep, a.t)
          a.p = this.datasets[t]?.humidity.fillzdata(timeinterval, tstep, a.p)
          a.h = this.datasets[t]?.power.fillzdata(timeinterval, tstep, a.h)
			}
		}      
		return a
	}
}
