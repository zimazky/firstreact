import { ILogDataSet, IEventParser } from "../ILogController"
import IrregularDataset from '../../utils/IrregularDS'

export type HydroEventData = {
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

export class HydroDataSet implements ILogDataSet<HydroEventData> {

  pressure: IrregularDataset
  mode: IrregularDataset

  constructor(timestamp: number) {
    this.pressure = new IrregularDataset(timestamp)
    this.mode = new IrregularDataset(timestamp)
  }
  push(data: HydroEventData, time: number): void {
    if(data.pressure != undefined) this.pressure.push({flag: data.flag, value: data.pressure, time})
    if(data.mode != undefined) this.mode.push({flag: 1, value: data.mode, time})
  }
}

export class HydroEventParser implements IEventParser<HydroEventData> {
  private pdata = 0
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

  public parseEventOld(event: string[]): HydroEventData {
    const data: HydroEventData = {}
    const flag = +event[0]
    let j = 2
    if(flag & 128) { // строка с полными данными
      this.pdata = 0
    }
    if(flag & 1 ) this.pdata += +event[j++]
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
    let p = (flag & 2) ? 5.*(this.pdata-102.3)/818.4 : this.pdata/1000.
    // проверка на корректность данных
    if(p>=-1 && p<=6) {
      data.flag = flag & 128 ? 0 : 1
      data.pressure = this.pressure = p
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
  // 1. Идентификатор зоны ('H' + номер)
  // 2. Флаги событий int8_t ([+] - используются для вывода графиков)
  //    1 - Изменение фактического давления
  //    2 - Признак передачи данных без преобразования (0В=0, 5В=1023)
  //    4 - Режим работы и подача мощности на насос;
  //    8 - Изменились настройки параметров давления (hilimit, lolimit, drylimit)
  //   16 - Изменились настройки временных параметров (pumpinittime, pumprunlimit, retryinterval)
  //  128 - Признак полной записи (выводятся все поля в виде полного значения)
  // Далее в соответствии с установленными битами флагов событий выводятся параметры:
  // 3. Фактическое давление. Тип int, выводится разница с предыдущим значением в потоке.
  // 4. Режим работы и подача мощности. Тип int8_t, выводится значение:
  //    0 - выключен, 
  //    1 - включено слежение до запуска насоса, 
  //    2 - включено слежение после запуска насоса, 
  //    4 - сухой ход, 
  //    8 - бит подачи мощности
  // 5. Заданные значения параметров давления (hilimit; lolimit; drylimit)
  // 6. Заданные значения временных параметров (pumpinittime; pumprunlimit; retryinterval)
  //
  // Возвращает структуру {flag, pressure} при успехе


  public parseEvent(event: string[], isFull: boolean): [string[], HydroEventData] {
    const data: HydroEventData = {}
    const flag = +event[1]
    let j = 2
    if(flag & 128) { // строка с полными данными
      this.pdata = 0
    }
    if(flag & 1 ) this.pdata += +event[j++]
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
    let p = (flag & 2) ? 5.*(this.pdata-102.3)/818.4 : this.pdata/1000.
    // проверка на корректность данных
    if(p>=-1 && p<=5) {
      data.flag = 1
      data.pressure = this.pressure = p
    }
    return [event.slice(j), data]
  }

  public getLastData(): HydroEventData {
    const data: HydroEventData = {
      flag: 1,
      pressure: this.pressure,
      mode: this.mode,
      hiLimit: this.hiLimit,
      loLimit: this.loLimit,
      dryLimit: this.dryLimit,
      pumpInitTime: this.pumpInitTime,
      pumpRunLimit: this.pumpRunLimit,
      retryInterval: this.retryInterval
    }
    return data
  }

  public createLogDataSet(timestamp: number): HydroDataSet {
    return new HydroDataSet(timestamp)
  }

}