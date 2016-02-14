'use strict';

var Gpio = require('../').Gpio,
  button = new Gpio(4, {alert: true});

button.on('alert', function (level, tick) {
  console.log(level + ' ' + tick);
});

console.log('  press the momentary push button a few times');

