import { GLView } from 'expo';
import * as React from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';

import DisableBodyScrollingView from './components/DisableBodyScrollingView';
import ExpoButton from './components/ExpoButton';
import GithubButton from './components/GithubButton';
import KeyboardControlsView from './components/KeyboardControlsView';
import logyo from './components/logyo';
import Game from './src/game';

logyo('https://twitter.com/baconbrix');
export default class App extends React.Component {
  state = {
    score: 0,
  };
  render() {
    const { style, ...props } = this.props;
    return (
      <View
        style={[{ width: '100vw', height: '100vh', overflow: 'hidden' }, style]}
      >
        <DisableBodyScrollingView>
          <KeyboardControlsView
            onKeyDown={({ code }) => {
              if (this.game) {
                if (code === 'Space') {
                  this.game.onPress();
                }
              }
            }}
          >
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
          </KeyboardControlsView>
        </DisableBodyScrollingView>
        <ExpoButton />
        <GithubButton />
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
      userSelect: 'none',
    }}
  >
    {children}
  </Text>
);
