import ArduinoLogLoader from './arduinoLogLoader'
import { HydroSensorData } from './HydroSystemController/HydroLogController'
import { TimeInterval } from './ILogController'
import { ThermalSensorData } from './ThermoController/ThermoLogController'
import { LLogController } from './LLogController/LLogController'

export default class ArduinoLogAPI {
  logLoader: ArduinoLogLoader
  thermoSensors: ThermalSensorData[]
  hydroSensors: HydroSensorData[]
  logController: LLogController
  timezone: number

  constructor(url: string, onload=()=>{}, threads=8, timezone=3) {
    this.logLoader = new ArduinoLogLoader(url,threads,timezone)
    this.thermoSensors = []
    this.hydroSensors = []
    this.logLoader.onload = onload
    this.timezone = timezone
    this.logController = new LLogController(this, +new Date('2022.11.06')/1000, Date.now()/1000)
  }
  setOnLoad(fn: ()=>{}) { this.logLoader.onload = fn }

  addThermalSensor(id: number, [tcolor,hcolor,pcolor], begin: number, end: number) {
    this.thermoSensors.push(new ThermalSensorData(id, this, [tcolor,hcolor,pcolor], begin, end))
  }
  addHydroSensor(id: number, color: string, begin: number, end: number) {
    this.hydroSensors.push(new HydroSensorData(id,this,color, begin, end))
  }
  getThermalSensorsRegData(timeinterval: TimeInterval, tstep: number) {
    return this.thermoSensors.map(d=>d.getRegData(timeinterval,tstep,this.logController.load))
  }
  getHydroSensorsRegData(timeinterval: TimeInterval, tstep: number) {
    return this.hydroSensors.map(d=>d.getRegData(timeinterval,tstep,this.logController.load))
  }

}
