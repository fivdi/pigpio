'use strict';

const pigpio = require('../');
const Gpio = pigpio.Gpio;

const outPin = 17;

const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

output.digitalWrite(0);
pigpio.waveClear();

let waveform = [];

for (let x = 0; x < 20; x++) {
  if (x % 2 === 1) {
    waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: x + 1 });
  } else {
    waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: x + 1 });
  }
}

pigpio.waveAddGeneric(waveform);

let waveId = pigpio.waveCreate();

if (waveId >= 0) {
  pigpio.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (pigpio.waveTxBusy()) {}

pigpio.waveDelete(waveId);

