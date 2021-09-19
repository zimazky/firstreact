
import classes from './Graphs.module.css'

// data - массив элементов {flag,value}
//        flag - признак отображения точки (0,1 или false,true)
//        value - значение в точке
// min, max - минимальное и максимальное значение датасета
// height - высота холста
// barw - расстояние между точками
export function Line({data, height, barw=2, min, max, color='#FFF'}) {

  let scale = height/(max-min)
  let d =''
  if(data[0].flag) {
    let y = height-scale*(data[0].value-min)
    d += 'M0 '+y
  }
  for(let i=1;i<data.length;i++) {
    if(data[i].flag) {
      let y = height-scale*(data[i].value-min)
      if(data[i-1].flag) d += 'L'+i*barw+' '+y
      else d += 'M'+i*barw+' '+y
    }
  }
  return (
    <path d={d} fill='none' stroke={color} strokeWidth='1'/>
  )
}

export function SteppedLine({data, height, barw=2, min, max, color='#FFF'}) {

  let scale = height/(max-min)
  let d =''
  if(data[0].flag) {
    let y = height-scale*(data[0].value-min)
    d += 'M0 '+y+'L'+barw+' '+y
  }
  for(let i=1;i<data.length;i++) {
    if(data[i].flag) {
      let y = height-scale*(data[i].value-min)
      if(data[i-1].flag) d += 'L'+i*barw+' '+y+'L'+(i*barw+barw)+' '+y
      else d += 'M'+i*barw+' '+y+'L'+(i*barw+barw)+' '+y
    }
  }
  return (
    <path d={d} fill='none' stroke={color} strokeWidth='1'/>
  )
}

function getYTickLabels(min, max, height, maxTick=20) {
  let ticks = height/maxTick
  let dy = (max-min)/ticks  // ориентировочный размер деления
  let dign = Math.round(Math.log(dy)/Math.log(10)) // округленнный десятичный логарифм ориентировочного деления
  let powlog = Math.pow(10,dign) // порядок деления (0.01,0.1,100,..)
  let mant = dy/powlog // мантисса ориентировочного размера деления
  // Приведенный размер деления (1, 2, 5) - мантисса деления
  if( mant <= 1 ) mant = 1
  else if( mant <= 1.25 ) { mant = 1.25; dign-=2; }
  else if( mant <= 2 ) mant = 2
  else if( mant <= 2.5 ) { mant = 2.5; dign--; }
  else if( mant <= 5 ) mant = 5
  else { mant = 10; dign++; }
  dign = dign<0?-dign:0 // число знаков после запятой
  let step = powlog*mant // размер деления
  let scale = height/(max-min)

  let yLabels = []
  let currentTick = max
  let nextCurrentTick = step*(~~(max/step))
  do {
    let height = nextCurrentTick>min ? scale*(currentTick-nextCurrentTick) : scale*(currentTick-min)
    yLabels.push({tick: currentTick, label: currentTick.toFixed(dign), height})
    currentTick = nextCurrentTick
    nextCurrentTick -= step
  } while(currentTick > min)
  console.log(yLabels)
  return yLabels
}

export function YTickLabels({min, max, height, maxTick}) {
  return (
    <div className={classes.YLabels}> {
      getYTickLabels(min,max,height,maxTick).map((l,i)=>{ 
        return (
          <div className={classes.YTickLabels} key={i} style={{height: l.height}}>{l.label}</div>
        )
      })
    }
    </div> 
  ) 
}