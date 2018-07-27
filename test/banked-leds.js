'use strict';

const assert = require('assert');
const pigpio = require('../');
const Gpio = pigpio.Gpio;
const GpioBank = pigpio.GpioBank;

const led17 = new Gpio(17, {mode: Gpio.OUTPUT});
const led18 = new Gpio(18, {mode: Gpio.OUTPUT});
const bank1 = new GpioBank();

bank1.clear(1 << 18 | 1 << 17);
assert.strictEqual((bank1.read() >> 17) & 0x3, 0, 'expected 0');

const iv = setInterval(() => {
  const bits = (bank1.read() >> 17) & 0x3;

  if (bits === 0) {
    bank1.set(1 << 17);
    assert.strictEqual((bank1.read() >> 17) & 0x3, 1, 'expected 1');
  } else if (bits === 1) {
    bank1.clear(1 << 17);
    bank1.set(1 << 18);
    assert.strictEqual((bank1.read() >> 17) & 0x3, 2, 'expected 2');
  } else if (bits === 2) {
    bank1.set(1 << 17);
    bank1.set(1 << 18);
    assert.strictEqual((bank1.read() >> 17) & 0x3, 3, 'expected 3');
  } else if (bits === 3) {
    bank1.clear(1 << 17);
    bank1.clear(1 << 18);
    assert.strictEqual((bank1.read() >> 17) & 0x3, 0, 'expected 0');
  }
}, 250);

setTimeout(() => {
  bank1.clear(1 << 18 | 1 << 17);
  clearInterval(iv);
}, 2000);

