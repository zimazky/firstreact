import { IrregularFloatDataset } from '../utils/irregularDS.js';
import {TimeDiagram, Line, SteppedLine, YTickLabels} from './Graphs.jsx'
import Modal from './Modal.jsx';
import {TimeTable} from './Table.jsx'
import styles from './TimeDiagramsSet.module.css'
//import { TimeIntervalProvider } from './TimeIntervalContext.jsx'


///////////////////////////////////////////////////////////////////////////////
// Класс набора датасетов, разделенных на временные кусочки - таймслоты
//   parse - возвращает новый датасет
///////////////////////////////////////////////////////////////////////////////
export class TimeSlots {
	constructor(url, ext) {
		this.url = url;
		this.ext = ext;
		this.array = []; // массив таймслотов {time,status,data}
		this.tryes = []; // массив с числом попыток загрузки данных для таймслота
		// функция парсинга возвращает датасет
		this.parse = function(t, textdata) { return {time:t,status:0}; };
		// функция, выполняемая после загрузки слота
		this.onload = function() {};
		// функция стыковки, позволяет произвести действия с элементами при стыковке
		// el1 - элемент слева
		// el2 - элемент справа
		this.ondock = function(el1,el2) { /*console.log(el1,el2);*/ };
	}

	//=========================================================================
	// Функция загрузки таймслота, заданного временм t
	//=========================================================================
	load(t, responseType='text') {
		if (TimeSlots.loading) {
			//исключаем одновременную загрузку таймслотов
			return;
		}
		if(typeof(this.array[t]) !== 'undefined') return; //исключаем повторную загрузку слота
		var today = (~~((Date.now()/1000+3*3600)/86400))*86400-3*3600;
		if (t>today) return; //не загружать будущие таймслоты
		TimeSlots.loading = true; 
		var date = new Date((t+3*3600)*1000); // дата по московскому времени
		var d = date.getUTCDate();
		var m = date.getUTCMonth()+1;
		var y = date.getUTCFullYear();
		var url = this.url+y+((m<10)?'0':'')+m+((d<10)?'0':'')+d+'.'+this.ext;//+'?'+Math.random();
		var xhr = new XMLHttpRequest();
		xhr.responseType = responseType;
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function (evt) {
			if (xhr.readyState == 4) {
				if(xhr.status == 200) {
					this.array[t] = this.parse(t, xhr.response);
					delete this.tryes[t];
					// поиск соседних слотов и стыковка
					if(typeof(this.array[t+86400]) !== 'undefined') { 
						if(this.array[t+86400].flag != 0) this.ondock(this.array[t],this.array[t+86400]); 
					}
					if(typeof(this.array[t-86400]) !== 'undefined') {
						if(this.array[t-86400].flag != 0) this.ondock(this.array[t-86400],this.array[t]); 
					}
				}
				else if(xhr.status != 0){ //не пытаемся больше загрузить
					console.log('loading error', xhr.statusText);
					console.log('status', xhr.status);
					this.array[t] = {flag:0};
					//delete this.tryes[t];
				}
				else { //пытаемся 3 раза загрузить при неудачных попытках
					if(typeof(this.tryes[t]) === 'undefined') this.tryes[t] = 1;
					else this.tryes[t] += 1;
					console.log('trying', this.tryes[t]);
					if(this.tryes[t] > 3) {
						this.array[t] = {flag:0};
						delete this.tryes[t];
					}
				}
				TimeSlots.loading = false;
				// завершающие действия после загрузки (напр. отрисовка)
				this.onload();
			}
		}.bind(this);
/*
		xhr.ontimeout = function (evt) {
			console.log('timeout', evt);
		}.bind(this);
*/
		xhr.send(null);
		console.log(url);
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
	getzdata(timeinterval, tstep) {
		var zdata = this.preparezdata(timeinterval, tstep);
		for(var t=(~~((timeinterval.begin+3*3600)/86400))*86400-3*3600;t<timeinterval.end;t+=86400) {
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
TimeSlots.loading = false;

///////////////////////////////////////////////////////////////////////////////
// Класс таймслотов зоны контроллера
///////////////////////////////////////////////////////////////////////////////
export class ArduinoZone extends TimeSlots {
	constructor(url, id, tcolor, hcolor, pcolor) {
		super(url, 'Z'+id);
		this.tcolor = tcolor; // цвет линии температуры
		this.hcolor = hcolor; // цвет линии влажности
		this.pcolor = pcolor; // цвет линии подачи мощности
		this.showpower = false;// показывать подачу мощности на диаграмме
		
		this.parse = function(t, textdata) {
			var tDataset = new IrregularFloatDataset(t);
			var hDataset = new IrregularFloatDataset(t);
			var pDataset = new IrregularFloatDataset(t);
			
			if(textdata) {
				//console.log(textdata);
				// Парсинг текстовых данных

				// Лог температурной зоны:
				// Строка представляет собой событие. Событие может выводиться двумя типами записей: 
				//   - полная запись (первая запись в файле лога или после перезагрузки);
				//   - разностная запись (записывается разность между текущим значением и предыдущим).
				// Порядок полей при выводе событий:
				// 1. Флаги событий int8_t
				//    1 - Изменение фактической температуры
				//    2 - Изменение фактической влажности
				//    4 - Бит подачи мощности на обогреватель
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
	
	
				//=========================================================================
				// Функция парсинга данных, полученных от устройства Arduino.
				//
				// Флаги событий ([+] - используются для вывода графиков)
				//    1 - Изменение фактической температуры [+]
				//    2 - Изменение фактической влажности [+]
				//    4 - Бит подачи мощности на обогреватель [+]
				//    8 - Бит режима работы
				//   16 - Изменение заданной температуры
				//   32 - Изменение заданного гистерезиса температуры
				//   64 - Изменение состояния датчика
				//  128 - Признак полной записи (выводятся все поля в виде полных значений)
				//=========================================================================
				var strings = textdata.split('\n');
				var time = 0; 
				var t = 0., h = 0., tc = 0., dtc = 0., p = 0.;
				var dht = 0;
				var f = 0;
				for (var i=0; i<strings.length; i++) {
					var event = strings[i].split(';');
					if (event.length < 2) continue;
					if (event[0] & 128) { // строка с полными данными
						t = 0.; h = 0.; tc = 0.; dtc = 0.; dht = 0;
						time = parseInt(event[1]);
						var j = 2;
						if (event[0] & 1 ) t = parseFloat(event[j++]); 
						if (event[0] & 2 ) h = parseFloat(event[j++]);
						if (event[0] & 4 ) p = 100.; else p = 0.;
						pDataset.push({flag: 1, time: time, value: p}); 
						if (event[0] & 16) tc = parseFloat(event[j++]);
						if (event[0] & 32) dtc = parseFloat(event[j++]);
						if (event[0] & 64) dht = parseFloat(event[j++]);
						if (dht == 0) { // добавляем только если датчик был без ошибок
							tDataset.push({flag: 0, time: time, value: t/10.}); 
							hDataset.push({flag: 0, time: time, value: h/10.}); 
						}
					}
					else { // строка с разностными данными
						if (time == 0) continue; //еще не было полных данных
						var ptime = parseInt(event[1]);
						// исправление ошибки в логах, отрицательная корректировка времени выводится как положительное число
						ptime = (ptime>2147483647)?ptime-4294967296:ptime; 
						if (ptime<0) console.log(ptime,time,t,h,tc,dtc,dht);
						time += ptime;
						var j = 2;
						if (event[0] & 1) t += parseFloat(event[j++]); 
						if (event[0] & 2) h += parseFloat(event[j++]); 
						if (event[0] & 4 ) {
							if (p != 100.) { // добавляем только если произошли изменения 0 -> 100
								p = 100.;
								pDataset.push({flag: 1, time: time, value: p}); 
							}
						}
						else {
							if (p != 0.) { // добавляем только если произошли изменения 100 -> 0
								p = 0.;
								pDataset.push({flag: 1, time: time, value: p}); 
							}
						}
						if (event[0] & 16) tc += parseFloat(event[j++]);
						if (event[0] & 32) dtc += parseFloat(event[j++]);
						if (event[0] & 64) dht = parseFloat(event[j++]);
						f = dht==0?1:0;
						if (dht == 0) {// добавляем только если датчик был без ошибок
							if (event[0] & 1) tDataset.push({flag: f, time: time, value: t/10.}); 
							if (event[0] & 2) hDataset.push({flag: f, time: time, value: h/10.}); 
						}
					}
				}
				// добавляем завершающие данные (на случай, если не было изменений в конце дня)
				if (tDataset.data.length != 0) tDataset.push({flag: f, time: time, value: t/10.}); 
				if (hDataset.data.length != 0) hDataset.push({flag: f, time: time, value: h/10.}); 
				if (pDataset.data.length != 0) pDataset.push({flag: 1, time: time, value: p}); 
			}
			return {t:tDataset, h:hDataset, p:pDataset};
		}
	}
	preparezdata(timeinterval, tstep) {
		var t = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE};
		var h = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE}; 
		var	p = {zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE};  
		
		for(var it=timeinterval.begin;it<timeinterval.end;it+=tstep) {
			t.zdata.push({flag:0});
			h.zdata.push({flag:0});
			p.zdata.push({flag:0});
		}
		return {t:t, h:h, p:p};
	}

	//=========================================================================
	// Функция для получения перемасштабированного регуляризованного датасета 
	// на интервале timeinterval
	//   tstep - шаг регуляризации
	// Возвращается структура {t:{zdata,min,max},h:{zdata,min,max},p:{zdata,min,max}}
	//   zdata
	//   min
	//   max
	//=========================================================================
	getzdata(timeinterval, tstep) {
		
		var a = this.preparezdata(timeinterval, tstep);
		
		for(var it=(~~((timeinterval.begin+3*3600)/86400))*86400-3*3600;it<timeinterval.end;it+=86400) {
			if(typeof(this.array[it]) === 'undefined') {
				this.load(it, 'text'); // подгрузка данных таймслота
			}
			else {
				// заполняем массив zdata перемасштабированными данными
				if(this.array[it].flag != 0) {
					a.t = this.array[it].t.fillzdata(timeinterval,tstep,a.t);
					a.h = this.array[it].h.fillzdata(timeinterval,tstep,a.h);
					a.p = this.array[it].p.fillzdata(timeinterval,tstep,a.p);
				}
			}
		}
		//console.log(a);
		return a;
	}
}


let zones = []
let ti = {}
ti.end = new Date('2021.12.25 00:00:00')/1000
ti.begin = ti.end-2*24*3600
const width = 350
const height = 250
const barw = 1

export default function TimeDiagramsSet() {
  
  const [timeInterval, setTimeInterval] = React.useState(ti)
  const [dataset, setDataset] = React.useState([])
  const [selectedDate, setSelectedDate] = React.useState(0)

  let numberOfZones = 3
  React.useEffect(()=>{
    zones.push(new ArduinoZone('./log/',2,'white','white','red'))
		zones.push(new ArduinoZone('./log/',3,'white','white','red'))

    zones.forEach((v)=>{v.onload = ()=>{
      setTimeInterval((prevTimeInterval)=>{
        return {...prevTimeInterval}
      })
		}})
  },[])	

  React.useEffect(()=>{
    let tstep = (barw*(timeInterval.end-timeInterval.begin)/width)
    let newDataset=zones.map(v=>v.getzdata(timeInterval,tstep))
    setDataset(newDataset)
  },[timeInterval])

  const onShift = React.useCallback( (d) => {
    setTimeInterval((prevTimeInterval)=>{
      let interval = prevTimeInterval.end-prevTimeInterval.begin
      return { begin: prevTimeInterval.begin-interval*d, end: prevTimeInterval.end-interval*d }
    })
  })

  const onZoom = React.useCallback( (z,k) => {
    setTimeInterval((prevTimeInterval)=>{
      let interval = prevTimeInterval.end-prevTimeInterval.begin
      if ( z*interval < 300 ) return prevTimeInterval
      let timeOffset = prevTimeInterval.begin+k*interval
      return { begin: timeOffset-z*(timeOffset-prevTimeInterval.begin), end: timeOffset+z*(prevTimeInterval.end-timeOffset)}
    })
  })

	const onSelectDate = React.useCallback( (date) => {
		setSelectedDate(date)
	})

	let tMin = Math.min(...dataset.map(v=>v.t.min))
	let tMax = Math.max(...dataset.map(v=>v.t.max))
	let hMin = Math.min(...dataset.map(v=>v.h.min))
	let hMax = Math.max(...dataset.map(v=>v.h.max))
	//if(selectedDate!=0) console.log(zones[0].array[(~~((selectedDate+3*3600)/86400))*86400-3*3600])
	let selectedDateStart = (~~((selectedDate+3*3600)/86400))*86400-3*3600
  return (
    <div className={styles.wrapper}>
      <div className={styles.diagramsColumn}>
        <TimeDiagram title='Temperature, °C' timeInterval={timeInterval} onShift={onShift} onZoom={onZoom} onSelectDate={onSelectDate} min={tMin} max={tMax} width={width} height={height}>
          {dataset[0] && <Line data={dataset[0].t.zdata} height={height} min={tMin} max={tMax} barw={barw} color='#ffa23c'/>}
					{dataset[1] && <Line data={dataset[1].t.zdata} height={height} min={tMin} max={tMax} barw={barw} color='#88a23c'/>}
        </TimeDiagram>
        <TimeDiagram title='Humidity, %' timeInterval={timeInterval} onShift={onShift} onZoom={onZoom} onSelectDate={onSelectDate} min={hMin} max={hMax} width={width} height={height}>
          {dataset[0] && <Line data={dataset[0].h.zdata} height={height} min={hMin} max={hMax} barw={barw} color='#bbb'/>}
          {dataset[1] && <Line data={dataset[1].h.zdata} height={height} min={hMin} max={hMax} barw={barw} color='#88bbbb'/>}
        </TimeDiagram>
      </div>
			{ selectedDate!=0 && 
			<Modal isOpen={selectedDate!=0} title={'Set target temperature for Zone'} onCancel={()=>{setSelectedDate(0)}}>
				<TimeTable
					title={new Date(selectedDate*1000).toLocaleDateString() + ' Z2 H'}
					data={zones[0].array[selectedDateStart].h?zones[0].array[selectedDateStart].h.data:[]}
					time={selectedDate}
				/>
			</Modal>
			}
    </div>
  )
}