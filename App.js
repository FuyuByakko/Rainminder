/**
 * @format
 * @flow
 */
const {openweather} = require('./server/APIS');

import React, {Component} from 'react';
import { SafeAreaView, StyleSheet, View, Text, Picker, Button } from 'react-native';
import axios from 'axios';
import GetLocation from 'react-native-get-location';
import parseWeather from './src/utils/parseWeather.js';
import timer from 'react-native-timer';

// import UserLocation from './src/components/UserLocation';

export default class App extends Component {
  state = {
    date: '',
    rainyDays: [],
    rainyToday: false,
    typeOfRain: '',
    weatherToday: 'Check the Weather',
    weatherStatuses: {
      checking: 'Getting the Weather',
      done: "Today's weather is: ",
    },
    selectedHour: '00',
    selectedMinutes: '00',
    warningTime: 2,
    timerName: 'wait-for-it',
    finishedTimer: null,
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.titleText} >Rain-minder</Text>
        </View>
        <View>
          <Button title="check weather!" onPress={this.getWeather} />
          <Text style={styles.weatherResult}> {this.state.weatherToday} </Text>
          {/* {{ for(entry of this.state.rainyDays) {
            <Text>{this.state.rainyDays}</Text>
          }
        }} */}

          {/* <UserLocation propTest='props passed' /> */}
        </View>
        <View style={styles.setTimerContainer}>

          <Text style={styles.setTimerText} > 
            SELECT THE TIME YOU WILL LEAVE HOME: 
            {this.state.selectedHour + ':' + this.state.selectedMinutes}
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={this.state.selectedHour}
              style={styles.picker}
              onValueChange={itemValue => this.setState({selectedHour: itemValue})}>
              {/* {["05","06","07","08","09","10", "11", "12"].map(value => (<Picker.Item label=`${value}` value=`${value}` />))} */}
              <Picker.Item label="00" value="00" />
              <Picker.Item label="05" value="05" />
              <Picker.Item label="06" value="06" />
              <Picker.Item label="07" value="07" />
              <Picker.Item label="08" value="08" />
              <Picker.Item label="09" value="09" />
              <Picker.Item label="10" value="10" />
              <Picker.Item label="11" value="11" />
              <Picker.Item label="12" value="12" />
              <Picker.Item label="13" value="13" />
              <Picker.Item label="14" value="14" />
              <Picker.Item label="15" value="15" />
              <Picker.Item label="16" value="16" />
              <Picker.Item label="17" value="17" />
              <Picker.Item label="18" value="18" />
            </Picker>
            <Picker
              selectedValue={this.state.selectedMinutes}
              style={styles.picker}
              onValueChange={itemValue => this.setState({selectedMinutes: itemValue})}>
              <Picker.Item label="00" value="00" />
              <Picker.Item label="05" value="05" />
              <Picker.Item label="10" value="10" />
              <Picker.Item label="15" value="15" />
              <Picker.Item label="20" value="20" />
              <Picker.Item label="25" value="25" />
              <Picker.Item label="30" value="30" />
              <Picker.Item label="35" value="35" />
              <Picker.Item label="40" value="40" />
              <Picker.Item label="45" value="45" />
              <Picker.Item label="50" value="50" />
              <Picker.Item label="55" value="55" />
            </Picker>
          </View>
          <Button title="SET TIMER!" onPress={this.setCheck} />
          <Text> You will be warned {this.state.warningTime} minutes in advance. </Text>
          {this.renderTimerResult()}
        </View>
      </SafeAreaView>
    );
  }

  componentDidMount() {
    this.getWeather();
  }

  setCheck = () => {
    const date = new Date(this.state.date)
    const offset = date.getTimezoneOffset() / 60;
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    const selectedTime = Date.UTC(
      year,
      month,
      day,
      Number(this.state.selectedHour) + offset,
      Number(this.state.selectedMinutes),
    );
    const timeNow = Date.now();
    const timeToWarn = selectedTime - this.state.warningTime * 60 * 1000;
    console.log('Time To Warn: ' + new Date(timeToWarn));
    console.log('Time Now: ' + new Date(timeNow));
    console.log('Wait time: ' + (timeToWarn - timeNow));

    timer.setTimeout(
      this.state.timerName,
      () => {
        console.info('TIMER DOOONE');
        this.setState({finishedTimer: true});
      },
      timeToWarn - Date.now()
    );

    this.setState({finishedTimer: false});
  };

  clearCheck = () => {
    if (timer.timeoutExists(this.state.timerName)) {
      console.info('timer cleared!');
      clearTimeout(this.state.timerName);
    }
  };

  renderTimerResult = () => {
    if (this.state.finishedTimer === null) { return }
    if (timer.timeoutExists(this.state.timerName)) {
      return <Button title="CLEARTIMER!" onPress={this.clearCheck} />
    } else {
      let text;
      if (this.state.rainyToday) {
        text = `Don't forget an Umbrella!\n ${this.state.typeOfRain} out there today!`;
      } else {
        text = 'Have a nice day!\nIt\'s fine outside!';
      }
      return <Text style={styles.weatherResult}>{text}</Text>;
    }
  };

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
      console.info(e);
    }
  };

  getWeather = async () => {
    this.setState({
      weatherToday: this.state.weatherStatuses.checking,
      rainyToday: false,
    });
    try {
      const position = await this.getLoc();
      console.info('got position: ', position);
      const API = process.env.WEATHER_API || openweather;
      // axios ('/weather')
      const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${position.lat}&lon=${position.lon}&APPID=${API}`;
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
        /**
         * 2 is THunderstorms, so highest priority
         * 5 is Rain
         * 3 is Drizzle
         * */
        if (curPointDate === todayDate) {
          console.log('comparison passed');
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
        this.setState({
          weatherToday: this.state.weatherStatuses.done.concat('FINE!'),
          date: today,
        });
      } else {
        this.setState({
          weatherToday: this.state.weatherStatuses.done.concat(worstToday.weather),
          date: today,
          rainyToday: true,
          typeOfRain: worstToday.weather,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    // justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    padding: 20,
  },
  title: {
    width: 500,
    backgroundColor: 'azure',
    height: 100,
    marginBottom: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 50,
  },
  weatherResult: {
    fontSize: 40,
    marginVertical: 20,
    textAlign: 'center',
  },
  setTimerContainer: {
    marginVertical: 30,
  },
  setTimerText: {
    fontSize: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
  },
  picker: {
    flex: 1,
    height: 50,
    width: 100,
    backgroundColor: '#f9c2ff',
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
