import styles from './Header.module.css'

export default function Header({firmware = '', controllerDateTime = ''}) {
  //const [state,setState] = React.useState({})
  const [timestamp,setTime] = React.useState(Date.now())

  React.useEffect( ()=>{
    const i = setInterval(()=>{ setTime(Date.now()) },1000)
    return () => { clearInterval(i) }
  }, [])

  const d = new Date(timestamp)
  const time = d.toLocaleTimeString()
  const date = d.toLocaleDateString()
  return  (
    <div className={styles.header}>
      <div className={styles.left}>
        <div className={styles.title}>Arduino TermoController</div>
        <div>{firmware}</div>
        <div>{controllerDateTime}</div>
      </div>
      <div className={styles.datetime}>
        <div className={styles.time}>{time}</div>
        <div className={styles.date}>{date}</div>
      </div>
    </div>  
  )
}