import ArduinoLogAPI from './arduinoLogAPI'
import { HydroSensorData } from './HydroSystemController/HydroLogController'
import { TimeInterval } from './ILogController'
import { ThermalSensorData } from './ThermoController/ThermoLogController'

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

