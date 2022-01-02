import Modal from './Modal.jsx'
import styles from './ParameterButton.module.css'

const round10 = (n) => Math.round(n*10)/10

export default function({parameterName, displayedValue = 0., 
  controlledValue = 0., controlledValue2 = 0., disabled = false, update = v=>{} }) {

  const [isModalOpen,openModal] = React.useState(false)
  const [modalState, setModalState] = React.useState(controlledValue)
  const [state, setState] = React.useState(controlledValue)
  const [sync, setSync] = React.useState(false)
  if(!disabled) {
    React.useEffect(()=>{
      console.log('Effect update controlledValue', controlledValue)
      if(typeof(controlledValue) === 'number') {
        setState(controlledValue)
        setModalState(controlledValue)
      }
      else setModalState(state)
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
        <span className={sync?styles.value:styles.not_synced_value}>({(sync?state:modalState).toFixed(1)}±{controlledValue2.toFixed(1)})</span>
      </div>
      <Modal isOpen={isModalOpen} title={'Set target temperature for Zone'} 
        onSubmit={()=>{
          if(modalState!=controlledValue) {
            update(modalState)
            setSync(false)
          }
          openModal(false)
        }} 
        onCancel={()=>{setModalState(controlledValue); openModal(false)}}
        >
        <span className={styles.modal_button} onClick={()=>{setModalState(s => round10(s - 0.1))}}>-</span>
        <span className={styles.modal_parameter} contentEditable suppressContentEditableWarning 
          onBlur={e => {console.log(+e.target.innerText);setModalState(round10(+e.target.innerText))} }>{modalState.toFixed(1)}</span>
        <span className={styles.modal_button} onClick={()=>{setModalState(s => round10(s + 0.1))}}>+</span>
      </Modal>
    </span>
  )
}
