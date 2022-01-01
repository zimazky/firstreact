import Modal from './Modal.jsx'
import styles from './ParameterButton.module.css'

export default function({parameterName, displayedValue = 0., 
  controlledValue = 0., controlledValue2 = 0., disabled = false, update = v=>{} }) {

  const [isModalOpen,openModal] = React.useState(false)
  const [state, setState] = React.useState(controlledValue)
  const [sync, setSync] = React.useState(false)
  
  if(!disabled) {
    console.log('parameter button sync',sync)
    React.useEffect(()=>{
      console.log('Effect update controlledValue', controlledValue)
      setState(controlledValue)
      setSync(true)
    }, [controlledValue])
  }

  return (
    disabled ?
    <span className={styles.disabled}>
      <div className={styles.name}>{parameterName}</div>
      <div className={styles.value}>{displayedValue}</div>
    </span>
    :
    <span className={styles.enabled} onClick={()=>{openModal(!isModalOpen)}}>
      <div className={styles.name}>{parameterName}</div>
      <div>
        <span className={styles.value}>{displayedValue}</span>
        <span className={sync?styles.value:styles.not_synced_value}>({state.toFixed(1)}±{controlledValue2.toFixed(1)})</span>
      </div>
      <Modal isOpen={isModalOpen} title={'Set target temperature for Zone'} 
        onSubmit={()=>{update(state); setSync(false); openModal(false)}} 
        onCancel={()=>{setState(controlledValue); openModal(false)}}
        >
        <span className={styles.modal_button} onClick={()=>{setState(s => s - 0.1)}}>-</span>
        <span className={styles.modal_parameter} contentEditable suppressContentEditableWarning 
          onBlur={e => {console.log(+e.target.innerText);setState(+e.target.innerText)} }>{state.toFixed(1)}</span>
        <span className={styles.modal_button} onClick={()=>{setState(s => s + 0.1)}}>+</span>
      </Modal>
    </span>
  )
}
