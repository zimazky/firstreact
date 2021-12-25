(()=>{"use strict";function e(){return e=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var l in a)Object.prototype.hasOwnProperty.call(a,l)&&(e[l]=a[l])}return e},e.apply(this,arguments)}function t({active:t=!1,disabled:a=!1,children:l="Button",...i}){return React.createElement("div",e({className:"button_c0afaa2 "+(t?"active_b40adfc":"")},i),l)}function a({title:e="Modal title",isOpen:t=!1,onSubmit:a=(()=>{}),onCancel:l=(()=>{}),children:i=null}){return t&&React.createElement("div",{className:"modalOverlay_faa7164",onClick:l},React.createElement("div",{className:"modalWindow_fac41c2",onClick:e=>e.stopPropagation()},React.createElement("div",{className:"modalHeader_ec3e5fe"},React.createElement("div",{className:"modalTitle_e276bb7"},e)),React.createElement("div",{className:"modalBody_a8134eb"},i),React.createElement("div",{className:"modalFooter_dcf803f"},React.createElement("span",{className:"cancel_b0d96c0",onClick:l},"Cancel"),React.createElement("span",{className:"apply_dc7f5d7",onClick:a},"Apply"))))}const l="name_fc64aab",i="value_be14f95",n="modal_button_aad8592";function s({parameterName:e,displayedValue:t=0,controlledValue:s=0,disabled:r=!1,update:o=(e=>{})}){const[h,c]=React.useState(!1),[u,d]=React.useState(s);return console.log("ModalState:",h),console.log("ParameterState:",u),r?React.createElement("div",null,React.createElement("div",{className:l},e),React.createElement("div",{className:i},t)):React.createElement("div",{className:"button",onClick:()=>{c(!h)}},React.createElement("div",{className:l},e),React.createElement("div",{className:i},t),React.createElement(a,{isOpen:h,title:"Set target temperature for Zone",onSubmit:()=>{o(u),c(!1)},onCancel:()=>{c(!1)}},React.createElement("span",{className:n,onClick:()=>{d(u-.1)}},"-"),React.createElement("span",{className:"modal_parameter_be59a01"},u.toFixed(1)),React.createElement("span",{className:n,onClick:()=>{d(u+.1)}},"+")))}const r={controlbox:"controlbox_d0c639d",header:"header_b26ca6e"};function o({zone:e,update:a}){return console.log(e),React.createElement("div",{className:r.controlbox},React.createElement("div",{className:r.header},React.createElement("div",{className:r.indicator}),"ZONE"+e.id),React.createElement("div",null,React.createElement(t,{onClick:()=>{console.log("pwrcontrol_button")}},"PWRCTRL"),React.createElement(t,{disabled:!0},"PWR"),React.createElement(t,null,"CONFIG")),React.createElement("div",null,React.createElement(t,{onClick:()=>{console.log("showpwr_button")}},"SHOWPWR")),React.createElement("div",null,React.createElement(s,{parameterName:"temperature",displayedValue:e.temperature.toFixed(1)+"°("+e.targetTemperature.toFixed(1)+"±"+e.targetTemperatureDelta+")",controlledValue:e.targetTemperature,update:t=>{a({...e,targetTemperature:t})}}),React.createElement(s,{parameterName:"humidity",displayedValue:e.humidity.toFixed(1)+"%",disabled:!0})),React.createElement("div",{className:"sensorstatus"}))}class h{constructor(e,t="stepped"){this.time=e,this.zmode=t,this.data=[],this.flag=0,this.value=0,this.high=Number.MIN_VALUE,this.low=Number.MAX_VALUE,this.open=0,this.close=0,this.topen=0,this.tclose=0,this.nclose=0,this.tstep=0,this.zdata=[]}push(e){if(!(e.time<this.time)){if(0==this.data.length)return this.flag=1,this.value=this.low=this.high=this.open=this.close=e.value,this.topen=this.tclose=e.time,void this.data.push({flag:0,time:e.time,value:e.value});this.tclose>this.topen&&(this.value=(this.value*(this.tclose-this.topen)+(this.close-this.open)*(e.time-this.tclose))/(e.time-this.topen)),this.close!=e.value||1!=e.flag?(this.low=Math.min(this.low,e.value),this.high=Math.max(this.high,e.value),this.close=e.value,this.tclose=e.time,this.nclose=0,this.data.push({flag:e.flag,time:e.time,value:e.value})):0==this.nclose?(this.nclose++,this.tclose=e.time,this.data.push({flag:e.flag,time:e.time,value:e.value})):(this.data[this.data.length-1].time=e.time,this.tclose=e.time)}}getlinearregdata(e){for(var t=[],a=this.data[0],l=this.time,i=a.value;l+e<a.time;)t.push({flag:0,value:i}),l+=e;t.push({flag:1,value:i});for(var n=1;n<this.data.length;n++){a=this.data[n];var s=t.length-1,r=this.data[n-1];if(a.time<l+e)t[s].value+=(a.value-i)*(l+e-a.time)/e,i=a.value;else{l+=e;var o=(a.value-r.value)/(a.time-r.time);for(i=r.value+o*(l-r.time);l+e<a.time;){var h=i+o*e;t.push({flag:a.flag,value:(i+h)/2}),i=h,l+=e}t.push({flag:1,value:i})}}return t}getsteppedregdata(e){for(var t=[],a=this.data[0],l=this.time,i=a.value;l+e<a.time;)t.push({flag:0,value:i}),l+=e;t.push({flag:1,value:i});for(var n=1;n<this.data.length;n++){a=this.data[n];var s=t.length-1,r=this.data[n-1];if(a.time<l+e)t[s].value+=(a.value-i)*(l+e-a.time)/e,i=a.value;else{for(l+=e,i=r.value;l+e<a.time;)t.push({flag:a.flag,value:i}),l+=e;0==a.flag&&(i=a.value),t.push({flag:1,value:i})}}return t.push({flag:1,value:i}),t}getohlcregdata(e){for(var t=[],a=this.data[0],l=this.time,i=a.value;l+e<a.time;)t.push({flag:0,open:i,high:i,low:i,close:i}),l+=e;t.push({flag:1,open:i,high:i,low:i,close:i});for(var n=1;n<this.data.length;n++){a=this.data[n];var s=t.length-1,r=this.data[n-1];if(a.time<l+e)t[s].close=a.value,t[s].high=a.value>t[s].high?a.value:t[s].high,t[s].low=a.value<t[s].low?a.value:t[s].low;else{for(l+=e,i=r.value;l+e<a.time;)t.push({flag:a.flag,open:i,high:i,low:i,close:i}),l+=e;0==a.flag&&(i=a.value),t.push({flag:1,open:i,high:i,low:i,close:i})}}return t.push({flag:1,open:i,high:i,low:i,close:i}),t}gethighlowregdata(e){for(var t=[],a=this.data[0],l=this.time,i=a.value;l+e<a.time;)t.push({flag:0,high:i,low:i}),l+=e;t.push({flag:1,high:i,low:i});for(var n=1;n<this.data.length;n++){a=this.data[n];var s=t.length-1,r=this.data[n-1];if(a.time<l+e)t[s].high=a.value>t[s].high?a.value:t[s].high,t[s].low=a.value<t[s].low?a.value:t[s].low;else{for(l+=e,i=r.value;l+e<a.time;)t.push({flag:a.flag,high:i,low:i}),l+=e;0==a.flag&&(i=a.value),t.push({flag:1,high:i,low:i})}}return t.push({flag:1,high:i,low:i}),t}rezoom(e){e<1&&(e=1),this.tstep!=e&&0!=this.data.length&&(this.tstep=e,"linear"==this.zmode?this.zdata=this.getlinearregdata(e):"stepped"==this.zmode?this.zdata=this.getsteppedregdata(e):"highlow"==this.zmode?this.zdata=this.gethighlowregdata(e):"ohlc"==this.zmode&&(this.zdata=this.getohlcregdata(e)))}fillzdata(e,t,a){if(this.tclose<=e.begin||this.topen>=e.end)return a;this.rezoom(t);var l=e.begin,i=~~((e.begin-this.time)/t),n=0;i<0&&(l=this.time,n=-i,i=0);var s=a.min,r=a.max;if("linear"==this.zmode||"stepped"==this.zmode)for(;l<e.end&&l<this.tclose;i++,n++,l+=t){var o=this.zdata[i].flag;a.zdata[n].flag=o;var h=this.zdata[i].value;a.zdata[n].value=h,1==o&&(s=h<s?h:s,r=h>r?h:r)}else if("highlow"==this.zmode)for(;l<e.end&&l<this.tclose;i++,n++,l+=t){o=this.zdata[i].flag,a.zdata[n].flag=o;var c=this.zdata[i].high,u=this.zdata[i].low;a.zdata[n].high=c,a.zdata[n].low=u,1==o&&(s=u<s?u:s,r=c>r?c:r)}else if("ohlc"==this.zmode)for(;l<e.end&&l<this.tclose;i++,n++,l+=t){o=this.zdata[i].flag,a.zdata[n].flag=o;var d=this.zdata[i].open,m=(c=this.zdata[i].high,u=this.zdata[i].low,this.zdata[i].close);a.zdata[n].open=d,a.zdata[n].high=c,a.zdata[n].low=u,a.zdata[n].close=m,1==o&&(s=u<s?u:s,r=c>r?c:r)}return{zdata:a.zdata,min:s,max:r}}integrate(e){var t=0;if(this.data.length>0)for(var a=this.data[0],l=1;l<this.data.length;l++){var i=this.data[l];i.time>e.begin&&i.time<=e.end&&(t+=a.value*(i.time-a.time),a=i)}return t}clearzdata(){this.zdata=[],this.tstep=0}}const c={gridBox:"gridBox_fc13aaa",context:"context_f11840f",detail:"detail_ec20b03",contextTickLabels:"contextTickLabels_fe07fb7",detailTickLabels:"detailTickLabels_f68035d",svgBox:"svgBox_b08058f",yLabels:"yLabels_e4cb634",yTickLabels:"yTickLabels_c40706f"};function u({data:e,height:t,barw:a=2,min:l,max:i,color:n="#FFF"}){let s=t/(i-l),r="";e[0].flag&&(r+="M0 "+(t-s*(e[0].value-l)));for(let i=1;i<e.length;i++)if(e[i].flag){let n=t-s*(e[i].value-l);e[i-1].flag?r+="L"+i*a+" "+n:r+="M"+i*a+" "+n}return React.createElement("path",{d:r,fill:"none",stroke:n,strokeWidth:"1"})}const d=[{value:1,unit:"s",shift:10800},{value:2,unit:"s",shift:10800},{value:5,unit:"s",shift:10800},{value:10,unit:"s",shift:10800},{value:20,unit:"s",shift:10800},{value:30,unit:"s",shift:10800},{value:60,unit:"m",shift:10800},{value:120,unit:"m",shift:10800},{value:300,unit:"m",shift:10800},{value:600,unit:"m",shift:10800},{value:1200,unit:"m",shift:10800},{value:1800,unit:"m",shift:10800},{value:3600,unit:"h",shift:10800},{value:7200,unit:"h",shift:10800},{value:10800,unit:"h",shift:10800},{value:21600,unit:"h",shift:10800},{value:43200,unit:"h",shift:10800},{value:86400,unit:"d",shift:10800},{value:172800,unit:"d",shift:10800},{value:345600,unit:"d",shift:10800},{value:604800,unit:"w",shift:27e4},{value:1209600,unit:"w",shift:27e4},{value:2629800,unit:"M",shift:1},{value:5259600,unit:"M",shift:2},{value:7889400,unit:"M",shift:3},{value:15778800,unit:"M",shift:6}],m=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];function f({title:e="TimeDiagram",width:t=300,height:a=200,min:l=0,max:i=1,children:n=null,timeInterval:s,onShift:r=(()=>{}),onZoom:o=(()=>{}),onSelectDate:h=(()=>{})}){const[u,f]=React.useState({x:0,y:0}),g=React.useRef(null);let v=!1,p=0,b=0,w=null;function E(e){if(e.preventDefault(),e.isPrimary)return v=!0,void(p=e.offsetX);null===w&&(w=e.pointerId,b=e.offsetX)}const R=React.useCallback(function(e,t=200){let a,l,i=!1;return function n(){if(i)return a=arguments,void(l=this);e.apply(this,arguments),i=!0,setTimeout((()=>{i=!1,a&&(n.apply(l,a),a=l=null)}),t)}}((e=>{if(e.preventDefault(),v){if(e.isPrimary){let a=(e.offsetX-p)/t;return p=e.offsetX,r(a),void f({x:e.offsetX,y:e.offsetY})}if(w===e.pointerId&&e.offsetX!==p){let a=(b-p)/(e.offsetX-p),l=p/t;b=e.offsetX,o(a,l)}}else f({x:e.offsetX,y:e.offsetY})}),30));function y(e){e.preventDefault(),e.isPrimary?v=!1:w===e.pointerId&&(w=null,b=0)}function z(e){e.preventDefault();let a=e.wheelDelta>0?.9:1.1111111111111112,l=e.offsetX/t;o(a,l)}function T(e){f({x:0,y:0})}React.useEffect((()=>(console.log("AddEventListener Mouse"),g.current.addEventListener("wheel",z),g.current.addEventListener("pointerdown",E),g.current.addEventListener("pointermove",R),g.current.addEventListener("pointerup",y),g.current.addEventListener("pointerout",T),()=>{console.log("RemoveEventListener Mouse"),g.current.removeEventListener("wheel",z),g.current.removeEventListener("pointerdown",E),g.current.removeEventListener("pointermove",R),g.current.removeEventListener("pointerup",y),g.current.removeEventListener("pointerout",T)})),[]);let C=(i-l)/a;return React.createElement(React.Fragment,null,React.createElement("div",{className:c.header,style:{width:t}},React.createElement("div",null,e)),React.createElement("div",{className:c.gridBox},React.createElement("div",{className:c.context}," ",function(e,t,a,l=50){let i=l*(t-e)/a,[n]=[0,...d.filter((e=>i>=e.value)).keys()].slice(-1),s=a/(t-e);const r=[];let o=new Date(1e3*(e+10800)),h=e;if("M"==d[n].unit){do{let e=o.getUTCFullYear();o.setUTCHours(0),o.setMinutes(0),o.setSeconds(0),o.setUTCFullYear(e+1,0,1);let a=o.getTime()/1e3-10800,l=a<t?(a-h)*s:(t-h)*s;r.push({tick:h,label:e,width:l}),h=a}while(h<t);return r}if("d"==d[n].unit||"w"==d[n].unit){do{let e=o.getUTCMonth()+1,a=o.getUTCFullYear();o.setUTCHours(0),o.setMinutes(0),o.setSeconds(0),o.setUTCDate(1),o.setUTCMonth(e);let l=o.getTime()/1e3-10800,i=l<t?(l-h)*s:(t-h)*s;r.push({tick:h,label:a+"."+(e<10?"0":"")+e,width:i}),h=l}while(h<t);return r}if("h"==d[n].unit){let a=86400*~~((e+d[n].shift)/86400+1)-d[n].shift;do{let e=a<t?(a-h)*s:(t-h)*s,l=new Date(1e3*(h+10800)),i=l.getUTCDate(),n=l.getUTCMonth()+1,o=l.getUTCFullYear();r.push({tick:h,label:o+"."+(n<10?"0":"")+n+"."+(i<10?"0":"")+i,width:e}),h=a,a+=86400}while(h<t);return r}if("m"==d[n].unit){let a=3600*~~((e+d[n].shift)/3600+1)-d[n].shift;do{let e=a<t?(a-h)*s:(t-h)*s,l=new Date(1e3*(h+10800)),i=l.getUTCHours(),n=l.getUTCDate(),o=l.getUTCMonth()+1;r.push({tick:h,label:(o<10?"0":"")+o+"."+(n<10?"0":"")+n+" "+(i<10?"0":"")+i+"h",width:e}),h=a,a+=3600}while(h<t);return r}if("s"==d[n].unit){let a=60*~~((e+d[n].shift)/60+1)-d[n].shift;do{let e=a<t?(a-h)*s:(t-h)*s,l=new Date(1e3*(h+10800)),i=l.getUTCMinutes(),n=l.getUTCHours();r.push({tick:h,label:(n<10?"0":"")+n+":"+(i<10?"0":"")+i,width:e}),h=a,a+=60}while(h<t);return r}return r}(s.begin,s.end,t,50).map((e=>React.createElement("div",{className:c.contextTickLabels,key:e.tick,style:{width:e.width}},e.label)))),React.createElement("div",{className:c.detail,style:{height:a+12}}," ",function(e,t,a,l=50){let i=l*(t-e)/a,[n]=[0,...d.filter((e=>i>=e.value)).keys()].slice(-1),s=a/(t-e),r=e,o=new Date(1e3*(e+10800));const h=[];if("M"==d[n].unit){do{let e=o.getUTCMonth();o.getUTCFullYear(),o.setUTCHours(0),o.setMinutes(0),o.setSeconds(0),o.setUTCDate(1),o.setUTCMonth(e+(d[n].shift-e%d[n].shift));let a=o.getTime()/1e3-10800,l=a<t?(a-r)*s:(t-r)*s;h.push({tick:r,label:m[e],width:l}),r=a}while(r<t);return h}let c=d[n].value,u=~~((e+d[n].shift)/c+1)*c-d[n].shift;if("s"==d[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCSeconds();h.push({tick:r,label:(a<10?"0":"")+a+"''",width:e}),r=u,u+=c}while(r<t);return h}if("m"==d[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCMinutes();h.push({tick:r,label:(a<10?"0":"")+a+"'",width:e}),r=u,u+=c}while(r<t);return h}if("h"==d[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCHours();h.push({tick:r,label:(a<10?"0":"")+a+"h",width:e}),r=u,u+=c}while(r<t);return h}if("d"==d[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCDate();h.push({tick:r,label:(a<10?"0":"")+a,width:e}),r=u,u+=c}while(r<t);return h}if("w"==d[n].unit){do{let e=u<t?(u-r)*s:(t-r)*s;o=new Date(1e3*(r+10800));let a=o.getUTCDate();h.push({tick:r,label:(a<10?"0":"")+a,width:e}),r=u,u+=c}while(r<t);return h}return h}(s.begin,s.end,t,50).map((e=>React.createElement("div",{className:c.detailTickLabels,key:e.tick,style:{width:e.width,height:a+12},onClick:()=>{h(e.tick)}},e.label)))),React.createElement("div",{className:c.yLabels,style:{width:t,height:a}}," ",function(e,t,a,l=20){let i=l*(t-e)/a,n=Math.round(Math.log(i)/Math.log(10)),s=Math.pow(10,n),r=i/s;r<=1?r=1:r<=2?r=2:r<=5?r=5:(r=10,n++),n=n<0?-n:0;let o=s*r,h=a/(t-e),c=[],u=t,d=o*~~(t/o);do{let t=d>e?h*(u-d):h*(u-e);t>0&&c.push({tick:u,label:u.toFixed(n),height:t}),u=d,d-=o}while(u>e);return c}(l,i,a).map(((e,t)=>React.createElement("div",{className:c.yTickLabels,key:t,style:{height:e.height}},e.label)))),React.createElement("svg",{ref:g,width:t,height:a,viewBox:`0 0 ${t} ${a}`,className:c.svgBox},n)),React.createElement("div",{style:{width:t}},new Date(1e3*(s.begin+u.x*(s.end-s.begin)/t)).toLocaleString()+" "+(i-C*u.y).toFixed(2)))}const g="row_f8cec4a",v={width:35},p={width:60},b={width:30};function w({title:e="Table",headerName:t="value",data:a=[],time:l,height:i=200}){const[n,s]=React.useState(a.findIndex((e=>e.time>=l))),r=React.useRef(null),o=React.useRef(l);if(o.current!=l){o.current=l;let e=a.findIndex((e=>e.time>=l));console.log(e,n),s(e),console.log(o.current)}let h=~~(i/12),c=a.length,u=i*(h/c);u=u<5?5:u;let d=n/c*(i-u);function m(e){e.preventDefault();let t=e.wheelDelta>0?-5:5;s((e=>e+t))}const f=React.useRef({isDragging:!1,y:0,row:n});function w(e){if(f.current.isDragging){let t=c*(e.clientY-f.current.y)/i,a=f.current.row+t;a<0&&(a=0),a>c-h&&(a=c-h),s(~~a)}}function E(e){f.current={isDragging:!1,y:0}}return React.useEffect((()=>(console.log("TimeTable AddEventListener Mouse"),r.current.addEventListener("wheel",m),document.addEventListener("mousemove",w),document.addEventListener("mouseup",E),()=>{console.log("TimeRemoveEventListener Mouse"),r.current.removeEventListener("wheel",m),document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",E)})),[]),React.createElement(React.Fragment,null,React.createElement("div",null,e),React.createElement("div",{ref:r,className:"wrapper_b8d6404",style:{height:i}},React.createElement("div",{className:"table_a2395b7"},React.createElement("div",{className:g},React.createElement("span",{style:v},"#"),React.createElement("span",{style:p},"time"),React.createElement("span",{style:b},t))," ",a.slice(n,n+h).map(((e,t)=>{let a=(e.time+10800)%86400,l=~~(a/3600),i=~~(a%3600/60),s=a%60;return React.createElement("div",{className:g,key:t},React.createElement("span",{style:v},n+t+1),React.createElement("span",{style:p},(l<10?"0":"")+l+":"+(i<10?"0":"")+i+":"+(s<10?"0":"")+s),React.createElement("span",{style:b},e.value))}))),React.createElement("div",{className:"scrollbarTrack_e15be30",onClick:function(e){s((e=>e+h>c?c:e+h))}},React.createElement("div",{className:"scrollbarUp_a9a56e8",style:{height:d},onClick:function(e){e.stopPropagation(),s((e=>e-h<0?0:e-h))}}),React.createElement("div",{className:"scrollbarThumb_dbe7646",style:{height:u},onMouseDown:function(e){e.preventDefault(),f.current={isDragging:!0,y:e.clientY,row:n},console.log("mouseDown",e)},onClick:e=>{e.stopPropagation()}}))))}const E={diagramsColumn:"diagramsColumn_ebe3634",tableColumn:"tableColumn_b6b5e3d",timeColumn:"timeColumn_e9a9dea",temperatureColumn:"temperatureColumn_b1e47fe",humidityColumn:"humidityColumn_bf089a3"};class R{constructor(e,t){this.url=e,this.ext=t,this.array=[],this.tryes=[],this.parse=function(e,t){return{time:e,status:0}},this.onload=function(){},this.ondock=function(e,t){}}load(e,t="text"){if(!R.loading&&void 0===this.array[e]){var a=86400*~~((Date.now()/1e3+10800)/86400)-10800;if(!(e>a)){R.loading=!0;var l=new Date(1e3*(e+10800)),i=l.getUTCDate(),n=l.getUTCMonth()+1,s=l.getUTCFullYear(),r=this.url+s+(n<10?"0":"")+n+(i<10?"0":"")+i+"."+this.ext,o=new XMLHttpRequest;o.responseType=t,o.open("GET",r,!0),o.onreadystatechange=function(t){4==o.readyState&&(200==o.status?(this.array[e]=this.parse(e,o.response),delete this.tryes[e],void 0!==this.array[e+86400]&&0!=this.array[e+86400].flag&&this.ondock(this.array[e],this.array[e+86400]),void 0!==this.array[e-86400]&&0!=this.array[e-86400].flag&&this.ondock(this.array[e-86400],this.array[e])):0!=o.status?(console.log("loading error",o.statusText),console.log("status",o.status),this.array[e]={flag:0}):(void 0===this.tryes[e]?this.tryes[e]=1:this.tryes[e]+=1,console.log("trying",this.tryes[e]),this.tryes[e]>3&&(this.array[e]={flag:0},delete this.tryes[e])),R.loading=!1,this.onload())}.bind(this),o.send(null),console.log(r)}}}preparezdata(e,t){for(var a=Number.MAX_VALUE,l=Number.MIN_VALUE,i=[],n=e.begin;n<e.end;n+=t)i.push({flag:0});return{zdata:i,min:a,max:l}}getzdata(e,t){for(var a=this.preparezdata(e,t),l=86400*~~((e.begin+10800)/86400)-10800;l<e.end;l+=86400)void 0===this.array[l]?this.load(l,"text"):0!=this.array[l].flag&&(a=this.array[l].fillzdata(e,t,a));return a}}R.loading=!1;class y extends R{constructor(e,t,a,l,i){super(e,"Z"+t),this.tcolor=a,this.hcolor=l,this.pcolor=i,this.showpower=!1,this.parse=function(e,t){var a=new h(e),l=new h(e),i=new h(e);if(t){for(var n=t.split("\n"),s=0,r=(e=0,0),o=0,c=0,u=0,d=0,m=0,f=0;f<n.length;f++){var g=n[f].split(";");if(!(g.length<2))if(128&g[0]){e=0,r=0,o=0,c=0,d=0,s=parseInt(g[1]);var v=2;1&g[0]&&(e=parseFloat(g[v++])),2&g[0]&&(r=parseFloat(g[v++])),u=4&g[0]?100:0,i.push({flag:1,time:s,value:u}),16&g[0]&&(o=parseFloat(g[v++])),32&g[0]&&(c=parseFloat(g[v++])),64&g[0]&&(d=parseFloat(g[v++])),0==d&&(a.push({flag:0,time:s,value:e/10}),l.push({flag:0,time:s,value:r/10}))}else{if(0==s)continue;var p=parseInt(g[1]);(p=p>2147483647?p-4294967296:p)<0&&console.log(p,s,e,r,o,c,d),s+=p,v=2,1&g[0]&&(e+=parseFloat(g[v++])),2&g[0]&&(r+=parseFloat(g[v++])),4&g[0]?100!=u&&(u=100,i.push({flag:1,time:s,value:u})):0!=u&&(u=0,i.push({flag:1,time:s,value:u})),16&g[0]&&(o+=parseFloat(g[v++])),32&g[0]&&(c+=parseFloat(g[v++])),64&g[0]&&(d=parseFloat(g[v++])),m=0==d?1:0,0==d&&(1&g[0]&&a.push({flag:m,time:s,value:e/10}),2&g[0]&&l.push({flag:m,time:s,value:r/10}))}}0!=a.data.length&&a.push({flag:m,time:s,value:e/10}),0!=l.data.length&&l.push({flag:m,time:s,value:r/10}),0!=i.data.length&&i.push({flag:1,time:s,value:u})}return{t:a,h:l,p:i}}}preparezdata(e,t){for(var a={zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE},l={zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE},i={zdata:[],min:Number.MAX_VALUE,max:Number.MIN_VALUE},n=e.begin;n<e.end;n+=t)a.zdata.push({flag:0}),l.zdata.push({flag:0}),i.zdata.push({flag:0});return{t:a,h:l,p:i}}getzdata(e,t){for(var a=this.preparezdata(e,t),l=86400*~~((e.begin+10800)/86400)-10800;l<e.end;l+=86400)void 0===this.array[l]?this.load(l,"text"):0!=this.array[l].flag&&(a.t=this.array[l].t.fillzdata(e,t,a.t),a.h=this.array[l].h.fillzdata(e,t,a.h),a.p=this.array[l].p.fillzdata(e,t,a.p));return a}}let z=[],T={};T.end=new Date("2021.12.25 00:00:00")/1e3,T.begin=T.end-172800;const C=250;function N(){const[e,t]=React.useState(T),[a,l]=React.useState([]),[i,n]=React.useState(0);React.useEffect((()=>{z.push(new y("./log/",2,"white","white","red")),z.push(new y("./log/",3,"white","white","red")),z.forEach((e=>{e.onload=()=>{t((e=>({begin:e.begin,end:e.end})))}}))}),[]),React.useEffect((()=>{let t=1*(e.end-e.begin)/400,a=z.map((a=>a.getzdata(e,t)));l(a)}),[e]);const s=React.useCallback((e=>{t((t=>{let a=t.end-t.begin;return{begin:t.begin-a*e,end:t.end-a*e}}))})),r=React.useCallback(((e,a)=>{t((t=>{let l=t.end-t.begin;if(e*l<300)return t;let i=t.begin+a*l;return{begin:i-e*(i-t.begin),end:i+e*(t.end-i)}}))})),o=React.useCallback((e=>{n(e)}));let h=Math.min(...a.map((e=>e.t.min))),c=Math.max(...a.map((e=>e.t.max))),d=Math.min(...a.map((e=>e.h.min))),m=Math.max(...a.map((e=>e.h.max))),g=86400*~~((i+10800)/86400)-10800;return React.createElement("div",{className:E.wrapper},React.createElement("div",{className:E.diagramsColumn},React.createElement(f,{title:"Temperature, °C",timeInterval:e,onShift:s,onZoom:r,onSelectDate:o,min:h,max:c,width:400,height:C},a[0]&&React.createElement(u,{data:a[0].t.zdata,height:C,min:h,max:c,barw:1,color:"#ffa23c"}),a[1]&&React.createElement(u,{data:a[1].t.zdata,height:C,min:h,max:c,barw:1,color:"#88a23c"})),React.createElement(f,{title:"Humidity, %",timeInterval:e,onShift:s,onZoom:r,onSelectDate:o,min:d,max:m,width:400,height:C},a[0]&&React.createElement(u,{data:a[0].h.zdata,height:C,min:d,max:m,barw:1,color:"#bbb"}),a[1]&&React.createElement(u,{data:a[1].h.zdata,height:C,min:d,max:m,barw:1,color:"#88bbbb"}))),0!=i&&React.createElement("div",{className:E.tableColumn},React.createElement(w,{title:new Date(1e3*i).toLocaleDateString()+" Z2 H",data:z[0].array[g].h?z[0].array[g].h.data:[],time:i}),React.createElement(w,{title:new Date(1e3*i).toLocaleDateString()+" Z3 H",data:z[1].array[g].h?z[1].array[g].h.data:[],time:i})))}function x(){const[e,t]=React.useState([{id:"1",temperature:21.5,targetTemperature:25,targetTemperatureDelta:.2,humidity:56},{id:"2",temperature:22.4,targetTemperature:23.4,targetTemperatureDelta:.1,humidity:55.6},{id:"3",temperature:13.5,targetTemperature:0,targetTemperatureDelta:0,humidity:98.2}]);return React.createElement(React.Fragment,null,React.createElement(N,null),React.createElement("div",null,e.map(((a,l)=>React.createElement(o,{key:l,zone:a,update:a=>{t(e.map((e=>(console.log(a),e.id==a.id?a:e))))}})))))}ReactDOM.render(React.createElement(x,null),document.getElementById("root"))})();