import { GLView } from 'expo';
import * as React from 'react';
import { TouchableWithoutFeedback, Text, View } from 'react-native';

import Game from './src/game';

export default class App extends React.Component {
  state = {
    score: 0,
  };
  render() {
    const { style, ...props } = this.props;
    return (
      <View style={[{ flex: 1 }, style]}>
        <TouchableWithoutFeedback
          onPressIn={() => {
            if (this.game) this.game.onPress();
          }}
        >
          <GLView
            style={{ flex: 1, backgroundColor: 'black' }}
            onContextCreate={context => {
              this.game = new Game(context);
              this.game.onScore = score => this.setState({ score });
            }}
          />
        </TouchableWithoutFeedback>

        <Score>{this.state.score}</Score>
      </View>
    );
  }
}

const Score = ({ children }) => (
  <Text
    style={{
      position: 'absolute',
      left: 0,
      top: '10%',
      right: 0,
      textAlign: 'center',
      color: 'white',
      fontSize: 48,
    }}
  >
    {children}
  </Text>
);
