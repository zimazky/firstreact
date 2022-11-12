import ArduinoController from '../arduinoapi/arduinoAPI'
import ArduinoLogController from '../arduinoapi/arduinoLogAPI'
import Header from './Header.jsx'
import TemperatureControl from './TemperatureControl.jsx'
import TimeDiagramsSet from './TimeDiagramsSet.jsx'
import styles from './App.module.css'

const zones = [
  {type: 'Z', id: 1, temperature: 14.1, targetTemperature: 23.5, targetTemperatureDelta: 0.2, humidity: 54.3, 
    onControl: 0, powerOn: 0, sensorState: -3},
  {type: 'Z', id: 2, temperature: 15.2, targetTemperature: 21.2, targetTemperatureDelta: 0.1, humidity: 48.1, 
    onControl: 0, powerOn: 0, sensorState: -3},
  {type: 'Z', id: 3, temperature: 5.9, targetTemperature: 0., targetTemperatureDelta: 0., humidity: 85.1, 
    onControl: 0, powerOn: 0, sensorState: -3},
  {type: 'H', id: 0, pressure: 2.4},
]

const hostname = window.location.hostname
console.log(hostname)
const logUrl = (hostname=='192.168.2.2' || hostname=='localhost')?'http://192.168.1.1:4480/data/log/':'./log/'
//const logUrl = (hostname=='localhost')?'http://192.168.2.2/log/':'./log/'

const logThreads = (hostname=='192.168.2.2')?1:8
//const logThreads = (hostname=='192.168.2.2' || hostname=='localhost')?1:8

const arduinoController = new ArduinoController('http://192.168.2.2')
const logController = new ArduinoLogController(logUrl,()=>{},logThreads)
const tiend = (hostname=='192.168.2.2' || hostname=='localhost' || hostname=='192.168.1.1' || hostname=='10.8.0.1')?
  Date.now()/1000:
  new Date('2022.06.26 00:00:00')/1000
const isOnline = (hostname=='192.168.2.2' || hostname=='localhost' || hostname=='192.168.1.1' || hostname=='10.8.0.1')?true:false

export default function App() {
  const [state,setState] = React.useState({version:'offline', unixtime: 0, zones})
  const [timeInterval, setTimeInterval] = React.useState({begin:tiend-2*24*3600,end:tiend})

  React.useEffect( ()=>{
    if(isOnline) {
      //сдвиг графика каждые 20 мин
      const refreshInterval = setInterval(()=>{
        setTimeInterval(ti=>({...ti, end: Date.now()/1000}))
      }, 1200000)
      //получение данных от контроллера каждые 10 сек
      const i = setInterval(()=>{
        arduinoController.getInfo(
          text=>setState(ArduinoController.parseInfo(text)),
          ()=>setState(s => ({...s, version: 'offline'}))
        )
      }, 10000)
      return () => {
        clearInterval(i)
        if(refreshInterval) clearInterval(refreshInterval)
      }
    }
  }, [])

  const onSetTemperature = React.useCallback( zone => {
    arduinoController.setTemperature(
      zone.id, 
      zone.targetTemperature,
      () => setState( s => ({...s, zones: s.zones.map( rec => rec.id==zone.id ? zone : rec )}) ),
      () => setState( s => ({...s, zones: s.zones.map( rec => rec.id==zone.id ? {...rec,targetTemperature: {}} : rec )}) )
    )
  })

  const onSetPowerControl = React.useCallback( zone => {
    const i = zone-1
    if(state.zones[i].onControl) {
      arduinoController.powerOff(
        zone,
        () => setState( s => ({...s, zones: s.zones.map( rec => rec.id==zone ? {...rec, onControl: 0} : rec )}) )
      )
      return
    }
    arduinoController.powerOn(
      zone,
      () => setState( s => ({...s, zones: s.zones.map( rec => rec.id==zone ? {...rec, onControl: 1} : rec )}) )
    )
  })

  return (
    <div className={styles.wrapper}>
      <Header firmware={state.version} controllerDateTime={new Date(state.unixtime*1000).toLocaleTimeString()}/>
      <div className={styles.main}>
        <div className={styles.controlsbox}>
          {state.zones.filter(zone=>zone.type==='Z').map((zone, index) => <TemperatureControl key={index} zone={zone}
          onSetTemperature={onSetTemperature}
          onSetPowerControl={onSetPowerControl}
          />)}
        </div>
        <div className={styles.diagramsbox}>
          <TimeDiagramsSet timeInterval={timeInterval} logController={logController}></TimeDiagramsSet>
        </div>
        <div className={styles.info}>{JSON.stringify(state)}</div>
      </div>
    </div>
  )
}