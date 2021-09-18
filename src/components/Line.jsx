export default function Line({data, height, min, max}) {

  // let d = data.map((p,i)=>{return i*5 + ' ' + p.value}).join(' ')
  // return (
  //   <polyline points={d} fill='none' stroke='white' strokeWidth='1'/>
  //)
  let b=1
  let scale = height/(max-min)
  let d = 'M0 '+(height-scale*(data[0].value-min))
  for(let i=1;i<data.length;i++) {
    if(data[i].flag == 1) {
      if(data[i-1].flag == 1) d += 'L'+i*b+' '+(height-scale*(data[i].value-min))
      else d += 'M'+i*b+' '+(height-scale*(data[i].value-min))
    }
  }
  console.log('min', min, 'max', max)
  return (
    <path d={d} fill='none' stroke='white' strokeWidth='1'/>
  )
}