'use strict';

var pigpio = require('bindings')('pigpio.node');

var BUTTON = 4,
  LED = 17;

pigpio.gpioInitialise()

pigpio.gpioSetISRFunc(BUTTON, pigpio.EITHER_EDGE, 0, function(gpio, level, tick) {
  console.log('gpio: ' + gpio + ', level: ' + level);
  pigpio.gpioWrite(LED, level);
});

setTimeout(function () {
  pigpio.gpioSetISRFunc(BUTTON, pigpio.EITHER_EDGE, 0);
}, 2000);

console.log('hit the button a few times');

