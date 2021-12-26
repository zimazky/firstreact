export default class ArduinoController {
  constructor(url) {
    this.url = url
  }

  getInfo() {
    return fetch(this.url+'/?g:i&r='+Math.random())
  }

  static parseInfo(text) {
		// 0:version, 1:numofzones,
		// 2:unixtime, 3:starttime, 4:lastsynctime, 5:lastsyncdelta, 6:lastsyncinterval, 7:tickcounter
		// 8:t1, 9:tc1, 10:h1, 11:m1, 12:p1, 13:dt1, 14:s1, 
		// 15:t2, 16:tc2, 17:h2, 18:m2, 19:p2, 20:dt2, 21:s2,
		// 22:t3, 23:tc3, 24:h3, 25:m3, 26:p3, 27:dt3, 28:s3,
		const a = text.split(';')
		const z = []
    const [version, numofz, unixtime, starttime, lastsynctime, lastsyncdelta, lastsyncinterval, tickcounter, ...zonesinfo] = a
    function parseZonesInfo(i, a = []) {
      const [t,tc,h,m,p,dt,s, ...i2] = i
      a.push({t:+t, tc:+tc, h:+h, m:+m, p:+p, dt:+dt, s:+s})
      if(i2.length) parseZonesInfo(i2, a)
      return a
    }
		return {version, numofz:+numofz, unixtime:+unixtime, starttime:+starttime, 
      lastsynctime:+lastsynctime, lastsyncdelta:+lastsyncdelta, lastsyncinterval:+lastsyncinterval, 
      tickcounter:+tickcounter, zones: parseZonesInfo(zonesinfo)}
	}
}	
