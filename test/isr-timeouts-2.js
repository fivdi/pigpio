'use strict';

var Gpio = require('../').Gpio,
  timeoutCount = 0,
  input = new Gpio(7, {mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE, timeout: 100});

input.on('interrupt', function (level) {
  if (level === Gpio.TIMEOUT) {
    timeoutCount++;
  }
});

setTimeout(function () {
  console.log('  ' + timeoutCount + ' timeouts detected (~10 expected)');

  input.enableInterrupt(Gpio.EITHER_EDGE, 1);
  timeoutCount = 0;

  setTimeout(function () {
    input.disableInterrupt();
    console.log('  ' + timeoutCount + ' timeouts detected (~1000 expected)');
  }, 1000);
}, 1000);

