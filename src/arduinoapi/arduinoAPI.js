export default class ArduinoController {
  constructor(url) {
    this.url = url
  }

  getInfo(response = (t)=>{}, reject = (e)=>{}) {
    return fetch(this.url+'/?g:i&r='+Math.random())
      .then(r=>r.text())
      .then(text => response(text))
      .catch(error => {
        console.log('ArduinoController not available')
        reject(error)
      })
  }

  setTemperature(zone, temperature, response = ()=>{}, reject = ()=>{}) {
    return fetch(this.url+'/?s'+zone+'t:'+ Math.round(temperature*10)+'&r='+Math.random())
      .then(() => {
        console.log('ArduinoController set temperature')
        response()
      })
      .catch(() => {
        console.log('ArduinoController set temperature failure')
        reject()
      })
  }

  powerOn(zone, response = ()=>{}, reject = ()=>{}) {
    return fetch(this.url+'/?s'+zone+'m:1&r='+Math.random())
      .then(() => {
        console.log('Power On', zone)
        response()
      })
      .catch(() => {
        console.log('Power On failure')
        reject()
      })
  }

  powerOff(zone, response = ()=>{}, reject = ()=>{}) {
    return fetch(this.url+'/?s'+zone+'m:0&r='+Math.random())
      .then(() => {
        console.log('Power Off', zone)
        response()
      })
      .catch(() => {
        console.log('Power Off failure')
        reject()
      })
  }

  static parseInfo(text) {
		// 0:version, 1:numofzones,
		// 2:unixtime, 3:starttime, 4:lastsynctime, 5:lastsyncdelta, 6:lastsyncinterval, 7:tickcounter
    // 8:loopcounter
    // 9:...zonesinfo
    // Зона термоконтроллера
 		// 0:type Z, 1:id, 2:t, 3:tc, 4:h, 5:m, 6:p, 7:dt, 8:s
    // Система водоснабжения
    // 0:type H, 1:id, 2:pressure
    // Зона полива
    // 0:type I, 1:id
    const a = text.split(';')
    const [version, numofz, unixtime, starttime, lastsynctime, lastsyncdelta, lastsyncinterval, tickcounter, loopcounter, ...zonesinfo] = a
    function parseZonesInfo(i, a = [], id = 0) {
      if(!i.length) return a
      const [type, ...data] = i
      switch(type) {
    		// 0:type, 1:id, 2:t, 3:tc, 4:h, 5:m, 6:p, 7:dt, 8:s
        case 'Z': {
          const [id, t, tc, h, m, p, dt, s, ...i2] = data
          a.push({type, id:+id, temperature: t/10., targetTemperature: tc/10., humidity: h/10., 
          onControl:+m, powerOn:+p, targetTemperatureDelta: dt/10., sensorState:+s})
          return parseZonesInfo(i2, a, id)
        }
        // 0:type, 1:id, 2:pressure, 3:mode, 4:hilimit, 5:lolimit, 6:drylimit, 7:pumpinittime, 8:pumprunlimit, 9:retryinterval
        // Пересчет значения датчика в бары
        // 0 бар соответствует значению 0,5 В или 102,3
        // 5 бар соответствует значению 4,5 В или 920,7
        // разница 4,5-0,5=4 В соответствует 818,4
        // 0. Тип зоны контроллера
        // 1. Идентификатор зоны
        // 2. Давление
        // 3. Режим
        // 4. Верхняя граница
        // 5. Нижняя граница
        // 6. Граница сухого хода
        // 7. Время инициализации насоса в секундах (для достижения давления выше предела сухого хода)
        // 8. Предел времени непрерывной работы насоса в секундах (исключение длительной работы на сухом ходу)
        // 9. Интервал времени для повторения запуска насоса в секундах (при сухом колодце)
        case 'H': {
          const [id, p, m, hi, lo, dry, pit, prl, ri, ...i2] = data
          a.push({type, id:+id, pressure: (p*10.-1023)*5./8184, mode:+m
            ,hilimit:+hi, lolimit:+lo, drylimit:+dry, pumpinittime:+pit
            , pumprunlimit:+prl, retryinterval:+ri})
          return parseZonesInfo(i2, a, id)
        }
        // 0:type, 1:id, 2:p, 3:s, 4:d, 5:ds, 6:md
        // 0. Тип зоны контроллера
        // 1. Идентификатор зоны
        // 2. Состояние программ и подачи мощности на клапан (poweron)
        // 3. Параметры начала программ полива (start)
        //    (каждый байт соответствует программе)
        // 4. Параметры продолжительности программ полива (duration)
        //    (каждый байт соответствует программе)
        // 5. Параметры дней полива в программах (days)
        //    (каждый байт соответствует программе)
        // 6. Продолжительность ручного полива (mduration)
        case 'I': {
          const [id, p, s, d, ds, md, ...i2] = data
          const [is, idd, ids] = [+s, +d, +ds]
          const start = [is&255, (is>>8)&255, (is>>16)&255, (is>>24)&255]
          const duration = [idd&255, (idd>>8)&255, (idd>>16)&255, (idd>>24)&255]
          const days = [ids&255, (ids>>8)&255, (ids>>16)&255, (ids>>24)&255]
          a.push({type, id:+id, poweron:+p, start, duration, days, mduration:+md})
          return parseZonesInfo(i2, a, id)
        }

      }
      return a
    }
    /*
    console.log({version:'ver.'+version, numofz:+numofz, unixtime:+unixtime, starttime:+starttime, 
    lastsynctime:+lastsynctime, lastsyncdelta:+lastsyncdelta, lastsyncinterval:+lastsyncinterval, 
    tickcounter:+tickcounter, loopcounter:+loopcounter, zones: parseZonesInfo(zonesinfo)})
    */
		return {version:'ver.'+version, numofz:+numofz, unixtime:+unixtime, starttime:+starttime, 
      lastsynctime:+lastsynctime, lastsyncdelta:+lastsyncdelta, lastsyncinterval:+lastsyncinterval, 
      tickcounter:+tickcounter, loopcounter:+loopcounter, zones: parseZonesInfo(zonesinfo)}
	}

  static states = ['OK','ErrChecksum','ErrTimeout','ErrConnect','ErrAckL','ErrAckH','ErrUnknown']
  static sensorState = s => ArduinoController.states[-s]
}	
