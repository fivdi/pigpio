'use strict';

const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const outPin = 17;
const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

output.digitalWrite(0);
output.waveClear();

let firstWaveForm = [];
let secondWaveForm = [];

for (let x = 0; x < 10; x++) {
  if (x % 2 === 0) {
    firstWaveForm.push({ gpioOn: outPin, gpioOff: 0, usDelay: 10 });
  } else {
    firstWaveForm.push({ gpioOn: 0, gpioOff: outPin, usDelay: 10 });
  }
}

output.waveAddGeneric(firstWaveForm);
let firstWaveId = output.waveCreate();

for (let x = 0; x < 10; x++) {
  if (x % 2 === 0) {
    secondWaveForm.push({ gpioOn: outPin, gpioOff: 0, usDelay: 20 });
  } else {
    secondWaveForm.push({ gpioOn: 0, gpioOff: outPin, usDelay: 20 });
  }
}

output.waveAddGeneric(secondWaveForm);
let secondWaveId = output.waveCreate();

if (firstWaveId >= 0 && secondWaveId >= 0) {
  let chain = [firstWaveId, 255, 0, secondWaveId, 255, 1, 3, 0];
  output.waveChain(chain);
}

while (output.waveTxBusy()) {}

output.waveDelete(firstWaveId);
output.waveDelete(secondWaveId);