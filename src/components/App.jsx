import TemperatureControl from './TemperatureControl.jsx'
import Diagram from './Diagram.jsx'
import Line from './Line.jsx'
import { TimeIntervalProvider } from './TimeIntervalContext.jsx'

export default function () {
  let dataSet = [15,18,14,13,15,20,21,25,29,24,25,22,10,12,9,8,6,3,5,4,8,7]
  let zones = [
    {id: '1', temperature: 21.5, targetTemperature: 25., targetTemperatureDelta: 0.2, humidity: 56.},
    {id: '2', temperature: 22.4, targetTemperature: 23.4, targetTemperatureDelta: 0.1, humidity: 55.6},
    {id: '3', temperature: 13.5, targetTemperature: 0., targetTemperatureDelta: 0., humidity: 98.2}
  ];
  const [state,setState] = React.useState(zones)
  
  let ti = {}
  ti.end = Date.now()/1000
  ti.begin = ti.end-2*24*3600

  return (
    <>
      <TimeIntervalProvider initTimeInterval={ti}>
        <Diagram width={600} height={300}>
          <Line data={dataSet}/>
        </Diagram>
        <Diagram>
        </Diagram>
      </TimeIntervalProvider>
      <TimeIntervalProvider initTimeInterval={ti}>
        <Diagram title='Another time interval'>
        </Diagram>
      </TimeIntervalProvider>
      <div>
        {state.map((zone, index) => <TemperatureControl key={index} zone={zone} update={(modifyedZone)=>{setState(state.map((rec)=>{console.log(modifyedZone); return (rec.id==modifyedZone.id)?modifyedZone:rec}))}}/>)}
      </div>
    </>
  )
}