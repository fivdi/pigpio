'use strict';

var Gpio = require('../'),
  iv,
  led = new Gpio(17, {mode: Gpio.OUTPUT}),
  dutyCycle = 0;

iv = setInterval(function () {
  led.analogWrite(dutyCycle);

  dutyCycle += 5;
  if (dutyCycle > 255) {
    dutyCycle = 0;
  }
}, 20);

setTimeout(function () {
  led.digitalWrite(0);
  clearInterval(iv);
}, 2000);

