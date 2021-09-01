//import TimeInterval from '../TimeInterval.js'
import styles from './Diagram.module.css'


const timeZone = 3
const timeUnits = [
  // value - шаг деталей, в секундах
  // qt - размер единицы измерения деталей, в секундах
  // unit - обозначение единицы измерения
  // contextvalue - шаг интервала контекста
  // shift - смещение начала интервала, для учета начала дня временной зоны или начала недели, в секундах
  
                                                    //интервал деталей		интервал контекста
  {value:1, qt:1, unit:'s', shift: timeZone*3600}, 			    //1s 					1m						YYYY.MM.DD hh:mm
  {value:2, qt:1, unit:'s', shift: timeZone*3600},			    //2s					1m						YYYY.MM.DD hh:mm
  {value:5, qt:1, unit:'s', shift: timeZone*3600},			    //5s					1m						YYYY.MM.DD hh:mm
  {value:10, qt:1, unit:'s', shift: timeZone*3600},			    //10s					1m						YYYY.MM.DD hh:mm
  {value:20, qt:1, unit:'s', shift: timeZone*3600},			    //20s					1m						YYYY.MM.DD hh:mm
  {value:30, qt:1, unit:'s', shift: timeZone*3600},			    //30s					1m						YYYY.MM.DD hh:mm
  {value:60, qt:60, unit:'m', shift: timeZone*3600},			  //1m					1h						YYYY.MM.DD hh:00
  {value:120, qt:60, unit:'m', shift: timeZone*3600},		    //2m					1h						YYYY.MM.DD hh:00
  {value:300, qt:60, unit:'m', shift: timeZone*3600},		    //5m					1h						YYYY.MM.DD hh:00
  {value:600, qt:60, unit:'m', shift: timeZone*3600},		    //10m					1h						YYYY.MM.DD hh:00
  {value:1200, qt:60, unit:'m', shift: timeZone*3600},		  //20m					1h						YYYY.MM.DD hh:00
  {value:1800, qt:60, unit:'m', shift: timeZone*3600},		  //30m					1h						YYYY.MM.DD hh:00
  {value:3600, qt:3600, unit:'h', shift: timeZone*3600},		//1h					1d						YYYY.MM.DD
  {value:7200, qt:3600, unit:'h', shift: timeZone*3600},		//2h					1d						YYYY.MM.DD
  {value:10800, qt:3600, unit:'h', shift: timeZone*3600},	  //3h					1d						YYYY.MM.DD
  {value:21600, qt:3600, unit:'h', shift: timeZone*3600},	  //6h					1d						YYYY.MM.DD
  {value:43200, qt:3600, unit:'h', shift: timeZone*3600},	  //12h					1d						YYYY.MM.DD
  {value:86400, qt:86400, unit:'d', shift: timeZone*3600},	//1d					1M						YYYY.MM
  {value:172800, qt:86400, unit:'d', shift: timeZone*3600},	//2d					1M						YYYY.MM
  {value:604800, qt:604800, unit:'w', shift: 3*24*3600+timeZone*3600},	//1w		1M						YYYY.MM
  {value:1209600, qt:604800, unit:'w', shift: 3*24*3600+timeZone*3600},	//2w		1M						YYYY.MM
  {value:2419200, qt:604800, unit:'w', shift: 3*24*3600+timeZone*3600}	//4w		1M						YYYY
]

function getContextTimeTickLabels( startTime, endTime, width, maxTick = 50) {
  let maxTickTimeInterval = maxTick*(endTime-startTime)/width
  let [i] = [0,...timeUnits.filter(a => maxTickTimeInterval>=a.value).keys()].slice(-1)
  let scale = width/(endTime-startTime)

  // Отображение уровня контекста
  // 1. Определяем дату-время левой границы
  // 2. В зависимости от уровня контекста найти границу контекста и отобразить штрихом, вывести текстовую метку
  // 3. Повторить пункт 2 до тех пор пока не выйдем за границы отображения.
  const contextTicks = []
  let ldate = new Date((startTime+timeZone*3600)*1000);
  let lhr = ldate.getUTCHours();
  let ld = ldate.getUTCDate();
  let lm = ldate.getUTCMonth()+1;
  let lyr = ldate.getUTCFullYear();
  if (timeUnits[i].unit == 'd' || timeUnits[i].unit == 'w') {
    // контекст - месяцы
    let date = new Date((startTime+timeZone*3600)*1000);
    for(let k=0,cx=startTime;cx<endTime;k++) {
      let m = date.getUTCMonth()+1;
      let yr = date.getUTCFullYear();
      date.setUTCHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setUTCDate(1);
      date.setUTCMonth(m);
      m = date.getUTCMonth()+1;
      yr = date.getUTCFullYear();
      cx = date.getTime()/1000-timeZone*3600;
      let at = (cx-startTime)*scale;
      if (k==0 && at>60) contextTicks.push({label: lyr+'.'+((lm<10)?'0':'')+lm+'.'+((ld<10)?'0':'')+ld, x: 0})
      contextTicks.push({label: yr+'.'+((m<10)?'0':'')+m, x: at})
    }
  }
  else if (timeUnits[i].unit == 'h') {
    // контекст - дни
    for(let k=0,cx=startTime; cx<endTime; cx+=86400,k++) {
      if (k==0) cx=(~~((startTime+timeUnits[i].shift)/86400+1))*86400-timeUnits[i].shift;
      let at = (cx-startTime)*scale;
      if (k==0 && at>60) contextTicks.push({label: lyr+'.'+((lm<10)?'0':'')+lm +'.'+((ld<10)?'0':'')+ld, x:0})
      let date = new Date((cx+timeZone*3600)*1000);
      let d = date.getUTCDate();
      let m = date.getUTCMonth()+1;
      let yr = date.getUTCFullYear();
      contextTicks.push({label: yr+'.'+((m<10)?'0':'')+m+'.'+((d<10)?'0':'')+d, x: at})
    }
  }
  else if (timeUnits[i].unit == 'm') {
    // контекст - часы
    for(let k=0,cx=startTime; cx<endTime; cx+=3600,k++) {
      if (k==0) cx=(~~((startTime+timeUnits[i].shift)/3600+1))*3600-timeUnits[i].shift; 
      let at = (cx-startTime)*scale;
      if (k==0 && at>95) 
        contextTicks.push({label: lyr+'.'+((lm<10)?'0':'')+lm+'.'+((ld<10)?'0':'')+ld+' '+((lhr<10)?'0':'')+lhr+':00', x: 0})
      let date = new Date((cx+timeZone*3600)*1000);
      let hr = date.getUTCHours();
      let d = date.getUTCDate();
      let m = date.getUTCMonth()+1;
      let yr = date.getUTCFullYear();
      contextTicks.push({ label: ((m<10)?'0':'')+m+'.'+((d<10)?'0':'')+d+' '+((hr<10)?'0':'')+hr+'h', x: at})
    }
  }
  return contextTicks;
}
    
function getDetailTimeTickLabels( startTime, endTime, width, maxTick = 50) {
  let maxTickTimeInterval = maxTick*(endTime-startTime)/width
  let [i] = [0,...timeUnits.filter(a => maxTickTimeInterval>=a.value).keys()].slice(-1)
  let step = timeUnits[i].value
  let tmin = (~~((startTime+timeUnits[i].shift)/step+1))*step-timeUnits[i].shift
  let scale = width/(endTime-startTime)

  // Отображение уровня деталей
  const detailTicks = []
  for(let h = tmin; h<endTime; h += step) {
    let at = (h-startTime)*scale;
    let date = new Date((h+timeZone*3600)*1000);
    if (timeUnits[i].unit == 's') {
      let s = date.getUTCSeconds();
      detailTicks.push({label: ((s<10)?'0':'')+s+'\'\'', x: at})
    }
    else if (timeUnits[i].unit == 'm') {
      let m = date.getUTCMinutes();
      detailTicks.push({label: ((m<10)?'0':'')+m+'\'', x: at})
    }
    else if (timeUnits[i].unit == 'h') {
      let hr = date.getUTCHours();
      detailTicks.push({label: ((hr<10)?'0':'')+hr+'h', x: at})
    }
    else if (timeUnits[i].unit == 'd') {
      let d = date.getUTCDate();
      detailTicks.push({label: ((d<10)?'0':'')+d, x: at})
    }
    else if (timeUnits[i].unit == 'w') {
      let d = date.getUTCDate();
      detailTicks.push({label: ((d<10)?'0':'')+d, x: at})
    }
  }
 return detailTicks
}


export default function Diagram({width=300, height=200, begin, end, dataSet, onZoom}) {

  const [timeInterval, setTimeInterval] = React.useState({begin, end})
  const diagramElement = React.useRef(null);
  
  function onZoomTimeInterval(e) {
    e.preventDefault()
    let z = Math.pow(0.9, e.wheelDelta>0 ? 1 : -1)
    let k = (e.offsetX)/width
    console.log(z)
    let d = z*(timeInterval.end-timeInterval.begin)
    //if ( d < 300 ) return //ограничение увеличения
    let t = timeInterval.begin+k*(timeInterval.end-timeInterval.begin)
    let newbegin = t-z*(t-timeInterval.begin)
    let newend = t+z*(timeInterval.end-t)
    console.log(timeInterval)
    console.log({begin: newbegin, end: newend})
    setTimeInterval({begin: newbegin, end: newend})
  }

  React.useEffect(() => {
    console.log('AddEventListener onMouseWheel')
    diagramElement.current.addEventListener('wheel', onZoomTimeInterval)
    return ()=>{diagramElement.current.removeEventListener('wheel', onZoomTimeInterval)}
  }, [timeInterval])

  let d = dataSet.map((p,i)=>{return i*5 + ' ' + p}).join(' ')
  return (
    <div className={styles.gridBox}>
      <svg ref={diagramElement} width={width} height={height} viewBox={'0 0 ' + width + ' ' + height} /*preserveAspectRatio='none'*/>
        <g className={styles.timeTicks}>
        { getContextTimeTickLabels(timeInterval.begin,timeInterval.end,300,50).map((l,i)=>{ return (
          <>
          <text key={'t'+i} x={l.x+2} y='11'>{l.label}</text>
          <line key={'l'+i} x1={l.x} y1='0' x2={l.x} y2='13' stroke='gray'></line>
          </>
        )})}
        { getDetailTimeTickLabels(timeInterval.begin,timeInterval.end,300,50).map((l,i)=>{ return (
          <>
          <text key={'dt'+i} x={l.x+2} y='24'>{l.label}</text>
          <line key={'dl'+i} x1={l.x} y1='13' x2={l.x} y2={height} stroke='gray'></line>
          </>
        )})}        
        </g>
        <polyline points={d} fill='none' stroke='white' strokeWidth='1'/>
      </svg>
    </div>
  )
}