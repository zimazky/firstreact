import classes from './Table.module.css'
// header = [{key,name}]
// data = [{key1:value1,key2:value2,...}]
export default function Table({header = [], data = [], width=300, height=500}) {

  return (
    <div className={classes.wrapper} style={{width,height}}>
    <table>
      <thead><tr>
        <th>#</th>
        { header.map((v,i)=><th key={i}>{v.name}</th>) }
      </tr></thead>
      <tbody>
        { data.map((v,i)=><tr key={i}><td>{i}</td>{header.map((h,i)=><td key={i}>{v[h.key]}</td>)}</tr>)  }
      </tbody>
    </table>
    </div>
  )
}