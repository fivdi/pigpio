'use strict';

const Gpio = require('../').Gpio;

const button = new Gpio(23, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  alert: true
});

let count = 0;

// Level must be stable for 10 ms before an alert event is emitted.
button.glitchFilter(10000);

button.on('alert', (level, tick) => {
  if (level === 0) {
    console.log(++count);
  }
});

