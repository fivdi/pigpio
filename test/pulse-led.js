'use strict';

const assert = require('assert');
const Gpio = require('../').Gpio;
const led = new Gpio(17, {mode: Gpio.OUTPUT});

let dutyCycle = 0;

const iv = setInterval(() => {
  led.pwmWrite(dutyCycle);

  const dutyCycleRead = led.getPwmDutyCycle();
  assert.strictEqual(dutyCycleRead, dutyCycle,
    'expected dutyCycle to be ' + dutyCycle + ', not ' + dutyCycleRead
  );

  dutyCycle += 5;
  if (dutyCycle > 255) {
    dutyCycle = 0;
  }
}, 20);

setTimeout(() => {
  led.digitalWrite(0);
  clearInterval(iv);
}, 2000);

