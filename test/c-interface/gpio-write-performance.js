'use strict';

var pigpio = require('bindings')('pigpio.node'),
  time,
  ops,
  i;

var LED = 17;

pigpio.gpioInitialise();

time = process.hrtime();

for (i = 0; i !== 2000000; i += 1) {
  pigpio.gpioWrite(LED, 1);
  pigpio.gpioWrite(LED, 0);
}

time = process.hrtime(time);
ops = Math.floor((i * 2) / (time[0] + time[1] / 1E9));

console.log(ops + ' write ops per second');

