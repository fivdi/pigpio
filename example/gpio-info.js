'use strict';

var Gpio = require('../'),
  gpio,
  gpioNo;

for (gpioNo = 0; gpioNo <= 53; gpioNo += 1) {
  gpio = new Gpio(gpioNo);

  console.log('GPIO ' + gpioNo + ':' +
    ' mode=' + gpio.getPinMode() +
    ' level=' + gpio.digitalRead()
  );
}

