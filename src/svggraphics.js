///////////////////////////////////////////////////////////////////////////////
// Графика
//   divid  - идентификатор контейнера
//   width  - ширина холста
//   height - высота холста
//
// Надо сделать:
//   - Отлавливать изменение размеров клиентской области и перестраивать 
//     размеры холста
///////////////////////////////////////////////////////////////////////////////
export function Graphics(divid, width=512, height=384) {
	this.container = document.getElementById(divid);
	this._canvas = document.createElement('canvas');
	this.container.appendChild( this._canvas );
	this._canvas.width = width;
	this._canvas.height = height;
	this._ctx = this._canvas.getContext('2d');
	this.width = this._canvas.width;
	this.height = this._canvas.height;

	//=========================================================================
	// Отображение гладкого графика
	//		x,y 	- положение блока отображения
	// 		width	- ширина блока отображения
	// 		height	- высота блока
	//		barw	- ширина линии тика
	//		barp	- зазор между линиями тиков
	// 		dataset	- набор данных 
	//				  используются поля: flag - отображать и value - значение
	//		shift	- смещение начала графика от начала датасета
	//				  (отрицательное значение указывает насколько смещается
	//				  график от начала области вывода)
	//		color	- цвет линии
	//=========================================================================
	this.lines = function(x,y,width,height,barw,barp,dataset,min,max,shift=0,color='black') {
		var dx; //начальное смещение графика
		if (shift < 0) { dx = -shift*(barw+barp); shift = 0; } else { dx = shift; shift = ~~(shift+.5); dx = (shift-dx)*(barw+barp); };
		// dx - начальное смещение графика в барах от левой границы области
		// shift - начальный бар от начала датасета
		if (dx >= width || shift >= dataset.length) return; //график вышел за пределы области построения
		var num_bars = ~~((width-dx)/(barw+barp));
		num_bars = (num_bars<dataset.length-shift)?num_bars:(dataset.length-shift);
		var scale = height/(max-min);
		this._ctx.save();
		this._ctx.strokeStyle = color;
		this._ctx.beginPath();
		var bx = ~~(x+dx)+0.5;
		var by = y+height-scale*(dataset[shift].value-min);
		this._ctx.moveTo( bx, ~~by+.5 )
		if (dataset[shift].flag == 1) this._ctx.lineTo( bx+(barw+barp), ~~by+0.5 );
		else this._ctx.moveTo( bx+(barw+barp), ~~by+0.5 );
		for (var i=1; i<num_bars; i++) {
			bx = ~~(x+dx+i*(barw+barp))+0.5;
			by = y+height-scale*(dataset[shift+i].value-min);
			if (dataset[shift+i].flag == 1) {
				if (dataset[shift+i-1].flag == 1) {
					//this._ctx.lineTo( bx, ~~by+0.5 );
					this._ctx.lineTo( bx+(barw+barp), ~~by+0.5 );
				}
				else {
					this._ctx.moveTo( bx, ~~by+0.5 );
					this._ctx.lineTo( bx+(barw+barp), ~~by+0.5 );
				}
			}
		}
		this._ctx.stroke();
		this._ctx.restore();
	}
	//=========================================================================
	// Отображение ступенчатого графика
	//		x,y 	- положение блока отображения
	// 		width	- ширина блока отображения
	// 		height	- высота блока
	//		barw	- ширина линии тика
	//		barp	- зазор между линиями тиков
	// 		dataset	- набор данных 
	//				  используются поля: flag - отображать и value - значение
	//		shift	- смещение начала графика от начала датасета
	//				  (отрицательное значение указывает насколько смещается
	//				  график от начала области вывода)
	//		color	- цвет линии
	//=========================================================================
	this.stepped = function(x,y,width,height,barw,barp,dataset,min,max,shift=0,color='black') {
		var dx; //начальное смещение графика
		if (shift < 0) { dx = -shift*(barw+barp); shift = 0; } else { dx = shift; shift = ~~(shift+.5); dx = (shift-dx)*(barw+barp); };
		// dx - начальное смещение графика в барах от левой границы области
		// shift - начальный бар от начала датасета
		if (dx >= width || shift >= dataset.length) return; //график вышел за пределы области построения
		var num_bars = ~~((width-dx)/(barw+barp));
		num_bars = (num_bars<dataset.length-shift)?num_bars:(dataset.length-shift);
		var scale = height/(max-min);
		this._ctx.save();
		this._ctx.strokeStyle = color;
		this._ctx.beginPath();
		var bx = ~~(x+dx)+0.5;
		var by = y+height-scale*(dataset[shift].value-min);
		this._ctx.moveTo( bx, ~~by+.5 )
		if (dataset[shift].flag == 1) this._ctx.lineTo( bx+(barw+barp), ~~by+0.5 );
		else this._ctx.moveTo( bx+(barw+barp), ~~by+0.5 );
		for (var i=1; i<num_bars; i++) {
			bx = ~~(x+dx+i*(barw+barp))+0.5;
			by = y+height-scale*(dataset[shift+i].value-min);
			if (dataset[shift+i].flag == 1) {
				if (dataset[shift+i-1].flag == 1) {
					this._ctx.lineTo( bx, ~~by+0.5 );
					this._ctx.lineTo( bx+(barw+barp), ~~by+0.5 );
				}
				else {
					this._ctx.moveTo( bx, ~~by+0.5 );
					this._ctx.lineTo( bx+(barw+barp), ~~by+0.5 );
				}
			}
		}
		this._ctx.stroke();
		this._ctx.restore();
	}
	//=========================================================================
	// Отображение графика баров OHLCV
	//		x,y 	- положение блока отображения
	// 		width	- ширина блока отображения
	// 		height	- высота блока
	//		barw	- ширина свечи (бара)
	//		barp	- зазор между свечами (барами)
	//	 	min		- минимальное значение
	// 		max		- максимальное значение
	// 		dataset	- набор данных
	//				  используются поля: flag - отображать, open - цена открытия, 
	//				  high - хай, low - лоу, close - цена закрытия
	//      shift	- смещение начала графика от начала датасета
	//				  (отрицательное значение указывает насколько смещается
	//				  график от начала области вывода)
	//		ucolor	- цвет линии роста
	//		dcolor	- цвет линии снижения
	//=========================================================================
	this.ohlcbars = function(x,y,width,height,barw,barp,dataset,min,max,shift=0,ucolor='green',dcolor='red') {
		var dx; 
		if (shift < 0) { dx = -shift*(barw+barp); shift = 0; } else { dx = shift; shift = ~~(shift+.5); dx = (shift-dx)*(barw+barp); };
		// dx - начальное смещение графика в барах от левой границы области
		// shift - начальный бар от начала датасета
		if (dx >= width || shift >= dataset.length) return; //график вышел за пределы области построения
		var num_bars = ~~((width-dx)/(barw+barp)); //число баров, попадающих в область построения
		num_bars = (num_bars<dataset.length-shift)?num_bars:(dataset.length-shift-1);
		var scale = height/(max-min);
		//var max = Math.max.apply(Math,dataset.slice(last_el-num_bars,last_el+1).map( function (d) { return d.high; } ));
		//var min = Math.min.apply(Math,dataset.slice(last_el-num_bars,last_el+1).map( function (d) { return d.low; } ));
		// Отрисовка баров
		this._ctx.save();
		// green
		this._ctx.beginPath();
		this._ctx.strokeStyle = ucolor; 
		var bx = ~~(x+dx)+0.5;
		for(var i=0; i<=num_bars; i++, bx+=barw+barp) {
			var by = y+height-scale*(dataset[shift+i].open-min);
			var hy = y+height-scale*(dataset[shift+i].high-min);
			var ly = y+height-scale*(dataset[shift+i].low-min);
			var cy = y+height-scale*(dataset[shift+i].close-min);
			if( dataset[shift+i].flag == 1 ) {
				if( cy <= by ) {
					// close
					this._ctx.moveTo( bx, ~~cy+0.5 ); 
					this._ctx.lineTo( bx-(barw+barp>>1), ~~cy+0.5 );
					// open
					this._ctx.moveTo( bx-(barw+barp>>1), ~~by+0.5 ); 
					this._ctx.lineTo( bx-(barw+barp), ~~by+0.5 );
					// high-low
					this._ctx.moveTo( bx-(barw+barp>>1), ~~hy+0.5 ); 
					this._ctx.lineTo( bx-(barw+barp>>1), ~~ly+0.5 );
				}
			}
		}
		this._ctx.stroke();
		// red
		this._ctx.beginPath();
		this._ctx.strokeStyle = dcolor; 
		bx = ~~(x+dx)+0.5;
		for(var i=0; i<=num_bars; i++, bx+=barw+barp) {
			var by = y+height-scale*(dataset[shift+i].open-min);
			var hy = y+height-scale*(dataset[shift+i].high-min);
			var ly = y+height-scale*(dataset[shift+i].low-min);
			var cy = y+height-scale*(dataset[shift+i].close-min);
			if( dataset[shift+i].flag == 1 ) {
				if( cy > by ) {
					// close
					this._ctx.moveTo( bx, ~~cy+0.5 ); 
					this._ctx.lineTo( bx-(barw+barp>>1), ~~cy+0.5 );
					// open
					this._ctx.moveTo( bx-(barw+barp>>1), ~~by+0.5 ); 
					this._ctx.lineTo( bx-(barw+barp), ~~by+0.5 );
					// high-low
					this._ctx.moveTo( bx-(barw+barp>>1), ~~hy+0.5 ); 
					this._ctx.lineTo( bx-(barw+barp>>1), ~~ly+0.5 );
				}
			}
		}
		this._ctx.stroke();
		this._ctx.restore();
		//return { min:min, max:max };
	}
	//=========================================================================
	// Отображение графика баров highlow
	//		x,y 	- положение блока отображения
	// 		width	- ширина блока отображения
	// 		height	- высота блока
	//		barw	- ширина свечи (бара)
	//		barp	- зазор между свечами (барами)
	//	 	min		- минимальное значение
	// 		max		- максимальное значение
	// 		dataset	- набор данных
	//				  используются поля: flag - отображать, open - цена открытия, 
	//				  high - хай, low - лоу, close - цена закрытия
	//      shift	- смещение начала графика от начала датасета
	//				  (отрицательное значение указывает насколько смещается
	//				  график от начала области вывода)
	//		color	- цвет линии
	//=========================================================================
	this.highlowbars = function(x,y,width,height,barw,barp,dataset,min,max,shift=0,color='black') {
		var dx; 
		if (shift < 0) { dx = -shift*(barw+barp); shift = 0; } else { dx = shift; shift = ~~(shift+.5); dx = (shift-dx)*(barw+barp); };
		// dx - начальное смещение графика в барах от левой границы области
		// shift - начальный бар от начала датасета
		if (dx >= width || shift >= dataset.length) return; //график вышел за пределы области построения
		var num_bars = ~~((width-dx)/(barw+barp)); //число баров, попадающих в область построения
		num_bars = (num_bars<dataset.length-shift)?num_bars:(dataset.length-shift-1);
		var scale = height/(max-min);
		//var max = Math.max.apply(Math,dataset.slice(last_el-num_bars,last_el+1).map( function (d) { return d.high; } ));
		//var min = Math.min.apply(Math,dataset.slice(last_el-num_bars,last_el+1).map( function (d) { return d.low; } ));
		// Отрисовка баров
		this._ctx.save();
		// green
		this._ctx.beginPath();
		this._ctx.strokeStyle = color; 
		var bx = ~~(x+dx)+0.5;
		for(var i=0; i<=num_bars; i++, bx+=barw+barp) {
			//var by = y+height-scale*(dataset[shift+i].open-min);
			var hy = y+height-scale*(dataset[shift+i].high-min);
			var ly = y+height-scale*(dataset[shift+i].low-min);
			//var cy = y+height-scale*(dataset[shift+i].close-min);
			if( dataset[shift+i].flag == 1 ) {
				// high-low
				this._ctx.moveTo( bx-(barw+barp>>1), ~~hy+0.5 ); 
				this._ctx.lineTo( bx-(barw+barp>>1), ~~ly+0.5 );
			}
		}
		this._ctx.stroke();
		this._ctx.restore();
		//return { min:min, max:max };
	}
	
	//=========================================================================
	// Отображение вертикальной оси с делениями
	//		x,y 	- положение блока отображения оси
	// 		width	- ширина блока отображения
	// 		height	- высота блока
	//	 	min		- минимальное значение на оси
	// 		max		- максимальное значение
	// 		ticks	- минимальное число делений (может быть в 2 раза больше) 
	//=========================================================================
	this.y_axis = function(x,y,width,height,min,max,grid=20,color,textcolor='gray') {
		var ticks = height/grid;
		var dx = (max-min)/ticks; // ориентировочный размер деления
		var dign = Math.log(dx)/Math.log(10); // десятичный логарифм ориентировочного деления
		dign = dign<0?(~~(dign-1)):~~(dign+.5); // округляем логарифм
		var powlog = Math.pow(10,dign); // порядок деления (0.01,0.1,100,..)
		var mant = dx/powlog; // мантисса ориентировочного размера деления
		// Приведенный размер деления (1, 2, 5) - мантисса деления
		if( mant <= 1 ) mant = 1;
		else if( mant <= 1.25 ) { mant = 1.25; dign-=2; }
		else if( mant <= 2.5 ) { mant = 2.5; dign--; }
		else if( mant <= 2 ) mant = 2;
		else if( mant <= 5 ) mant = 5;
		else { mant = 10; dign++; }
		dign = dign<0?-dign:0; // число знаков после запятой
		var step = powlog*mant; // размер деления
		// Минимальная отметка шкалы
		var ymin = step*(~~(min/step+1));
		var scale = height/(max-min);
		// число знаков после запятой
		// Отрисовка шкалы
		this._ctx.save();
		this._ctx.strokeStyle = color; 
		this._ctx.lineWidth = 1;
		this._ctx.fillStyle = textcolor;
		this._ctx.font = "10px verdana";
		this._ctx.textAlign = "right";
		this._ctx.textBaseline = "bottom"; 
		//шкала
		for(var h = ymin; h <= max; h += step) {
			var ay = ~~(y+height-scale*(h-min))+0.5;
			this._ctx.beginPath();
			this._ctx.moveTo( x, ay ); 
			this._ctx.lineTo( x+width, ay );
			this._ctx.stroke();
			this._ctx.fillText(h.toFixed(dign),x+width-2,ay);
		}
		this._ctx.restore();
	}
	
	//=========================================================================
	// Отображение сетки вдоль горизонтальной оси
	//		x,y 	- положение блока с графиками
	// 		width	- ширина блока с графиками
	// 		height	- высота блока
	//	 	min		- минимальное значение по оси x, в секундах
	// 		max		- максимальное значение по оси x, в секундах
	//		grid	- максимальный размер сетки
	//=========================================================================
	this.timezone = 3;
	this.timeunits = [
		// value - шаг деталей, в секундах
		// qt - размер единицы измерения деталей, в секундах
		// unit - обозначение единицы измерения
		// contextvalue - шаг интервала контекста
		// shift - смещение начала интервала, для учета начала дня временной зоны или начала недели, в секундах
		
																		//интервал деталей		интервал контекста
		{value:1, qt:1, unit:'s', shift: this.timezone*3600}, 			//1s 					1m						YYYY.MM.DD hh:mm
		{value:2, qt:1, unit:'s', shift: this.timezone*3600},			//2s					1m						YYYY.MM.DD hh:mm
		{value:5, qt:1, unit:'s', shift: this.timezone*3600},			//5s					1m						YYYY.MM.DD hh:mm
		{value:10, qt:1, unit:'s', shift: this.timezone*3600},			//10s					1m						YYYY.MM.DD hh:mm
		{value:20, qt:1, unit:'s', shift: this.timezone*3600},			//20s					1m						YYYY.MM.DD hh:mm
		{value:30, qt:1, unit:'s', shift: this.timezone*3600},			//30s					1m						YYYY.MM.DD hh:mm
		{value:60, qt:60, unit:'m', shift: this.timezone*3600},			//1m					1h						YYYY.MM.DD hh:00
		{value:120, qt:60, unit:'m', shift: this.timezone*3600},		//2m					1h						YYYY.MM.DD hh:00
		{value:300, qt:60, unit:'m', shift: this.timezone*3600},		//5m					1h						YYYY.MM.DD hh:00
		{value:600, qt:60, unit:'m', shift: this.timezone*3600},		//10m					1h						YYYY.MM.DD hh:00
		{value:1200, qt:60, unit:'m', shift: this.timezone*3600},		//20m					1h						YYYY.MM.DD hh:00
		{value:1800, qt:60, unit:'m', shift: this.timezone*3600},		//30m					1h						YYYY.MM.DD hh:00
		{value:3600, qt:3600, unit:'h', shift: this.timezone*3600},		//1h					1d						YYYY.MM.DD
		{value:7200, qt:3600, unit:'h', shift: this.timezone*3600},		//2h					1d						YYYY.MM.DD
		{value:10800, qt:3600, unit:'h', shift: this.timezone*3600},	//3h					1d						YYYY.MM.DD
		{value:21600, qt:3600, unit:'h', shift: this.timezone*3600},	//6h					1d						YYYY.MM.DD
		{value:43200, qt:3600, unit:'h', shift: this.timezone*3600},	//12h					1d						YYYY.MM.DD
		{value:86400, qt:86400, unit:'d', shift: this.timezone*3600},	//1d					1M						YYYY.MM
		{value:172800, qt:86400, unit:'d', shift: this.timezone*3600},	//2d					1M						YYYY.MM
		{value:604800, qt:604800, unit:'w', shift: 3*24*3600+this.timezone*3600},	//1w		1M						YYYY.MM
		{value:1209600, qt:604800, unit:'w', shift: 3*24*3600+this.timezone*3600},	//2w		1M						YYYY.MM
		{value:2419200, qt:604800, unit:'w', shift: 3*24*3600+this.timezone*3600}	//4w		1M						YYYY
	];
	this.time_grid = function(x,y,width,height,min,max,grid=50,color='gray',textcolor='gray') {
		var dx = grid*(max-min)/width;
		var i;
		for (i=0; i<this.timeunits.length && dx > this.timeunits[i].value; i++) {}
		i = i==0?0:i-1;
		var step = this.timeunits[i].value;
		var tmin = (~~((min+this.timeunits[i].shift)/step+1))*step-this.timeunits[i].shift;
		var scale = width/(max-min);
		this._ctx.save();
		this._ctx.strokeStyle = color; 
		this._ctx.lineWidth = 1;
		this._ctx.fillStyle = textcolor;
		this._ctx.font = "10px verdana";
		//this._ctx.textAlign = "right";
		this._ctx.textBaseline = "top"; 
		// Отображение уровня контекста
		// 1. Определяем дату-время левой границы
		// 2. В зависимости от уровня контекста найти границу контекста и отобразить штрихом, вывести текстовую метку
		// 3. Повторить пункт 2 до тех пор пока не выйдем за границы отображения.
		var ldate = new Date((min+this.timezone*3600)*1000);
		var lhr = ldate.getUTCHours();
		var ld = ldate.getUTCDate();
		var lm = ldate.getUTCMonth()+1;
		var lyr = ldate.getUTCFullYear();
		if (this.timeunits[i].unit == 'd' || this.timeunits[i].unit == 'w') {
			// контекст - месяцы
			var date = new Date((min+this.timezone*3600)*1000);
			for(var k=0,cx=min;cx<max;k++) {
				var m = date.getUTCMonth()+1;
				var yr = date.getUTCFullYear();
				date.setUTCHours(0);
				date.setMinutes(0);
				date.setSeconds(0);
				date.setUTCDate(1);
				date.setUTCMonth(m);
				m = date.getUTCMonth()+1;
				yr = date.getUTCFullYear();
				cx = date.getTime()/1000-this.timezone*3600;
				var at = ~~(x+(cx-min)*scale)+0.5;
				if (k==0 && (at-x)>60) this._ctx.fillText('' + lyr +'.'+ ((lm<10)?'0':'')+lm +'.'+ ((ld<10)?'0':'')+ld,0,0);
				var str = '' + yr +'.'+ ((m<10)?'0':'')+m;
				this._ctx.beginPath();
				this._ctx.moveTo( at, y ); 
				this._ctx.lineTo( at, y+12 );
				this._ctx.stroke();
				this._ctx.fillText(str,at,0);
			}
		}
		else if (this.timeunits[i].unit == 'h') {
			// контекст - дни
			for(var k=0,cx=min; cx<max; cx+=86400,k++) {
				if (k==0) cx=(~~((min+this.timeunits[i].shift)/86400+1))*86400-this.timeunits[i].shift;
				var at = ~~(x+(cx-min)*scale)+0.5;
				if (k==0 && (at-x)>60) this._ctx.fillText('' + lyr +'.'+ ((lm<10)?'0':'')+lm +'.'+ ((ld<10)?'0':'')+ld,0,0);
				var date = new Date((cx+this.timezone*3600)*1000);
				var d = date.getUTCDate();
				var m = date.getUTCMonth()+1;
				var yr = date.getUTCFullYear();
				var str = '' + yr +'.'+ ((m<10)?'0':'')+m +'.'+ ((d<10)?'0':'')+d;
				this._ctx.beginPath();
				this._ctx.moveTo( at, y ); 
				this._ctx.lineTo( at, y+12 );
				this._ctx.stroke();
				this._ctx.fillText(str,at,0);
			}
		}
		else if (this.timeunits[i].unit == 'm') {
			// контекст - часы
			for(var k=0,cx=min; cx<max; cx+=3600,k++) {
				if (k==0) cx=(~~((min+this.timeunits[i].shift)/3600+1))*3600-this.timeunits[i].shift; 
				var at = ~~(x+(cx-min)*scale)+0.5;
				if (k==0 && (at-x)>95) this._ctx.fillText('' + lyr +'.'+ ((lm<10)?'0':'')+lm +'.'+ ((ld<10)?'0':'')+ld +' '+ ((lhr<10)?'0':'')+lhr +':00',0,0);
				var date = new Date((cx+this.timezone*3600)*1000);
				var hr = date.getUTCHours();
				var d = date.getUTCDate();
				var m = date.getUTCMonth()+1;
				var yr = date.getUTCFullYear();
				var str = '' + ((m<10)?'0':'')+m +'.'+ ((d<10)?'0':'')+d +' '+ ((hr<10)?'0':'')+hr +'h';
				this._ctx.beginPath();
				this._ctx.moveTo( at, y ); 
				this._ctx.lineTo( at, y+12 );
				this._ctx.stroke();
				this._ctx.fillText(str,at,0);
			}
		}
		
		// Отображение уровня деталей
		for(var h = tmin; h<max; h += step) {
			var at = ~~(x+(h-min)*scale)+0.5;
			this._ctx.beginPath();
			this._ctx.moveTo( at, y+12 ); 
			this._ctx.lineTo( at, y+height );
			this._ctx.stroke();
			var date = new Date((h+this.timezone*3600)*1000);
			if (this.timeunits[i].unit == 's') {
				var s = date.getUTCSeconds();
				var str = '' + ((s<10)?'0':'')+s + '\'\'';
				this._ctx.fillText(str,at,12);
			}
			else if (this.timeunits[i].unit == 'm') {
				m = date.getUTCMinutes();
				var str = '' + ((m<10)?'0':'')+m + '\'';
				this._ctx.fillText(str,at,12);
			}
			else if (this.timeunits[i].unit == 'h') {
				var hr = date.getUTCHours();
				var str = '' + ((hr<10)?'0':'')+hr + 'h';
				this._ctx.fillText(str,at,12);
			}
			else if (this.timeunits[i].unit == 'd') {
				var d = date.getUTCDate();
				var str = '' + ((d<10)?'0':'')+d;
				this._ctx.fillText(str,at,12);
			}
			else if (this.timeunits[i].unit == 'w') {
				var d = date.getUTCDate();
				var m = date.getUTCMonth()+1;
				var str = '' + /*((m<10)?'0':'')+m +'.'+*/ ((d<10)?'0':'')+d;
				this._ctx.fillText(str,at,12);
			}
		}
		this._ctx.restore();
	}
	
	//=========================================================================
	// Очистка области рисования
	//=========================================================================
	this.clear = function() {
		this._ctx.clearRect( 0, 0, this.width, this.height);
	}
}
