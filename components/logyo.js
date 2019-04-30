import { Constants } from 'expo';

let saidHello = false;

// From PIXI.js
export default function(type) {
  if (saidHello) {
    return;
  }

  if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
    console.log(
      '\n %c %c %c Expo Web ' +
        Constants.expoVersion +
        ' %c  %c ' +
        type +
        ' %c %c \n\n',
      'background: #4630EB; padding:5px 0;',
      'background: #4630EB; padding:5px 0;',
      'color: #ffffff; background: #030307; padding:5px 0;',
      'background: #4630EB; padding:5px 0;',
      'background: #4630EB; padding:5px 0;',
      'background: #4630EB; padding:5px 0;',
      'color: #4630EB; background: #fff; padding:5px 0;',
      'color: #4630EB; background: #fff; padding:5px 0;',
    );
  } else if (window.console) {
    console.log(
      'Expo Web ' + Constants.expoVersion + ' - ' + type + ' - www.expo.io',
    );
  }

  saidHello = true;
}
