'use strict';

const assert = require('assert');
const pigpio = require('../');
const Gpio = pigpio.Gpio;

const iterations = 20;
const delay = 1000;

const outPin = 17;
const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

output.digitalWrite(0);
pigpio.waveClear();

let waveform = [];

for (let x = 0; x < iterations; x++) {
  if (x % 2 === 0) {
    waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: delay });
  } else {
    waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: delay });
  }
}

let waveLength = pigpio.waveAddGeneric(waveform);

assert.strictEqual(waveLength, waveform.length, 'waveAddGeneric');

let waveId = pigpio.waveCreate();

assert.strictEqual(waveId, 0, 'waveCreate'); // waveId should be 0 at this point

pigpio.waveDelete(waveId);


// Create new waveform

pigpio.waveAddGeneric(waveform);

let secondWaveId = pigpio.waveCreate();

assert.strictEqual(secondWaveId, 0, 'waveDelete'); // waveId should be 0 again because old wave got deleted

assert.strictEqual(pigpio.waveGetMicros(), iterations * delay, 'waveGetMicros');
assert.strictEqual(pigpio.waveGetHighMicros(), iterations * delay, 'waveGetHighMicros');
assert.strictEqual(typeof pigpio.waveGetMaxMicros(), 'number', 'waveGetMaxMicros');
assert.strictEqual(pigpio.waveGetPulses(), iterations, 'waveGetPulses');
assert.strictEqual(pigpio.waveGetHighPulses(), iterations, 'waveGetHighPulses');
assert.strictEqual(typeof pigpio.waveGetMaxPulses(), 'number', 'waveGetMaxPulses');
assert.strictEqual(pigpio.waveGetCbs(), iterations * 2, 'waveGetCbs');
assert.strictEqual(pigpio.waveGetHighCbs(), iterations * 2, 'waveGetHighCbs');
assert.strictEqual(typeof pigpio.waveGetMaxCbs(), 'number', 'waveGetMaxCbs');

if (waveId === 0) {
  pigpio.waveTxSend(secondWaveId, pigpio.WAVE_MODE_REPEAT);
}

assert.strictEqual(pigpio.waveTxBusy(), 1, 'waveTxBusy');

while (pigpio.waveTxBusy()) {
  assert.strictEqual(pigpio.waveTxAt(), secondWaveId, 'waveTxAt');
  pigpio.waveTxStop();
}


// Create new waveform

pigpio.waveClear();

pigpio.waveAddGeneric(waveform);

let thirdWaveId = pigpio.waveCreate();

assert.strictEqual(thirdWaveId, 0, 'waveClear'); // waveId should be 0 again because waves got cleared

console.log('waves test passed');

