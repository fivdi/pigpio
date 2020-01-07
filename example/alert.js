'use strict';

// Assumption: the LED is off when the program is started

const Gpio = require('../').Gpio;

const led = new Gpio(17, {
  mode: Gpio.OUTPUT,
  alert: true
});

const watchLed = () => {
  let startTick;

  // Use alerts to determine how long the LED was turned on
  led.on('alert', (level, tick) => {
    if (level === 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      console.log(diff);
    }
  });
};

watchLed();

// Turn the LED on for 15 microseconds once per second
setInterval(() => {
  led.trigger(15, 1);
}, 1000);

