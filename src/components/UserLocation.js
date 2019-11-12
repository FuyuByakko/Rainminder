import React from 'react';
import {View, Text, Button} from 'react-native';
import GetLocation from 'react-native-get-location';

export default class UserLocation extends React.Component {
  state = {
    position: null,
    showPos: false,
    location: null,
  };

  handleClick = () => {
    this.setState(previousState => ({showPos: !previousState.showPos}));
  }

  getLoc = async () => {
    let location = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    this.setState(previousState => ({
      showPos: !previousState.showPos,
      location: {lat: location.latitude, lon: location.longitude}
    }));
    console.log(location);
  }

  render() {
    let additionalField;
    // let location;
    if (this.state.showPos) {
      additionalField = <Text>Lat: {this.state.location.lat}, Log: {this.state.location.lon}</Text>;
    } else {
      additionalField = <Text>It should be hidden</Text>;
    }
    return (
      <View>
        <Text>{this.props.propTest}</Text>
        <Button title="works!" onPress={this.getLoc} />
        {additionalField}
      </View>
    )
  }
}
