import useEventListener from '../hooks/useEventListener'
import throttle from '../utils/throttle'


///////////////////////////////////////////////////////////////////////////////
// Хук масштабирования и смещения содержимого компонента, заданного
// переменной targetElement, ссылающейся на DOM элемент
// Работает на всех типах указывающих устройств, обрабатываются pointer events
export default function usePointerZoom(targetElement, width, onShift=()=>{}, onZoom=()=>{}, onMove=()=>{}) {
  const stateRef = React.useRef({isDragging:false,clientX0:0,clientX1:0,pointerId1:null}).current

  function onPointerDown(e) {
    e.preventDefault()
    if(e.isPrimary) {
      stateRef.isDragging = true
      stateRef.clientX0 = e.offsetX
      return
    }
    if(stateRef.pointerId1 !== null) return
    stateRef.pointerId1 = e.pointerId
    stateRef.clientX1 = e.offsetX
  }

  const onPointerMove = throttle( (e) => {
    e.preventDefault()
    if(!stateRef.isDragging) {
      onMove(e.offsetX,e.offsetY)
      return
    }
    if(e.isPrimary) {
      let d = (e.offsetX-stateRef.clientX0)/width
      stateRef.clientX0 = e.offsetX
      onShift(d)
      onMove(e.offsetX,e.offsetY)
      return
    }
    if(stateRef.pointerId1 === e.pointerId) {
      let z = (e.offsetX-stateRef.clientX0)
      if(Math.abs(z)<10) return
      z = (stateRef.clientX1-stateRef.clientX0)/z
      if(z<0) return
      let k = (stateRef.clientX0)/width
      stateRef.clientX1 = e.offsetX
      onZoom(z,k)
    }
  }, 30)

  function onPointerUp(e) {
    e.preventDefault()
    if(e.isPrimary) {
      stateRef.isDragging = false
      return
    }
    if(stateRef.pointerId1 === e.pointerId) {
      stateRef.pointerId1 = null
      stateRef.clientX1 = 0.
    }
  }

  function onPointerOut(e) {
    onMove(0,0)
  }

  function onWheel(e) {
    e.preventDefault()
    let z = e.wheelDelta>0 ? 0.9 : 1.1111111111111112
    let k = (e.offsetX)/width
    onZoom(z,k)
  }

  useEventListener('wheel', onWheel, targetElement)
  useEventListener('pointerdown', onPointerDown, targetElement)
  useEventListener('pointermove', onPointerMove, targetElement)
  useEventListener('pointerup', onPointerUp, targetElement)
  useEventListener('pointerout', onPointerOut, targetElement)
}
