import useLatest from './useLatest'

export default function useEventListener(eventName, handler, target = window, options = {}) {
  const handlerRef = useLatest(handler)

  React.useEffect(() => {
    if(!target?.addEventListener) { console.log(target); return}
    console.log('AddEventListener', eventName)
    const listener = e => handlerRef(e)
    target.addEventListener(eventName, listener, options)
    return () => {
      console.log('RemoveEventListener', eventName)
      target.removeEventListener(eventName, listener, options)
    }
  }, [eventName, target])
}