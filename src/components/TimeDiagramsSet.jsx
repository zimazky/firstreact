import ArduinoLogAPI from '../arduinoapi.js/arduinologapi.js'
import TimeSlots from '../utils/timeslots.js'
import {TimeDiagram, Line, SteppedLine, YTickLabels} from './Graphs.jsx'
import Modal from './Modal.jsx';
import {TimeTable} from './Table.jsx'
import styles from './TimeDiagramsSet.module.css'

///////////////////////////////////////////////////////////////////////////////
// Класс таймслотов зоны контроллера
///////////////////////////////////////////////////////////////////////////////
export class ArduinoZone extends TimeSlots {
	constructor(url, id, tcolor, hcolor, pcolor) {
		super(url, 'Z'+id);
		this.tcolor = tcolor; // цвет линии температуры
		this.hcolor = hcolor; // цвет линии влажности
		this.pcolor = pcolor; // цвет линии подачи мощности
		this.showpower = false;// показывать подачу мощности на диаграмме
		
		this.parse = function(t, textdata) {
			return ArduinoLogAPI.parse(textdata,t)
		}
	}

	preparezdata(timeinterval, tstep) {
		var t = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE};
		var h = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}; 
		var	p = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE};  
		
		for(var it=timeinterval.begin;it<timeinterval.end;it+=tstep) {
			t.zdata.push({flag:0});
			h.zdata.push({flag:0});
			p.zdata.push({flag:0});
		}
		return {t:t, h:h, p:p};
	}

	//=========================================================================
	// Функция для получения перемасштабированного регуляризованного датасета 
	// на интервале timeinterval
	//   tstep - шаг регуляризации
	// Возвращается структура {t:{zdata,min,max},h:{zdata,min,max},p:{zdata,min,max}}
	//   zdata
	//   min
	//   max
	//=========================================================================
	getzdata(timeinterval, tstep) {
		
		var a = this.preparezdata(timeinterval, tstep);
		
		for(var it=(~~((timeinterval.begin+3*3600)/86400))*86400-3*3600;it<timeinterval.end;it+=86400) {
			if(typeof(this.array[it]) === 'undefined') {
				this.load(it, 'text'); // подгрузка данных таймслота
			}
			else {
				// заполняем массив zdata перемасштабированными данными
				if(this.array[it].flag != 0) {
					a.t = this.array[it].t.fillzdata(timeinterval,tstep,a.t);
					a.h = this.array[it].h.fillzdata(timeinterval,tstep,a.h);
					a.p = this.array[it].p.fillzdata(timeinterval,tstep,a.p);
				}
			}
		}
		//console.log(a);
		return a;
	}
}


let zones = []
const width = 350
const height = 250
const barw = 1

export default function TimeDiagramsSet(props) {
  
  const [timeInterval, setTimeInterval] = React.useState(props.timeInterval)
  const [dataset, setDataset] = React.useState([])
  const [selectedDate, setSelectedDate] = React.useState(0)
	React.useEffect(()=>{
		setTimeInterval( ti=>({begin: props.timeInterval.end-ti.end+ti.begin, end: props.timeInterval.end}) )
	},[props.timeInterval.end])
  React.useEffect(()=>{
    zones.push(new ArduinoZone('./log/',2,'white','white','red'))
		zones.push(new ArduinoZone('./log/',3,'white','white','red'))

    zones.forEach((v)=>{v.onload = ()=>setTimeInterval( ti=>( {...ti}) )})
  },[])	

  React.useEffect(()=>{
    let tstep = (barw*(timeInterval.end-timeInterval.begin)/width)
    let newDataset=zones.map(v=>v.getzdata(timeInterval,tstep))
    setDataset(newDataset)
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

	let tMin = Math.min(...dataset.map(v=>v.t.min))
	let tMax = Math.max(...dataset.map(v=>v.t.max))
	let hMin = Math.min(...dataset.map(v=>v.h.min))
	let hMax = Math.max(...dataset.map(v=>v.h.max))
	//if(selectedDate!=0) console.log(zones[0].array[(~~((selectedDate+3*3600)/86400))*86400-3*3600])
	let selectedDateStart = (~~((selectedDate+3*3600)/86400))*86400-3*3600
  return (
    <div className={styles.wrapper}>
      <div className={styles.diagramsColumn}>
        <TimeDiagram title='Temperature, °C' timeInterval={timeInterval} onShift={onShift} onZoom={onZoom} onSelectDate={onSelectDate} min={tMin} max={tMax} width={width} height={height}>
          {dataset[0] && <Line data={dataset[0].t.zdata} height={height} min={tMin} max={tMax} barw={barw} color='#ffa23c'/>}
					{dataset[1] && <Line data={dataset[1].t.zdata} height={height} min={tMin} max={tMax} barw={barw} color='#88a23c'/>}
        </TimeDiagram>
        <TimeDiagram title='Humidity, %' timeInterval={timeInterval} onShift={onShift} onZoom={onZoom} onSelectDate={onSelectDate} min={hMin} max={hMax} width={width} height={height}>
          {dataset[0] && <Line data={dataset[0].h.zdata} height={height} min={hMin} max={hMax} barw={barw} color='#bbb'/>}
          {dataset[1] && <Line data={dataset[1].h.zdata} height={height} min={hMin} max={hMax} barw={barw} color='#88bbbb'/>}
        </TimeDiagram>
      </div>
			{ selectedDate!=0 && 
			<Modal isOpen={selectedDate!=0} title={'Set target temperature for Zone'} onCancel={()=>{setSelectedDate(0)}}>
				<TimeTable
					title={new Date(selectedDate*1000).toLocaleDateString() + ' Z2 H'}
					data={zones[0].array[selectedDateStart].h?zones[0].array[selectedDateStart].h.data:[]}
					time={selectedDate}
				/>
			</Modal>
			}
    </div>
  )
}