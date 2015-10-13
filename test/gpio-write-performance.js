'use strict';

var pigpio = require('../'),
  time = process.hrtime(),
  ops,
  i;

pigpio.gpioInitialise();

for (i = 0; i !== 5000000; i += 1) {
  pigpio.gpioWrite(17,1);
  pigpio.gpioWrite(17,0);
}

time = process.hrtime(time);
ops = Math.floor((i * 2) / (time[0] + time[1] / 1E9));

console.log(ops + ' write ops per second');

