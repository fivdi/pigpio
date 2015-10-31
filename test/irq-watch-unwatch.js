'use strict';

var pigpio = require('bindings')('pigpio.node');

var BUTTON = 4,
  LED = 17;

pigpio.gpioInitialise()

setInterval(function () {
  pigpio.gpioSetISRFunc(BUTTON, pigpio.EITHER_EDGE, 100, function(gpio, level, tick) {
    console.log('gpio: ' + gpio + ', level: ' + level + ', tick: ' + tick);
    if (level !== pigpio.PI_TIMEOUT) {
      pigpio.gpioWrite(LED, level);
    }
  });

  setTimeout(function () {
    pigpio.gpioSetISRFunc(BUTTON, pigpio.EITHER_EDGE, 0);
  }, 1000)
}, 2000);

/*setTimeout(function () {
  pigpio.gpioSetISRFunc(BUTTON, pigpio.EITHER_EDGE, 0);
}, 2000);*/

console.log('hit the button a few times');

