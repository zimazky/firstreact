export default class TickerLogParser {
  time = 0
  loopcounter = 0
  
  parseEventOld(event) {
    const flag = +event[0]
    if(flag & 128) { // строка с полными данными
      this.time = parseInt(event[1])
    }
    else { // строка с разностными данными
      if(this.time == 0) return 0 //еще не было полных данных
      let ptime = parseInt(event[1])
      // исправление ошибки в логах, отрицательная корректировка времени выводится как положительное число
      ptime = ptime > 2147483647 ? ptime-4294967296 : ptime
      if(ptime<0) console.log(ptime, this.time)
      this.time += ptime
    }
    return this.time
  }

  parseEventNew(event, isFull) {
    if(isFull) { // строка с полными данными
      this.time = parseInt(event[0])
      this.loopcounter = parseInt(event[1])
    }
    else { // строка с разностными данными
      if(this.time == 0) return //еще не было полных данных
      let ptime = parseInt(event[0])
      // исправление ошибки в логах, отрицательная корректировка времени выводится как положительное число
      ptime = ptime > 2147483647 ? ptime-4294967296 : ptime
      if(ptime<0) console.log(ptime, this.time)
      this.time += ptime
      this.loopcounter += parseInt(event[1])
    }
    return {time: this.time, loopcounter: this.loopcounter}
  }

}
