'use strict';

var assert = require('assert'),
  Gpio = require('../').Gpio,
  iv,
  led = new Gpio(17, {mode: Gpio.OUTPUT}),
  dutyCycle = 0;

iv = setInterval(function () {
  var dutyCycleRead;

  led.pwmWrite(dutyCycle);

  dutyCycleRead = led.getPwmDutyCycle();
  assert.strictEqual(dutyCycleRead, dutyCycle,
    'expected dutyCycle to be ' + dutyCycle + ', not ' + dutyCycleRead
  );

  dutyCycle += 5;
  if (dutyCycle > 255) {
    dutyCycle = 0;
  }
}, 20);

setTimeout(function () {
  led.digitalWrite(0);
  clearInterval(iv);
}, 2000);

