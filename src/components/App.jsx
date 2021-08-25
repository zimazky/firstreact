import TemperatureControl from './TemperatureControl.jsx';

export default function () {
  let zones = ['1','2','3'];
  return (
    <div>
      <TemperatureControl zone='1' temperature={21.5} targetTemperature={25.0}/>
      <TemperatureControl zone='2' temperature={22.4} targetTemperature={24.3}/>
      <TemperatureControl zone='3'/>
    </div>
  );
}