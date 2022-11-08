type SensorData = {
  flag: number
  value: number
}

type ThermalSensorData = {
  temperature?: SensorData
  humidity?: SensorData
  power?: number
  mode?: number
  targetTemperature?: number
  targetTemperatureDelta?: number
  sensorState?: number
}

export default class ThermalSensorLogParser {

  private temperature = 0
  private humidity = 0
  private targetTemperature = 0
  private targetTemperatureDelta = 0
  private power = 0
  private mode = 0
  private sensorState = 0
  private f = 0

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

  public parseEventOld(event: string[]): ThermalSensorData {
   
    let data: ThermalSensorData = {}
    const flag = +event[0]
    let j = 2;
    if(flag & 128) { // строка с полными данными
      this.temperature = 0
      this.humidity = 0
      this.power = 0
      this.mode = 0
      this.targetTemperature = 0
      this.targetTemperatureDelta = 0
      this.sensorState = 0
    }
    if(flag & 1) this.temperature += +event[j++]
    if(flag & 2) this.humidity += +event[j++]
    if(flag & 4) {
      // добавляем только если произошли изменения 0 -> 1
      if(!this.power) data.power = this.power= 1
    }
    else {
      // добавляем только если произошли изменения 1 -> 0
      if(this.power) data.power = this.power = 0
    }
    if(flag & 8) {
      // добавляем только если произошли изменения 0 -> 1
      if(!this.mode) data.mode = this.mode= 1
    }
    else {
      // добавляем только если произошли изменения 1 -> 0
      if(this.mode) data.mode = this.mode = 0
    }
    if(flag & 16) data.targetTemperature = this.targetTemperature = +event[j++]
    if(flag & 32) data.targetTemperatureDelta = this.targetTemperatureDelta = +event[j++]
    if(flag & 64) data.sensorState = this.sensorState = +event[j++]
    if(this.sensorState == 0) { // добавляем только если датчик был без ошибок
      const f = flag & 128 ? 0 : 1
      if(flag & 1) data.temperature = {flag: f, value: this.temperature/10.}
      if(flag & 2) data.humidity = {flag: f, value: this.humidity/10.}
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

  public parseEventNew(event: string[]): [string[], ThermalSensorData] {
   
    let data: ThermalSensorData = {}
    const flag = +event[0]
    let j = 1;
    if(flag & 128) { // строка с полными данными
      this.temperature = 0
      this.humidity = 0
      this.power = 0
      this.mode = 0
      this.targetTemperature = 0
      this.targetTemperatureDelta = 0
      this.sensorState = 0
    }
    if(flag & 1) this.temperature += +event[j++]
    if(flag & 2) this.humidity += +event[j++]
    if(flag & 4) {
      // добавляем только если произошли изменения 0 -> 1
      if(!this.power) data.power = this.power= 1
    }
    else {
      // добавляем только если произошли изменения 1 -> 0
      if(this.power) data.power = this.power = 0
    }
    if(flag & 8) {
      // добавляем только если произошли изменения 0 -> 1
      if(!this.mode) data.mode = this.mode= 1
    }
    else {
      // добавляем только если произошли изменения 1 -> 0
      if(this.mode) data.mode = this.mode = 0
    }
    if(flag & 16) data.targetTemperature = this.targetTemperature = +event[j++]
    if(flag & 32) data.targetTemperatureDelta = this.targetTemperatureDelta = +event[j++]
    if(flag & 64) data.sensorState = this.sensorState = +event[j++]
    if(this.sensorState == 0) { // добавляем только если датчик был без ошибок
      const f = flag & 128 ? 0 : 1
      if(flag & 1) data.temperature = {flag: f, value: this.temperature/10.}
      if(flag & 2) data.humidity = {flag: f, value: this.humidity/10.}
    }
    return [event.slice(j), data]
  }

  /**
   * Возвращает последние данные после чтения лога
   * @returns 
   */
  public getLastData(): ThermalSensorData {
    let data: ThermalSensorData = {}
    const f = this.sensorState == 0 ? 1 : 0
    data.temperature = {flag: f, value: this.temperature/10.}
    data.humidity = {flag: f, value: this.humidity/10.}
    data.power = this.power
    data.mode = this.mode
    data.targetTemperature = this.targetTemperature
    data.targetTemperatureDelta = this.targetTemperatureDelta
    data.sensorState = this.sensorState
    return data
  }

}