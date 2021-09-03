export default function Line({data}) {

  let d = data.map((p,i)=>{return i*5 + ' ' + p}).join(' ')
  return (
    <polyline points={d} fill='none' stroke='white' strokeWidth='1'/>
  )
}