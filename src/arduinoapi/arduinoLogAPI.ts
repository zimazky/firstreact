import LogLoader from './LogLoader'
import { HydroSensorData } from './HydroSystemController/HydroLogController'
import { TimeInterval } from './ILogController'
import { ThermalSensorData } from './ThermoController/ThermoLogController'
import { LLogController } from './LLogController/LLogController'

export default class ArduinoLogAPI {
  logLoader: LogLoader
  thermoSensors: ThermalSensorData[]
  hydroSensors: HydroSensorData[]
  logController: LLogController

  constructor(url: string, onload=()=>{}, threads=8) {
    this.logLoader = new LogLoader(url, threads)
    this.thermoSensors = []
    this.hydroSensors = []
    this.logLoader.onload = onload
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
