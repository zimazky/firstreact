import React from 'react';

function TemperatureControl(id) {
  return (
  <div class="controlbox" id="arduinocontrol-${id}">
    <div class="header"><div class="indicator"></div> ZONE ${id}</div>
    <div>
      <div class="button pwrctrl" onclick="turnPwrCtrl(this,${id})">PWRCTRL</div>
      <div class="button pwr">PWR</div>
      <div class="button">CONFIG</div>
    </div>
    <div>
      <div class="button" onclick="turnShowPwr(this,${id})">SHOWPWR</div>
    </div>
    <div>
      <div class="parameter temperature button" onclick="modalOpen(this,${id})">
        <div class="name">temperature</div>
        <div class="value">0.0°(0.0°)</div>
      </div>
      <div class="parameter humidity">
        <div class="name">humidity</div>
        <div class="value">0.0%</div>
      </div>
    </div>
    <div class="sensorstatus"></div>
  </div>
  );
}

export default TemperatureControl;