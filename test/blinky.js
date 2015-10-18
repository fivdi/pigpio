'use strict';

var pigpio = require('../'),
  iv;

var LED = 17;

pigpio.gpioInitialise();

iv = setInterval(function () {
  pigpio.gpioWrite(LED, pigpio.gpioRead(LED) ^ 1);
}, 100);

setTimeout(function () {
  pigpio.gpioWrite(LED, 0);
  clearInterval(iv);
}, 2000);

