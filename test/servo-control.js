'use strict';

const assert = require('assert');
const Gpio = require('../').Gpio;
const motor = new Gpio(17, {mode: Gpio.OUTPUT});

let pulseWidth = 500;

motor.servoWrite(0);
assert.strictEqual(motor.getServoPulseWidth(), 0,
  'expected pulseWidth to be 0'
);

const iv = setInterval(() => {
  motor.servoWrite(pulseWidth);

  const pulseWidthRead = motor.getServoPulseWidth();
  assert.strictEqual(pulseWidthRead, pulseWidth,
    'expected pulseWidth to be ' + pulseWidth + ', not ' + pulseWidthRead
  );

  pulseWidth += 25;
  if (pulseWidth > 2500) {
    pulseWidth = 500;
  }
}, 20);

setTimeout(() => {
  motor.digitalWrite(0);
  clearInterval(iv);
}, 2000);

