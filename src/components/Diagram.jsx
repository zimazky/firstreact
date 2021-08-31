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

function displayTimeGrid( x, y, width, height, min, max, maxTick=50, color='gray', textcolor='gray') {
  let dx = maxTick*(max-min)/width
  let [i] = [0,...timeUnits.filter(a => dx<=a.value).keys()].slice(-1)
  //i = (i==0) ? 0 : i-1
  let step = timeUnits[i].value
  let tmin = (~~((min+timeUnits[i].shift)/step+1))*step-timeUnits[i].shift
  let scale = width/(max-min)

  // Отображение уровня контекста
  // 1. Определяем дату-время левой границы
  // 2. В зависимости от уровня контекста найти границу контекста и отобразить штрихом, вывести текстовую метку
  // 3. Повторить пункт 2 до тех пор пока не выйдем за границы отображения.
  let contextTicks = []
  let ldate = new Date((min+timeZone*3600)*1000);
  let lhr = ldate.getUTCHours();
  let ld = ldate.getUTCDate();
  let lm = ldate.getUTCMonth()+1;
  let lyr = ldate.getUTCFullYear();
  if (timeUnits[i].unit == 'd' || timeUnits[i].unit == 'w') {
    // контекст - месяцы
    let date = new Date((min+timeZone*3600)*1000);
    for(let k=0,cx=min;cx<max;k++) {
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
      let at = x+(cx-min)*scale;
      if (k==0 && (at-x)>60) contextTicks.push({string: lyr+'.'+((lm<10)?'0':'')+lm+'.'+((ld<10)?'0':'')+ld, x: 0})
      contextTicks.push({string: yr+'.'+((m<10)?'0':'')+m, x: at})
    }
  }
  else if (timeUnits[i].unit == 'h') {
    // контекст - дни
    for(let k=0,cx=min; cx<max; cx+=86400,k++) {
      if (k==0) cx=(~~((min+timeUnits[i].shift)/86400+1))*86400-timeUnits[i].shift;
      let at = ~~(x+(cx-min)*scale)+0.5;
      if (k==0 && (at-x)>60) contextTicks.push({string: lyr+'.'+((lm<10)?'0':'')+lm +'.'+((ld<10)?'0':'')+ld, x:0})
      let date = new Date((cx+timeZone*3600)*1000);
      let d = date.getUTCDate();
      let m = date.getUTCMonth()+1;
      let yr = date.getUTCFullYear();
      contextTicks.push({string: yr+'.'+((m<10)?'0':'')+m+'.'+((d<10)?'0':'')+d, x: at})
    }
  }
  else if (timeUnits[i].unit == 'm') {
    // контекст - часы
    for(let k=0,cx=min; cx<max; cx+=3600,k++) {
      if (k==0) cx=(~~((min+timeUnits[i].shift)/3600+1))*3600-timeUnits[i].shift; 
      let at = ~~(x+(cx-min)*scale)+0.5;
      if (k==0 && (at-x)>95) 
        contextTicks.push({string: lyr+'.'+((lm<10)?'0':'')+lm+'.'+((ld<10)?'0':'')+ld+' '+((lhr<10)?'0':'')+lhr+':00', x: 0})
      let date = new Date((cx+timeZone*3600)*1000);
      let hr = date.getUTCHours();
      let d = date.getUTCDate();
      let m = date.getUTCMonth()+1;
      let yr = date.getUTCFullYear();
      contextTicks.push({ string: ((m<10)?'0':'')+m+'.'+((d<10)?'0':'')+d+' '+((hr<10)?'0':'')+hr+'h', x: at})
    }
  }
  /*  
  // Отображение уровня деталей
  for(var h = tmin; h<max; h += step) {
    var at = ~~(x+(h-min)*scale)+0.5;
    this._ctx.beginPath();
    this._ctx.moveTo( at, y+12 ); 
    this._ctx.lineTo( at, y+height );
    this._ctx.stroke();
    var date = new Date((h+timeZone*3600)*1000);
    if (timeUnits[i].unit == 's') {
      var s = date.getUTCSeconds();
      var str = '' + ((s<10)?'0':'')+s + '\'\'';
      this._ctx.fillText(str,at,12);
    }
    else if (timeUnits[i].unit == 'm') {
      m = date.getUTCMinutes();
      var str = '' + ((m<10)?'0':'')+m + '\'';
      this._ctx.fillText(str,at,12);
    }
    else if (timeUnits[i].unit == 'h') {
      var hr = date.getUTCHours();
      var str = '' + ((hr<10)?'0':'')+hr + 'h';
      this._ctx.fillText(str,at,12);
    }
    else if (timeUnits[i].unit == 'd') {
      var d = date.getUTCDate();
      var str = '' + ((d<10)?'0':'')+d;
      this._ctx.fillText(str,at,12);
    }
    else if (timeUnits[i].unit == 'w') {
      var d = date.getUTCDate();
      var m = date.getUTCMonth()+1;
      var str = '' + ((d<10)?'0':'')+d;
      this._ctx.fillText(str,at,12);
    }
  }
  this._ctx.restore()
  */
}


export default function({width=300, height=200, dataSet}) {
  //const max
  let d = dataSet.map((p,i)=>{return i*5 + ' ' + p}).join(' ')
  return (
    <div className={styles.gridBox}>
      <svg width={width} height={height} viewBox={'0 0 ' + width + ' ' + height} /*preserveAspectRatio='none'*/>
        <polyline points={d} fill='none' stroke='white' strokeWidth='1'/>
      </svg>
    </div>
  )
}