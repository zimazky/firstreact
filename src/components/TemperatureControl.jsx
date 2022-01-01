import Button from './Button.jsx';
import ParameterButton from './ParameterButton.jsx';
import styles from './TemperatureControl.module.css'

export default function({zone, setTemperature, setPowerControl}) {
  return (
  <div className={styles.controlbox}>
    <div className={styles.header}><div className={styles.indicator}></div>{'ZONE'+zone.id}</div>
    <div>
      <Button active={zone.onControl?true:false} onClick={()=>setPowerControl(zone.id)}>PWRCTRL</Button>
      <Button active={zone.powerOn?true:false} disabled>PWR</Button>
      <Button>CONFIG</Button>
    </div>
    <div>
      <Button onClick={()=>{console.log('showpwr_button')}}>SHOWPWR</Button>
    </div>
    <div>
      <ParameterButton 
        parameterName='temperature'
        displayedValue={zone.temperature.toFixed(1) + '°'}
        controlledValue={zone.targetTemperature}
        controlledValue2={zone.targetTemperatureDelta}
        update={(newTargetTemperature)=>{setTemperature({...zone,targetTemperature:newTargetTemperature})}}
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
