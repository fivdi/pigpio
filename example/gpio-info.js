'use strict';

const Gpio = require('../').Gpio;

for (let gpioNo = Gpio.MIN_GPIO; gpioNo <= Gpio.MAX_GPIO; gpioNo += 1) {
  const gpio = new Gpio(gpioNo);

  console.log('GPIO ' + gpioNo + ':' +
    ' mode=' + gpio.getMode() +
    ' level=' + gpio.digitalRead()
  );
}

