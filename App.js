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
  state = {rainyDays: []}

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Rain-minder</Text>
        </View>
        <View>
          <Button title="check weather!" onPress={this.getWeather} />
          <Text>Rainy Days:</Text>
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
    try {
      const position = await this.getLoc();
      console.log("got position: ", position)
      const API = process.env.WEATHER_API || openweather;
      // axios ('/weather')
      const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${position.lat}&lon=${position.lon}&APPID=${API}`;
      const info = {
        method: 'POST',
        url,
        data: position,
      };
      const weather = await axios(info);
      this.setState({rainyDays: parseWeather(weather.data)});
    } catch (e){
      console.log(e);
    }
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
