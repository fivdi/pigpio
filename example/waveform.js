var outPin = 17;

var Gpio = require('pigpio').Gpio,
  out = new Gpio(outPin, {
    mode: Gpio.OUTPUT
  });
  
(function () {
  var waveform = [];
  
  var x = 0;
  for (x=0; x < 10; x++) {
    if (x % 2 == 0) {
      waveform[x] = { gpioOn:(1 << outPin), gpioOff:0, usDelay:20 };
    } else {
      waveform[x] = { gpioOn:0, gpioOff:(1 << outPin), usDelay:20 };
    }
  }
  
  for (x=10; x < 20; x++) {
    if (x % 2 == 0) {
      waveform[x] = { gpioOn:(1 << outPin), gpioOff:0, usDelay:30 };
    } else {
      waveform[x] = { gpioOn:0, gpioOff:(1 << outPin), usDelay:30 };
    }
  }
  
  for (x=20; x < 30; x++) {
    if (x % 2 == 0) {
      waveform[x] = { gpioOn:(1 << outPin), gpioOff:0, usDelay:20 };
    } else {
      waveform[x] = { gpioOn:0, gpioOff:(1 << outPin), usDelay:20 };
    }
  }
  
  Gpio.waveClear();
  
  Gpio.waveAddGeneric(waveform.length, waveform);
  
  var waveId = Gpio.waveCreate();

  if (waveId >= 0) {
    Gpio.waveTxSend(waveId, Gpio.WAVE_MODE_ONE_SHOT);
  }

  while (Gpio.waveTxBusy()) {}
  
  Gpio.waveDelete(waveId);
  
}());