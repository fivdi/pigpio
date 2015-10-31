'use strict';

var pigpio = require('bindings')('pigpio.node'),
  irqCount7 = 0,
  irqCount9 = 0;

var INPUTS = [7, 9],
  OUTPUTS = [8, 11];

pigpio.gpioInitialise();

OUTPUTS.forEach(function (output) {
  pigpio.gpioWrite(output, 0);
});

INPUTS.forEach(function (input) {
  pigpio.gpioSetISRFunc(input, pigpio.EITHER_EDGE, 0, function(gpio, level, tick) {
    if (gpio === 7) {
      irqCount7 += 1;
      if (irqCount7 < 10000) {
        pigpio.gpioWrite(8, level ^ 1);
      }
    } else if (gpio === 9) {
      irqCount9 += 1;
      if (irqCount9 < 10000) {
        pigpio.gpioWrite(11, level ^ 1);
      }
    }

    if (irqCount7 === 10000 & irqCount9 === 10000) {
      console.log('20000 interrupts detected');
      INPUTS.forEach(function (input) {
        pigpio.gpioSetISRFunc(input, pigpio.EITHER_EDGE, 0);
      });
    }
  });
});

setTimeout(function () {
  OUTPUTS.forEach(function (output) {
    pigpio.gpioWrite(output, 1);
  });
}, 10);

