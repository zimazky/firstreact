import Button from './Button.jsx';
import ParameterButton from './ParameterButton.jsx';
import styles from './TemperatureControl.module.css'

export default function({zone, update}) {
  console.log(zone)
  return (
  <div className={styles.controlbox}>
    <div className={styles.header}><div className={styles.indicator}></div>{'ZONE'+zone.id}</div>
    <div>
      <Button onClick={()=>{console.log('pwrcontrol_button')}}>PWRCTRL</Button>
      <Button disabled>PWR</Button>
      <Button>CONFIG</Button>
    </div>
    <div>
      <Button onClick={()=>{console.log('showpwr_button')}}>SHOWPWR</Button>
    </div>
    <div>
      <ParameterButton 
        parameterName='temperature'
        value={zone.temperature.toFixed(1) + '°(' + zone.targetTemperature.toFixed(1) + '±' + zone.targetTemperatureDelta + ')'}
        update={(newTargetTemperature)=>{update({...zone,targetTemperature:newTargetTemperature})}}
      />
      <ParameterButton 
        parameterName='humidity'
        value={zone.humidity.toFixed(1) + '%'}
        disabled
      />
    </div>
    <div className='sensorstatus'></div>
  </div>
  );
}
