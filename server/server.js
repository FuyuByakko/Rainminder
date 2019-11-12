const {openweather} = require("./APIS.js");
//imports
const express = require("express");
const axios = require("axios");

const port = process.env.PORT || 5000

const app = express();

app.use('/api', (req, res) => res.send("hello"));

app.post('/weather', async(req, res) => {
  console.log(req.body);
  const lat = req.body.position.lat;
  const lon = req.body.position.lon;
  console.log(lat, lon);
  // req.cityName
  //by city name
  // let city = "London"
  // let country = "us"
  // const url = 'http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=68a9d690b1771296cba9fdfd11b9b629';
  // const url = `http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&APPID=${openweather}`;
  const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&APPID=${openweather}`;
  
  // const url = `http://api.openweathermap.org/data/2.5/forecast/hourly?q=${city},${country}&APPID=${openweather}`;
  const weather = await axios(url)
  res.json(weather.data)
  
  //by city id
  // pro.openweathermap.org/data/2.5/forecast?id=524901

  //by lat/lon
  //pro.openweathermap.org/data/2.5/forecast?lat=35&lon=139
})


app.listen(port, () => {console.log(`App listening on ${port}`)});
