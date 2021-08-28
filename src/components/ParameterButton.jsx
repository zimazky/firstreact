import Modal from './Modal.jsx'
import styles from './ParameterButton.module.css'

export default function({parameterName, value = 0., disabled = false, update}) {
  const [isModalOpen,openModal] = React.useState(false)
  const [state, setState] = React.useState(0.)
  //const refModal = React.useRef()
  console.log('ModalState:', isModalOpen)
  console.log('ParameterState:', state)

  return (
    disabled ?
    <div>
      <div className={styles.name}>{parameterName}</div>
      <div className={styles.value}>{value}</div>
    </div>
    :
    <div className='button' onClick={()=>{openModal(!isModalOpen)}}>
      <div className={styles.name}>{parameterName}</div>
      <div className={styles.value}>{value}</div>
      <Modal isOpen={isModalOpen} title={'Set target temperature for Zone'} onSubmit={()=>{openModal(false)}} onCancel={()=>{openModal(false)}}>
        <span className='plus' onClick={()=>{setState(state-0.1)}}>-</span>
        <span contentEditable='true' onChange={(e)=>setState(e.target.value)}>{state.toFixed(1)}</span>
        <span className='plus' onClick={()=>{setState(state+0.1)}}>+</span>
      </Modal>
    </div>
)
}
