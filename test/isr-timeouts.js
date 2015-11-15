'use strict';

var Gpio = require('../').Gpio,
  timeoutCount = 0,
  input = new Gpio(7, {mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE, timeout: 10});

input.on('interrupt', function (level) {
  if (level === Gpio.TIMEOUT) {
    timeoutCount++;
  }
});

setTimeout(function () {
  console.log('  ' + timeoutCount + ' timeouts detected (~100 expected)');

  input.enableInterrupt(Gpio.EITHER_EDGE);
  timeoutCount = 0;

  setTimeout(function () {
    input.disableInterrupt();
    console.log('  ' + timeoutCount + ' timeouts detected (0 expected)');
  }, 1000);
}, 1000);

