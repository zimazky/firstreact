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

export function ScrollBar({onPgDn=()=>{}, onPgUp=()=>{}, children=null}) {

  return (
  <div>
    {children}
    <div className={classes.scrollbarTrack} onClick={onPgDn}>
        <div className={classes.scrollbarUp} style={{height:thumbShift}} onClick={onPgUp}></div>
        <div className={classes.scrollbarThumb} style={{height:thumbHeight}} 
          onMouseDown={onMouseDown} 
          onClick={(e)=>{e.stopPropagation()}}
        ></div>
    </div>
  </div>
  )
}

// headerName
// data = [{time,value}]
const colId = {width:35}
const colTime = {width:60}
const colValue = {width:30}
export function TimeTable({title='Table', headerName = 'value', data = [], time, height=200}) {
  const [row,setRow] = React.useState(data.findIndex(v=>v.time>=time))
  const tableElement = React.useRef(null)
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
  let thumbShift = (height-thumbHeight)*(row/totalRows)

  function pgUp(e) {
    e.stopPropagation()
    setRow(v=>(v-rows)<0?0:v-rows)
  }
  function pgDown(e) {
    setRow(v=>(v+rows)>totalRows?totalRows:v+rows)
  }
  function onWheel(e) {
    e.preventDefault()
    let d = e.wheelDelta>0 ? -5 : 5
    setRow(v=>v+d)
  }
  const refDrag = React.useRef({isDragging:false, y:0, row})
  function onMouseDown(e) {
    e.preventDefault()
    refDrag.current = {isDragging:true, y:e.clientY, row}
    console.log('mouseDown',e)
  }
  function onMouseMove(e) {
    if (refDrag.current.isDragging) {
      let deltaRow = totalRows*(e.clientY-refDrag.current.y)/height
      let newRow = refDrag.current.row + deltaRow
      if(newRow<0) newRow = 0
      if(newRow>(totalRows-rows)) newRow = totalRows-rows
      setRow(~~newRow)
    }
  }
  function onMouseUp(e) {
    //e.preventDefault()
    refDrag.current = {isDragging:false, y:0}
  }

  React.useEffect(()=>{
    console.log('TimeTable AddEventListener Mouse')
    tableElement.current.addEventListener('wheel', onWheel)
    document.addEventListener('mousemove',onMouseMove)
    document.addEventListener('mouseup',onMouseUp)
    return ()=>{
      console.log('TimeRemoveEventListener Mouse')
      tableElement.current.removeEventListener('wheel', onWheel)
      document.removeEventListener('mousemove',onMouseMove)
      document.removeEventListener('mouseup',onMouseUp)
      }
  },[])

  return (
    <>
    <div>{title}</div>
    <div ref={tableElement} className={classes.wrapper} style={{height}}>
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
        <div className={classes.scrollbarThumb} style={{height:thumbHeight}} 
          onMouseDown={onMouseDown} 
          onClick={(e)=>{e.stopPropagation()}}
        ></div>
      </div>
    </div>
    </>
  )
}