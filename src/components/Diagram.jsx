import styles from './Diagram.module.css'
//import { useTimeInterval } from './TimeIntervalContext.jsx'

const timeZone = 3
const timeUnits = [
  // Массив интервалов для делений шкалы времени
  // value - шаг деталей, в секундах
  // unit - обозначение единицы измерения
  // contextvalue - шаг интервала контекста
  // shift - смещение начала интервала, для учета начала дня временной зоны или начала недели, в секундах
  //                                              интервал деталей		интервал контекста
  {value:1, unit:'s', shift: timeZone*3600}, 			            //1s 		1m		YYYY.MM.DD hh:mm
  {value:2, unit:'s', shift: timeZone*3600},			            //2s		1m		YYYY.MM.DD hh:mm
  {value:5, unit:'s', shift: timeZone*3600},			            //5s		1m		YYYY.MM.DD hh:mm
  {value:10, unit:'s', shift: timeZone*3600},			            //10s		1m		YYYY.MM.DD hh:mm
  {value:20, unit:'s', shift: timeZone*3600},			            //20s	  1m		YYYY.MM.DD hh:mm
  {value:30, unit:'s', shift: timeZone*3600},			            //30s		1m		YYYY.MM.DD hh:mm
  {value:60, unit:'m', shift: timeZone*3600},			            //1m		1h		YYYY.MM.DD hh:00
  {value:120, unit:'m', shift: timeZone*3600},		            //2m		1h		YYYY.MM.DD hh:00
  {value:300, unit:'m', shift: timeZone*3600},		            //5m		1h		YYYY.MM.DD hh:00
  {value:600, unit:'m', shift: timeZone*3600},		            //10m		1h		YYYY.MM.DD hh:00
  {value:1200, unit:'m', shift: timeZone*3600},		            //20m		1h		YYYY.MM.DD hh:00
  {value:1800, unit:'m', shift: timeZone*3600},		            //30m		1h		YYYY.MM.DD hh:00
  {value:3600, unit:'h', shift: timeZone*3600},		            //1h		1d		YYYY.MM.DD
  {value:7200, unit:'h', shift: timeZone*3600},		            //2h		1d		YYYY.MM.DD
  {value:10800, unit:'h', shift: timeZone*3600},	            //3h		1d		YYYY.MM.DD
  {value:21600, unit:'h', shift: timeZone*3600},	            //6h		1d		YYYY.MM.DD
  {value:43200, unit:'h', shift: timeZone*3600},	            //12h		1d		YYYY.MM.DD
  {value:86400, unit:'d', shift: timeZone*3600},	            //1d		1M		YYYY.MM
  {value:172800, unit:'d', shift: timeZone*3600},	            //2d		1M		YYYY.MM
  {value:345600, unit:'d', shift: timeZone*3600},	            //4d		1M		YYYY.MM
  {value:604800, unit:'w', shift: 3*24*3600+timeZone*3600},	  //1w		1M		YYYY.MM
  {value:1209600, unit:'w', shift: 3*24*3600+timeZone*3600},	//2w		1M		YYYY.MM
  {value:30.4375*86400, unit:'M', shift: 1},	                //1M		1Y		YYYY
  {value:60.875*86400, unit:'M', shift: 2},	                  //2M		1Y		YYYY
  {value:91.3125*86400, unit:'M', shift: 3},	                //3M		1Y		YYYY
  {value:182.625*86400, unit: 'M', shift: 6},	                //6M		1Y		YYYY

//  {value:~~(365.25*86400), unit:'Y', shift: null},//1Y	1Y		YYYY
]
const monthNames = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

///////////////////////////////////////////////////////////////////////////////
// Функция получения массива меток шкалы впемени верхнего уровня (контекст)
// startTime  - время на левой границы шкалы
// endTime    - время на правой границы шкалы
// width      - длина шкалы времени в пикселях
// maxTick    - максимальный интервал между делениями нижнего уровня шкалы 
//              (детальный уровень) в пикселях
//
// Возвращает массив объектов { tick, label, width }
// tick  - таймстемп деления
// label - строковая метка деления шкалы
// width - интервал в пикселях до следующей метки
function getContextTimeTickLabels( startTime, endTime, width, maxTick = 50) {
  let maxTickTimeInterval = maxTick*(endTime-startTime)/width
  let [i] = [0,...timeUnits.filter(a => maxTickTimeInterval>=a.value).keys()].slice(-1)
  let scale = width/(endTime-startTime)

  const contextTicks = []
  let currentDate = new Date((startTime+timeZone*3600)*1000)
  let currentTick = startTime
  if (timeUnits[i].unit == 'M' ) {
    do {
      let yr = currentDate.getUTCFullYear()
      currentDate.setUTCHours(0)
      currentDate.setMinutes(0)
      currentDate.setSeconds(0)
      currentDate.setUTCFullYear(yr+1,0,1)
      let nextCurrentTick = currentDate.getTime()/1000-timeZone*3600
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      contextTicks.push({tick: currentTick, label: yr, width})
      currentTick = nextCurrentTick
    } while(currentTick < endTime)
    return contextTicks;
  }
  if (timeUnits[i].unit == 'd' || timeUnits[i].unit == 'w') {
    do {
      let m = currentDate.getUTCMonth()+1
      let yr = currentDate.getUTCFullYear()
      currentDate.setUTCHours(0)
      currentDate.setMinutes(0)
      currentDate.setSeconds(0)
      currentDate.setUTCDate(1)
      currentDate.setUTCMonth(m)
      let nextCurrentTick = currentDate.getTime()/1000-timeZone*3600
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      contextTicks.push({tick: currentTick, label: yr+'.'+((m<10)?'0':'')+m, width})
      currentTick = nextCurrentTick
    } while(currentTick < endTime)
    return contextTicks;
  }
  if (timeUnits[i].unit == 'h') {
    let nextCurrentTick = (~~((startTime+timeUnits[i].shift)/86400+1))*86400-timeUnits[i].shift
    do {
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      let currentDate = new Date((currentTick+timeZone*3600)*1000)
      let d = currentDate.getUTCDate()
      let m = currentDate.getUTCMonth()+1
      let yr = currentDate.getUTCFullYear()
      contextTicks.push({tick: currentTick, label: yr+'.'+((m<10)?'0':'')+m+'.'+((d<10)?'0':'')+d, width})
      currentTick = nextCurrentTick
      nextCurrentTick+=86400
    } while(currentTick < endTime)
    return contextTicks;
  }
  if (timeUnits[i].unit == 'm') {
    let nextCurrentTick = (~~((startTime+timeUnits[i].shift)/3600+1))*3600-timeUnits[i].shift
    do {
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      let currentDate = new Date((currentTick+timeZone*3600)*1000)
      let hr = currentDate.getUTCHours()
      let d = currentDate.getUTCDate()
      let m = currentDate.getUTCMonth()+1
      contextTicks.push({tick: currentTick, label: ((m<10)?'0':'')+m+'.'+((d<10)?'0':'')+d+' '+((hr<10)?'0':'')+hr+'h', width})
      currentTick = nextCurrentTick
      nextCurrentTick+=3600
    } while(currentTick < endTime)
    return contextTicks;
  }
  if (timeUnits[i].unit == 's') {
    let nextCurrentTick = (~~((startTime+timeUnits[i].shift)/60+1))*60-timeUnits[i].shift
    do {
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      let currentDate = new Date((currentTick+timeZone*3600)*1000)
      let mi = currentDate.getUTCMinutes()
      let hr = currentDate.getUTCHours()
      contextTicks.push({tick: currentTick, label: ((hr<10)?'0':'')+hr+':'+((mi<10)?'0':'')+mi, width})
      currentTick = nextCurrentTick
      nextCurrentTick+=60
    } while(currentTick < endTime)
    return contextTicks;
  }
  return contextTicks;
}

///////////////////////////////////////////////////////////////////////////////
// Функция получения массива меток шкалы времени нижнего уровня (детали)
// startTime  - время на левой границы шкалы
// endTime    - время на правой границы шкалы
// width      - длина шкалы времени в пикселях
// maxTick    - максимальный интервал между делениями нижнего уровня шкалы 
//              (детальный уровень) в пикселях
//
// Возвращает массив объектов { tick, label, width }
// tick  - таймстемп деления
// label - строковая метка деления шкалы
// width - интервал в пикселях до следующей метки
function getDetailTimeTickLabels( startTime, endTime, width, maxTick = 50) {
  let maxTickTimeInterval = maxTick*(endTime-startTime)/width
  let [i] = [0,...timeUnits.filter(a => maxTickTimeInterval>=a.value).keys()].slice(-1)
  let scale = width/(endTime-startTime)

  let currentTick = startTime
  let currentDate = new Date((startTime+timeZone*3600)*1000)
  const detailTicks = []
  if (timeUnits[i].unit == 'M') {
    do {
      let m = currentDate.getUTCMonth()
      let yr = currentDate.getUTCFullYear()
      currentDate.setUTCHours(0)
      currentDate.setMinutes(0)
      currentDate.setSeconds(0)
      currentDate.setUTCDate(1)
      currentDate.setUTCMonth(m + (timeUnits[i].shift - m%timeUnits[i].shift))
      let nextCurrentTick = currentDate.getTime()/1000-timeZone*3600
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      detailTicks.push({tick: currentTick, label: monthNames[m], width})
      currentTick = nextCurrentTick
    } while(currentTick < endTime)
    return detailTicks
  }
  let tickInterval = timeUnits[i].value
  let nextCurrentTick = (~~((startTime+timeUnits[i].shift)/tickInterval+1))*tickInterval-timeUnits[i].shift
  if (timeUnits[i].unit == 's') {
    do {
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      currentDate = new Date((currentTick+timeZone*3600)*1000)
      let s = currentDate.getUTCSeconds()
      detailTicks.push({tick: currentTick, label: ((s<10)?'0':'')+s+'\'\'', width})
      currentTick = nextCurrentTick
      nextCurrentTick += tickInterval
    } while(currentTick < endTime)
    return detailTicks
  }
  if (timeUnits[i].unit == 'm') {
    do {
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      currentDate = new Date((currentTick+timeZone*3600)*1000)
      let m = currentDate.getUTCMinutes()
      detailTicks.push({tick: currentTick, label: ((m<10)?'0':'')+m+'\'', width})
      currentTick = nextCurrentTick
      nextCurrentTick += tickInterval
    } while(currentTick < endTime)
    return detailTicks
  }
  if (timeUnits[i].unit == 'h') {
    do {
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      currentDate = new Date((currentTick+timeZone*3600)*1000)
      let hr = currentDate.getUTCHours()
      detailTicks.push({tick: currentTick, label: ((hr<10)?'0':'')+hr+'h', width})
      currentTick = nextCurrentTick
      nextCurrentTick += tickInterval
    } while(currentTick < endTime)
    return detailTicks
  }
  if (timeUnits[i].unit == 'd') {
    do {
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      currentDate = new Date((currentTick+timeZone*3600)*1000)
      let d = currentDate.getUTCDate()
      detailTicks.push({tick: currentTick, label: ((d<10)?'0':'')+d, width})
      currentTick = nextCurrentTick
      nextCurrentTick += tickInterval
    } while(currentTick < endTime)
    return detailTicks
  }
  if (timeUnits[i].unit == 'w') {
    do {
      let width = nextCurrentTick<endTime ? (nextCurrentTick-currentTick)*scale : (endTime-currentTick)*scale
      currentDate = new Date((currentTick+timeZone*3600)*1000)
      let d = currentDate.getUTCDate();
      detailTicks.push({tick: currentTick, label: ((d<10)?'0':'')+d, width})
      currentTick = nextCurrentTick
      nextCurrentTick += tickInterval
    } while(currentTick < endTime)
    return detailTicks
  }
  return detailTicks
}

///////////////////////////////////////////////////////////////////////////////
// Компонент временной диаграмы
export default function Diagram({title='TimeDiagram', width=300, height=200, children=null, timeInterval, onShift=()=>{}, onZoom=()=>{}}) {

//  const {timeInterval,updateTimeInterval} = useTimeInterval()
  const [cursorPosition, setCursorPosition] = React.useState(0)
  const diagramElement = React.useRef(null);
  /////////////////////////////////////////////////////////////////////////////
  // Обработчики мыши
  let isDragging = false
  let clientX0 = 0.
  function onMouseDown(e) {
    e.preventDefault()
    isDragging = true
    clientX0 = e.offsetX
  }
  function onMouseMove(e) {
    if (isDragging) {
      let d = (e.offsetX-clientX0)/width
      clientX0 = e.offsetX
      onShift(d)
      //updateTimeInterval({type:'shift',value:d})
    }
    setCursorPosition(e.offsetX)
  }
  function onMouseUp(e) {
    e.preventDefault()
    isDragging = false
  }
  function onWheel(e) {
    e.preventDefault()
    let z = e.wheelDelta>0 ? 0.9 : 1.1111111111111112
    let k = (e.offsetX)/width
    onZoom(z,k)
    //updateTimeInterval({type:'zoom',value:z,offset:k})
  }
  function onMouseOut(e) {
    setCursorPosition(0)
  }
  /////////////////////////////////////////////////////////////////////////////
  // Регистрация обработчиков
  React.useEffect(() => {
    console.log('AddEventListener Mouse')
    diagramElement.current.addEventListener('wheel', onWheel)
    diagramElement.current.addEventListener('mousedown', onMouseDown)
    diagramElement.current.addEventListener('mousemove', onMouseMove)
    diagramElement.current.addEventListener('mouseup', onMouseUp)
    diagramElement.current.addEventListener('mouseout', onMouseOut)
    return ()=>{
      console.log('RemoveEventListener Mouse')
      diagramElement.current.removeEventListener('wheel', onWheel)
      diagramElement.current.removeEventListener('mousedown', onMouseDown)
      diagramElement.current.removeEventListener('mousemove', onMouseMove)
      diagramElement.current.removeEventListener('mouseup', onMouseUp)
      diagramElement.current.removeEventListener('mouseout', onMouseOut)
      }
  }, [])

  return (
    <>
    <div className={styles.header} style={{width: width}}><div>{title}</div>
    {/*<div ><Button>{'⇔'}</Button><Button>{'{...}'}</Button></div>*/}
    </div>
    <div className={styles.gridBox}>
      <div className={styles.context}> { getContextTimeTickLabels(timeInterval.begin,timeInterval.end,width,50).map(l=>{ 
        return (
          <div className={styles.contextTickLabels} key={l.tick} style={{width: l.width}}>{l.label}</div>
        )})
      }
      </div>
      <div className={styles.detail} style={{height: height+12}}> { 
        getDetailTimeTickLabels(timeInterval.begin,timeInterval.end,width,50).map(l=>{ 
        return (
          <div className={styles.detailTickLabels} key={l.tick} style={{width: l.width, height: height+12}}>{l.label}</div>
        )})
      }
      </div>
      <svg ref={diagramElement} width={width} height={height} viewBox={'0 0 ' + width + ' ' + height} 
      className={styles.svgBox}>
        {children}
      </svg>
    </div>
    <div>{new Date((timeInterval.begin+cursorPosition*(timeInterval.end-timeInterval.begin)/width)*1000).toLocaleString()}</div>
    </>
  )
}