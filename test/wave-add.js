'use strict';

const assert = require('assert');
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

pigpio.configureClock(1, pigpio.CLOCK_PCM);

const iterations = 100;

const outPin = 17;
const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

output.digitalWrite(0);
output.waveClear();
  
let waveform = [];
let result = [];

for (let x = 0; x < iterations; x++) {
  if (x % 2 === 0) {
    waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: x + 1 });
  } else {
    waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: x + 1 });
  }
}

output.waveAddGeneric(waveform);

let waveId = output.waveCreate();

output.enableAlert();

output.on('alert', (level, tick) => {
  result.push([level, tick]);
  if (result.length === iterations) {
    for (let r = 0; r < result.length; r++) {
      if (result[r + 1] !== undefined) {
        assert.strictEqual(result[r][0], (waveform[r].gpioOn !== 0 ? 1 : 0), 'Waves level mismatch');
        assert.strictEqual(Math.abs(waveform[r].usDelay - pigpio.tickDiff(result[r][1], result[r + 1][1])) < 10, true, 'Waves tick mismatch');
      } else {
        console.log('wave-add test passed.');
      }
    }
    output.disableAlert();
  }
});

if (waveId >= 0) {
  output.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (output.waveTxBusy()) {}

output.waveDelete(waveId);