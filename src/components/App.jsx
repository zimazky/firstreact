import Header from './Header.jsx';
import TemperatureControl from './TemperatureControl.jsx'
import TimeDiagramsSet from './TimeDiagramsSet.jsx'
import styles from './App.module.css'
import ArduinoController from '../arduinoapi.js/arduinoapi.js';

const zones = [
  {id: 1, temperature: 14.1, targetTemperature: 23.5, targetTemperatureDelta: 0.2, humidity: 54.3, 
    onControl: 0, powerOn: 0, sensorState: -3},
  {id: 2, temperature: 15.2, targetTemperature: 21.2, targetTemperatureDelta: 0.1, humidity: 48.1, 
    onControl: 0, powerOn: 0, sensorState: -3},
  {id: 3, temperature: 5.9, targetTemperature: 0., targetTemperatureDelta: 0., humidity: 85.1, 
    onControl: 0, powerOn: 0, sensorState: -3},
]
const arduinoapi = new ArduinoController('http://192.168.2.2')
const ti = {}
ti.end = new Date('2022.01.01 00:00:00')/1000
ti.begin = ti.end-2*24*3600

export default function () {
  const [state,setState] = React.useState({version:'offline', unixtime: 0, zones})

  React.useEffect( ()=>{
    arduinoapi.getInfo( text=>setState(ArduinoController.parseInfo(text)) )

    const i = setInterval(()=>{
      arduinoapi.getInfo(
        text=>setState(ArduinoController.parseInfo(text)),
        error=>setState(s => ({...s, version: 'offline'}))
      )
    }, 10000)
    return () => clearInterval(i)
  }, [])

  const onSetTemperature = React.useCallback((zone) => {
    arduinoapi.setTemperature(
      zone.id, 
      zone.targetTemperature,
      text => {
        setState( s => {
          const zones = s.zones.map( rec => rec.id==zone.id ? zone : rec )
          return {...s, zones}
        })
      }
    )
  })

  const onSetPowerControl = React.useCallback((zone) => {
    const i = zone-1
    if(state.zones[i].onControl) {
      arduinoapi.powerOff(zone)
        .then(()=>console.log('powerOff',zone))
        .catch(()=>console.log('Fail powerOff',zone))
      return
    }
    arduinoapi.powerOn(zone)
      .then(()=> console.log('powerOn',zone))
      .catch(()=>console.log('Fail powerOn',zone))
  })

  return (
    <div className={styles.wrapper}>
      <Header firmware={state.version} controllerDateTime={new Date(state.unixtime*1000).toLocaleTimeString()}/>
      <div className={styles.main}>
        <div className={styles.controlsbox}>
          {state.zones.map((zone, index) => <TemperatureControl key={index} zone={zone} 
          setTemperature={onSetTemperature}
          setPowerControl={onSetPowerControl}
          />)}
        </div>
        <div className={styles.diagramsbox}>
          <TimeDiagramsSet timeInterval={ti}></TimeDiagramsSet>
        </div>
        <div className={styles.info}>{JSON.stringify(state)}</div>
      </div>
    </div>
  )
}