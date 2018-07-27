'use strict';

const assert = require('assert');
const Gpio = require('../').Gpio;
const input = new Gpio(22, {mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP});

assert.strictEqual(input.digitalRead(), 1, 'expected gpio22 to be 1');
input.pullUpDown(Gpio.PUD_DOWN);
assert.strictEqual(input.digitalRead(), 0, 'expected gpio22 to be 0');

