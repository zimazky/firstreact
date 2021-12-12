import useLatest from './useLatest'
//import type { BasicTarget } from '../utils/domTarget';
//import { getTargetElement } from '../utils/domTarget';
//import useEffectWithTarget from '../utils/useEffectWithTarget';

/*
type Options<T extends Target = Target> = {
  target?: T;
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
};
*/

export default function useEventListener(eventName, handler, options = {}) {
  const handlerRef = useLatest(handler)

  useEffectWithTarget(
    () => {
      const targetElement = options.target ?? window
      if (!targetElement?.addEventListener) return
      const eventListener = (event) => handlerRef.current(event)
      targetElement.addEventListener(eventName, eventListener, {
        capture: options.capture,
        once: options.once,
        passive: options.passive,
      })
      return () => {
        targetElement.removeEventListener(eventName, eventListener, {
          capture: options.capture,
        })
      }
    },
    [eventName, options.capture, options.once, options.passive],
    options.target,
  )
}
