import DateTime from "./datetime"

///////////////////////////////////////////////////////////////////////////////
// Абстрактный Класс набора датасетов, разделенных на временные кусочки - таймслоты
//   parse - возвращает новый датасет
///////////////////////////////////////////////////////////////////////////////
export default class TimeSlots {
  static queue = []

  constructor(url, ext, threads=8, timezone=3) {
    this.datetime = new DateTime(timezone)
    this.threads = threads
		this.url = url;
		this.ext = ext;

		this.array = []; // массив таймслотов {time,status,data}
		this.tryes = []; // массив с числом попыток загрузки данных для таймслота
		// функция парсинга возвращает датасет
		this.parse = function(t, textdata) { return {time:t,status:0} }
		// функция, выполняемая после загрузки слота
		this.onload = function() {}
	}

	//=========================================================================
	// Функция загрузки таймслота, заданного временм t
	//=========================================================================
	load(timestamp) {

  	//исключаем одновременную загрузку таймслотов
    if (TimeSlots.queue.length>=this.threads) return
    //исключаем повторную загрузку слота
    if(typeof(this.array[timestamp]) !== 'undefined') return
    //не загружать будущие таймслоты
		if (timestamp>this.datetime.getBeginDayTimestamp(Date.now()/1000)) return
    const strId = this.datetime.getYYYYMMDD(timestamp)+'.'+this.ext
    //не загружать которые в очереди
		if(TimeSlots.queue.includes(strId)) return
    TimeSlots.queue.push(strId)
		const url = this.url+strId
    //console.log(TimeSlots.queue)
		console.log(url)
    return fetch(url)
      .then(r=>r.text())
      .then((text)=>{
        this.array[timestamp] = this.parse(timestamp, text)
      })
      .catch((error)=>{
        console.log('loading error', error)
        this.array[timestamp] = {flag:0}
      })
      .finally(()=>{
				TimeSlots.queue = TimeSlots.queue.filter(s=>s!=strId)
				// завершающие действия после загрузки (напр. отрисовка)
				this.onload()
      })
	}
	
	//=========================================================================
	// Функция подготовки пустого регулярного датасета.
	// Реализовано простое представление объекта zdata, состоящее из 
	// массива и значений min и max
	//=========================================================================
	preparezdata(timeinterval, tstep) {
		var min = Number.MAX_VALUE, max = Number.MIN_VALUE;
		var zdata = [];
		for(var t=timeinterval.begin;t<timeinterval.end;t+=tstep) {
			zdata.push({flag:0});
		}
		return {zdata:zdata, min:min, max:max};
	}
	//=========================================================================
	// Функция для получения перемасштабированного регуляризованного датасета 
	// на интервале timeinterval, tstep - шаг регуляризации.
	// Возвращается zdata.
	// zdata может быть структурой, включающей как несколько датасетов, так
	// и значения min и max по датасетам.
	// Функция абстрактна, не исходит из конкретного представления объекта zdata
	//=========================================================================
	getzdata({begin, end}, tstep) {
		var zdata = this.preparezdata(timeinterval, tstep);
		for(var t=this.datetime.getBeginDayTimestamp(begin);t<end;t+=86400) {
			if(typeof(this.array[t]) === 'undefined') {
				this.load(t, 'text'); // подгрузка данных таймслота
			}
			else {
				// заполняем массив zdata перемасштабированными данными
				if(this.array[t].flag != 0)
					zdata = this.array[t].fillzdata(timeinterval,tstep,zdata);
			}
		}
		return zdata;
	}
}
