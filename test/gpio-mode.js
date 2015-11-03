'use strict';

var assert = require('assert'),
  Gpio = require('../'),
  gpio7 = new Gpio(7, {mode: Gpio.INPUT}),
  gpio8 = new Gpio(8, {mode: Gpio.OUTPUT});

assert.strictEqual(gpio7.getPinMode(), Gpio.INPUT, 'expected INPUT mode for gpio7');
assert.strictEqual(gpio8.getPinMode(), Gpio.OUTPUT, 'expected OUTPUT mode for gpio8');

gpio8.pinMode(Gpio.INPUT);
assert.strictEqual(gpio8.getPinMode(), Gpio.INPUT, 'expected INPUT mode for gpio8');

gpio7.pinMode(Gpio.OUTPUT);
assert.strictEqual(gpio7.getPinMode(), Gpio.OUTPUT, 'expected OUTPUT mode for gpio7');

gpio7.pinMode(Gpio.INPUT);
assert.strictEqual(gpio7.getPinMode(), Gpio.INPUT, 'expected INPUT mode for gpio7');

