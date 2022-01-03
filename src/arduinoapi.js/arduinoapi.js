export default class ArduinoController {
  constructor(url) {
    this.url = url
  }

  getInfo(response = (t)=>{}, reject = (e)=>{}) {
    return fetch(this.url+'/?g:i&r='+Math.random())
      .then(r=>r.text())
      .then(text => response(text))
      .catch(error => {
        console.log('ArduinoController not available')
        reject(error)
      })
  }

  setTemperature(zone, temperature, response = ()=>{}, reject = ()=>{}) {
    return fetch(this.url+'/?s'+zone+'t:'+ Math.round(temperature*10)+'&r='+Math.random())
      .then(() => {
        console.log('ArduinoController set temperature')
        response()
      })
      .catch(() => {
        console.log('ArduinoController set temperature failure')
        reject()
      })
  }

  powerOn(zone, response = ()=>{}, reject = ()=>{}) {
    return fetch(this.url+'/?s'+zone+'m:1&r='+Math.random())
      .then(() => {
        console.log('Power On', zone)
        response()
      })
      .catch(() => {
        console.log('Power On failure')
        reject()
      })
  }

  powerOff(zone, response = ()=>{}, reject = ()=>{}) {
    return fetch(this.url+'/?s'+zone+'m:0&r='+Math.random())
      .then(() => {
        console.log('Power Off', zone)
        response()
      })
      .catch(() => {
        console.log('Power Off failure')
        reject()
      })
  }

  static parseInfo(text) {
		// 0:version, 1:numofzones,
		// 2:unixtime, 3:starttime, 4:lastsynctime, 5:lastsyncdelta, 6:lastsyncinterval, 7:tickcounter
		// 8:t1, 9:tc1, 10:h1, 11:m1, 12:p1, 13:dt1, 14:s1, 
		// 15:t2, 16:tc2, 17:h2, 18:m2, 19:p2, 20:dt2, 21:s2,
		// 22:t3, 23:tc3, 24:h3, 25:m3, 26:p3, 27:dt3, 28:s3,
		const a = text.split(';')
    const [version, numofz, unixtime, starttime, lastsynctime, lastsyncdelta, lastsyncinterval, tickcounter, ...zonesinfo] = a
    function parseZonesInfo(i, a = [], id = 0) {
      if(!i.length) return a
      const [t, tc, h, m, p, dt, s, ...i2] = i
      a.push({id: ++id, temperature: t/10., targetTemperature: tc/10., humidity: h/10., 
        onControl:+m, powerOn:+p, targetTemperatureDelta: dt/10., sensorState:+s})
      return parseZonesInfo(i2, a, id)
    }
		return {version:'ver.'+version, numofz:+numofz, unixtime:+unixtime, starttime:+starttime, 
      lastsynctime:+lastsynctime, lastsyncdelta:+lastsyncdelta, lastsyncinterval:+lastsyncinterval, 
      tickcounter:+tickcounter, zones: parseZonesInfo(zonesinfo)}
	}

  static states = ['OK','ErrChecksum','ErrTimeout','ErrConnect','ErrAckL','ErrAckH','ErrUnknown']
  static sensorState = s => ArduinoController.states[-s]
}	
