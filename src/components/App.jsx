import Header from './Header.jsx';
import TemperatureControl from './TemperatureControl.jsx'
import TimeDiagramsSet from './TimeDiagramsSet.jsx'
import styles from './App.module.css'
import ArduinoController from '../arduinoapi/arduinoAPI.js'

const zones = [
  {id: 1, temperature: 14.1, targetTemperature: 23.5, targetTemperatureDelta: 0.2, humidity: 54.3, 
    onControl: 0, powerOn: 0, sensorState: -3},
  {id: 2, temperature: 15.2, targetTemperature: 21.2, targetTemperatureDelta: 0.1, humidity: 48.1, 
    onControl: 0, powerOn: 0, sensorState: -3},
  {id: 3, temperature: 5.9, targetTemperature: 0., targetTemperatureDelta: 0., humidity: 85.1, 
    onControl: 0, powerOn: 0, sensorState: -3},
]
const arduinoapi = new ArduinoController('http://192.168.2.2')
const tiend = new Date('2022.01.04 00:00:00')/1000

export default function App() {
  const [state,setState] = React.useState({version:'offline', unixtime: 0, zones})
  const [timeInterval, setTimeInterval] = React.useState({begin:tiend-2*24*3600,end:tiend})

  React.useEffect( ()=>{
    const end = Date.now()/1000
    let refreshInterval
    arduinoapi.getInfo( text=>{
      setState(ArduinoController.parseInfo(text))
      setTimeInterval({begin: end-2*24*3600, end})
      refreshInterval = setInterval(()=>{
        setTimeInterval(ti=>({...ti, end: Date.now()/1000}))
      }, 1200000)
    })
    const i = setInterval(()=>{
      arduinoapi.getInfo(
        text=>setState(ArduinoController.parseInfo(text)),
        ()=>setState(s => ({...s, version: 'offline'}))
      )
    }, 10000)
    return () => {
      clearInterval(i)
      if(refreshInterval) clearInterval(refreshInterval)
    }
  }, [])

  const onSetTemperature = React.useCallback( zone => {
    arduinoapi.setTemperature(
      zone.id, 
      zone.targetTemperature,
      () => setState( s => ({...s, zones: s.zones.map( rec => rec.id==zone.id ? zone : rec )}) ),
      () => setState( s => ({...s, zones: s.zones.map( rec => rec.id==zone.id ? {...rec,targetTemperature: {}} : rec )}) )
    )
  })

  const onSetPowerControl = React.useCallback( zone => {
    const i = zone-1
    if(state.zones[i].onControl) {
      arduinoapi.powerOff(
        zone,
        () => setState( s => ({...s, zones: s.zones.map( rec => rec.id==zone ? {...rec, onControl: 0} : rec )}) )
      )
      return
    }
    arduinoapi.powerOn(
      zone,
      () => setState( s => ({...s, zones: s.zones.map( rec => rec.id==zone ? {...rec, onControl: 1} : rec )}) )
    )
  })

  return (
    <div className={styles.wrapper}>
      <Header firmware={state.version} controllerDateTime={new Date(state.unixtime*1000).toLocaleTimeString()}/>
      <div className={styles.main}>
        <div className={styles.controlsbox}>
          {state.zones.map((zone, index) => <TemperatureControl key={index} zone={zone}
          onSetTemperature={onSetTemperature}
          onSetPowerControl={onSetPowerControl}
          />)}
        </div>
        <div className={styles.diagramsbox}>
          <TimeDiagramsSet timeInterval={timeInterval}></TimeDiagramsSet>
        </div>
        <div className={styles.info}>{JSON.stringify(state)}</div>
      </div>
    </div>
  )
}