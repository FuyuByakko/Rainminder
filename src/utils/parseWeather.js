export default function parseWeather(weatherInfo) {
  const forecastList = weatherInfo.list;
  //possibly add description for light/moderate rain
  const rainIDs = [2, 3, 5]
  const rainParse = forecastList.map( forecast => ({
    date: forecast.dt,
    weatherCode: forecast.weather[0].id,
    weather: forecast.weather[0].main,
  }))
  const filtered = rainParse.filter( forecast => rainIDs.includes(Math.floor(forecast.weatherCode / 100)));
  // console.log(filtered);
  return filtered
}
