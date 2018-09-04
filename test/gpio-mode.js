'use strict';

const assert = require('assert');
const Gpio = require('../').Gpio;
const gpio7 = new Gpio(7, {mode: Gpio.INPUT});
const gpio8 = new Gpio(8, {mode: Gpio.OUTPUT});

assert.strictEqual(gpio7.getMode(), Gpio.INPUT, 'expected INPUT mode for gpio7');
assert.strictEqual(gpio8.getMode(), Gpio.OUTPUT, 'expected OUTPUT mode for gpio8');

gpio8.mode(Gpio.INPUT);
assert.strictEqual(gpio8.getMode(), Gpio.INPUT, 'expected INPUT mode for gpio8');

gpio7.mode(Gpio.OUTPUT);
assert.strictEqual(gpio7.getMode(), Gpio.OUTPUT, 'expected OUTPUT mode for gpio7');

gpio7.mode(Gpio.INPUT);
assert.strictEqual(gpio7.getMode(), Gpio.INPUT, 'expected INPUT mode for gpio7');

