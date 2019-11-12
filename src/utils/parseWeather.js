export default function parseWeather(weatherInfo) {
  const forecastList = weatherInfo.list;
  //possibly add description for light/moderate rain
  const rainParse = forecastList.map( forecast => ({
    date: forecast.dt,
    weatherCode: forecast.weather[0].id,
    weather: forecast.weather[0].main,
  }))
  const filtered = rainParse.filter( forecast => forecast.weather.toUpperCase().includes('RAIN'));

  return filtered
}
