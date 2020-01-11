# Troubleshooting

## Sound / microphone doesn't work properly

When using PWM it can happen that your sound card would stop working properly. The visible effect is that for example sound stream breaks and ALSA is starting throwing errors.

If you encounter this issue, you might want to try forcing the pigpio clock to use PWM hardware.

Example code:
```js
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

// Call configureClock before creating Gpio objects
pigpio.configureClock(1, pigpio.CLOCK_PWM);

const led = new Gpio(25, { mode: Gpio.OUTPUT }); 
```

Related issues:
- [Sound stream breaks when initing the library](https://github.com/fivdi/pigpio/issues/52)
- [gpioInitialise cause I2S DAC sound card does not work properly](https://github.com/joan2937/pigpio/issues/87)

