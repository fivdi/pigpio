const assert = require('assert');
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const outPin = 17;
const outPut = new Gpio(outPin, {
  mode: Gpio.OUTPUT
});

let baud = 115200;
let dataBits = 8;
let stopBits = 1;
let offset = 0;
let message = "Hello world!";

outPut.waveAddSerial(baud, dataBits, stopBits, offset, message);

let waveId = outPut.waveCreate();

if(waveId >= 0) {
  outPut.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (outPut.waveTxBusy()) { }

outPut.waveDelete(waveId);


