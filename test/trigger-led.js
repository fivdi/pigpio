'use strict';

const Gpio = require('../').Gpio;
const led = new Gpio(17, {mode: Gpio.OUTPUT});

const iv = setInterval(() => {
  led.trigger(100, 1);
}, 2);

setTimeout(() => {
  led.digitalWrite(0);
  clearInterval(iv);
}, 2000);

