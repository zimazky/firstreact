import useEventListener from '../hooks/useEventListener'
import throttle from '../utils/throttle'

let isDragging = false
let clientX0 = 0.
let clientX1 = 0.
let pointerId1 = null
///////////////////////////////////////////////////////////////////////////////
// Хук масштабирования и смещения содержимого компонента, заданного
// переменной targetElement, ссылающейся на DOM элемент
// Работает на всех типах указывающих устройств, обрабатываются pointer events
export default function usePointerZoom(targetElement, width, onShift=()=>{}, onZoom=()=>{}, onMove=()=>{}) {

  function onPointerDown(e) {
    e.preventDefault()
    if(e.isPrimary) {
      isDragging = true
      clientX0 = e.offsetX
      return
    }
    if(pointerId1 !== null) return
    pointerId1 = e.pointerId
    clientX1 = e.offsetX
  }

  const onPointerMove = throttle( (e) => {
    e.preventDefault()
    if(!isDragging) {
      onMove(e.offsetX,e.offsetY)
      return
    }
    if(e.isPrimary) {
      let d = (e.offsetX-clientX0)/width
      clientX0 = e.offsetX
      onShift(d)
      onMove(e.offsetX,e.offsetY)
      return
    }
    if(pointerId1 === e.pointerId) {
      let z = (e.offsetX-clientX0)
      if(Math.abs(z)<10) return
      z = (clientX1-clientX0)/z
      if(z<0) return
      let k = (clientX0)/width
      clientX1 = e.offsetX
      onZoom(z,k)
    }
  }, 30)

  function onPointerUp(e) {
    e.preventDefault()
    if(e.isPrimary) {
      isDragging = false
      return
    }
    if(pointerId1 === e.pointerId) {
      pointerId1 = null
      clientX1 = 0.
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
