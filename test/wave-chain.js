'use strict';

const assert = require('assert');
const pigpio = require('../');
const Gpio = pigpio.Gpio;

pigpio.configureClock(1, pigpio.CLOCK_PCM);

const iterations = 20;
const repetitions = 3;
const delay = 10;

const outPin = 17;
const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

output.digitalWrite(0);
pigpio.waveClear();

let firstWaveForm = [];
let secondWaveForm = [];
let result = [];

for (let x = 0; x < iterations; x++) {
  if (x % 2 === 0) {
    firstWaveForm.push({ gpioOn: outPin, gpioOff: 0, usDelay: delay });
  } else {
    firstWaveForm.push({ gpioOn: 0, gpioOff: outPin, usDelay: delay });
  }
}

pigpio.waveAddGeneric(firstWaveForm);
let firstWaveId = pigpio.waveCreate();

for (let x = 0; x < iterations; x++) {
  if (x % 2 === 0) {
    secondWaveForm.push({ gpioOn: outPin, gpioOff: 0, usDelay: delay });
  } else {
    secondWaveForm.push({ gpioOn: 0, gpioOff: outPin, usDelay: delay });
  }
}

pigpio.waveAddGeneric(secondWaveForm);
let secondWaveId = pigpio.waveCreate();

output.enableAlert();

output.on('alert', (level, tick) => {
  result.push([level, tick]);
  if (result.length === iterations + (iterations * repetitions)) {
    for (let r = 0; r < result.length; r++) {
      if (result[r + 1] !== undefined) {
        assert.strictEqual(Math.abs(delay - pigpio.tickDiff(result[r][1], result[r + 1][1])) < 10, true, 'Waves tick mismatch');
      } else {
        console.log('wave-chain test passed.');
      }
    }
    output.disableAlert();
  }
});

if (firstWaveId >= 0 && secondWaveId >= 0) {
  pigpio.waveChain([firstWaveId, 255, 0, secondWaveId,	255, 1, repetitions, 0]);
}

while (pigpio.waveTxBusy()) {}

pigpio.waveDelete(firstWaveId);
pigpio.waveDelete(secondWaveId);

