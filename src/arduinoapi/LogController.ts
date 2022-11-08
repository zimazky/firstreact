import IrregularFloatDataset from '../utils/irregularDS.js'

type TimeInterval = {
  begin: number
  end: number
}

type TimeSlot = {
  thermoSensors: IrregularFloatDataset[]
  hydroSensor: IrregularFloatDataset
}

type RegularData = {
  zdata: any[]
  min: number
  max: number
}

export default class LogController {
  
  public load(timestamp: number) {

  }

  public getRegData(timeinterval: TimeInterval, tstep: number): RegularData {
    return
  }
}