'use strict';

var pigpio = require('bindings')('pigpio.node'),
  leds = [5, 6, 12, 13, 16, 17, 19, 20, 21, 26],
  dutycycle = 0;

pigpio.gpioInitialise();

setInterval(function () {
  leds.forEach(function (led) {
    pigpio.gpioPWM(led, dutycycle);
  });

  dutycycle += 5;
  if (dutycycle > 255) {
    dutycycle = 0;
  }
}, 20);

