import ArduinoLogAPI from "../arduinoLogAPI"
import ArduinoLogController from "../arduinoLogController"
import { HydroDataSet } from "./HydroEventParser"
import { TimeInterval } from "../ILogController"

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

export class HydroSensorData {
  id: number
  ext: string
  controller: ArduinoLogAPI
  timezone: number
  onload: (t?: string)=>void
  color: string
  isShowPower: boolean
  timeslots: HydroDataSet[]


  constructor(id: number, parent: ArduinoLogController, color: string) {
    this.id = id
    this.ext = 'H'+id
    this.controller = parent.logController
    this.timezone = parent.timezone
    this.color = color
    this.onload = parent.onload
    this.timeslots = []
  }

  load(timestamp: number) {
    this.controller.getLogByTimestamp(this.ext, timestamp, text=>{
      this.timeslots[timestamp] = ArduinoLogAPI.parseHydroSensorData(text, timestamp)
    }, ()=>{
      this.timeslots[timestamp] = new HydroDataSet(timestamp)
    }, ()=>{
      this.onload()
    })
	}

  getRegData(timeinterval: TimeInterval, tstep: number) {
		let a = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.zdata.push({flag:0})
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin,this.timezone);t<timeinterval.end;t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') this.load(t)
			else /*if(this.timeslots[t].flag != 0)*/ {
          a = this.timeslots[t]?.pressure?.fillzdata(timeinterval,tstep,a)
			}
		}
		return a
	}
}
