
function getBeginDayTimestamp(timestamp, timezone) {
  return (~~((timestamp+timezone*3600)/86400))*86400-timezone*3600
}

function getYYYYMMDD(timestamp, timezone) {
  const date = new Date((timestamp+timezone*3600)*1000)
  var d = date.getUTCDate()
  var m = date.getUTCMonth()+1
  var y = date.getUTCFullYear()
  return y+((m<10)?'0':'')+m+((d<10)?'0':'')+d
}


export default class ArduinoLogAPI {
  static ERRORS = ['OK','Busy','Queued','NotYet']

  constructor(url, threads=8, timezone=3) {
    this.threads = threads
    this.queue = []
		this.url = url
    this.timezone = timezone
	}

	// Функция загрузки LOG-файла
	getLogByName(name, onLoad=()=>{}, onError=()=>{}, onFinally=()=>{}) {
  	//ограничиваем одновременную загрузку таймслотов
    if (this.queue.length>=this.threads) return 1
    //не загружать которые в очереди
		if(this.queue.includes(name)) return 2
    this.queue.push(name)
    //console.log(this.queue)
    //console.log(name)
    fetch(this.url+name)
      .then(r=>r.text())
      .then((text)=>{
        onLoad(text)
      })
      .catch((error)=>{
        console.log(name)
        console.log('loading error', error)
        onError()
      })
      .finally(()=>{
				this.queue = this.queue.filter(s=>s!=name)
        onFinally()
      })
    return 0
	}
	
  // Функция загрузки LOG-файла по timestamp
	getLogByTimestamp(type, timestamp, onLoad=()=>{}, onError=()=>{}, onFinally=()=>{}) {
    //не загружать будущие таймслоты
		if (timestamp>getBeginDayTimestamp(Date.now()/1000, this.timezone)) return 3
    const name = getYYYYMMDD(timestamp, this.timezone)+'.'+type
    return this.getLogByName(name, onLoad, onError, onFinally)
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Функция парсинга текстовых данных, полученных от устройства Arduino.
  //
  // Лог температурной зоны:
  // Строка представляет собой событие. Событие может выводиться двумя типами записей: 
  //   - полная запись (первая запись в файле лога или после перезагрузки);
  //   - разностная запись (записывается разность между текущим значением и предыдущим).
  // Порядок полей при выводе событий:
  // 1. Флаги событий int8_t ([+] - используются для вывода графиков)
  //    1 - Изменение фактической температуры [+]
  //    2 - Изменение фактической влажности [+]
  //    4 - Бит подачи мощности на обогреватель [+]
  //    8 - Бит режима работы
  //   16 - Изменение заданной температуры
  //   32 - Изменение заданного гистерезиса температуры
  //   64 - Изменение состояния датчика
  //  128 - Признак полной записи (выводятся все поля в виде полного значения)
  // 2. Метка времени. Тип unixtime, выводится разница с предыдущим значением в потоке.
  // Далее в соответствии с установленными битами флагов событий выводятся параметры:
  // 3. Фактическая температура. Тип int, выводится разница с предыдущим значением в потоке.
  // 4. Фактическая влажность. Тип int, выводится разница с предыдущим значением в потоке.
  // 5. Заданная температура. Тип int, выводится разница с предыдущим значением в потоке.
  // 6. Заданный гистерезис температуры. Тип int, выводится разница с предыдущим значением в потоке.
  // 7. Состояние датчика.  Тип int, выводится полное значение.

  static parseThermalSensorData = function(textdata, [tDS=[],hDS=[],pDS=[]] ) {
   
    if(!textdata) return [tDS, hDS, pDS]

    const strings = textdata.split('\n')
    let time = 0
    let temperature = 0, humidity = 0, targetTemperature = 0, targetTemperatureDelta = 0
    let power = 0, sensorState = 0
    let f = 0
    strings.forEach(string => {
      const event = string.split(';')
      if(event.length <= 2) return
      const flag = event[0]
      if(flag & 128) { // строка с полными данными
        temperature = 0; humidity = 0; targetTemperature = 0; targetTemperatureDelta = 0
        sensorState = 0
        time = +event[1];
        let j = 2;
        if(flag & 1) temperature = +event[j++]
        if(flag & 2) humidity = +event[j++]
        power = (flag & 4) ? 1 : 0
        pDS.push({flag: 1, time, value: power})
        if(flag & 16) targetTemperature = +event[j++]
        if(flag & 32) targetTemperatureDelta = +event[j++]
        if(flag & 64) sensorState = +event[j++]
        if(sensorState == 0) { // добавляем только если датчик был без ошибок
          tDS.push({flag: 0, time, value: temperature/10.})
          hDS.push({flag: 0, time, value: humidity/10.})
        }
      }
      else { // строка с разностными данными
        if(time == 0) return //еще не было полных данных
        // исправление ошибки в логах, отрицательная корректировка времени выводится как положительное число
        let ptime = +event[1]
        if(ptime>2147483647) ptime -= 4294967296
        if(ptime<0) console.log('correction time difference',ptime,time)
        time += ptime
        let j = 2
        if(flag & 1) temperature += +event[j++]
        if(flag & 2) humidity += +event[j++]
        if(flag & 4) {
          // добавляем только если произошли изменения 0 -> 1
          if(!power) pDS.push({flag: 1, time, value: power=1})
        }
        else {
          // добавляем только если произошли изменения 1 -> 0
          if(power) pDS.push({flag: 1, time, value: power=0})
        }
        if(flag & 16) targetTemperature += +event[j++]
        if(flag & 32) targetTemperatureDelta += +event[j++]
        if(flag & 64) sensorState = +event[j++]
        f = (sensorState == 0) ? 1 : 0
        if(sensorState == 0) {// добавляем только если датчик был без ошибок
          if(flag & 1) tDS.push({flag: f, time, value: temperature/10.})
          if(flag & 2) hDS.push({flag: f, time, value: humidity/10.})
        }
      }
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    if(tDS.data.length != 0) tDS.push({flag: f, time, value: temperature/10.})
    if(hDS.data.length != 0) hDS.push({flag: f, time, value: humidity/10.})
    if(pDS.data.length != 0) pDS.push({flag: 1, time, value: power})

    return [tDS, hDS, pDS]
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Функция парсинга данных с датчика давления гидросистемы
  //
  // Лог давления в системе водоснабжения:
  // Строка представляет собой событие. Событие может выводиться двумя типами записей: 
  //   - полная запись (первая запись в файле лога или после перезагрузки);
  //   - разностная запись (записывается разность между текущим значением и предыдущим).
  // Порядок полей при выводе событий:
  // 1. Флаги событий int8_t ([+] - используются для вывода графиков)
  //    1 - Изменение фактического давления [+]
  //    2 - Признак непреобразованных данных (1 - raw data, 0 - pressure*1000) [+]
  //    4 - (Резерв) Заданный предел отключения насоса
  //    8 - (Резерв) Заданный предел сухого хода
  //  128 - Признак полной записи (выводятся все поля в виде полного значения)
  // 2. Метка времени. Тип unixtime, выводится разница с предыдущим значением в потоке.
  // Далее в соответствии с установленными битами флагов событий выводятся параметры:
  // 3. Фактическое давление. Тип int, выводится разница с предыдущим значением в потоке.
  //
  static parseHydroSensorData = function(textdata, pressureDataset=[]) {
    
    if(!textdata) return pressureDataset

    const strings = textdata.split('\n')
    let time = 0
    let pr = 0
    let pr_out = 0
    strings.forEach(string => {
      let event = string.split(';')
      if(event.length <= 2) return
      if(event[0] & 128) { // строка с полными данными
        pr = 0
        pr_out = 0
        time = parseInt(event[1])
        let j = 2
        if(event[0] & 1 ) pr = +event[j++]
      }
      else { // строка с разностными данными
        if(time == 0) return //еще не было полных данных
        let ptime = parseInt(event[1])
        // исправление ошибки в логах, отрицательная корректировка времени выводится как положительное число
        ptime = (ptime>2147483647)?ptime-4294967296:ptime
        if(ptime<0) console.log(ptime, time, pr)
        time += ptime
        let j = 2
        if (event[0] & 1) pr += +(event[j++])
      }
      // преобразование к нормальному представлению давления
      pr_out = (event[0] & 2) ? 5.*(pr-102.3)/818.4 : pr/1000.
      // проверка на корректность данных
      if(pr_out>=-1 && pr_out<=5) pressureDataset.push({flag: 1, time: time, value: pr_out})
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    if(pressureDataset.data.length) pressureDataset.push({flag: 1, time: time, value: pr_out})
    return pressureDataset;
  }


}
