const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const outPin = 17;

const outPut = new Gpio(outPin, {
  mode: Gpio.OUTPUT
});
  
let waveform = [];

for (let x = 0; x < 20; x++) {
  if (x % 2 == 1) {
    waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: x + 1 });
  } else {
    waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: x + 1 });
  }
}

outPut.waveClear();

outPut.waveAddGeneric(waveform);

let waveId = outPut.waveCreate();

if (waveId >= 0) {
  outPut.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (outPut.waveTxBusy()) {}

outPut.waveDelete(waveId);