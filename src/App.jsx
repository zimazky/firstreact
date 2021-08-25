import React from 'react';
import TemperatureControl from './TemperatureControl.jsx';

function App() {
  let zones = ['1','2','3'];
  return (
    <div>
    {zones.map((zone,idx)=>{<TemperatureControl/>})}
    </div>
  );
}

export default App;