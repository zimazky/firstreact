import ArduinoLogAPI from "../arduinoLogAPI"
import ArduinoLogController from "../arduinoLogController"
import { TimeInterval } from "../ILogController"
import { ThermoDataSet } from "./ThermoEventParser"

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

export class ThermalSensorData {
  id: number
  ext: string
  controller: ArduinoLogAPI
  timezone: number
  onload: (t?: string)=>void
  colors: {t:string, h: string, p: string}
  isShowPower: boolean
  timeslots: ThermoDataSet[]
  
  static DATASET_NAMES = ['Temperature', 'Humidity', 'Power']

  constructor(id: number, parent: ArduinoLogController, [tcolor,hcolor,pcolor]) {
    this.id = id
    this.ext = 'Z'+id
    this.controller = parent.logController
    this.timezone = parent.timezone
    this.onload = parent.onload
    this.colors = {t:tcolor,h:hcolor,p:pcolor}
    this.isShowPower = false
    this.timeslots = []
  }
  
  load(timestamp: number) {
    this.controller.getLogByTimestamp(this.ext, timestamp, text=>{
      this.timeslots[timestamp] = ArduinoLogAPI.parseThermalSensorData(text, timestamp)
    }, ()=>{
      this.timeslots[timestamp] = new ThermoDataSet(timestamp)
    }, ()=>{
      this.onload()
    })
	}

  getRegData(timeinterval: TimeInterval, tstep: number) {
		let a = ThermalSensorData.DATASET_NAMES.map(()=>({zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}))
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.forEach(d=>d.zdata.push({flag:0}))
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin, this.timezone); t<timeinterval.end; t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') this.load(t)
			else /*if(this.timeslots[t].length)*/ {
          a[0] = this.timeslots[t]?.temperature?.fillzdata(timeinterval,tstep,a[0])
          a[1] = this.timeslots[t]?.humidity?.fillzdata(timeinterval,tstep,a[1])
          a[2] = this.timeslots[t]?.power?.fillzdata(timeinterval,tstep,a[2])
			}
		}      
		return a
	}
}
