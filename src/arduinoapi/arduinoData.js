import ArduinoLogAPI from '../arduinoapi/arduinoLogAPI.js'
import IrregularFloatDataset from '../utils/irregularDS.js'

function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

class ThermoSensorData {
  
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
      const [t,h,p] = ArduinoLogAPI.parseThermoSensorData(text, [
        new IrregularFloatDataset(timestamp), 
        new IrregularFloatDataset(timestamp), 
        new IrregularFloatDataset(timestamp)])
      this.timeslots[timestamp] = {flag:1, data: [t,h,p]}
    }, ()=>{
      this.timeslots[timestamp] = {flag:0}
    }, ()=>{
      this.onload()
    })
	}

  getRegData(timeinterval, tstep) {
		let a = ThermoSensorData.DATASET_NAMES.map(()=>({zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}))
		
		for(let t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
      a.forEach(d=>d.zdata.push({flag:0}))
		}

		for(let t=getBeginDayTimestamp(timeinterval.begin,this.timezone);t<timeinterval.end;t+=86400) {
			if(typeof(this.timeslots[t]) === 'undefined') this.load(t)
			else if(this.timeslots[t].flag != 0) {
          a = this.timeslots[t].data.map((d,i)=>d.fillzdata(timeinterval,tstep,a[i]))
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
    this.controller = controller
    this.color = color
    this.data = []
  }
}

export default class ArduinoControllerLogData {
  constructor(url, onload=()=>{}, threads=8, timezone=3) {
    this.logController = new ArduinoLogAPI(url,threads,timezone)
    this.thermoSensors = []
    this.hydroSensors = []
    this.onload = onload
    this.timezone = timezone
  }
  addThermoSensor(id,[tcolor,hcolor,pcolor]) {
    this.thermoSensors.push(new ThermoSensorData(id,this,[tcolor,hcolor,pcolor]))
  }
  addHydroSensor(id,color) {
    this.hydroSensors.push(new HydroSensorData(id,this,color))
  }
  getThermoSensorsRegData(timeinterval, tstep) {
    return this.thermoSensors.map(d=>d.getRegData(timeinterval,tstep))
  }
}

