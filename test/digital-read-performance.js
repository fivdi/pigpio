'use strict';

const Gpio = require('../').Gpio;
const button = new Gpio(4, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN
});

const ITERATIONS = 2000000;

let time = process.hrtime();

for (let i = 0; i !== ITERATIONS; i += 1) {
  button.digitalRead();
}

time = process.hrtime(time);
const ops = Math.floor(ITERATIONS / (time[0] + time[1] / 1E9));

console.log('  ' + ops + ' read ops per second');

