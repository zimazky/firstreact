import ArduinoLogAPI from './arduinoLogAPI.js'
import IrregularFloatDataset from '../utils/irregularDS.js'

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

class ThermalSensorData {
  
  static DATASET_NAMES = ['Temperature', 'Humidity', 'Power']

  constructor(id,parent,[tcolor,hcolor,pcolor]) {
    this.id = id
    this.ext = 'Z'+id
    this.controller = parent.logController
    this.timezone = parent.timezone
    this.onload = parent.onload
    this.colors = {t:tcolor,h:hcolor,p:pcolor}
    this.isShowPower = false
    this.timeslots = []
  }
  
  load(timestamp) {
    this.controller.getLogByTimestamp(this.ext, timestamp, text=>{
      this.timeslots[timestamp] = ArduinoLogAPI
			.parseThermalSensorData(text, [
        new IrregularFloatDataset(timestamp),
        new IrregularFloatDataset(timestamp),
        new IrregularFloatDataset(timestamp)
			])
    }, ()=>{
      this.timeslots[timestamp] = []
    }, ()=>{
      this.onload()
    })
	}

  getRegData(timeinterval, tstep) {
		let a = ThermalSensorData.DATASET_NAMES.map(()=>({zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}))
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.forEach(d=>d.zdata.push({flag:0}))
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin,this.timezone);t<timeinterval.end;t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') this.load(t)
			else if(this.timeslots[t].length) {
          a = this.timeslots[t].map((d,i)=>d.fillzdata(timeinterval,tstep,a[i]))
			}
		}
		return a
	}
}

class HydroSensorData {
  constructor(id,parent,color) {
    this.id = id
    this.ext = 'H'+id
    this.controller = parent.logController
    this.timezone = parent.timezone
    this.color = color
    this.onload = parent.onload
    this.timeslots = []
  }

  load(timestamp) {
    this.controller.getLogByTimestamp(this.ext, timestamp, text=>{
      this.timeslots[timestamp] = ArduinoLogAPI
			.parseHydroSensorData(text, new IrregularFloatDataset(timestamp))
    }, ()=>{
      this.timeslots[timestamp] = {flag:0}
    }, ()=>{
      this.onload()
    })
	}

  getRegData(timeinterval, tstep) {
		let a = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.zdata.push({flag:0})
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin,this.timezone);t<timeinterval.end;t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') this.load(t)
			else if(this.timeslots[t].flag != 0) {
          a = this.timeslots[t].fillzdata(timeinterval,tstep,a)
			}
		}
		return a
	}

}

export default class ArduinoLogController {
  constructor(url, onload=()=>{}, threads=8, timezone=3) {
    this.logController = new ArduinoLogAPI(url,threads,timezone)
    this.thermoSensors = []
    this.hydroSensors = []
    this.onload = onload
    this.timezone = timezone
  }
  addThermalSensor(id,[tcolor,hcolor,pcolor]) {
    this.thermoSensors.push(new ThermalSensorData(id,this,[tcolor,hcolor,pcolor]))
  }
  addHydroSensor(id,color) {
    this.hydroSensors.push(new HydroSensorData(id,this,color))
  }
  getThermalSensorsRegData(timeinterval, tstep) {
    return this.thermoSensors.map(d=>d.getRegData(timeinterval,tstep))
  }
  getHydroSensorsRegData(timeinterval, tstep) {
    return this.hydroSensors.map(d=>d.getRegData(timeinterval,tstep))
  }

}

