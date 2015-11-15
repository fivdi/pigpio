'use strict';

var assert = require('assert'),
  Gpio = require('../').Gpio,
  iv,
  motor = new Gpio(17, {mode: Gpio.OUTPUT}),
  pulseWidth = 500;

motor.servoWrite(0);
assert.strictEqual(motor.getServoPulseWidth(), 0,
  'expected pulseWidth to be 0'
);

iv = setInterval(function () {
  var pulseWidthRead;

  motor.servoWrite(pulseWidth);

  pulseWidthRead = motor.getServoPulseWidth();
  assert.strictEqual(pulseWidthRead, pulseWidth,
    'expected pulseWidth to be ' + pulseWidth + ', not ' + pulseWidthRead
  );

  pulseWidth += 25;
  if (pulseWidth > 2500) {
    pulseWidth = 500;
  }
}, 20);

setTimeout(function () {
  motor.digitalWrite(0);
  clearInterval(iv);
}, 2000);

