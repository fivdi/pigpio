'use strict';

// GPIO7 needs to be connected to GPIO8 with a 1K resistor for this test.

var assert = require('assert'),
  Gpio = require('../').Gpio,
  input = new Gpio(7, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_OFF,
    alert: true
  }),
  output = new Gpio(8, {
    mode: Gpio.OUTPUT
  }),
  count = 0;

output.digitalWrite(0);
input.glitchFilter(50);
input.on('alert', (level, tick) => {
  if (level === 1) {
    count++;
    console.log('  rising edge, count=' + count);
  }
});

output.trigger(30, 1); // alert function should not be executed (blocked by glitchFilter)

setTimeout(() => {
 output.trigger(70, 1); // alert function should be executed
}, 500);

setTimeout(() => {
  assert.strictEqual(count, 1, 'expected 1 alert function call instead of ' + count);
  console.log("  success...");
  process.exit(0);
}, 1000);

