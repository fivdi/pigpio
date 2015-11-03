'use strict';

// For this test to work
// - GPIO7 needs to be connected to GPIO8 with a 1K resistor
// - GPIO9 needs to be connected to GPIO11 with a 1K resistor

var Gpio = require('../'),
  interruptCounts = [0, 0],
  inputs = [
    new Gpio(7, {mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE}),
    new Gpio(9, {mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE})
  ],
  outputs = [
    new Gpio(8, {mode: Gpio.OUTPUT}),
    new Gpio(11, {mode: Gpio.OUTPUT})
  ];

// Put inputs and outputs in a known state
outputs.forEach(function (output) {
  output.digitalWrite(0);
});

[0, 1].forEach(function (ix) {
  inputs[ix].on('interrupt', function (level) {
    interruptCounts[ix] += 1;
    outputs[ix].digitalWrite(level ^ 1);

    if (interruptCounts[ix] === 1000 * (ix + 1)) {
      console.log('  ' + interruptCounts[ix] + ' interrupts detected on input' + ix);
      inputs[ix].disableInterrupt();
    }
  });
});

setTimeout(function () {
  // Trigger first interrupts
  outputs.forEach(function (output) {
    output.digitalWrite(1);
  });
}, 1);

