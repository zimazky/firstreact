//import useRafState from '../useRafState';

export default function useSize(target = null) {
  const [state, setState] = React.useState({}) //useRafState()

  React.useLayoutEffect(() => {
    if(!target) return
    const resizeObserver = new ResizeObserver( (entries) => {
      entries.forEach( (entry) => {
        const { clientWidth, clientHeight } = entry.target;
        setState({ width: clientWidth, height: clientHeight })
        console.log('resize', clientWidth)
      })
    })
    resizeObserver.observe(target)
    console.log('Add resizeObserver', target)
    return () => { resizeObserver.disconnect() }
  }, [target])
  return state
}
