import ArduinoController from '../arduinoapi/arduinoAPI.js';
import Button from './Button.jsx';
import ParameterButton from './ParameterButton.jsx';
import styles from './TemperatureControl.module.css'

export default function({zone, onSetTemperature, onSetPowerControl}) {
  return (
  <div className={styles.controlbox}>
    <div className={styles.header}><div className={styles.indicator}></div>
      {'ZONE'+zone.id+' Sensor: '+ArduinoController.sensorState(zone.sensorState)}
    </div>
    <div>
      <Button active={zone.onControl?true:false} onClick={()=>onSetPowerControl(zone.id)}>PWRCTRL</Button>
      <Button active={zone.powerOn?true:false} disabled>PWR</Button>
      <Button onClick={()=>{console.log('showpwr_button')}}>SHOWPWR</Button>
      <Button>CONFIG</Button>
    </div>
    <div>
      <ParameterButton 
        parameterName='temperature'
        displayedValue={zone.temperature.toFixed(1) + '°'}
        controlledValue={zone.targetTemperature}
        controlledValue2={zone.targetTemperatureDelta}
        update={t=>onSetTemperature({...zone,targetTemperature:t})}
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
