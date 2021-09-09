const TimeIntervalContext = React.createContext()

export const useTimeInterval = ()=>{
  return React.useContext(TimeIntervalContext)
}

export const TimeIntervalProvider = ({initTimeInterval, children}) => {
  const [timeInterval, setTimeInterval] = React.useState(initTimeInterval)

  const updateTimeInterval = (action)=>{
    if(action.type == 'shift') {
      // type = 'shift'
      // value - относительная величина сдвига (1 - на величину всего интервала)
      setTimeInterval((prevTimeInterval)=>{
        let interval = prevTimeInterval.end-prevTimeInterval.begin
        return { begin: prevTimeInterval.begin-interval*action.value, end: prevTimeInterval.end-interval*action.value }
      })
    }
    else if(action.type == 'zoom') {
      // type = 'zoom'
      // value - во сколько раз увеличить
      // offset - относительно какой точки увеличивать (0 - левая граница, 1 - правая граница)
      setTimeInterval((prevTimeInterval)=>{
        let interval = prevTimeInterval.end-prevTimeInterval.begin
        if ( action.value*interval < 300 ) return prevTimeInterval
        let timeOffset = prevTimeInterval.begin+action.offset*interval
        return { begin: timeOffset-action.value*(timeOffset-prevTimeInterval.begin), end: timeOffset+action.value*(prevTimeInterval.end-timeOffset)}
      })
    }
  }

  return (
    <TimeIntervalContext.Provider value={{timeInterval,updateTimeInterval}}>
      { children }
    </TimeIntervalContext.Provider>
  )
}