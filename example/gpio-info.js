'use strict';

var Gpio = require('../'),
  gpio,
  gpioNo;

for (gpioNo = Gpio.MIN_GPIO; gpioNo <= Gpio.MAX_GPIO; gpioNo += 1) {
  gpio = new Gpio(gpioNo);

  console.log('GPIO ' + gpioNo + ':' +
    ' mode=' + gpio.getPinMode() +
    ' level=' + gpio.digitalRead()
  );
}

