'use strict';

var assert = require('assert'),
  Gpio = require('../').Gpio,
  iv,
  led = new Gpio(17, {mode: Gpio.OUTPUT}),
  dutyCycle = 0;

assert.strictEqual(led.getPwmRange(), 255, 'expected pwm range to be 255');
assert.strictEqual(led.getPwmRealRange(), 250, 'expected pwm real range to be 250');
assert.strictEqual(led.getPwmFrequency(), 800, 'expected get pwm frequency to be 800');

led.pwmRange(125);
assert.strictEqual(led.getPwmRange(), 125, 'expected pwm range to be 125');
assert.strictEqual(led.getPwmRealRange(), 250, 'expected pwm real range to be 250');
assert.strictEqual(led.getPwmFrequency(), 800, 'expected get pwm frequency to be 800');

led.pwmFrequency(2000)
assert.strictEqual(led.getPwmRange(), 125, 'expected pwm range to be 125');
assert.strictEqual(led.getPwmRealRange(), 100, 'expected pwm real range to be 100');
assert.strictEqual(led.getPwmFrequency(), 2000, 'expected get pwm frequency to be 2000');

