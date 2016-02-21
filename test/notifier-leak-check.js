'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  Notifier = pigpio.Notifier,
  notifierCount = 0;

var LED_GPIO = 18,
  FREQUENCY = 25000;

(function () {
  var led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});

  led.hardwarePwmWrite(FREQUENCY, 500000);
}());

(function next() {
  var ledNotifier = new Notifier({bits: 1 << LED_GPIO}),
    closing = false;

  ledNotifier.stream().on('data', function (buf) {
    if (!closing) {
      ledNotifier.stream().on('close', function () {
        notifierCount += 1;

        if (notifierCount % 1000 === 0) {
          console.log(notifierCount);
        }

        if (notifierCount < 100000) {
          next();
        }
      });

      ledNotifier.close();
      closing = true;
    }
  });
}());

