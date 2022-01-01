import useLatest from './useLatest'

export default function useEventListener(eventName, handler, target = window, options = {}) {
  //const handlerRef = useLatest(handler)
  const handlerRef = React.useRef(handler).current

  React.useEffect(() => {
    if(!target?.addEventListener) return
    console.log('AddEventListener', eventName)
    const listener = e => handlerRef(e)
    target.addEventListener(eventName, listener, options)
    return () => {
      console.log('RemoveEventListener', eventName)
      target.removeEventListener(eventName, listener, options)
    }
  }, [eventName, target])
}