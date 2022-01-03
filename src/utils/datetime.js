export default class DateTime {

  static WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  static MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  constructor(timezone=3, startweek=1) {
    this.timezone = timezone
    this.startweek = startweek
  }
  
  // Timestamp начала недели, зависит от startweek
  getBegintWeekTimestamp(timestamp) {
    const d = new Date(timestamp*1000)
    d.setHours(0,0,0,0)
    const currentDay = d.getDate()
    let m = d.getDay()
    m = m==0?7:m
    return d.setDate(currentDay - m + this.startweek)/1000
  }

  // Timestamp начала дня, зависит от timezone
  getBeginDayTimestamp(timestamp) {
    return (~~((timestamp+this.timezone*3600)/86400))*86400-this.timezone*3600
  }

  getYYYYMMDD(timestamp) {
    const date = new Date((timestamp+this.timezone*3600)*1000)
    var d = date.getUTCDate()
    var m = date.getUTCMonth()+1
    var y = date.getUTCFullYear()
    return y+((m<10)?'0':'')+m+((d<10)?'0':'')+d
  }
  
  /////////////////////////////////////////////////////////////////////////////
  // Статические методы

  // Фунция возвращает день месяца, месяц (0-11), день недели (0-6)
  static getDayMonthWeekday(timestamp) {
    const d = new Date(timestamp*1000)
    const day = d.getDate()
    const month = d.getMonth()
    const weekday = d.getDay()
    return {day, month, weekday}
  }

  static getWeekday(timestamp) {
    return new Date(timestamp*1000).getDay()
  }

  static getTimeString(timestamp) {
    const d = new Date(timestamp*1000)
    const h = d.getHours()
    const m = d.getMinutes()
    return (h>9?'':'0') + h + (m>9?':':':0') + m
  }
 

}






