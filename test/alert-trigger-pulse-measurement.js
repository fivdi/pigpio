'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  led,
  iv;

//pigpio.configureClock(1, pigpio.CLOCK_PCM);

led = new Gpio(17, {
  mode: Gpio.OUTPUT,
  alert: true
});

led.digitalWrite(0);

(function () {
  var pulseCounts = [],
    pulses = 0,
    risingTick,
    fallingTick,
    i;

  led.on('alert', function (level, tick) {
    var pulseLength;

    if (level === 1) {
      risingTick = tick;
    } else {
      fallingTick = tick;
      pulseLength = fallingTick - risingTick;

      if (pulseCounts[pulseLength] === undefined) {
        pulseCounts[pulseLength] = 0;
      }
      pulseCounts[pulseLength] += 1;

      pulses += 1;
      if (pulses === 1000) {
        for (i = 0; i != pulseCounts.length; i += 1) {
          if (pulseCounts[i] !== undefined) {
            console.log(i + 'us - ' + pulseCounts[i]);
          }
        }

        clearInterval(iv);
        led.digitalWrite(0);
        led.disableAlert();
      }
    }
  });
}());

iv = setInterval(function () {
  led.trigger(10, 1);
}, 2);

