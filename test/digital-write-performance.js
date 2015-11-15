'use strict';

var Gpio = require('../').Gpio,
  led = new Gpio(17, {mode: Gpio.OUTPUT}),
  time,
  ops,
  i;

time = process.hrtime();

for (i = 0; i !== 2000000; i += 1) {
  led.digitalWrite(1);
  led.digitalWrite(0);
}

time = process.hrtime(time);
ops = Math.floor((i * 2) / (time[0] + time[1] / 1E9));

console.log('  ' + ops + ' write ops per second');

