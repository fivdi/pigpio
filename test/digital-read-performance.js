'use strict';

var Gpio = require('../').Gpio,
  button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN
  }),
  time,
  ops,
  i;

time = process.hrtime();

for (i = 0; i !== 2000000; i += 1) {
  button.digitalRead();
}

time = process.hrtime(time);
ops = Math.floor(i / (time[0] + time[1] / 1E9));

console.log('  ' + ops + ' read ops per second');

