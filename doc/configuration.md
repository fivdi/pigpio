## Configuration

#### Functions
  - [configureClock(microseconds, peripheral)](https://github.com/fivdi/pigpio/blob/master/doc/configuration.md#configureclockmicroseconds-peripheral)

#### Constants
  - [CLOCK_PWM](https://github.com/fivdi/pigpio/blob/master/doc/configuration.md#clock_pwm)
  - [CLOCK_PCM](https://github.com/fivdi/pigpio/blob/master/doc/configuration.md#clock_pcm)

### Functions

#### configureClock(microseconds, peripheral)
- microseconds - an unsigned integer specifying the sample rate in microseconds (1, 2, 4, 5, 8, or 10)
- peripheral - an unsigned integer specifying the peripheral for timing (CLOCK_PWM or CLOCK_PCM)

Under the covers, pigpio uses the DMA and PWM or PCM peripherals to control
and schedule PWM and servo pulse lengths. pigpio can also detect GPIO state
changes. A fundamental paramater when performing these activities is the
sample rate. The sample rate is a global setting and the same sample rate is
used for all GPIOs.

The sample rate can be set to 1, 2, 4, 5, 8, or 10 microseconds.

The number of samples per second and approximate CPU % for each sample rate
is given by the following table:

Sample rate (us) | Samples per second | CPU % |
---: | ---: | ---: |
1 | 1000000 | 25 |
2 | 500000 | 16 |
4 | 250000 | 11 |
5 | 200000 | 10 |
8 | 125000 | 15 |
10 | 100000 | 14 |

The configureClock function can be used to configure the sample rate and timing
peripheral.

If configureClock is never called, the sample rate will default to 5
microseconds timed by the PCM peripheral.

If configureClock is called, it must be called before any other pigpio
functions are called. For example:

```js
var pigpio = require('pigpio'),
  Gpio = pigpio.Gpio,
  led;

// Call configureClock before using any other pigpio functions
pigpio.configureClock(1, pigpio.CLOCK_PCM);

led = new Gpio(17, {mode: Gpio.OUTPUT});
```

### Constants

#### CLOCK_PWM
PWM clock.

#### CLOCK_PCM
PCM clock.

