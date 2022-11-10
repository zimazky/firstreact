import ArduinoLogAPI from './arduinoLogAPI'
import IrregularFloatDataset from '../utils/IrregularDS.js'
import { ThermoDataSet } from './ThermoEventParser'
import { TimeInterval } from './ILogController'
import { HydroDataSet } from './HydroEventParser'

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

class ThermalSensorData {
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

class HydroSensorData {
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


export default class ArduinoLogController {
  logController: ArduinoLogAPI
  thermoSensors: ThermalSensorData[]
  hydroSensors: HydroSensorData[]
  onload: (t: string)=>void
  timezone: number

  constructor(url: string, onload=()=>{}, threads=8, timezone=3) {
    this.logController = new ArduinoLogAPI(url,threads,timezone)
    this.thermoSensors = []
    this.hydroSensors = []
    this.onload = onload
    this.timezone = timezone
  }
  setOnLoad(fn: ()=>{}) { this.onload = fn }
  addThermalSensor(id: number, [tcolor,hcolor,pcolor]) {
    this.thermoSensors.push(new ThermalSensorData(id, this, [tcolor,hcolor,pcolor]))
  }
  addHydroSensor(id: number, color: string) {
    this.hydroSensors.push(new HydroSensorData(id,this,color))
  }
  getThermalSensorsRegData(timeinterval: TimeInterval, tstep: number) {
    return this.thermoSensors.map(d=>d.getRegData(timeinterval,tstep))
  }
  getHydroSensorsRegData(timeinterval: TimeInterval, tstep: number) {
    return this.hydroSensors.map(d=>d.getRegData(timeinterval,tstep))
  }

}

