'use strict';

// GPIO7 needs to be connected to GPIO8 with a 1K resistor for this test.

var Gpio = require('../').Gpio,
  interruptCount = 0,
  input = new Gpio(7, {mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE}),
  output = new Gpio(8, {mode: Gpio.OUTPUT});

output.digitalWrite(0);

input.on('interrupt', function (level) {
  interruptCount++;
  output.digitalWrite(level ^ 1);
});

setTimeout(function () {
  var time = process.hrtime();

  output.digitalWrite(1);

  setTimeout(function () {
    var interruptsPerSec;

    time = process.hrtime(time);
    interruptsPerSec = Math.floor(interruptCount / (time[0] + time[1] / 1E9));

    console.log('  ' + interruptsPerSec + ' interrupts per second');

    input.disableInterrupt();
  }, 1000);
}, 1);

