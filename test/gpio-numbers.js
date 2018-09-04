'use strict';

const assert = require('assert');
const Gpio = require('../').Gpio;

assert.strictEqual(Gpio.MIN_GPIO, 0, 'expected Gpio.MIN_GPIO to be 0');
assert.strictEqual(Gpio.MAX_GPIO, 53, 'expected Gpio.MAX_GPIO to be 53');
assert.strictEqual(Gpio.MAX_USER_GPIO, 31, 'expected Gpio.MAX_USER_GPIO to be 31');

