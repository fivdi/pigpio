'use strict';

const Gpio = require('../').Gpio;

const led = new Gpio(17, {mode: Gpio.OUTPUT});

setInterval(() => {
  led.digitalWrite(led.digitalRead() ^ 1);
}, 100);

