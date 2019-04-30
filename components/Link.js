import { Linking } from 'expo';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export default ({ url, onPress, ...props }) => (
  <TouchableOpacity
    onPress={() => {
      if (url) {
        Linking.openURL(url);
      }
      if (onPress) {
        onPress();
      }
    }}
    {...props}
  />
);
