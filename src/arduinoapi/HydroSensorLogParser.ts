type HydroSensorData = {
  flag?: number
  pressure?: number
  mode?: number
  hiLimit?: number
  loLimit?: number
  dryLimit?: number
  pumpInitTime?: number
  pumpRunLimit?: number
  retryInterval?: number
}

export default class HydroSensorLogParser {
  private pressure = 0
  private mode = 0
  private hiLimit = 0
  private loLimit = 0
  private dryLimit = 0
  private pumpInitTime = 0
  private pumpRunLimit = 0
  private retryInterval = 0

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Функция парсинга данных с датчика давления гидросистемы из лога старого образца
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
  // Возвращает структуру {flag, pressure} при успехе

  public parseEventOld(event: string[]): HydroSensorData {
    const data: HydroSensorData = {}
    const flag = +event[0]
    let j = 2
    if(flag & 128) { // строка с полными данными
      this.pressure = 0
    }
    if(flag & 1 ) this.pressure += +event[j++]
    if(flag & 4 ) data.mode = this.mode = +event[j++]
    if(flag & 8 ) {
      data.hiLimit = this.hiLimit = +event[j++]
      data.loLimit = this.loLimit = +event[j++]
      data.dryLimit = this.dryLimit = +event[j++]
    }
    if(flag & 16 ) {
      data.pumpInitTime = this.pumpInitTime = +event[j++]
      data.pumpRunLimit = this.pumpRunLimit = +event[j++]
      data.retryInterval = this.retryInterval = +event[j++]
    }
    // преобразование к нормальному представлению давления
    let p = (flag & 2) ? 5.*(this.pressure-102.3)/818.4 : this.pressure/1000.
    // проверка на корректность данных
    if(p>=-1 && p<=6) {
      data.flag = flag & 128 ? 0 : 1
      data.pressure = p
    }
    return data
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Функция парсинга данных с датчика давления гидросистемы из лога нового образца
  //
  // Лог давления в системе водоснабжения:
  // Строка представляет собой событие. Событие может выводиться двумя типами записей: 
  //   - полная запись (первая запись в файле лога или после перезагрузки);
  //   - разностная запись (записывается разность между текущим значением и предыдущим).
  // Порядок полей при выводе событий:
  // 1. Флаги событий int8_t ([+] - используются для вывода графиков)
  //    1 - Изменение фактического давления
  //    2 - Признак передачи данных без преобразования (0В=0, 5В=1023)
  //    4 - Режим работы и подача мощности на насос;
  //    8 - Изменились настройки параметров давления (hilimit, lolimit, drylimit)
  //   16 - Изменились настройки временных параметров (pumpinittime, pumprunlimit, retryinterval)
  //  128 - Признак полной записи (выводятся все поля в виде полного значения)
  // Далее в соответствии с установленными битами флагов событий выводятся параметры:
  // 2. Фактическое давление. Тип int, выводится разница с предыдущим значением в потоке.
  // 3. Режим работы и подача мощности. Тип int8_t, выводится значение:
  //    0 - выключен, 
  //    1 - включено слежение до запуска насоса, 
  //    2 - включено слежение после запуска насоса, 
  //    4 - сухой ход, 
  //    8 - бит подачи мощности
  // 4. Заданные значения параметров давления (hilimit; lolimit; drylimit)
  // 5. Заданные значения временных параметров (pumpinittime; pumprunlimit; retryinterval)
  //
  // Возвращает структуру {flag, pressure} при успехе


  public parseEventNew(event: string[]): [string[], HydroSensorData] {
    const data: HydroSensorData = {}
    const flag = +event[0]
    let j = 1
    if(flag & 128) { // строка с полными данными
      this.pressure = 0
    }
    if(flag & 1 ) this.pressure += +event[j++]
    if(flag & 4 ) data.mode = this.mode = +event[j++]
    if(flag & 8 ) {
      data.hiLimit = this.hiLimit = +event[j++]
      data.loLimit = this.loLimit = +event[j++]
      data.dryLimit = this.dryLimit = +event[j++]
    }
    if(flag & 16 ) {
      data.pumpInitTime = this.pumpInitTime = +event[j++]
      data.pumpRunLimit = this.pumpRunLimit = +event[j++]
      data.retryInterval = this.retryInterval = +event[j++]
    }
    // преобразование к нормальному представлению давления
    let p = (flag & 2) ? 5.*(this.pressure-102.3)/818.4 : this.pressure/1000.
    // проверка на корректность данных
    if(p>=-1 && p<=5) {
      data.flag = 1
      data.pressure = p
    }
    return [event.slice(j), data]
  }

}