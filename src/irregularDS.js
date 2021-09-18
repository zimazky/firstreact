///////////////////////////////////////////////////////////////////////////////
// Масштабируемый датасет с нерегулярными по времени данными, приводимый к
// регулярному датасету с усредненными значениями величин
//
// 
//   Нерегулярный по времени датасет data, приводится к регулярному датасету
//   усредненных данных zdata при перемасштабировании
//
// Параметры инициализации:
//   time  - время начала таймслота датасета
//   tstep - шаг регуляризации и усреднения датасета (шаг сетки времени)
//           при tstep=0 заранее регуляризация не производится
//   zmode - режим отображения перемасштабированного датасета: 
//           'linear'   - точки соединенные прямыми (датасет представляется набором кусочно-линейных отрезков),
//           'stepped'  - ступенчатое изменение на точках (датасет представляется набором кусочно-ступенчатых отрезков), 
//           'highlow'  - максимальные high и минимальные low значения в ячейке
//           'ohlc'     - open, high, low, close значения в ячейке
//           'differential' - приращения между границами баров (пока не реализовано)
///////////////////////////////////////////////////////////////////////////////
export class IrregularFloatDataset {
	constructor(time, zmode = 'stepped') {
		this.time = time; // время начала датасета
		this.zmode = zmode; // режим отображения на регулярную сетку
		this.data = [];  // нерегулярный по времени датасет 
		this.flag = 0;   // признак загрузки (1 если загружена хотя бы одна точка)
		this.value = 0;  // среднее значение
		this.high = Number.MIN_VALUE; // максимальное значение по всему датасету
		this.low = Number.MAX_VALUE;  // минимальное значение по всему датасету
		this.open = 0;   // первое значение датасета
		this.close = 0;  // последнее значение датасета
		this.topen = 0;  // время первого значения датасета
		this.tclose = 0; // время последнего значения датасета
		this.nclose = 0; //число повторений одного значения в конце датасета
						          //используется для исключения дублирования данных при добавлении значений в датасет
		// секция для кэширования перемасштабированных данных
		this.tstep = 0; //вначале 0, перемасштабирование не установлено
		this.zdata = []; // перемасштабированный регулярный по времени датасет
	}

	//=========================================================================
	// Функция добавления новой точки в датасет
	//
	// Структура входного значения d, попадающего в data:
	//    flag  - признак разрыва (0 - разрыв, 1 - непрерывность)
	//            разрыв указывает на то, что между предыдущим элементом и
	//            текущим нет связи
	//    time  - метка времени новой точки
	//    value - значение новой точки
	//=========================================================================
	push(d) {
		// !!!ДОРАБОТАТЬ
		// РАССМОТРЕТЬ СЛУЧАЙ, КОГДА ОДНА ТОЧКА СЛЕВА, А ДРУГАЯ СПРАВА ОТ ГРАНИЦЫ
		if (d.time < this.time) return; // грубо отбрасываются все точки слева
		if (this.data.length == 0) { // инициализация при добавлении первого значения 
			this.flag = 1
			this.value = this.low = this.high = this.open = this.close = d.value
			this.topen = this.tclose = d.time
			this.data.push( {flag: 0, time: d.time, value: d.value} )
      return
		}
		// добавление второго и более значения в датасет
    // среднее значение можно посчитать
    // v = (v*(t[i-1]-to)+(d[i-1]-do)*(t[i]-t[i-1]))/(t[i]-to)
    if(this.tclose>this.topen) {
      this.value = (this.value*(this.tclose-this.topen)+(this.close-this.open)*(d.time-this.tclose))/(d.time-this.topen);
    }
    if(this.close == d.value && d.flag == 1) { // исключение повторения данных
      // при повторении сохраняются первая и последняя точка из серии
      if(this.nclose == 0) { // первое повторение
        this.nclose++;
        this.tclose = d.time;
        this.data.push({flag:d.flag,time:d.time,value:d.value});
      }
      else { // второе и более повторение
        this.data[this.data.length-1].time = d.time;
        this.tclose = d.time;
      }
      return;
    }
    this.low = Math.min(this.low,d.value);
    this.high = Math.max(this.high,d.value);
    this.close = d.value;
    this.tclose = d.time;
    this.nclose = 0;
    this.data.push({flag:d.flag,time:d.time,value:d.value});
		
	}
	
	//=========================================================================
	// Функция получения регуляризованного датасета
	// по способу кусочно-линейной интерполяции
	//
	// z - шаг регуляризации
	//
	// Возвращает регуляризованный датасет в виде массива элементов со структурой
	// {flag, value}
	//
	getlinearregdata(z) {
		var zdata = [];
		var d = this.data[0];
		var zt = this.time;
		var v0 = d.value; // значение в начале (на левой границе) текущей ячейки (считаем = d.value)
		while (zt+z < d.time) {
			// заполняем регулярные ячейки неактивными значениями до первой точки
			zdata.push({flag:0, value:v0});
			zt += z;
		}
		// на этот момент первая точка data[0] находится в интервале [zt,zt+z)
		//    zt     zt+z
		//    |       |
		//  v0|---d   |
		//    |   ^   |
		
		// сохраняем значение первой точки в ячейку
		zdata.push({flag:1, value:v0});
		for (var i=1; i<this.data.length; i++) {
			d = this.data[i];
			var n = zdata.length-1;
			var dm = this.data[i-1];
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
				zdata[n].value += (d.value-v0)*(zt+z-d.time)/z;
				v0 = d.value;
			}
			else { // создаем новые ячейки
				zt += z;
				//       zt             zt+z
				//       |               |        d
				//       |               |v1
				//  dm   |v0             |
				//
				// k = (d-dm)/(d.time-dm.time)
				// v0 = dm + k*(zt-dm.time)
				// v1 = v0 + k*z
				// v = (v0+v1)/2 = v0 + k*z/2
				var k = (d.value-dm.value)/(d.time-dm.time);
				// ячейки через которые отрезок проходит насквозь
				v0 = dm.value+k*(zt-dm.time); // значение на левой границе
				while (zt+z < d.time) {
					var v1 = v0 + k*z;
					zdata.push({flag:d.flag, value: (v0+v1)/2});
					v0 = v1; zt += z;
				}
				// ячейка в которой завершается отрезок
				zdata.push({flag: 1, value: v0});
			}
		}
	return zdata;
	}
	
	//=========================================================================
	// Функция получения регуляризованного датасета
	// по способу кусочно-ступенчатой интерполяции
	//
	// z - шаг регуляризации
	//
	// Возвращает регуляризованный датасет в виде массива элементов со структурой
	// {flag, value}
	//
	getsteppedregdata(z) {
		var zdata = [];
		var d = this.data[0];
		var zt = this.time;
		var v0 = d.value; // значение в начале (на левой границе) текущей ячейки (считаем = d.value)
		while (zt+z < d.time) {
			// заполняем регулярные ячейки неактивными значениями до первой точки
			zdata.push({flag:0, value:v0});
			zt += z;
		}
		// сохраняем значение первой точки в ячейку
		zdata.push({flag:1, value:v0});
		for (var i=1; i<this.data.length; i++) {
			d = this.data[i];
			var n = zdata.length-1;
			var dm = this.data[i-1];
			if (d.time < zt+z) {
				// попали в уже существующую ячейку
				// вычисляем усредненное значение аналогично кусочно-линейному датасету
				zdata[n].value += (d.value-v0)*(zt+z-d.time)/z;
				v0 = d.value;
			}
			else {
				// создаем новые ячейки
				zt += z;
				// ячейки через которые отрезок проходит насквозь
				v0 = dm.value; // значение на левой границе
				while (zt+z < d.time) {
					zdata.push({flag:d.flag, value: v0});
					zt += z;
				}
				// ячейка в которой завершается отрезок
				if(d.flag == 0) v0 = d.value;
				zdata.push({flag: 1, value: v0});
			}
		}
		// завершающая точка (на всякий случай)
		zdata.push({flag: 1, value: v0});
		return zdata;
	}
	
	//=========================================================================
	// Функция получения регуляризованного датасета
	// по способу ohlc
	//
	// z - шаг регуляризации
	//
	// Возвращает регуляризованный датасет в виде массива элементов со структурой
	// {flag, open, high, low, close}
	//
	getohlcregdata(z) {
		var zdata = [];
		var d = this.data[0];
		var zt = this.time;
		var v0 = d.value; // значение в начале (на левой границе) текущей ячейки (считаем = d.value)
		while (zt+z < d.time) {
			// заполняем регулярные ячейки неактивными значениями до первой точки
			zdata.push({flag:0, open: v0, high:v0, low:v0, close: v0});
			zt += z;
		}
		// сохраняем значение первой точки в ячейку
		zdata.push({flag:1, open: v0, high:v0, low:v0, close: v0});
		for (var i=1; i<this.data.length; i++) {
			d = this.data[i];
			var n = zdata.length-1;
			var dm = this.data[i-1];
			if (d.time < zt+z) {
				// попали в уже существующую ячейку
				// добавляем новые значения high и low
				zdata[n].close = d.value;
				zdata[n].high = (d.value>zdata[n].high)?d.value:zdata[n].high;
				zdata[n].low  = (d.value<zdata[n].low)?d.value:zdata[n].low;
			}
			else {
				// создаем новые ячейки
				zt += z;
				// ячейки через которые отрезок проходит насквозь
				v0 = dm.value; // значение на левой границе
				while (zt+z < d.time) {
					zdata.push({flag:d.flag, open: v0, high:v0, low:v0, close: v0});
					zt += z;
				}
				// ячейка в которой завершается отрезок
				if(d.flag == 0) v0 = d.value;
				zdata.push({flag: 1, open: v0, high:v0, low:v0, close: v0});
			}
		}
		// завершающая точка (на всякий случай)
		zdata.push({flag: 1, open: v0, high:v0, low:v0, close: v0});
		return zdata;
	}
	
	//=========================================================================
	// Функция получения регуляризованного датасета
	// по способу highlow
	//
	// z - шаг регуляризации
	//
	// Возвращает регуляризованный датасет в виде массива элементов со структурой
	// {flag, high, low}
	//
	gethighlowregdata(z) {
		var zdata = [];
		var d = this.data[0];
		var zt = this.time;
		var v0 = d.value; // значение в начале (на левой границе) текущей ячейки (считаем = d.value)
		while (zt+z < d.time) {
			// заполняем регулярные ячейки неактивными значениями до первой точки
			zdata.push({flag:0, high:v0, low:v0});
			zt += z;
		}
		// сохраняем значение первой точки в ячейку
		zdata.push({flag:1, high:v0, low:v0});
		for (var i=1; i<this.data.length; i++) {
			d = this.data[i];
			var n = zdata.length-1;
			var dm = this.data[i-1];
			if (d.time < zt+z) {
				// попали в уже существующую ячейку
				// добавляем новые значения high и low
				zdata[n].high = (d.value>zdata[n].high)?d.value:zdata[n].high;
				zdata[n].low  = (d.value<zdata[n].low)?d.value:zdata[n].low;
			}
			else {
				// создаем новые ячейки
				zt += z;
				// ячейки через которые отрезок проходит насквозь
				v0 = dm.value; // значение на левой границе
				while (zt+z < d.time) {
					zdata.push({flag:d.flag, high:v0, low:v0});
					zt += z;
				}
				// ячейка в которой завершается отрезок
				if(d.flag == 0) v0 = d.value;
				zdata.push({flag: 1, high:v0, low:v0});
			}
		}
		// завершающая точка (на всякий случай)
		zdata.push({flag: 1, high:v0, low:v0});
		return zdata;
	}

	//=========================================================================
	// Функция перемасштабирования датасета.
	//   z - шаг регуляризации (интервал времени между соседними ячейками)
	//   значения ячеек считаем принадлежат левой границе ячейки
	//
	// Структура перемасштабированного бара z в zdata при zmode='linear' или 'stepped':
	//    flag  - признак активности бара, указывает отображать ли бар при выводе
	//    value - среднее значение в баре
	//
	// Структура перемасштабированного бара z в zdata при zmode='highlow':
	//    flag  - признак активности бара, указывает отображать ли бар при выводе
	//    high  - максимальное значение в баре
	//    low   - минимальное значение в баре
	//=========================================================================
	rezoom(z) {
		if (z < 1) z = 1; // ограничение на масштабирование z>=1
		if (this.tstep == z || this.data.length == 0) return; // не перемасштабируем, если z не поменялся или датасет пустой
		this.tstep = z;
		if(this.zmode == 'linear') this.zdata = this.getlinearregdata(z);
		else if(this.zmode == 'stepped') this.zdata = this.getsteppedregdata(z);
		else if(this.zmode == 'highlow') this.zdata = this.gethighlowregdata(z);
		else if(this.zmode == 'ohlc') this.zdata = this.getohlcregdata(z);
	}
	
	//=========================================================================
	// Заполнение регулярного датасета z после регуляризации
	//=========================================================================
	fillzdata(timeinterval, tstep, z) {
		if(this.tclose<=timeinterval.begin || this.topen>=timeinterval.end) return z; // датасет не попал в интервал
		this.rezoom(tstep);
		var t = timeinterval.begin;
		var i = ~~((timeinterval.begin-this.time)/tstep); //индекс по датасету zdata
		var zi = 0; //индекс по датасету z
		if(i<0) { t = this.time; zi=-i; i=0; }

		var min=z.min, max=z.max;
		if(this.zmode == 'linear' || this.zmode == 'stepped') {
			for(;t<timeinterval.end && t<this.tclose; i++,zi++,t+=tstep) {
				var flag = this.zdata[i].flag;
				z.zdata[zi].flag = flag;
				var ft = this.zdata[i].value;
				z.zdata[zi].value = ft;
				if(flag == 1) {
					min = (ft < min)? ft : min;
					max = (ft > max)? ft : max;
				}
			}
		}
		else if(this.zmode == 'highlow') { // для режима highlow
			for(;t<timeinterval.end && t<this.tclose; i++,zi++,t+=tstep) {
				var flag = this.zdata[i].flag;
				z.zdata[zi].flag = flag;
				var high = this.zdata[i].high;
				var low = this.zdata[i].low;
				z.zdata[zi].high = high;
				z.zdata[zi].low = low;
				if(flag == 1) {
					min = (low < min)? low : min;
					max = (high > max)? high : max;
				}
			}
		}
		else if(this.zmode == 'ohlc') { // для режима ohlc
			for(;t<timeinterval.end && t<this.tclose; i++,zi++,t+=tstep) {
				var flag = this.zdata[i].flag;
				z.zdata[zi].flag = flag;
				var open = this.zdata[i].open;
				var high = this.zdata[i].high;
				var low = this.zdata[i].low;
				var close = this.zdata[i].close;
				z.zdata[zi].open = open;
				z.zdata[zi].high = high;
				z.zdata[zi].low = low;
				z.zdata[zi].close = close;
				if(flag == 1) {
					min = (low < min)? low : min;
					max = (high > max)? high : max;
				}
			}
		}
		
		return {zdata:z.zdata,min:min,max:max};
	}

	//=========================================================================
	// Функция интегрирования датасета по времени на интервале timeinterval.
	// Интеграл в единицах*секунда.
	//=========================================================================
	integrate(timeinterval) {
		var s = 0.;
		if (this.data.length>0) {
			var d_ = this.data[0];
			for (var i=1; i<this.data.length; i++) {
				var d = this.data[i];
				if(d.time>timeinterval.begin && d.time<=timeinterval.end) {
					s += d_.value*(d.time-d_.time);
					d_=d;
				}
			}
		}
		return s;
	}

	clearzdata() {
		this.zdata = [];
		this.tstep = 0;
	}
}
