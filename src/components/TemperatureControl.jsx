export default function({zone, temperature = 0., targetTemperature = 0., targetTemperatureDelta = 0.1, humidity = 0.}) {
  return (
  <div className="controlbox">
    <div className="header"><div className="indicator"></div>{'ZONE'+zone}</div>
    <div>
      <div className="button pwrctrl" onClick={()=>{console.log('pwrcontrol_button')}}>PWRCTRL</div>
      <div className="button pwr">PWR</div>
      <div className="button">CONFIG</div>
    </div>
    <div>
      <div className="button" onClick={()=>{console.log('showpwr_button')}}>SHOWPWR</div>
    </div>
    <div>
      <div className="parameter temperature button" onClick={()=>{console.log('modalopen_button')}}>
        <div className="name">temperature</div>
        <div className="value">{temperature.toFixed(1) + '°(' + targetTemperature.toFixed(1) + '±' + targetTemperatureDelta.toFixed(1) + '°)'}</div>
      </div>
      <div className="parameter humidity">
        <div className="name">humidity</div>
        <div className="value">{humidity.toFixed(1) + '%'}</div>
      </div>
    </div>
    <div className="sensorstatus"></div>
  </div>
  );
}
