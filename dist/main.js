(()=>{"use strict";class e{constructor(e){this.url=e}getInfo(e=(e=>{}),t=(e=>{})){return fetch(this.url+"/?g:i&r="+Math.random()).then((e=>e.text())).then((t=>e(t))).catch((e=>{console.log("ArduinoController not available"),t(e)}))}setTemperature(e,t,a=(()=>{}),l=(()=>{})){return fetch(this.url+"/?s"+e+"t:"+Math.round(10*t)+"&r="+Math.random()).then((()=>{console.log("ArduinoController set temperature"),a()})).catch((()=>{console.log("ArduinoController set temperature failure"),l()}))}powerOn(e,t=(()=>{}),a=(()=>{})){return fetch(this.url+"/?s"+e+"m:1&r="+Math.random()).then((()=>{console.log("Power On",e),t()})).catch((()=>{console.log("Power On failure"),a()}))}powerOff(e,t=(()=>{}),a=(()=>{})){return fetch(this.url+"/?s"+e+"m:0&r="+Math.random()).then((()=>{console.log("Power Off",e),t()})).catch((()=>{console.log("Power Off failure"),a()}))}static parseInfo(e){const t=e.split(";"),[a,l,i,n,s,r,o,c,h,...u]=t;return{version:"ver."+a,numofz:+l,unixtime:+i,starttime:+n,lastsynctime:+s,lastsyncdelta:+r,lastsyncinterval:+o,tickcounter:+c,loopcounter:+h,zones:function e(t,a=[],l=0){if(!t.length)return a;const[i,...n]=t;switch(i){case"Z":{const[t,l,s,r,o,c,h,u,...m]=n;return a.push({type:i,id:+t,temperature:l/10,targetTemperature:s/10,humidity:r/10,onControl:+o,powerOn:+c,targetTemperatureDelta:h/10,sensorState:+u}),e(m,a,t)}case"H":{const[t,l,...s]=n;return a.push({type:i,id:+t,pressure:5*(10*l-1023)/8184}),e(s,a,t)}case"I":{const[t,...l]=n;return a.push({type:i,id:+t}),e(l,a,t)}}return a}(u)}}static states=["OK","ErrChecksum","ErrTimeout","ErrConnect","ErrAckL","ErrAckH","ErrUnknown"];static sensorState=t=>e.states[-t]}class t{static ERRORS=["OK","Busy","Queued","NotYet"];constructor(e,t=8,a=3){this.threads=t,this.queue=[],this.url=e,this.timezone=a}getLogByName(e,t=(()=>{}),a=(()=>{}),l=(()=>{})){return this.queue.length>=this.threads?1:this.queue.includes(e)?2:(this.queue.push(e),fetch(this.url+e).then((e=>e.text())).then((e=>{t(e)})).catch((t=>{console.log(e),console.log("loading error",t),a()})).finally((()=>{this.queue=this.queue.filter((t=>t!=e)),l()})),0)}getLogByTimestamp(e,t,a=(()=>{}),l=(()=>{}),i=(()=>{})){if(t>function(e,t){return 86400*~~((e+3600*t)/86400)-3600*t}(Date.now()/1e3,this.timezone))return 3;const n=function(e,t){const a=new Date(1e3*(e+3600*t));var l=a.getUTCDate(),i=a.getUTCMonth()+1;return a.getUTCFullYear()+(i<10?"0":"")+i+(l<10?"0":"")+l}(t,this.timezone)+"."+e;return this.getLogByName(n,a,l,i)}static parseThermalSensorData=function(e,[t=[],a=[],l=[]]){if(!e)return[t,a,l];const i=e.split("\n");let n=0,s=0,r=0,o=0,c=0,h=0,u=0,m=0;return i.forEach((e=>{const i=e.split(";");if(i.length<=2)return;const d=i[0];if(128&d){s=0,r=0,o=0,c=0,u=0,n=+i[1];let e=2;1&d&&(s=+i[e++]),2&d&&(r=+i[e++]),h=4&d?1:0,l.push({flag:1,time:n,value:h}),16&d&&(o=+i[e++]),32&d&&(c=+i[e++]),64&d&&(u=+i[e++]),0==u&&(t.push({flag:0,time:n,value:s/10}),a.push({flag:0,time:n,value:r/10}))}else{if(0==n)return;let e=+i[1];e>2147483647&&(e-=4294967296),e<0&&console.log("correction time difference",e,n),n+=e;let f=2;1&d&&(s+=+i[f++]),2&d&&(r+=+i[f++]),4&d?h||l.push({flag:1,time:n,value:h=1}):h&&l.push({flag:1,time:n,value:h=0}),16&d&&(o+=+i[f++]),32&d&&(c+=+i[f++]),64&d&&(u=+i[f++]),m=0==u?1:0,0==u&&(1&d&&t.push({flag:m,time:n,value:s/10}),2&d&&a.push({flag:m,time:n,value:r/10}))}})),0!=t.data.length&&t.push({flag:m,time:n,value:s/10}),0!=a.data.length&&a.push({flag:m,time:n,value:r/10}),0!=l.data.length&&l.push({flag:1,time:n,value:h}),[t,a,l]};static parseHydroSensorData=function(e,t=[]){if(!e)return t;const a=e.split("\n");let l=0,i=0,n=0;return a.forEach((e=>{let a=e.split(";");if(!(a.length<=2)){if(128&a[0]){i=0,n=0,l=parseInt(a[1]);let e=2;1&a[0]&&(i=+a[e++])}else{if(0==l)return;let e=parseInt(a[1]);e=e>2147483647?e-4294967296:e,e<0&&console.log(e,l,i),l+=e;let t=2;1&a[0]&&(i+=+a[t++])}n=2&a[0]?5*(i-102.3)/818.4:i/1e3,n>=-1&&n<=5&&t.push({flag:1,time:l,value:n})}})),t.data.length&&t.push({flag:1,time:l,value:n}),t}}class a{constructor(e,t="stepped"){this.time=e,this.zmode=t,this.data=[],this.flag=0,this.value=0,this.high=Number.MIN_VALUE,this.low=Number.MAX_VALUE,this.open=0,this.close=0,this.topen=0,this.tclose=0,this.nclose=0,this.tstep=0,this.zdata=[]}push(e){if(!(e.time<this.time)){if(0==this.data.length)return this.flag=1,this.value=this.low=this.high=this.open=this.close=e.value,this.topen=this.tclose=e.time,void this.data.push({flag:0,time:e.time,value:e.value});this.tclose>this.topen&&(this.value=(this.value*(this.tclose-this.topen)+(this.close-this.open)*(e.time-this.tclose))/(e.time-this.topen)),this.close!=e.value||1!=e.flag?(this.low=Math.min(this.low,e.value),this.high=Math.max(this.high,e.value),this.close=e.value,this.tclose=e.time,this.nclose=0,this.data.push({flag:e.flag,time:e.time,value:e.value})):0==this.nclose?(this.nclose++,this.tclose=e.time,this.data.push({flag:e.flag,time:e.time,value:e.value})):(this.data[this.data.length-1].time=e.time,this.tclose=e.time)}}getlinearregdata(e){for(var t=[],a=this.data[0],l=this.time,i=a.value;l+e<a.time;)t.push({flag:0,value:i}),l+=e;t.push({flag:1,value:i});for(var n=1;n<this.data.length;n++){a=this.data[n];var s=t.length-1,r=this.data[n-1];if(a.time<l+e)t[s].value+=(a.value-i)*(l+e-a.time)/e,i=a.value;else{l+=e;var o=(a.value-r.value)/(a.time-r.time);for(i=r.value+o*(l-r.time);l+e<a.time;){var c=i+o*e;t.push({flag:a.flag,value:(i+c)/2}),i=c,l+=e}t.push({flag:1,value:i})}}return t}getsteppedregdata(e){for(var t=[],a=this.data[0],l=this.time,i=a.value;l+e<a.time;)t.push({flag:0,value:i}),l+=e;t.push({flag:1,value:i});for(var n=1;n<this.data.length;n++){a=this.data[n];var s=t.length-1,r=this.data[n-1];if(a.time<l+e)t[s].value+=(a.value-i)*(l+e-a.time)/e,i=a.value;else{for(l+=e,i=r.value;l+e<a.time;)t.push({flag:a.flag,value:i}),l+=e;0==a.flag&&(i=a.value),t.push({flag:1,value:i})}}return t.push({flag:1,value:i}),t}getohlcregdata(e){for(var t=[],a=this.data[0],l=this.time,i=a.value;l+e<a.time;)t.push({flag:0,open:i,high:i,low:i,close:i}),l+=e;t.push({flag:1,open:i,high:i,low:i,close:i});for(var n=1;n<this.data.length;n++){a=this.data[n];var s=t.length-1,r=this.data[n-1];if(a.time<l+e)t[s].close=a.value,t[s].high=a.value>t[s].high?a.value:t[s].high,t[s].low=a.value<t[s].low?a.value:t[s].low;else{for(l+=e,i=r.value;l+e<a.time;)t.push({flag:a.flag,open:i,high:i,low:i,close:i}),l+=e;0==a.flag&&(i=a.value),t.push({flag:1,open:i,high:i,low:i,close:i})}}return t.push({flag:1,open:i,high:i,low:i,close:i}),t}gethighlowregdata(e){for(var t=[],a=this.data[0],l=this.time,i=a.value;l+e<a.time;)t.push({flag:0,high:i,low:i}),l+=e;t.push({flag:1,high:i,low:i});for(var n=1;n<this.data.length;n++){a=this.data[n];var s=t.length-1,r=this.data[n-1];if(a.time<l+e)t[s].high=a.value>t[s].high?a.value:t[s].high,t[s].low=a.value<t[s].low?a.value:t[s].low;else{for(l+=e,i=r.value;l+e<a.time;)t.push({flag:a.flag,high:i,low:i}),l+=e;0==a.flag&&(i=a.value),t.push({flag:1,high:i,low:i})}}return t.push({flag:1,high:i,low:i}),t}rezoom(e){e<1&&(e=1),this.tstep!=e&&0!=this.data.length&&(this.tstep=e,"linear"==this.zmode?this.zdata=this.getlinearregdata(e):"stepped"==this.zmode?this.zdata=this.getsteppedregdata(e):"highlow"==this.zmode?this.zdata=this.gethighlowregdata(e):"ohlc"==this.zmode&&(this.zdata=this.getohlcregdata(e)))}fillzdata(e,t,a){if(this.tclose<=e.begin||this.topen>=e.end)return a;this.rezoom(t);var l=e.begin,i=~~((e.begin-this.time)/t),n=0;i<0&&(l=this.time,n=-i,i=0);var s=a.min,r=a.max;if("linear"==this.zmode||"stepped"==this.zmode)for(;l<e.end&&l<this.tclose;i++,n++,l+=t){var o=this.zdata[i].flag;a.zdata[n].flag=o;var c=this.zdata[i].value;a.zdata[n].value=c,1==o&&(s=c<s?c:s,r=c>r?c:r)}else if("highlow"==this.zmode)for(;l<e.end&&l<this.tclose;i++,n++,l+=t){o=this.zdata[i].flag,a.zdata[n].flag=o;var h=this.zdata[i].high,u=this.zdata[i].low;a.zdata[n].high=h,a.zdata[n].low=u,1==o&&(s=u<s?u:s,r=h>r?h:r)}else if("ohlc"==this.zmode)for(;l<e.end&&l<this.tclose;i++,n++,l+=t){o=this.zdata[i].flag,a.zdata[n].flag=o;var m=this.zdata[i].open,d=(h=this.zdata[i].high,u=this.zdata[i].low,this.zdata[i].close);a.zdata[n].open=m,a.zdata[n].high=h,a.zdata[n].low=u,a.zdata[n].close=d,1==o&&(s=u<s?u:s,r=h>r?h:r)}return{zdata:a.zdata,min:s,max:r}}integrate(e){var t=0;if(this.data.length>0)for(var a=this.data[0],l=1;l<this.data.length;l++){var i=this.data[l];i.time>e.begin&&i.time<=e.end&&(t+=a.value*(i.time-a.time),a=i)}return t}clearzdata(){this.zdata=[],this.tstep=0}}function l(e,t){return 86400*~~((e+3600*t)/86400)-3600*t}class i{static DATASET_NAMES=["Temperature","Humidity","Power"];constructor(e,t,[a,l,i]){this.id=e,this.ext="Z"+e,this.controller=t.logController,this.timezone=t.timezone,this.onload=t.onload,this.colors={t:a,h:l,p:i},this.isShowPower=!1,this.timeslots=[]}load(e){this.controller.getLogByTimestamp(this.ext,e,(l=>{this.timeslots[e]=t.parseThermalSensorData(l,[new a(e),new a(e),new a(e)])}),(()=>{this.timeslots[e]=[]}),(()=>{this.onload()}))}getRegData(e,t){let a=i.DATASET_NAMES.map((()=>({zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE})));for(let l=e.begin;l<e.end;l+=t)a.forEach((e=>e.zdata.push({flag:0})));for(let i=l(e.begin,this.timezone);i<e.end;i+=86400)void 0===this.timeslots[i]?this.load(i):this.timeslots[i].length&&(a=this.timeslots[i].map(((l,i)=>l.fillzdata(e,t,a[i]))));return a}}class n{constructor(e,t,a){this.id=e,this.ext="H"+e,this.controller=t.logController,this.timezone=t.timezone,this.color=a,this.onload=t.onload,this.timeslots=[]}load(e){this.controller.getLogByTimestamp(this.ext,e,(l=>{this.timeslots[e]=t.parseHydroSensorData(l,new a(e))}),(()=>{this.timeslots[e]={flag:0}}),(()=>{this.onload()}))}getRegData(e,t){let a={zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE};for(let l=e.begin;l<e.end;l+=t)a.zdata.push({flag:0});for(let i=l(e.begin,this.timezone);i<e.end;i+=86400)void 0===this.timeslots[i]?this.load(i):0!=this.timeslots[i].flag&&(a=this.timeslots[i].fillzdata(e,t,a));return a}}function s({firmware:e="",controllerDateTime:t=""}){const[a,l]=React.useState(Date.now());React.useEffect((()=>{const e=setInterval((()=>{l(Date.now())}),1e3);return()=>{clearInterval(e)}}),[]);const i=new Date(a),n=i.toLocaleTimeString(),s=i.toLocaleDateString();return React.createElement("div",{className:"header_c8adb03"},React.createElement("div",{className:"left_cdef396"},React.createElement("div",{className:"title_f84cf26"},"Arduino TermoController"),React.createElement("div",null,e),React.createElement("div",null,t)),React.createElement("div",{className:"datetime_fdfbec6"},React.createElement("div",{className:"time_b1c1c45"},n),React.createElement("div",{className:"date_d7127cf"},s)))}function r(){return r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var l in a)Object.prototype.hasOwnProperty.call(a,l)&&(e[l]=a[l])}return e},r.apply(this,arguments)}function o({active:e=!1,disabled:t=!1,children:a="Button",...l}){return React.createElement("div",r({className:"button_c0afaa2 "+(e?"active_b40adfc":"")},l),a)}function c({title:e="Modal title",isOpen:t=!1,onSubmit:a=(()=>{}),onCancel:l=(()=>{}),children:i=null}){return t&&React.createElement("div",{className:"modalOverlay_faa7164",onClick:l},React.createElement("div",{className:"modalWindow_fac41c2",onClick:e=>e.stopPropagation()},React.createElement("div",{className:"modalHeader_ec3e5fe"},React.createElement("div",{className:"modalTitle_e276bb7"},e)),React.createElement("div",{className:"modalBody_a8134eb"},i),React.createElement("div",{className:"modalFooter_dcf803f"},React.createElement("span",{className:"cancel_b0d96c0",onClick:l},"Cancel"),React.createElement("span",{className:"apply_dc7f5d7",onClick:a},"Apply"))))}const h="name_fc64aab",u="value_be14f95",m="modal_button_aad8592",d=e=>Math.round(10*e)/10;function f({parameterName:e,displayedValue:t=0,controlledValue:a=0,controlledValue2:l=0,disabled:i=!1,update:n=(e=>{})}){const[s,r]=React.useState(!1),[o,f]=React.useState(a),[g,p]=React.useState(a),[v,w]=React.useState(!1);return i||React.useEffect((()=>{console.log("Effect update controlledValue",a),"number"==typeof a?(p(a),f(a)):f(g),w(!0)}),[a]),i?React.createElement("span",{className:"disabled_acbb102"},React.createElement("div",{className:h},e),React.createElement("div",{className:u},t)):React.createElement("span",{className:"enabled_fe9b8d8",onClick:()=>{r(!s)}},React.createElement("div",{className:h},e),React.createElement("div",null,React.createElement("span",{className:u},t),React.createElement("span",{className:v?u:"not_synced_value_afc6328"},"(",(v?g:o).toFixed(1),"±",l.toFixed(1),")")),React.createElement(c,{isOpen:s,title:"Set target temperature for Zone",onSubmit:()=>{o!=a&&(n(o),w(!1)),r(!1)},onCancel:()=>{f(a),r(!1)}},React.createElement("span",{className:m,onClick:()=>{f((e=>d(e-.1)))}},"-"),React.createElement("span",{className:"modal_parameter_be59a01",contentEditable:!0,suppressContentEditableWarning:!0,onBlur:e=>{console.log(+e.target.innerText),f(d(+e.target.innerText))}},o.toFixed(1)),React.createElement("span",{className:m,onClick:()=>{f((e=>d(e+.1)))}},"+")))}const g={controlbox:"controlbox_d0c639d",header:"header_b26ca6e"};function p({zone:t,onSetTemperature:a,onSetPowerControl:l}){return React.createElement("div",{className:g.controlbox},React.createElement("div",{className:g.header},React.createElement("div",{className:g.indicator}),"ZONE"+t.id+" Sensor: "+e.sensorState(t.sensorState)),React.createElement("div",null,React.createElement(o,{active:!!t.onControl,onClick:()=>l(t.id)},"PWRCTRL"),React.createElement(o,{active:!!t.powerOn,disabled:!0},"PWR"),React.createElement(o,{onClick:()=>{console.log("showpwr_button")}},"SHOWPWR"),React.createElement(o,null,"CONFIG")),React.createElement("div",null,React.createElement(f,{parameterName:"temperature",displayedValue:t.temperature.toFixed(1)+"°",controlledValue:t.targetTemperature,controlledValue2:t.targetTemperatureDelta,update:e=>a({...t,targetTemperature:e})}),React.createElement(f,{parameterName:"humidity",displayedValue:t.humidity.toFixed(1)+"%",disabled:!0})),React.createElement("div",{className:"sensorstatus"}))}function v(e,t,a=window,l={}){const i=React.useRef(t).current;React.useEffect((()=>{if(!a?.addEventListener)return;console.log("AddEventListener",e);const t=e=>i(e);return a.addEventListener(e,t,l),()=>{console.log("RemoveEventListener",e),a.removeEventListener(e,t,l)}}),[e,a])}const w={gridBox:"gridBox_fc13aaa",context:"context_f11840f",detail:"detail_ec20b03",contextTickLabels:"contextTickLabels_fe07fb7",detailTickLabels:"detailTickLabels_f68035d",svgBox:"svgBox_b08058f",yLabels:"yLabels_e4cb634",yTickLabels:"yTickLabels_c40706f"};function R({data:e,height:t,barw:a=2,min:l,max:i,color:n="#FFF"}){let s=t/(i-l),r="";e[0].flag&&(r+="M0 "+(t-s*(e[0].value-l)));for(let i=1;i<e.length;i++)if(e[i].flag){let n=t-s*(e[i].value-l);e[i-1].flag?r+="L"+i*a+" "+n:r+="M"+i*a+" "+n}return React.createElement("path",{d:r,fill:"none",stroke:n,strokeWidth:"1"})}const b=[{value:1,unit:"s",shift:10800},{value:2,unit:"s",shift:10800},{value:5,unit:"s",shift:10800},{value:10,unit:"s",shift:10800},{value:20,unit:"s",shift:10800},{value:30,unit:"s",shift:10800},{value:60,unit:"m",shift:10800},{value:120,unit:"m",shift:10800},{value:300,unit:"m",shift:10800},{value:600,unit:"m",shift:10800},{value:1200,unit:"m",shift:10800},{value:1800,unit:"m",shift:10800},{value:3600,unit:"h",shift:10800},{value:7200,unit:"h",shift:10800},{value:10800,unit:"h",shift:10800},{value:21600,unit:"h",shift:10800},{value:43200,unit:"h",shift:10800},{value:86400,unit:"d",shift:10800},{value:172800,unit:"d",shift:10800},{value:345600,unit:"d",shift:10800},{value:604800,unit:"w",shift:27e4},{value:1209600,unit:"w",shift:27e4},{value:2629800,unit:"M",shift:1},{value:5259600,unit:"M",shift:2},{value:7889400,unit:"M",shift:3},{value:15778800,unit:"M",shift:6}],E=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];function y({title:e="TimeDiagram",width:t=300,height:a=200,min:l=0,max:i=1,children:n=null,timeInterval:s,onShift:r=(()=>{}),onZoom:o=(()=>{}),onSelectDate:c=(()=>{})}){const[h,u]=React.useState({x:0,y:0}),m=React.useRef(null);!function(e,t,a=(()=>{}),l=(()=>{}),i=(()=>{})){const n=React.useRef({isDragging:!1,clientX0:0,clientX1:0,pointerId1:null}).current,s=function(e,t=200){let a,l,i=!1;return function n(){if(i)return a=arguments,void(l=this);e.apply(this,arguments),i=!0,setTimeout((()=>{i=!1,a&&(n.apply(l,a),a=l=null)}),t)}}((e=>{if(e.preventDefault(),n.isDragging){if(e.isPrimary){let l=(e.offsetX-n.clientX0)/t;return n.clientX0=e.offsetX,a(l),void i(e.offsetX,e.offsetY)}if(n.pointerId1===e.pointerId){let a=e.offsetX-n.clientX0;if(Math.abs(a)<10)return;if(a=(n.clientX1-n.clientX0)/a,a<0)return;let i=n.clientX0/t;n.clientX1=e.offsetX,l(a,i)}}else i(e.offsetX,e.offsetY)}),30);v("wheel",(function(e){e.preventDefault();let a=e.wheelDelta>0?.9:1.1111111111111112,i=e.offsetX/t;l(a,i)}),e),v("pointerdown",(function(e){if(e.preventDefault(),e.isPrimary)return n.isDragging=!0,void(n.clientX0=e.offsetX);null===n.pointerId1&&(n.pointerId1=e.pointerId,n.clientX1=e.offsetX)}),e),v("pointermove",s,e),v("pointerup",(function(e){e.preventDefault(),e.isPrimary?n.isDragging=!1:n.pointerId1===e.pointerId&&(n.pointerId1=null,n.clientX1=0)}),e),v("pointerout",(function(e){i(0,0)}),e)}(m.current,t,r,o,((e,t)=>{u({x:e,y:t})}));let d=(i-l)/a;return React.createElement(React.Fragment,null,React.createElement("div",{className:w.header,style:{width:t}},React.createElement("div",null,e)),React.createElement("div",{className:w.gridBox},React.createElement("div",{className:w.context}," ",function(e,t,a,l=50){let i=l*(t-e)/a,[n]=[0,...b.filter((e=>i>=e.value)).keys()].slice(-1),s=a/(t-e);const r=[];let o=new Date(1e3*(e+10800)),c=e;if("M"==b[n].unit){do{let e=o.getUTCFullYear();o.setUTCHours(0),o.setMinutes(0),o.setSeconds(0),o.setUTCFullYear(e+1,0,1);let a=o.getTime()/1e3-10800,l=a<t?(a-c)*s:(t-c)*s;r.push({tick:c,label:e,width:l}),c=a}while(c<t);return r}if("d"==b[n].unit||"w"==b[n].unit){do{let e=o.getUTCMonth()+1,a=o.getUTCFullYear();o.setUTCHours(0),o.setMinutes(0),o.setSeconds(0),o.setUTCDate(1),o.setUTCMonth(e);let l=o.getTime()/1e3-10800,i=l<t?(l-c)*s:(t-c)*s;r.push({tick:c,label:a+"."+(e<10?"0":"")+e,width:i}),c=l}while(c<t);return r}if("h"==b[n].unit){let a=86400*~~((e+b[n].shift)/86400+1)-b[n].shift;do{let e=a<t?(a-c)*s:(t-c)*s,l=new Date(1e3*(c+10800)),i=l.getUTCDate(),n=l.getUTCMonth()+1,o=l.getUTCFullYear();r.push({tick:c,label:o+"."+(n<10?"0":"")+n+"."+(i<10?"0":"")+i,width:e}),c=a,a+=86400}while(c<t);return r}if("m"==b[n].unit){let a=3600*~~((e+b[n].shift)/3600+1)-b[n].shift;do{let e=a<t?(a-c)*s:(t-c)*s,l=new Date(1e3*(c+10800)),i=l.getUTCHours(),n=l.getUTCDate(),o=l.getUTCMonth()+1;r.push({tick:c,label:(o<10?"0":"")+o+"."+(n<10?"0":"")+n+" "+(i<10?"0":"")+i+"h",width:e}),c=a,a+=3600}while(c<t);return r}if("s"==b[n].unit){let a=60*~~((e+b[n].shift)/60+1)-b[n].shift;do{let e=a<t?(a-c)*s:(t-c)*s,l=new Date(1e3*(c+10800)),i=l.getUTCMinutes(),n=l.getUTCHours();r.push({tick:c,label:(n<10?"0":"")+n+":"+(i<10?"0":"")+i,width:e}),c=a,a+=60}while(c<t);return r}return r}(s.begin,s.end,t,50).map((e=>React.createElement("div",{className:w.contextTickLabels,key:e.tick,style:{width:e.width}},e.label)))),React.createElement("div",{className:w.detail,style:{height:a+12}}," ",function(e,t,a,l=50){let i=l*(t-e)/a,[n]=[0,...b.filter((e=>i>=e.value)).keys()].slice(-1),s=a/(t-e),r=e,o=new Date(1e3*(e+10800));const c=[];if("M"==b[n].unit){do{let e=o.getUTCMonth();o.getUTCFullYear(),o.setUTCHours(0),o.setMinutes(0),o.setSeconds(0),o.setUTCDate(1),o.setUTCMonth(e+(b[n].shift-e%b[n].shift));let a=o.getTime()/1e3-10800,l=a<t?(a-r)*s:(t-r)*s;c.push({tick:r,label:E[e],width:l}),r=a}while(r<t);return c}let h=b[n].value,u=~~((e+b[n].shift)/h+1)*h-b[n].shift;if("s"==b[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCSeconds();c.push({tick:r,label:(a<10?"0":"")+a+"''",width:e}),r=u,u+=h}while(r<t);return c}if("m"==b[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCMinutes();c.push({tick:r,label:(a<10?"0":"")+a+"'",width:e}),r=u,u+=h}while(r<t);return c}if("h"==b[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCHours();c.push({tick:r,label:(a<10?"0":"")+a+"h",width:e}),r=u,u+=h}while(r<t);return c}if("d"==b[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCDate();c.push({tick:r,label:(a<10?"0":"")+a,width:e}),r=u,u+=h}while(r<t);return c}if("w"==b[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCDate();c.push({tick:r,label:(a<10?"0":"")+a,width:e}),r=u,u+=h}while(r<t);return c}return c}(s.begin,s.end,t,50).map((e=>React.createElement("div",{className:w.detailTickLabels,key:e.tick,style:{width:e.width,height:a+12},onClick:()=>{c(e.tick)}},e.label)))),React.createElement("div",{className:w.yLabels,style:{width:t,height:a}}," ",function(e,t,a,l=20){let i=l*(t-e)/a,n=Math.round(Math.log(i)/Math.log(10)),s=Math.pow(10,n),r=i/s;r<=1?r=1:r<=2?r=2:r<=5?r=5:(r=10,n++),n=n<0?-n:0;let o=s*r,c=a/(t-e),h=[],u=t,m=o*~~(t/o);do{let t=m>e?c*(u-m):c*(u-e);t>0&&h.push({tick:u,label:u.toFixed(n),height:t}),u=m,m-=o}while(u>e);return h}(l,i,a).map(((e,t)=>React.createElement("div",{className:w.yTickLabels,key:t,style:{height:e.height}},e.label)))),React.createElement("svg",{ref:m,width:t,height:a,viewBox:`0 0 ${t} ${a}`,className:w.svgBox},n)),React.createElement("div",{style:{width:t}},new Date(1e3*(s.begin+h.x*(s.end-s.begin)/t)).toLocaleString()+" "+(i-d*h.y).toFixed(2)))}const D="row_f8cec4a",T={width:35},z={width:60},C={width:30};function S({title:e="Table",headerName:t="value",data:a=[],time:l,height:i=200}){const[n,s]=React.useState(a.findIndex((e=>e.time>=l))),r=React.useRef(null),o=React.useRef(l);if(o.current!=l){o.current=l;let e=a.findIndex((e=>e.time>=l));console.log(e,n),s(e),console.log(o.current)}let c=~~(i/12),h=a.length,u=i*(c/h);u=u<5?5:u;let m=n/h*(i-u);const d=React.useRef({isDragging:!1,y:0,row:n});return v("wheel",(function(e){e.preventDefault();let t=e.wheelDelta>0?-5:5;s((e=>e+t))}),r.current),v("mousemove",(function(e){if(d.current.isDragging){let t=h*(e.clientY-d.current.y)/i,a=d.current.row+t;a<0&&(a=0),a>h-c&&(a=h-c),s(~~a)}}),r.current),v("mouseup",(function(e){d.current={isDragging:!1,y:0}}),r.current),React.createElement(React.Fragment,null,React.createElement("div",null,e),React.createElement("div",{ref:r,className:"wrapper_b8d6404",style:{height:i}},React.createElement("div",{className:"table_a2395b7"},React.createElement("div",{className:D},React.createElement("span",{style:T},"#"),React.createElement("span",{style:z},"time"),React.createElement("span",{style:C},t))," ",a.slice(n,n+c).map(((e,t)=>{let a=(e.time+10800)%86400,l=~~(a/3600),i=~~(a%3600/60),s=a%60;return React.createElement("div",{className:D,key:t},React.createElement("span",{style:T},n+t+1),React.createElement("span",{style:z},(l<10?"0":"")+l+":"+(i<10?"0":"")+i+":"+(s<10?"0":"")+s),React.createElement("span",{style:C},e.value))}))),React.createElement("div",{className:"scrollbarTrack_e15be30",onClick:function(e){s((e=>e+c>h?h:e+c))}},React.createElement("div",{className:"scrollbarUp_a9a56e8",style:{height:m},onClick:function(e){e.stopPropagation(),s((e=>e-c<0?0:e-c))}}),React.createElement("div",{className:"scrollbarThumb_dbe7646",style:{height:u},onMouseDown:function(e){e.preventDefault(),d.current={isDragging:!0,y:e.clientY,row:n},console.log("mouseDown",e)},onClick:e=>{e.stopPropagation()}}))))}const N=350,x=250;function _(e){const[t,a]=React.useState(e.timeInterval),[l,i]=React.useState({thermalData:[],hydroData:[]}),[n,s]=React.useState(0),r=React.useRef(e.logController).current;React.useEffect((()=>{a((t=>({begin:e.timeInterval.end-t.end+t.begin,end:e.timeInterval.end})))}),[e.timeInterval.end]),React.useEffect((()=>{r.setOnLoad((()=>a((e=>({...e}))))),r.addThermalSensor(2,["white","white","red"]),r.addThermalSensor(3,["white","white","red"]),r.addHydroSensor(0,["white","white","red"])}),[]),React.useEffect((()=>{let e=1*(t.end-t.begin)/N;const a=r.getThermalSensorsRegData(t,e),l=r.getHydroSensorsRegData(t,e);i({thermalData:a,hydroData:l})}),[t]);const o=React.useCallback((e=>{a((t=>{let a=t.end-t.begin;return{begin:t.begin-a*e,end:t.end-a*e}}))})),h=React.useCallback(((e,t)=>{a((a=>{let l=a.end-a.begin;if(e*l<300)return a;let i=a.begin+t*l;return{begin:i-e*(i-a.begin),end:i+e*(a.end-i)}}))})),u=React.useCallback((e=>{s(e)}));let m=Math.min(...l.thermalData.map((e=>e[0].min))),d=Math.max(...l.thermalData.map((e=>e[0].max))),f=Math.min(...l.thermalData.map((e=>e[1].min))),g=Math.max(...l.thermalData.map((e=>e[1].max))),p=Math.min(...l.hydroData.map((e=>e.min))),v=Math.max(...l.hydroData.map((e=>e.max))),w=86400*~~((n+10800)/86400)-10800;return React.createElement("div",{className:"wrapper_d20fbe7"},React.createElement("div",{className:"diagramsColumn_ebe3634"},React.createElement(y,{title:"Temperature, °C",timeInterval:t,onShift:o,onZoom:h,onSelectDate:u,min:m,max:d,width:N,height:x},l.thermalData[0]&&React.createElement(R,{data:l.thermalData[0][0].zdata,height:x,min:m,max:d,barw:1,color:"#ffa23c"}),l.thermalData[1]&&React.createElement(R,{data:l.thermalData[1][0].zdata,height:x,min:m,max:d,barw:1,color:"#88a23c"})),React.createElement(y,{title:"Humidity, %",timeInterval:t,onShift:o,onZoom:h,onSelectDate:u,min:f,max:g,width:N,height:x},l.thermalData[0]&&React.createElement(R,{data:l.thermalData[0][1].zdata,height:x,min:f,max:g,barw:1,color:"#bbb"}),l.thermalData[1]&&React.createElement(R,{data:l.thermalData[1][1].zdata,height:x,min:f,max:g,barw:1,color:"#88bbbb"})),React.createElement(y,{title:"Pressure Hydro System, bar",timeInterval:t,onShift:o,onZoom:h,onSelectDate:u,min:p,max:v,width:N,height:x},l.hydroData[0]&&React.createElement(R,{data:l.hydroData[0].zdata,height:x,min:p,max:v,barw:1,color:"#ffa23c"}))),0!=n&&React.createElement(c,{isOpen:0!=n,title:"Set target temperature for Zone",onCancel:()=>{s(0)}},React.createElement(S,{title:new Date(1e3*n).toLocaleDateString()+" Z2 H",data:r.hydroSensors[0].timeslots[w]?r.hydroSensors[0].timeslots[w].data:[],time:n})))}const k=[{type:"Z",id:1,temperature:14.1,targetTemperature:23.5,targetTemperatureDelta:.2,humidity:54.3,onControl:0,powerOn:0,sensorState:-3},{type:"Z",id:2,temperature:15.2,targetTemperature:21.2,targetTemperatureDelta:.1,humidity:48.1,onControl:0,powerOn:0,sensorState:-3},{type:"Z",id:3,temperature:5.9,targetTemperature:0,targetTemperatureDelta:0,humidity:85.1,onControl:0,powerOn:0,sensorState:-3}],M=window.location.hostname;console.log(M);const I="192.168.2.2"==M||"localhost"==M?"http://192.168.1.1:4480/data/log/":"./log/",L="192.168.2.2"==M?1:8,U=new e("http://192.168.2.2"),O=new class{constructor(e,a=(()=>{}),l=8,i=3){this.logController=new t(e,l,i),this.thermoSensors=[],this.hydroSensors=[],this.onload=a,this.timezone=i}setOnLoad(e){this.onload=e}addThermalSensor(e,[t,a,l]){this.thermoSensors.push(new i(e,this,[t,a,l]))}addHydroSensor(e,t){this.hydroSensors.push(new n(e,this,t))}getThermalSensorsRegData(e,t){return this.thermoSensors.map((a=>a.getRegData(e,t)))}getHydroSensorsRegData(e,t){return this.hydroSensors.map((a=>a.getRegData(e,t)))}}(I,(()=>{}),L),X="192.168.2.2"==M||"localhost"==M||"192.168.1.1"==M||"10.8.0.1"==M?Date.now()/1e3:new Date("2022.06.26 00:00:00")/1e3,A="192.168.2.2"==M||"localhost"==M||"192.168.1.1"==M||"10.8.0.1"==M;function H(){const[t,a]=React.useState({version:"offline",unixtime:0,zones:k}),[l,i]=React.useState({begin:X-172800,end:X});React.useEffect((()=>{if(A){const t=setInterval((()=>{i((e=>({...e,end:Date.now()/1e3})))}),12e5),l=setInterval((()=>{U.getInfo((t=>a(e.parseInfo(t))),(()=>a((e=>({...e,version:"offline"})))))}),1e4);return()=>{clearInterval(l),t&&clearInterval(t)}}}),[]);const n=React.useCallback((e=>{U.setTemperature(e.id,e.targetTemperature,(()=>a((t=>({...t,zones:t.zones.map((t=>t.id==e.id?e:t))})))),(()=>a((t=>({...t,zones:t.zones.map((t=>t.id==e.id?{...t,targetTemperature:{}}:t))})))))})),r=React.useCallback((e=>{const l=e-1;t.zones[l].onControl?U.powerOff(e,(()=>a((t=>({...t,zones:t.zones.map((t=>t.id==e?{...t,onControl:0}:t))}))))):U.powerOn(e,(()=>a((t=>({...t,zones:t.zones.map((t=>t.id==e?{...t,onControl:1}:t))})))))}));return React.createElement("div",{className:"wrapper_d808929"},React.createElement(s,{firmware:t.version,controllerDateTime:new Date(1e3*t.unixtime).toLocaleTimeString()}),React.createElement("div",{className:"main_ef0bc9e"},React.createElement("div",{className:"controlsbox_d8af8a5"},t.zones.filter((e=>"Z"===e.type)).map(((e,t)=>React.createElement(p,{key:t,zone:e,onSetTemperature:n,onSetPowerControl:r})))),React.createElement("div",{className:"diagramsbox_e0be825"},React.createElement(_,{timeInterval:l,logController:O})),React.createElement("div",{className:"info_bae79b0"},JSON.stringify(t))))}ReactDOM.render(React.createElement(H,null),document.getElementById("root"))})();