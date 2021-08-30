import Modal from './Modal.jsx'
import styles from './ParameterButton.module.css'

export default function({parameterName, displayedValue = 0., controlledValue = 0., disabled = false, update = v=>{} }) {
  const [isModalOpen,openModal] = React.useState(false)
  const [state, setState] = React.useState(controlledValue)
  console.log('ModalState:', isModalOpen)
  console.log('ParameterState:', state)

  return (
    disabled ?
    <div>
      <div className={styles.name}>{parameterName}</div>
      <div className={styles.value}>{displayedValue}</div>
    </div>
    :
    <div className='button' onClick={()=>{openModal(!isModalOpen)}}>
      <div className={styles.name}>{parameterName}</div>
      <div className={styles.value}>{displayedValue}</div>
      <Modal isOpen={isModalOpen} title={'Set target temperature for Zone'} onSubmit={()=>{update(state);openModal(false)}} onCancel={()=>{openModal(false)}}>
        <span className={styles.modal_button} onClick={()=>{setState(state-0.1)}}>-</span>
        <span className={styles.modal_parameter}>{state.toFixed(1)}</span>
        <span className={styles.modal_button} onClick={()=>{setState(state+0.1)}}>+</span>
      </Modal>
    </div>
  )
}
