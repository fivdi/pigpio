'use strict';

const assert = require('assert');
const Gpio = require('../').Gpio;
const led = new Gpio(18, {mode: Gpio.OUTPUT});

assert.strictEqual(led.getPwmRange(), 255, 'expected pwm range to be 255');
assert.strictEqual(led.getPwmRealRange(), 250, 'expected pwm real range to be 250');
assert.strictEqual(led.getPwmFrequency(), 800, 'expected get pwm frequency to be 800');

led.pwmRange(125);
assert.strictEqual(led.getPwmRange(), 125, 'expected pwm range to be 125');
assert.strictEqual(led.getPwmRealRange(), 250, 'expected pwm real range to be 250');
assert.strictEqual(led.getPwmFrequency(), 800, 'expected get pwm frequency to be 800');

led.pwmFrequency(2000);
assert.strictEqual(led.getPwmRange(), 125, 'expected pwm range to be 125');
assert.strictEqual(led.getPwmRealRange(), 100, 'expected pwm real range to be 100');
assert.strictEqual(led.getPwmFrequency(), 2000, 'expected get pwm frequency to be 2000');

const dutyCycle = Math.floor(led.getPwmRange() / 2);
led.pwmWrite(dutyCycle);
assert.strictEqual(led.getPwmDutyCycle(), dutyCycle, 'expected duty cycle to be ' + dutyCycle);

led.hardwarePwmWrite(1e7, 500000);
assert.strictEqual(led.getPwmRange(), 1e6, 'expected pwm range to be 1e6');
assert.strictEqual(led.getPwmRealRange(), 25, 'expected pwm real range to be 25');
assert.strictEqual(led.getPwmFrequency(), 1e7, 'expected get pwm frequency to be 1e7');
assert.strictEqual(led.getPwmDutyCycle(), 500000, 'expected duty cycle to be 500000');

led.digitalWrite(0);
assert.strictEqual(led.getPwmRange(), 125, 'expected pwm range to be 125');
assert.strictEqual(led.getPwmRealRange(), 100, 'expected pwm real range to be 100');
assert.strictEqual(led.getPwmFrequency(), 2000, 'expected get pwm frequency to be 2000');

