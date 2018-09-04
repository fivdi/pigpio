'use strict';

// For this test to work
// - GPIO7 needs to be connected to GPIO8 with a 1K resistor
// - GPIO9 needs to be connected to GPIO11 with a 1K resistor

const Gpio = require('../').Gpio;

[[7, 8], [9, 11]].forEach((gpioNos) => {
  const input = new Gpio(gpioNos[0], {mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE});
  const output = new Gpio(gpioNos[1], {mode: Gpio.OUTPUT});

  let interruptCount= 0;

  // Put input and output in a known state
  output.digitalWrite(0);

  input.on('interrupt', (level) => {
    interruptCount += 1;
    output.digitalWrite(level ^ 1);

    if (interruptCount === 1000) {
      console.log('  ' + interruptCount + ' interrupts detected on GPIO' + gpioNos[0]);
      input.disableInterrupt();
    }
  });

  setTimeout(() => {
    // Trigger first interrupt
    output.digitalWrite(1);
  }, 1);
});

