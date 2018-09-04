'use strict';

const Gpio = require('../').Gpio;
const led = new Gpio(17, {mode: Gpio.OUTPUT});

const ITERATIONS = 2000000;

let time = process.hrtime();

for (let i = 0; i !== ITERATIONS; i += 1) {
  led.digitalWrite(1);
  led.digitalWrite(0);
}

time = process.hrtime(time);
const ops = Math.floor((ITERATIONS * 2) / (time[0] + time[1] / 1E9));

console.log('  ' + ops + ' write ops per second');

