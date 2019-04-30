import React from 'react';
import { Image } from 'react-native';

import Link from './Link';

export default () => (
  <Link
    url="https://github.com/evanbacon/react-native-flappy-bird"
    style={{
      userSelect: 'none',
      textDecoration: 'none',
      position: 'absolute',
      bottom: 8,
      padding: 8,
      right: 8,
    }}
  >
    <Image
      style={{ opacity: 0.5, userSelect: 'none', width: 24, height: 24 }}
      source={{
        uri: 'https://image.flaticon.com/icons/svg/25/25231.svg',
      }}
    />
  </Link>
);
