'use strict';

// Generate PWM pulses at 250Hz with a 7us duty cycle and measure the length
// of the pulses with alerts.

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  led;

pigpio.configureClock(1, pigpio.CLOCK_PCM);

led = new Gpio(18, {
  mode: Gpio.OUTPUT,
  alert: true
});

led.digitalWrite(0);

(function () {
  var pulseCounts = [],
    pulses = 0,
    risingTick = 0,
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

        led.digitalWrite(0);
        led.disableAlert();
      }
    }
  });
}());

// frequency 250Hz, duty cycle 7us
led.hardwarePwmWrite(250, 250*7);

