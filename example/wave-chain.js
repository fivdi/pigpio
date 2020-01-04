const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;


const outPin = 17;
const outPut = new Gpio(outPin, {
  mode: Gpio.OUTPUT
});

outPut.waveClear();

let firstWaveForm = [];
let secondWaveForm = [];

for (let x = 0; x < 10; x++) {
  if (x % 2 == 0) {
    firstWaveForm.push({ gpioOn: outPin, gpioOff: 0, usDelay: 10 });
  } else {
    firstWaveForm.push({ gpioOn: 0, gpioOff: outPin, usDelay: 10 });
  }
}

outPut.waveAddGeneric(firstWaveForm);
let firstWaveId = outPut.waveCreate();


for (let x = 0; x < 10; x++) {
  if (x % 2 == 0) {
    secondWaveForm.push({ gpioOn: outPin, gpioOff: 0, usDelay: 20 });
  } else {
    secondWaveForm.push({ gpioOn: 0, gpioOff: outPin, usDelay: 20 });
  }
}

outPut.waveAddGeneric(secondWaveForm);
let secondWaveId = outPut.waveCreate();

if (firstWaveId >= 0 && secondWaveId >= 0) {
  outPut.waveChain([firstWaveId, 255, 0, secondWaveId,	255, 1, 3, 0]);
}

while (outPut.waveTxBusy()) {}

outPut.waveDelete(firstWaveId);
outPut.waveDelete(secondWaveId);