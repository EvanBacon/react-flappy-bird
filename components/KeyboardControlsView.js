import React from 'react';

class KeyboardControlsView extends React.PureComponent {
  static defaultProps = {
    onKeyDown: () => {},
    onKeyUp: () => {},
  };

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyDown = e => {
    this.props.onKeyDown(e);
  };

  onKeyUp = e => {
    this.props.onKeyUp(e);
  };

  render() {
    return this.props.children;
  }
}

export default KeyboardControlsView;
