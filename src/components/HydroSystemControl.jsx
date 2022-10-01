import ArduinoController from '../arduinoapi/arduinoAPI.js';
import Button from './Button.jsx';
import ParameterButton from './ParameterButton.jsx';
import styles from './HydroSystemControl.module.css'

const MODE = ['CTRL OFF','CTRL ON','CTRL ON PUMP','CTRL DRY']

export default function({zone, onSetPressureRange, onSetPumpControl}) {
  return (
  <div className={styles.controlbox}>
    <div className={styles.header}><div className={styles.indicator}></div>
      {'ZONE'+zone.id+' Sensor: '+ArduinoController.sensorState(zone.sensorState)}
    </div>
    <div>
      <Button active={zone.mode!=0} onClick={()=>onSetPumpControl()}>{MODE[zone.mode]}</Button>
      <Button active={zone.powerOn?true:false} disabled>PUMP</Button>
      <Button disabled></Button>
      <Button onClick={()=>{console.log('showpwr_button')}}>SHOWPWR</Button>
      <Button>CONFIG</Button>
    </div>
    <div>
      <ParameterButton 
        parameterName='pressure'
        displayedValue={zone.pressure.toFixed(3) + ' bar'}
        controlledValue={zone.loLimit}
        controlledValue2={zone.hiLimit}
        controlledValue3={zone.dryLimit}
        update={(lo,hi,dry)=>onSetPressureRange({...zone,loLimit:lo,hiLimit:hi,dryLimit:dry})}
      />
      <ParameterButton 
        parameterName='humidity'
        displayedValue={zone.humidity.toFixed(1) + '%'}
        disabled
      />
    </div>
    <div className='sensorstatus'></div>
  </div>
  );
}
