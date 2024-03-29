
/** Скалярный тип логических данных для регулярного датасета */
type BData = {
	/** Логический признак непрерывности текущего элемента с предыдущим:
	 *  0 - разрыв с предыдущим элементом
	 *  1 - непрерывность
	*/
	flag: number
}
/** Скалярный тип данных для регулярного датасета */
interface Data extends BData {
	/** значение точки */
	value: number
}
/** Тип данных, включающий время, для нерегулярного по времени датасета */
interface IrregularData extends Data {
	/** метка времени точки */
	time: number
}
/** Тип High-Low данных для регулярного датасета */
interface HLData extends BData {
	/** максимальное значение */
	high: number
	/** минимальное значение */
	low: number
}
/** Тип Open-High-Low-Close данных для регулярного датасета */
interface OHLCData extends HLData {
	/** начальное значение */
	open: number
	/** конечное значение*/
	close: number
}

interface OHLCVData extends Data, OHLCData {}

interface IDataSet<T extends BData> {
	min: number
	max: number
	zdata: T[]
}

type ZDataSet = IDataSet<Data>
type HLDataSet = IDataSet<HLData>
type OHLCDataSet = IDataSet<OHLCData>

interface TimeInterval {
  begin: number
  end: number
}

type DataSetModes = 'linear' | 'stepped' | 'highlow' | 'ohlc' | 'differential'
/******************************************************************************
 * Масштабируемый датасет с нерегулярными по времени данными, приводимый к
 * регулярному датасету с усредненными значениями величин
 *
 * Нерегулярный по времени датасет data, приводится к регулярному датасету
 *   интерполированных данных zdata при перемасштабировании
 *
 * Параметры инициализации:
 *   time  - время начала таймслота датасета
 *   tstep - шаг регуляризации и усреднения датасета (шаг сетки времени)
 *           при tstep=0 заранее регуляризация не производится
 *   zmode - режим отображения перемасштабированного датасета: 
 *           'linear'   - точки соединенные прямыми (датасет представляется набором кусочно-линейных отрезков),
 *           'stepped'  - ступенчатое изменение на точках (датасет представляется набором кусочно-ступенчатых отрезков), 
 *           'highlow'  - максимальные high и минимальные low значения в ячейке
 *           'ohlc'     - open, high, low, close значения в ячейке
 *           'differential' - приращения между границами баров (пока не реализовано)
 *
 */
export default class IrregularDataset implements OHLCVData {
	/** время начала датасета (идентифицирует таймслот) */
	time: number
	/** нерегулярный по времени датасет */
	data: IrregularData[] = []
	/** признак загрузки (1 если загружена хотя бы одна точка) */
	flag = 0
	/** среднее значение по всему датасету */
	value = 0
	/** максимальное значение по всему датасету */
	high = -Number.MAX_VALUE
	/** минимальное значение по всему датасету */
	low = Number.MAX_VALUE
	/** первое значение датасета */
	open = 0
	/** последнее значение датасета */
	close = 0
	/** время первого значения датасета */
	topen = 0
	/** время последнего значения датасета */
	tclose = 0
	/** число повторений одного значения в конце датасета
	 *  используется для исключения дублирования данных при добавлении значений в датасет * */
	private nclose = 0

	// секция для кэширования перемасштабированных данных

	/** режим отображения на регулярную сетку */
	private zmode: DataSetModes
	/** шаг сетки регулярного по времени датасета
	 *  вначале 0, перемасштабирование не установлено */
	private tstep = 0
	/** минимальный шаг сетки регулярного по времени датасета */
	private static mintstep = 1
	/** перемасштабированный регулярный по времени датасет */
	private zdata: Data[] = []
	private ohlcdata: OHLCData[] = []
	private hldata: HLData[] = []

	constructor(time: number, zmode: DataSetModes = 'stepped') {
		this.time = time
		this.zmode = zmode
	}

	/****************************************************************************
	 * Добавление новой точки в датасет 
	 * */
	push(d: IrregularData): void {
		// !!!ДОРАБОТАТЬ
		// РАССМОТРЕТЬ СЛУЧАЙ, КОГДА ОДНА ТОЧКА СЛЕВА, А ДРУГАЯ СПРАВА ОТ ГРАНИЦЫ
		if (d.time < this.time) return // грубо отбрасываются все точки слева
		if (this.data.length == 0) { 
			// инициализация при добавлении первого значения 
			this.flag = 1
			this.value = this.low = this.high = this.open = this.close = d.value
			this.topen = this.tclose = d.time
			this.data.push( {flag: 0, time: d.time, value: d.value} )
      return
		}
		// добавление второго и более значения в датасет
    // среднее значение можно посчитать
		// считаем из предположения ступенчатой диаграммы (не линейная)
    // v = (v*(t[i-1]-to)+d[i-1]*(t[i]-t[i-1]))/(t[i]-to)
    if(this.tclose>this.topen) {
      this.value = (this.value*(this.tclose-this.topen)+this.close*(d.time-this.tclose))/(d.time-this.topen)
    }
    if(this.close == d.value && d.flag == 1) { // исключение повторения данных
      // при повторении сохраняются первая и последняя точка из серии
      if(this.nclose == 0) { 
				// первое повторение
        this.nclose++
        this.tclose = d.time
        this.data.push({flag: d.flag, time:d.time, value:d.value})
      }
      else { 
				// второе и более повторение
        this.data[this.data.length-1].time = d.time
        this.tclose = d.time
      }
      return
    }
    this.low = Math.min(this.low,d.value)
    this.high = Math.max(this.high,d.value)
    this.close = d.value
    this.tclose = d.time
    this.nclose = 0
    this.data.push({flag:d.flag, time:d.time, value:d.value})
	}
	
	/****************************************************************************
	 *  Получение регуляризованного датасета
	 *  по способу кусочно-линейной интерполяции
	 *  z - шаг регуляризации
	*/
	getlinearregdata(z: number): Data[] {
		const zdata: Data[] = []
		let d = this.data[0]
		let zt = this.time
		let v0 = d.value // значение в начале (на левой границе) текущей ячейки (считаем = d.value)
		while (zt+z < d.time) {
			// заполняем регулярные ячейки неактивными значениями до первой точки
			zdata.push({flag: 0, value: v0})
			zt += z
		}
		// на этот момент первая точка data[0] находится в интервале [zt,zt+z)
		//    zt     zt+z
		//    |       |
		//  v0|---d   |
		//    |   ^   |
		
		// сохраняем значение первой точки в ячейку
		zdata.push({flag: 1, value: v0})
		for (let i=1; i<this.data.length; i++) {
			d = this.data[i]
			const n = zdata.length-1
			const dm = this.data[i-1]
			if (d.time < zt+z) { 
				// попали в уже существующую ячейку
				// v*(zt+z-zt)=v0*(zt+z-zt)+(v1-v0)(zt+z-t1)+(v2-v0)(zt+z-t2)+...+(vk-v0)(zt+z-tk)
				// отсюда выводим
				// v = v0 + (v1-v0)(zt+z-t1)/z+(v2-v0)(zt+z-t2)/z+...+(vk-v0)(zt+z-tk)/z
				// с каждой новой точкой попавшей в ячейку среднее уточняется по формуле
				// v = v0 + (v[i]-v[i-1])(zt+z-t[i])/z
				//    zt             zt+z
				//    |         d-----|
				//    |   dm-----     |
				//  v0|----           |
				// здесь v0 - это либо значение на левой границе (первое повторное попадание),
				//            либо значение предыдущей точки (второе и более попадание)
				zdata[n].value += (d.value-v0)*(zt+z-d.time)/z
				v0 = d.value
			}
			else { // создаем новые ячейки
				zt += z
				//       zt             zt+z
				//       |               |        d
				//       |               |v1
				//  dm   |v0             |
				//
				// k = (d-dm)/(d.time-dm.time)
				// v0 = dm + k*(zt-dm.time)
				// v1 = v0 + k*z
				// v = (v0+v1)/2 = v0 + k*z/2
				const k = (d.value-dm.value)/(d.time-dm.time)
				// ячейки через которые отрезок проходит насквозь
				v0 = dm.value+k*(zt-dm.time) // значение на левой границе
				while (zt+z < d.time) {
					const v1 = v0 + k*z
					zdata.push({flag:d.flag, value: (v0+v1)/2})
					v0 = v1; zt += z
				}
				// ячейка в которой завершается отрезок
				zdata.push({flag: 1, value: v0})
			}
		}
		return zdata
	}
	
	/****************************************************************************
	 * Получение регуляризованного датасета
	 * по способу кусочно-ступенчатой интерполяции
	 * @param tstep - шаг сетки регуляризации
	 * @returns регуляризованный датасет
	 */
	getsteppedregdata(tstep: number): Data[] {
		const zdata: Data[] = []
		let d = this.data[0]
		let zt = this.time
		let v0 = d.value // значение в начале (на левой границе) текущей ячейки (считаем = d.value)
		while (zt+tstep < d.time) {
			// заполняем регулярные ячейки неактивными значениями до первой точки
			zdata.push({flag: 0, value: v0})
			zt += tstep
		}
		// сохраняем значение первой точки в ячейку
		zdata.push({flag: 1, value: v0})
		for (let i=1; i<this.data.length; i++) {
			d = this.data[i]
			const n = zdata.length-1
			const dm = this.data[i-1]
			if (d.time < zt+tstep) {
				// попали в уже существующую ячейку
				// вычисляем усредненное значение аналогично кусочно-линейному датасету
				zdata[n].value += (d.value-v0)*(zt+tstep-d.time)/tstep
				v0 = d.value
			}
			else {
				// создаем новые ячейки
				zt += tstep
				// ячейки через которые отрезок проходит насквозь
				v0 = dm.value // значение на левой границе
				while (zt+tstep < d.time) {
					zdata.push({flag: d.flag, value: v0})
					zt += tstep
				}
				// ячейка в которой завершается отрезок
				if(d.flag == 0) v0 = d.value
				zdata.push({flag: 1, value: v0})
			}
		}
		// завершающая точка (на всякий случай)
		zdata.push({flag: 1, value: v0})
		return zdata
	}
	
	/****************************************************************************
	 * Получение регуляризованного датасета
	 * по способу ohlc
	 * @param z шаг регуляризации
	 * @returns регуляризованный датасет в виде массива элементов 
	 * {flag, open, high, low, close}
	 */
	getohlcregdata(z: number): OHLCData[] {
		const zdata: OHLCData[] = []
		let d = this.data[0]
		let zt = this.time
		let v0 = d.value // значение в начале (на левой границе) текущей ячейки (считаем = d.value)
		while (zt+z < d.time) {
			// заполняем регулярные ячейки неактивными значениями до первой точки
			zdata.push({flag:0, open: v0, high:v0, low:v0, close: v0})
			zt += z
		}
		// сохраняем значение первой точки в ячейку
		zdata.push({flag:1, open: v0, high:v0, low:v0, close: v0})
		for (let i=1; i<this.data.length; i++) {
			d = this.data[i]
			const n = zdata.length-1
			const dm = this.data[i-1]
			if (d.time < zt+z) {
				// попали в уже существующую ячейку
				// добавляем новые значения high и low
				zdata[n].close = d.value
				zdata[n].high = (d.value>zdata[n].high) ? d.value : zdata[n].high
				zdata[n].low  = (d.value<zdata[n].low) ? d.value : zdata[n].low
			}
			else {
				// создаем новые ячейки
				zt += z
				// ячейки через которые отрезок проходит насквозь
				v0 = dm.value // значение на левой границе
				while (zt+z < d.time) {
					zdata.push({flag: d.flag, open: v0, high: v0, low: v0, close: v0})
					zt += z
				}
				// ячейка в которой завершается отрезок
				if(d.flag == 0) v0 = d.value;
				zdata.push({flag: 1, open: v0, high: v0, low: v0, close: v0})
			}
		}
		// завершающая точка (на всякий случай)
		zdata.push({flag: 1, open: v0, high: v0, low: v0, close: v0})
		return zdata
	}
	
	/****************************************************************************
	 * Получения регуляризованного датасета
	 * по способу highlow
	 * @param z шаг регуляризации
	 * @returns регуляризованный датасет в виде массива элементов со структурой
	 * {flag, high, low}
	 */
	gethighlowregdata(z: number): HLData[] {
		const zdata: HLData[] = []
		let d = this.data[0]
		let zt = this.time
		let v0 = d.value // значение в начале (на левой границе) текущей ячейки (считаем = d.value)
		while (zt+z < d.time) {
			// заполняем регулярные ячейки неактивными значениями до первой точки
			zdata.push({flag: 0, high: v0, low: v0})
			zt += z
		}
		// сохраняем значение первой точки в ячейку
		zdata.push({flag: 1, high: v0, low: v0})
		for (var i=1; i<this.data.length; i++) {
			d = this.data[i]
			const n = zdata.length-1
			const dm = this.data[i-1]
			if (d.time < zt+z) {
				// попали в уже существующую ячейку
				// добавляем новые значения high и low
				zdata[n].high = (d.value>zdata[n].high) ? d.value : zdata[n].high
				zdata[n].low  = (d.value<zdata[n].low) ? d.value : zdata[n].low
			}
			else {
				// создаем новые ячейки
				zt += z
				// ячейки через которые отрезок проходит насквозь
				v0 = dm.value // значение на левой границе
				while (zt+z < d.time) {
					zdata.push({flag: d.flag, high: v0, low: v0})
					zt += z
				}
				// ячейка в которой завершается отрезок
				if(d.flag == 0) v0 = d.value
				zdata.push({flag: 1, high: v0, low: v0})
			}
		}
		// завершающая точка (на всякий случай)
		zdata.push({flag: 1, high: v0, low: v0})
		return zdata
	}

	/****************************************************************************
	 * Перемасштабирование датасета
	 * @param tstep -шаг сетки регуляризации
	 */
	rezoom(tstep: number): void {
		if (tstep < IrregularDataset.mintstep) 
			tstep = IrregularDataset.mintstep // ограничение на масштабирование z>=1
		if (this.tstep == tstep || this.data.length == 0) 
			return // не перемасштабируем, если z не поменялся или датасет пустой
		this.tstep = tstep
		switch(this.zmode) {
			case 'linear': this.zdata = this.getlinearregdata(tstep); break
			case 'stepped': this.zdata = this.getsteppedregdata(tstep); break
			case 'highlow': this.hldata = this.gethighlowregdata(tstep); break
			case 'ohlc': this.ohlcdata = this.getohlcregdata(tstep); break
		}
	}

	/** Создание регулярного датасета и заполнение начальными данными */
	static createzdata(timeinterval: TimeInterval, tstep: number): ZDataSet {
		const a: ZDataSet = {zdata: [], min:Number.MAX_VALUE, max: -Number.MAX_VALUE}
		if(tstep<IrregularDataset.mintstep) tstep = IrregularDataset.mintstep
		for(let t = timeinterval.begin; t<timeinterval.end; t+=tstep) {
      a.zdata.push({flag: 0, value: 0})
		}
		return a
	}
	
	/****************************************************************************
	 * Заполнение регулярного датасета z. 
	 * Перед вызовом датасет заполнен начальными данными
	 * @param timeinterval интервал датасета
	 * @param tstep - шаг регулярной сетки (в секундах)
	 * @param z - начальный датасет
	 * @returns возвращает ссылку на измененный датасет
	 */
	fillzdata(timeinterval: TimeInterval, tstep: number, z: ZDataSet): ZDataSet {
		if(tstep<IrregularDataset.mintstep) tstep = IrregularDataset.mintstep
		if(this.tclose<=timeinterval.begin || this.topen>=timeinterval.end) 
			return z // датасет не попал в интервал
		this.rezoom(tstep)
		let t = timeinterval.begin
		let i = ~~((timeinterval.begin-this.time)/tstep) //индекс по датасету zdata
		let zi = 0 //индекс по датасету z
		if(i<0) { t = this.time; zi = -i; i = 0 }

		for(; t<timeinterval.end && t<this.tclose; i++, zi++, t+=tstep) {
			const flag = this.zdata[i].flag
			z.zdata[zi].flag = flag
			const value = this.zdata[i].value
			z.zdata[zi].value = value;
			if(flag == 1) {
				z.min = (value < z.min) ? value : z.min
				z.max = (value > z.max) ? value : z.max
			}
		}
		return z
	}

	/****************************************************************************
	 * Заполнение регулярного датасета z
	 * @param timeinterval 
	 * @param tstep 
	 * @param z - HLDataSet
	 * @returns 
	 */
	fillHLData(timeinterval: TimeInterval, tstep: number, z: HLDataSet): HLDataSet {
		if(tstep<IrregularDataset.mintstep) tstep = IrregularDataset.mintstep
		if(this.tclose<=timeinterval.begin || this.topen>=timeinterval.end) 
			return z // датасет не попал в интервал
		this.rezoom(tstep)
		let t = timeinterval.begin
		let i = ~~((timeinterval.begin-this.time)/tstep) //индекс по датасету hldata
		let zi = 0 //индекс по датасету z
		if(i<0) { t = this.time; zi=-i; i=0 }

		for(; t<timeinterval.end && t<this.tclose; i++, zi++, t+=tstep) {
			const flag = this.hldata[i].flag
			z.zdata[zi].flag = flag
			const high = this.hldata[i].high
			const low = this.hldata[i].low
			z.zdata[zi].high = high
			z.zdata[zi].low = low
			if(flag == 1) {
				z.min = (low < z.min)? low : z.min
				z.max = (high > z.max)? high : z.max
			}
		}
		return z
	}

	/****************************************************************************
	 * Заполнение регулярного датасета z
	 * @param timeinterval 
	 * @param tstep 
	 * @param z - OHLCDataSet
	 * @returns 
	 */
	fillOHLCData(timeinterval: TimeInterval, tstep: number, z: OHLCDataSet): OHLCDataSet {
		if(tstep<IrregularDataset.mintstep) tstep = IrregularDataset.mintstep
		if(this.tclose<=timeinterval.begin || this.topen>=timeinterval.end) 
			return z // датасет не попал в интервал
		this.rezoom(tstep)
		let t = timeinterval.begin
		let i = ~~((timeinterval.begin-this.time)/tstep) //индекс по датасету hldata
		let zi = 0 //индекс по датасету z
		if(i<0) { t = this.time; zi=-i; i=0 }

		for(; t<timeinterval.end && t<this.tclose; i++, zi++, t+=tstep) {
			const flag = this.ohlcdata[i].flag
			const open = this.ohlcdata[i].open
			const high = this.ohlcdata[i].high
			const low = this.ohlcdata[i].low
			const close = this.ohlcdata[i].close
			z.zdata[zi] = {flag, open, high, low, close}
			if(flag == 1) {
				z.min = (low < z.min) ? low : z.min
				z.max = (high > z.max) ? high : z.max
			}
		}
		return z
	}

	/****************************************************************************
	 * Интегрирование датасета по времени на интервале timeinterval.
	 * Интеграл в единицах*секунда.
	 * @param timeinterval 
	 * @returns 
	 */
	integrate(timeinterval: TimeInterval) {
		let s = 0.
		if (this.data.length == 0) return s
		let d_ = this.data[0]
		for (let i=1; i<this.data.length; i++) {
			const d = this.data[i]
			if(d.time>timeinterval.begin && d.time<=timeinterval.end) {
				s += d_.value*(d.time-d_.time)
				d_=d
			}
		}
		return s
	}

	/** Очищение закэшированного регулярного датасета */
	clearzdata() {
		this.zdata = []
		this.hldata = []
		this.ohlcdata = []
		this.tstep = 0
	}

}
