'use strict';

// If "pigpio.gpioSetISRFunc(BUTTON, pigpio.EITHER_EDGE, 0)" is not run before
// exiting the process, the following error will often occur the next time the
// program is run:
// initMboxBlock: init mbox zaps failed

var pigpio = require('bindings')('pigpio.node'),
  handlerCount = 0;

var BUTTON = 4,
  LED = 17;

pigpio.gpioInitialise();

setImmediate(function next() {
  handlerCount += 1;

  pigpio.gpioSetISRFunc(BUTTON, pigpio.EITHER_EDGE, 1, function(gpio, level, tick) {
    if (handlerCount % 1000 === 0) {
      console.log(handlerCount + ' - gpio: ' + gpio + ', level: ' + level + ', tick: ' + tick);
    }
    if (level !== pigpio.PI_TIMEOUT) {
      console.log(handlerCount + ' - gpio: ' + gpio + ', level: ' + level + ', tick: ' + tick);
      pigpio.gpioWrite(LED, level);
    }
  });

  setImmediate(next);
});

process.on('SIGINT', function () {
  pigpio.gpioSetISRFunc(BUTTON, pigpio.EITHER_EDGE, 0);
  pigpio.gpioTerminate();
  process.exit();
});

