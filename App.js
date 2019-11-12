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
  state = {}

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Rain-minder</Text>
        </View>
        <View>
          <Text>USER LOCATION:</Text>
          <Button title="check weather!" onPress={this.getLoc} />
          <UserLocation propTest='props passed' />
        </View>
      </SafeAreaView>
    );
  }

  getLoc = async () => {
    const location = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    // console.log(location);
    const position = {lat: location.latitude, lon: location.longitude};
    this.getWeatherForLoc(position);
  };

  getWeatherForLoc = async (position) => {
    const API = process.env.WEATHER_API || openweather;
    // console.log("got position: ", position)
    // axios ('/weather')
    const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${position.lat}&lon=${position.lon}&APPID=${API}`;
    const info = {
      method: 'POST',
      url,
      data: position,
    };
    const weather = await axios(info);
    parseWeather(weather.data);
  };
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
