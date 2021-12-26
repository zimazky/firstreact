import Header from './Header.jsx';
import TemperatureControl from './TemperatureControl.jsx'
import TimeDiagramsSet from './TimeDiagramsSet.jsx'
import styles from './App.module.css'
import ArduinoController from '../arduinoapi.js/arduinoapi.js';

export default function () {
  let zones = [
    {id: '1', temperature: 21.5, targetTemperature: 25., targetTemperatureDelta: 0.2, humidity: 56.},
    {id: '2', temperature: 22.4, targetTemperature: 23.4, targetTemperatureDelta: 0.1, humidity: 55.6},
    {id: '3', temperature: 13.5, targetTemperature: 0., targetTemperatureDelta: 0., humidity: 98.2}
  ];
  const [state,setState] = React.useState(zones)
  const [s,setS] = React.useState(zones)
  React.useEffect( ()=>{
    const arduinoapi = new ArduinoController('http://192.168.2.2')
    arduinoapi.getInfo().then(response=>response.text()).then(text=>{
      setS(ArduinoController.parseInfo(text))
    })
    const i = setInterval(()=>{
      arduinoapi.getInfo().then(response=>response.text()).then(text=>{
        setS(ArduinoController.parseInfo(text))
      })
    },10000)
    return clearInterval(i)
  }, [])

  return (
    <div className={styles.wrapper}>
      <Header firmware={s.version} controllerDateTime={new Date(s.unixtime*1000).toLocaleTimeString()}/>
      <div className={styles.main}>
        <div className={styles.controlsbox}>
          {state.map((zone, index) => <TemperatureControl key={index} zone={zone} update={(modifyedZone)=>{setState(state.map((rec)=>{console.log(modifyedZone); return (rec.id==modifyedZone.id)?modifyedZone:rec}))}}/>)}
        </div>
        <div className={styles.diagramsbox}>
          <TimeDiagramsSet></TimeDiagramsSet>
        </div>
        <div>{JSON.stringify(s)}</div>
      </div>
    </div>
  )
}