export default function SteppedLine({data, height, barw=2, min, max}) {

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
    <path d={d} fill='none' stroke='white' strokeWidth='1'/>
  )
}