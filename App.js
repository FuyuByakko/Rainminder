/**
 * @format
 * @flow
 */
const {openweather} = require("./server/APIS");

import React, {Component} from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, Button } from 'react-native';
import axios from "axios";
import GetLocation from 'react-native-get-location';
import parseWeather from './src/utils/parseWeather.js';

import UserLocation from './src/components/UserLocation';

export default class App extends Component {
  state = {
    date: new Date(),
    rainyDays: [],
    weatherToday: "Check the Weather",
    weatherStatuses: {
      checking: "Getting the Weather",
      done: "Today's weather is: ",
    },
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Rain-minder</Text>
        </View>
        <View>
          <Text> {} </Text>
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
      </SafeAreaView>
    );
  }

  componentDidMount() {
    this.setState({weatherToday: this.state.weatherStatuses.checking})
    this.getWeather();
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
      
      const today = new Date();
      
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
        let todayDate = today.getUTCDate();
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
        this.setState({weatherToday: this.state.weatherStatuses.done.concat("FINE!")})
      } else {
        this.setState({weatherToday: this.state.weatherStatuses.done.concat(worstToday.weather)});
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
