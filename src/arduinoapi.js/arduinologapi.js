import {IrregularFloatDataset} from '../utils/irregularDS.js'

export default class ArduinoLogAPI {

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

  static parse = function(textdata, timestamp) {
    const tDataset = new IrregularFloatDataset(timestamp)
    const hDataset = new IrregularFloatDataset(timestamp)
    const pDataset = new IrregularFloatDataset(timestamp)
    
    if(!textdata) return {t:tDataset, h:hDataset, p:pDataset}

    const strings = textdata.split('\n')
    let time = 0
    let temperature = 0, humidity = 0, targetTemperature = 0, targetTemperatureDelta = 0
    let power = 0, sensorState = 0
    let f = 0
    strings.forEach(string => {
      const event = string.split(';')
      if(event.length < 2) return
      const flag = event[0]
      if(flag & 128) { // строка с полными данными
        temperature = 0; humidity = 0; targetTemperature = 0; targetTemperatureDelta = 0
        sensorState = 0
        time = +event[1];
        let j = 2;
        if(flag & 1) temperature = +event[j++]
        if(flag & 2) humidity = +event[j++]
        power = (flag & 4) ? 1 : 0
        pDataset.push({flag: 1, time, value: power})
        if(flag & 16) targetTemperature = +event[j++]
        if(flag & 32) targetTemperatureDelta = +event[j++]
        if(flag & 64) sensorState = +event[j++]
        if(sensorState == 0) { // добавляем только если датчик был без ошибок
          tDataset.push({flag: 0, time, value: temperature/10.})
          hDataset.push({flag: 0, time, value: humidity/10.})
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
          if(!power) pDataset.push({flag: 1, time, value: power=1})
        }
        else {
          // добавляем только если произошли изменения 1 -> 0
          if(power) pDataset.push({flag: 1, time, value: power=0})
        }
        if(flag & 16) targetTemperature += +event[j++]
        if(flag & 32) targetTemperatureDelta += +event[j++]
        if(flag & 64) sensorState = +event[j++]
        f = (sensorState == 0) ? 1 : 0
        if(sensorState == 0) {// добавляем только если датчик был без ошибок
          if(flag & 1) tDataset.push({flag: f, time, value: temperature/10.})
          if(flag & 2) hDataset.push({flag: f, time, value: humidity/10.})
        }
      }
    })
    // добавляем завершающие данные (на случай, если не было изменений в конце дня)
    if(tDataset.data.length != 0) tDataset.push({flag: f, time, value: temperature/10.})
    if(hDataset.data.length != 0) hDataset.push({flag: f, time, value: humidity/10.})
    if(pDataset.data.length != 0) pDataset.push({flag: 1, time, value: power})

    return {t:tDataset, h:hDataset, p:pDataset}
  }

}
