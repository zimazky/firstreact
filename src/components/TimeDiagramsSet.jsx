import {TimeDiagram, Line, SteppedLine, YTickLabels} from './Graphs.jsx'
import Modal from './Modal.jsx';
import {TimeTable} from './Table.jsx'
import styles from './TimeDiagramsSet.module.css'

const width = 350
const height = 250
const barw = 1

export default function TimeDiagramsSet(props) {
  
  const [timeInterval, setTimeInterval] = React.useState(props.timeInterval)
  const [dataset, setDataset] = React.useState({thermalData:[],hydroData:[]})
  const [selectedDate, setSelectedDate] = React.useState(0)
  const logController = React.useRef(props.logController).current
	React.useEffect(()=>{
		setTimeInterval( ti=>({begin: props.timeInterval.end-ti.end+ti.begin, end: props.timeInterval.end}) )
	},[props.timeInterval.end])
  React.useEffect(()=>{
    logController.setOnLoad( ()=>setTimeInterval( ti=>({...ti}) ))
		logController.addThermalSensor(2,['white','white','red'],new Date('2016.04.29')/1000)
		logController.addThermalSensor(3,['white','white','red'],new Date('2018.09.14')/1000)
		logController.addHydroSensor(0,['white','white','red'],new Date('2021.07.25')/1000)
  },[])	

  React.useEffect(()=>{
    let tstep = (barw*(timeInterval.end-timeInterval.begin)/width)
		const thermalData = logController.getThermalSensorsRegData(timeInterval,tstep)
		const hydroData = logController.getHydroSensorsRegData(timeInterval,tstep)
    setDataset({thermalData, hydroData})
  },[timeInterval])

  const onShift = React.useCallback( (d) => {
    setTimeInterval((prevTimeInterval)=>{
      let interval = prevTimeInterval.end-prevTimeInterval.begin
      return { begin: prevTimeInterval.begin-interval*d, end: prevTimeInterval.end-interval*d }
    })
  })

  const onZoom = React.useCallback( (z,k) => {
    setTimeInterval((prevTimeInterval)=>{
      let interval = prevTimeInterval.end-prevTimeInterval.begin
      if ( z*interval < 300 ) return prevTimeInterval
      let timeOffset = prevTimeInterval.begin+k*interval
      return { begin: timeOffset-z*(timeOffset-prevTimeInterval.begin), end: timeOffset+z*(prevTimeInterval.end-timeOffset)}
    })
  })

	const onSelectDate = React.useCallback( (date) => {
		setSelectedDate(date)
	})

  //console.log(dataset)
 	let tMin = Math.min(...dataset.thermalData.map(v=>v[0].min))
	let tMax = Math.max(...dataset.thermalData.map(v=>v[0].max))
	let hMin = Math.min(...dataset.thermalData.map(v=>v[1].min))
	let hMax = Math.max(...dataset.thermalData.map(v=>v[1].max))
  
	let hpMin = Math.min(...dataset.hydroData.map(v=>v.min))
	let hpMax = Math.max(...dataset.hydroData.map(v=>v.max))

  let selectedDateStart = (~~((selectedDate+3*3600)/86400))*86400-3*3600
  return (
    <div className={styles.wrapper}>
      <div className={styles.diagramsColumn}>
        <TimeDiagram title='Temperature, °C' timeInterval={timeInterval} onShift={onShift} onZoom={onZoom} onSelectDate={onSelectDate} min={tMin} max={tMax} width={width} height={height}>
          {dataset.thermalData[0] && <Line data={dataset.thermalData[0][0].zdata} 
          height={height} min={tMin} max={tMax} barw={barw} color='#ffa23c'/>}
					{dataset.thermalData[1] && <Line data={dataset.thermalData[1][0].zdata} 
          height={height} min={tMin} max={tMax} barw={barw} color='#88a23c'/>}
        </TimeDiagram>
        <TimeDiagram title='Humidity, %' timeInterval={timeInterval} onShift={onShift} onZoom={onZoom} onSelectDate={onSelectDate} min={hMin} max={hMax} width={width} height={height}>
          {dataset.thermalData[0] && <Line data={dataset.thermalData[0][1].zdata}
          height={height} min={hMin} max={hMax} barw={barw} color='#bbb'/>}
          {dataset.thermalData[1] && <Line data={dataset.thermalData[1][1].zdata}
          height={height} min={hMin} max={hMax} barw={barw} color='#88bbbb'/>}
        </TimeDiagram>
        <TimeDiagram title='Pressure Hydro System, bar' timeInterval={timeInterval} onShift={onShift} onZoom={onZoom} onSelectDate={onSelectDate} min={hpMin} max={hpMax} width={width} height={height}>
          {dataset.hydroData[0] && <Line data={dataset.hydroData[0].zdata}
          height={height} min={hpMin} max={hpMax} barw={barw} color='#ffa23c'/>}
        </TimeDiagram>
      </div>
			{ selectedDate!=0 && 
			<Modal isOpen={selectedDate!=0} title={'Set target temperature for Zone'} onCancel={()=>{setSelectedDate(0)}}>
				<TimeTable
					title={new Date(selectedDate*1000).toLocaleDateString() + ' Z2 H'}
					data={logController.hydroSensors[0].timeslots[selectedDateStart]?logController.hydroSensors[0].timeslots[selectedDateStart].data:[]}
					time={selectedDate}
				/>
			</Modal>
			}
    </div>
  )
}