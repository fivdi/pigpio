'use strict';

var Gpio = require('../').Gpio,
  iv,
  led = new Gpio(18, {mode: Gpio.OUTPUT});

led.hardwarePwmWrite(10, 500000);

setTimeout(function () {
  led.digitalWrite(0);
}, 2000);

