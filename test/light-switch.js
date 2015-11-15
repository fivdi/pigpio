'use strict';

var Gpio = require('../').Gpio,
  button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
  }),
  led = new Gpio(17, {mode: Gpio.OUTPUT});

button.on('interrupt', function (level) {
  led.digitalWrite(level);
});

setTimeout(function () {
  led.digitalWrite(0);
  button.disableInterrupt();
}, 2000);

console.log('  press the momentary push button a few times');

