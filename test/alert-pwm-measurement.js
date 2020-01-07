'use strict';

// Generate PWM pulses at 250Hz with a 7us duty cycle and measure the length
// of the pulses with alerts.

const pigpio = require('../');
const Gpio = pigpio.Gpio;

pigpio.configureClock(1, pigpio.CLOCK_PCM);

const led = new Gpio(18, {
  mode: Gpio.OUTPUT,
  alert: true
});

const activatePwmMeasurement = () => {
  const pulseCounts = [];
  let pulses = 0;
  let risingTick = 0;

  led.on('alert', (level, tick) => {
    if (level === 1) {
      risingTick = tick;
    } else {
      const fallingTick = tick;
      const pulseLength = fallingTick - risingTick;

      if (pulseCounts[pulseLength] === undefined) {
        pulseCounts[pulseLength] = 0;
      }
      pulseCounts[pulseLength] += 1;

      pulses += 1;
      if (pulses === 1000) {
        for (let i = 0; i !== pulseCounts.length; i += 1) {
          if (pulseCounts[i] !== undefined) {
            console.log('  ' + i + 'us - ' + pulseCounts[i]);
          }
        }

        led.digitalWrite(0);
        led.disableAlert();
      }
    }
  });
};

led.digitalWrite(0);
activatePwmMeasurement();
led.hardwarePwmWrite(250, 250*7);

