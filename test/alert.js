'use strict';

const Gpio = require('../').Gpio;
const button = new Gpio(4, {alert: true});

button.on('alert', (level, tick) => {
  console.log(level + ' ' + tick);
});

console.log('  press the momentary push button a few times');

