import classes from './Table.module.css'
// header = [{key,name}]
// data = [{key1:value1,key2:value2,...}]
export default function Table({header = [], data = [], width=300, height=500, rows=20}) {
  const [row,setRow] = React.useState(0)
  return (
    <div className={classes.wrapper} style={{width,height}}>
      <div>
        <span>#</span>
        { header.map((v,i)=><span key={i}>{v.name}</span>) }
      </div>
        { data.slice(row,row+rows).map((v,i)=><div key={i}><span>{i}</span>{header.map((h,i)=><span key={i}>{v[h.key]}</span>)}</div>) }
    </div>
  )
}
// headerName
// data = [{time,value}]
const colId = {width:35}
const colTime = {width:60}
const colValue = {width:30}
export function TimeTable({title = 'Table', headerName = 'value', data = [], time, height=200}) {
  const [row,setRow] = React.useState(data.findIndex(v=>v.time>=time))
  const refTime = React.useRef(time)
  if(refTime.current!=time) { 
    refTime.current = time
    let crow = data.findIndex(v=>v.time>=time)
    console.log(crow,row)
    setRow(crow)
    console.log(refTime.current)
  }

  let rows = ~~(height/12)
  let totalRows = data.length
  let thumbHeight = height*(rows/totalRows)
  thumbHeight = thumbHeight<5?5:thumbHeight
  let thumbShift = height*(row/totalRows)

  function pgUp(e) {
    e.stopPropagation()
    setRow(v=>v-rows)
    //dispatch({type: 'changeRow', value: -rows})
  }
  function pgDown(e) {
    setRow(v=>v+rows)
    //dispatch({type: 'changeRow', value: rows})
  }
  return (
    <>
    <div>{title}</div>
    <div className={classes.wrapper} style={{height}}>
      <div className={classes.table}>
      <div className={classes.row}>
        <span style={colId}>#</span><span style={colTime}>time</span><span style={colValue}>{headerName}</span>
      </div> { data.slice(row,row+rows).map((v,i)=>{
        let time = (v.time+3*3600)%86400
        let h = ~~(time/3600)
        let m = ~~((time%3600)/60)
        let s = time%60
        return <div className={classes.row} key={i}>
          <span style={colId}>{row+i+1}</span><span style={colTime}>{(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s}</span><span style={colValue}>{v.value}</span>
        </div>}) 
      }
      </div>
      <div className={classes.scrollbarTrack} onClick={pgDown}>
        <div className={classes.scrollbarUp} style={{height:thumbShift}} onClick={pgUp}></div>
        <div className={classes.scrollbarThumb} style={{height:thumbHeight}}></div>
      </div>
    </div>
    </>
  )
}