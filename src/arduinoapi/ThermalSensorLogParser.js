export default class ThermalSensorLogParser {

  temperature = 0
  humidity = 0
  targetTemperature = 0
  targetTemperatureDelta = 0
  power = 0
  sensorState = 0
  f = 0

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
  // 7. Состояние датчика. Тип int, выводится полное значение.

  parseEventOld(event) {
   
    let data = {}
    const flag = +event[0]
    if(flag & 128) { // строка с полными данными
      this.temperature = 0; this.humidity = 0; this.targetTemperature = 0; this.targetTemperatureDelta = 0
      this.sensorState = 0
      let j = 2;
      if(flag & 1) this.temperature = +event[j++]
      if(flag & 2) this.humidity = +event[j++]
      this.power = (flag & 4) ? 1 : 0
      data.power = {flag: 1, value: this.power}
      if(flag & 16) this.targetTemperature = +event[j++]
      if(flag & 32) this.targetTemperatureDelta = +event[j++]
      if(flag & 64) this.sensorState = +event[j++]
      if(this.sensorState == 0) { // добавляем только если датчик был без ошибок
        data.temperature = {flag: 0, value: this.temperature/10.}
        data.humidity = {flag: 0, value: this.humidity/10.}
      }
    }
    else { // строка с разностными данными
      let j = 2
      if(flag & 1) this.temperature += +event[j++]
      if(flag & 2) this.humidity += +event[j++]
      if(flag & 4) {
        // добавляем только если произошли изменения 0 -> 1
        if(!this.power) data.power = {flag: 1, value: this.power=1}
      }
      else {
        // добавляем только если произошли изменения 1 -> 0
        if(this.power) data.power = {flag: 1, value: this.power=0}
      }
      if(flag & 16) this.targetTemperature += +event[j++]
      if(flag & 32) this.targetTemperatureDelta += +event[j++]
      if(flag & 64) this.sensorState = +event[j++]
      this.f = (this.sensorState == 0) ? 1 : 0
      if(this.sensorState == 0) {// добавляем только если датчик был без ошибок
        if(flag & 1) data.temperature = {flag: this.f, value: this.temperature/10.}
        if(flag & 2) data.humidity = {flag: this.f, value: this.humidity/10.}
      }
    }
    return data
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
  // Далее в соответствии с установленными битами флагов событий выводятся параметры:
  // 2. Фактическая температура. Тип int, выводится разница с предыдущим значением в потоке.
  // 3. Фактическая влажность. Тип int, выводится разница с предыдущим значением в потоке.
  // 4. Заданная температура. Тип int, выводится разница с предыдущим значением в потоке.
  // 5. Заданный гистерезис температуры. Тип int, выводится разница с предыдущим значением в потоке.
  // 6. Состояние датчика. Тип int, выводится полное значение.

  parseEventNew(event) {
   
    let data = {}
    const flag = +event[0]
    if(flag & 128) { // строка с полными данными
      this.temperature = 0; this.humidity = 0; this.targetTemperature = 0; this.targetTemperatureDelta = 0
      this.sensorState = 0
      let j = 1;
      if(flag & 1) this.temperature = +event[j++]
      if(flag & 2) this.humidity = +event[j++]
      this.power = (flag & 4) ? 1 : 0
      data.power = {flag: 1, value: this.power}
      if(flag & 16) this.targetTemperature = +event[j++]
      if(flag & 32) this.targetTemperatureDelta = +event[j++]
      if(flag & 64) this.sensorState = +event[j++]
      if(this.sensorState == 0) { // добавляем только если датчик был без ошибок
        data.temperature = {flag: 0, value: this.temperature/10.}
        data.humidity = {flag: 0, value: this.humidity/10.}
      }
    }
    else { // строка с разностными данными
      let j = 1
      if(flag & 1) this.temperature += +event[j++]
      if(flag & 2) this.humidity += +event[j++]
      if(flag & 4) {
        // добавляем только если произошли изменения 0 -> 1
        if(!this.power) data.power = {flag: 1, value: this.power=1}
      }
      else {
        // добавляем только если произошли изменения 1 -> 0
        if(this.power) data.power = {flag: 1, value: this.power=0}
      }
      if(flag & 16) this.targetTemperature += +event[j++]
      if(flag & 32) this.targetTemperatureDelta += +event[j++]
      if(flag & 64) this.sensorState = +event[j++]
      this.f = (this.sensorState == 0) ? 1 : 0
      if(this.sensorState == 0) {// добавляем только если датчик был без ошибок
        if(flag & 1) data.temperature = {flag: this.f, value: this.temperature/10.}
        if(flag & 2) data.humidity = {flag: this.f, value: this.humidity/10.}
      }
    }
    return data
  }
}