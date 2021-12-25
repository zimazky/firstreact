import Header from './Header.jsx';
import TemperatureControl from './TemperatureControl.jsx'
import TimeDiagramsSet from './TimeDiagramsSet.jsx'

export default function () {
  let zones = [
    {id: '1', temperature: 21.5, targetTemperature: 25., targetTemperatureDelta: 0.2, humidity: 56.},
    {id: '2', temperature: 22.4, targetTemperature: 23.4, targetTemperatureDelta: 0.1, humidity: 55.6},
    {id: '3', temperature: 13.5, targetTemperature: 0., targetTemperatureDelta: 0., humidity: 98.2}
  ];
  const [state,setState] = React.useState(zones)
  

  return (
    <div style={{display: 'inline-block', maxWidth: 900}}>
      <Header/>
      <div style={{textAlign: 'left', direction: 'rtl'}}>
        <div style={{display: 'inline-block',	verticalAlign: 'top',	direction: 'ltr', margin: 4}}>
          {state.map((zone, index) => <TemperatureControl key={index} zone={zone} update={(modifyedZone)=>{setState(state.map((rec)=>{console.log(modifyedZone); return (rec.id==modifyedZone.id)?modifyedZone:rec}))}}/>)}
        </div>
        <TimeDiagramsSet></TimeDiagramsSet>
      </div>
    </div>
  )
}