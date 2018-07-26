'use strict';

const Gpio = require('../').Gpio;
const button = new Gpio(4, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.EITHER_EDGE
});
const led = new Gpio(17, {mode: Gpio.OUTPUT});

button.on('interrupt', (level) => {
  led.digitalWrite(level);
});

setTimeout(() => {
  led.digitalWrite(0);
  button.disableInterrupt();
}, 2000);

console.log('  press the momentary push button a few times');

