import Header from './Header.jsx';
import TemperatureControl from './TemperatureControl.jsx'
import TimeDiagramsSet from './TimeDiagramsSet.jsx'
import styles from './App.module.css'
import ArduinoController from '../arduinoapi.js/arduinoapi.js';

const zones = [
  {id: '1', temperature: 14.1, targetTemperature: 23.5, targetTemperatureDelta: 0.1, humidity: 54.3},
  {id: '2', temperature: 5.1, targetTemperature: 5., targetTemperatureDelta: 0.1, humidity: 85.1},
]
const arduinoapi = new ArduinoController('http://192.168.2.2')

export default function () {
  const [state,setState] = React.useState({version:'offline', unixtime: 0, zones})

  React.useEffect( ()=>{
    arduinoapi.getInfo()
      .then(response=>response.text())
      .then(text=>{ setState(ArduinoController.parseInfo(text)) })
      .catch(() => console.log('ArduinoController not available'))

    const i = setInterval(()=>{
      arduinoapi.getInfo()
        .then(response=>response.text())
        .then(text=>setState(ArduinoController.parseInfo(text)))
        .catch(()=>{
          console.log('ArduinoController not available')
          setState( s => ({...s, version: 'offline'}) )
        })

    }, 10000)
    return () => clearInterval(i)
  }, [])

  const onSetTemperature = React.useCallback((zone) => {
    arduinoapi.setTemperature(zone.id, zone.targetTemperature)
    .then(()=>{
      console.log('ArduinoController set temperature')
      setState( s => {
        const zones = s.zones.map( rec => rec.id==zone.id ? zone : rec )
        return {...s, zones}
      })
    })
    .catch(() => {
      console.log('ArduinoController not available')
    })
  })

  const onSetPowerControl = React.useCallback((zone) => {
    if(state.zones[zone].onControl) {
      arduinoapi.powerOff(zone)
        .then(()=>{
          console.log('powerOff',zone)
          setState(s=>{
            const zones = s.zones
            zones[zone].onControl = 0
            return {...s, zones}
          })
        })
        .catch(()=>console.log('Fail powerOff',zone))
      return
    }
    arduinoapi.powerOn(zone)
      .then(()=>{
        console.log('powerOn',zone)
        setState(s=>{
          const zones = s.zones
          zones[zone].onControl = 1
          return {...s, zones}
        })
      })
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
          <TimeDiagramsSet></TimeDiagramsSet>
        </div>
        <div className={styles.info}>{JSON.stringify(state)}</div>
      </div>
    </div>
  )
}