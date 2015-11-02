'use strict';

var Gpio = require('../'),
  led = new Gpio(17, {mode: Gpio.OUTPUT});

setInterval(function () {
  led.digitalWrite(led.digitalRead() ^ 1);
}, 100);

