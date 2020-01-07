'use strict';

// GPIO7 needs to be connected to GPIO8 with a 1K resistor for this test.

const assert = require('assert');
const Gpio = require('../').Gpio;
const input = new Gpio(7, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_OFF,
  alert: true
});
const output = new Gpio(8, {
  mode: Gpio.OUTPUT
});

let alertCount = 0;

output.digitalWrite(0);
input.glitchFilter(50);
input.on('alert', (level, tick) => {
  if (level === 1) {
    alertCount++;
    console.log('  rising edge, alertCount = ' + alertCount);
  }
});

output.trigger(30, 1); // alert function should not be executed (blocked by glitchFilter)

setTimeout(() => {
 output.trigger(70, 1); // alert function should be executed
}, 500);

setTimeout(() => {
  assert.strictEqual(alertCount, 1, 'expected 1 alert function call instead of ' + alertCount);
  console.log('  success...');
  process.exit(0);
}, 1000);

