import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Linking, Constants } from 'expo';

let saidHello = false;

// From PIXI.js
function sayHello(type) {
  if (saidHello) {
    return;
  }

  if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
    console.log(
      '\n %c %c %c Expo Web ' +
        Constants.expoVersion +
        ' %c  %c  www.expo.io  %c %c \n\n',
      'background: #4630EB; padding:5px 0;',
      'background: #4630EB; padding:5px 0;',
      'color: #ffffff; background: #030307; padding:5px 0;',
      'background: #4630EB; padding:5px 0;',
      'background: #4630EB; padding:5px 0;',
      'background: #4630EB; padding:5px 0;',
      'color: #4630EB; background: #fff; padding:5px 0;',
    );
  } else if (window.console) {
    console.log(
      'Expo Web ' + Constants.expoVersion + ' - ' + type + ' - www.expo.io',
    );
  }

  saidHello = true;
}

sayHello('Bacon');

const ExpoButton = () => (
  <TouchableOpacity
    onPress={() => {
      Linking.openURL(
        'https://blog.expo.io/expo-cli-and-sdk-web-support-beta-d0c588221375',
      );
    }}
    style={{ position: 'absolute', bottom: 8, left: 8 }}
  >
    <View style={{ opacity: 0.5, flexDirection: 'row', alignItems: 'center' }}>
      <Image
        style={{ width: 36, height: 36 }}
        source={{
          uri:
            'https://d30j33t1r58ioz.cloudfront.net/static/brand/logo-b-black-228x228.png',
        }}
      />
      <Text style={{ fontWeight: '600' }}>Expo</Text>
    </View>
  </TouchableOpacity>
);

export default ExpoButton;
