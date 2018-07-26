'use strict';

const Gpio = require('../').Gpio;
const led = new Gpio(18, {mode: Gpio.OUTPUT});

led.hardwarePwmWrite(10, 500000);

setTimeout(() => {
  led.digitalWrite(0);
}, 2000);

