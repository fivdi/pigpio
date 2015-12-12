'use strict';

var Gpio = require('../').Gpio,
  iv,
  led = new Gpio(17, {mode: Gpio.OUTPUT});

iv = setInterval(function () {
  led.trigger(100, 1);
}, 2);

setTimeout(function () {
  led.digitalWrite(0);
  clearInterval(iv);
}, 2000);

