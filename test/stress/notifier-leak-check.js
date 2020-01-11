'use strict';

const pigpio = require('../../');
const Gpio = pigpio.Gpio;
const Notifier = pigpio.Notifier;

const LED_GPIO = 18;
const FREQUENCY = 25000;

let notifierCount = 0;

const startPwm = () => {
  const led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});

  led.hardwarePwmWrite(FREQUENCY, 500000);
};

const createNotifier = () => {
  const ledNotifier = new Notifier({bits: 1 << LED_GPIO});
  let closing = false;

  ledNotifier.stream().on('data', (buf) => {
    if (!closing) {
      ledNotifier.stream().on('close', () => {
        notifierCount += 1;

        if (notifierCount % 1000 === 0) {
          console.log(notifierCount);
        }

        if (notifierCount < 100000) {
          createNotifier();
        }
      });

      ledNotifier.close();
      closing = true;
    }
  });
};

startPwm();
createNotifier();

