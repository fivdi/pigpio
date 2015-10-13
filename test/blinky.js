'use strict';

var pigpio = require('../');

pigpio.gpioInitialise();

setInterval(function () {
  pigpio.gpioWrite(17, 1);
  setTimeout(function () {
    pigpio.gpioWrite(17, 0);
  }, 250);
}, 500);

