'use strict';

const assert = require('assert');
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const iterations = 20;
const delay = 1000;

const outPin = 17;
const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

output.digitalWrite(0);
output.waveClear();

let waveform = [];

for (let x = 0; x < iterations; x++) {
  if (x % 2 === 0) {
    waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: delay });
  } else {
    waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: delay });
  }
}

assert.strictEqual(output.waveAddNew(), output, 'waveAddNew');

let waveLength = output.waveAddGeneric(waveform);

assert.strictEqual(waveLength, waveform.length, 'waveAddGeneric');

let waveId = output.waveCreate();

assert.strictEqual(waveId, 0, 'waveCreate'); // waveId should be 0 at this point

output.waveDelete(waveId);


// Create new waveform

output.waveAddGeneric(waveform);

let secondWaveId = output.waveCreate();

assert.strictEqual(secondWaveId, 0, 'waveDelete'); // waveId should be 0 again because old wave got deleted

assert.strictEqual(output.waveGetMicros(), iterations * delay, 'waveGetMicros');
assert.strictEqual(output.waveGetHighMicros(), iterations * delay, 'waveGetHighMicros');
assert.strictEqual(typeof output.waveGetMaxMicros(), 'number', 'waveGetMaxMicros');
assert.strictEqual(output.waveGetPulses(), iterations, 'waveGetPulses');
assert.strictEqual(output.waveGetHighPulses(), iterations, 'waveGetHighPulses');
assert.strictEqual(typeof output.waveGetMaxPulses(), 'number', 'waveGetMaxPulses');
assert.strictEqual(output.waveGetCbs(), iterations * 2, 'waveGetCbs');
assert.strictEqual(output.waveGetHighCbs(), iterations * 2, 'waveGetHighCbs');
assert.strictEqual(typeof output.waveGetMaxCbs(), 'number', 'waveGetMaxCbs');

if (waveId === 0) {
  output.waveTxSend(secondWaveId, pigpio.WAVE_MODE_REPEAT);
}

assert.strictEqual(output.waveTxBusy(), 1, 'waveTxBusy');

while (output.waveTxBusy()) {
  assert.strictEqual(output.waveTxAt(), secondWaveId, 'waveTxAt');
  assert.strictEqual(output.waveTxStop(), output, 'waveTxStop');
}


// Create new waveform

output.waveClear();

output.waveAddGeneric(waveform);

let thirdWaveId = output.waveCreate();

assert.strictEqual(thirdWaveId, 0, 'waveClear'); // waveId should be 0 again because waves got cleared

console.log('waves test passed');