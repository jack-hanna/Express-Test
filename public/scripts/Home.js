/* Script for home page interactive elements
   Developed by
*/
function updateWeather(farenheit){
   fetch("https://api.open-meteo.com/v1/forecast?latitude=30.612214183103088&longitude=-96.34101092562297&current_weather=true")
      .then((response) => response.json())
      .then((json) =>
        {document.getElementById("currWeather").innerHTML = (farenheit) ? (json.current_weather.temperature * 1.8 + 32).toFixed(1) + "F" : json.current_weather.temperature.toFixed(1) + "C"}
      );
}