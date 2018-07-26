'use strict';

// GPIO7 needs to be connected to GPIO8 with a 1K resistor for this test.

const Gpio = require('../').Gpio;
const input = new Gpio(7, {mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE});
const output = new Gpio(8, {mode: Gpio.OUTPUT});

let interruptCount = 0;

output.digitalWrite(0);

input.on('interrupt', (level) => {
  interruptCount++;
  output.digitalWrite(level ^ 1);
});

setTimeout(() => {
  let time = process.hrtime();

  output.digitalWrite(1);

  setTimeout(() => {
    time = process.hrtime(time);

    const interruptsPerSec = Math.floor(interruptCount / (time[0] + time[1] / 1E9));

    console.log('  ' + interruptsPerSec + ' interrupts per second');

    input.disableInterrupt();
  }, 1000);
}, 1);

