import React from 'react';

function TemperatureControl(props) {
  console.log(props);
  let id=1;
  return (
  <div className="controlbox" id="arduinocontrol-${id}">
    <div className="header"><div className="indicator"></div> ZONE {id}</div>
    <div>
      <div className="button pwrctrl" onclick="turnPwrCtrl(this,${id})">PWRCTRL</div>
      <div className="button pwr">PWR</div>
      <div className="button">CONFIG</div>
    </div>
    <div>
      <div className="button" onclick="turnShowPwr(this,${id})">SHOWPWR</div>
    </div>
    <div>
      <div className="parameter temperature button" onclick="modalOpen(this,${id})">
        <div className="name">temperature</div>
        <div className="value">0.0°(0.0°)</div>
      </div>
      <div className="parameter humidity">
        <div className="name">humidity</div>
        <div className="value">0.0%</div>
      </div>
    </div>
    <div className="sensorstatus"></div>
  </div>
  );
}

export default TemperatureControl;