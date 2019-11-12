/**
 * @format
 * @flow
 */
const {openweather} = require("./server/APIS");

import React, {Component} from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, Picker, Button } from 'react-native';
import axios from "axios";
import GetLocation from 'react-native-get-location';
import parseWeather from './src/utils/parseWeather.js';

import UserLocation from './src/components/UserLocation';

export default class App extends Component {
  state = {
    date: "",
    rainyDays: [],
    weatherToday: "Check the Weather",
    weatherStatuses: {
      checking: "Getting the Weather",
      done: "Today's weather is: ",
    },
    selectedHour: "00",
    selectedMinutes: "00",
    warningTime: "00"
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Rain-minder</Text>
        </View>
        <View>
          <Button title="check weather!" onPress={this.getWeather} />
          <Text> {this.state.weatherToday} </Text>
          {/* {{ for(entry of this.state.rainyDays) {
            <Text>{this.state.rainyDays}</Text>
          }
        }} */}

          {/* <UserLocation propTest='props passed' /> */}
        </View>
        <Text> SELECT THE TIME YOU WILL LEAVE HOME: {this.state.selectedHour + ":" + this.state.selectedMinutes}</Text>
        <View style={{flexDirection:"row"}}>
          <Picker
            selectedValue={this.state.selectedHour}
            style={{height:50, width: 50, backgroundColor: '#f9c2ff', padding: 20, marginVertical: 8, marginHorizontal: 16}}
            onValueChange={itemValue => this.setState({selectedHour: itemValue})}>
            <Picker.Item label="00" value="00" />
            <Picker.Item label="05" value="05" />
            <Picker.Item label="06" value="06" />
            <Picker.Item label="07" value="07" />
            <Picker.Item label="08" value="08" />
            <Picker.Item label="09" value="09" />
            <Picker.Item label="23" value="23" />
          </Picker>
          <Picker
            selectedValue={this.state.selectedMinutes}
            style={{height:50, width: 50, backgroundColor: '#f9c2ff', padding: 20, marginVertical: 8, marginHorizontal: 16}}
            onValueChange={itemValue => this.setState({selectedMinutes: itemValue})}>
            <Picker.Item label="01" value="01" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="30" value="30" />
            <Picker.Item label="45" value="45" />
          </Picker>
        </View>
        <Button title="SET TIMER!" onPress={this.setCheck} />
        <Text> You will be warned {this.state.warningTime} minutes in advance. </Text>
      </SafeAreaView>
    );
  }

  componentDidMount() {
    this.setState({weatherToday: this.state.weatherStatuses.checking})
    this.getWeather();
  }

  setCheck = () => {
    // 5minutes * 60 secs = 300 secs * 1000 ms = 300000
    const date = new Date(this.state.date)
    const offset = date.getTimezoneOffset() / 60;
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    console.log( date, year, month, day, offset)

    const selectedTime = Date.UTC(
      year,
      month,
      day,
      Number(this.state.selectedHour) + offset,
      Number(this.state.selectedMinutes) + offset,
    );
    const timeToWarn = selectedTime - this.state.warningTime * 60 * 1000;
    console.log("Time To Warn: " + timeToWarn);
    console.log("Time Now: " + this.state.date);

    setTimeout(() => {
      console.log("WAKE UUUUUUUUUUUUUUUUUP")
    }, timeToWarn - Date.now() );
  }

  getLoc = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      console.info(location);
      const position = {lat: location.latitude, lon: location.longitude};
      return position;
    } catch (e) {
      console.info(e)
    }
  };

  getWeather = async () => {
    this.setState({weatherToday: this.state.weatherStatuses.checking});
    try {
      const position = await this.getLoc();
      console.log("got position: ", position)
      // const API = process.env.WEATHER_API || openweather;
      // axios ('/weather')
      const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${position.lat}&lon=${position.lon}&APPID=${openweather}`;
      const info = {
        method: 'POST',
        url,
        data: position,
      };
      const AllWeatherPoints = await axios(info);
      const parsedWeatherPoints = parseWeather(AllWeatherPoints.data);

      this.setState({rainyDays: parsedWeatherPoints});

      const today = Date.now();

      // NEED TO CHANGE FILTERING LOGIC
      // const weatherByDay = parsedWeatherPoints.reduce((allDays, curDay) => {
      //   let curDayDate = new Date(curDay.date * 1000).getUTCDate();
      //   if (allDays.indexOf(curDayDate) === -1) {
      //     allDays.push(curDayDate);
      //   }
      //   return allDays;
      // }, []);

      const worstToday = parsedWeatherPoints.reduce((thisDay, curPoint) => {
        let curPointDate = new Date(curPoint.date * 1000).getUTCDate();
        let todayDate = today;
        if (curPointDate === todayDate) {
          console.log("comparison passed");
        // 2 > 5 > 3
          if (thisDay && Math.floor(thisDay.weatherCode / 100) === 2) {
            return thisDay;
          } else if (Math.floor(curPoint.weatherCode / 100) === 2) {
            return curPoint;
          } else if (thisDay && Math.floor(thisDay.weatherCode / 100) === 5) {
            return thisDay;
          } else if (Math.floor(curPoint.weatherCode / 100) === 5) {
            return curPoint;
          }
        }
        return thisDay;
      }, {});

      if (Object.keys(worstToday).length < 1) {
        this.setState({weatherToday: this.state.weatherStatuses.done.concat("FINE!"), date: today})
      } else {
        this.setState({weatherToday: this.state.weatherStatuses.done.concat(worstToday.weather), date: today});
      }

    } catch (e){
      console.log(e);
    }
  };
  // divideWeatherByDay() {
  //   this.state.rainyDays
  //   const today = new Date()
  // }

};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    // justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    padding: 20
  },
});
