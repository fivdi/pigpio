'use strict';

var Gpio = require('../').Gpio,
  iv,
  led = new Gpio(17, {mode: Gpio.OUTPUT});

iv = setInterval(function () {
  led.digitalWrite(led.digitalRead() ^ 1);
}, 100);

setTimeout(function () {
  led.digitalWrite(0);
  clearInterval(iv);
}, 2000);

