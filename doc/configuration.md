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

Configures pigpio to use the specified sample rate timed by a specified
peripheral.

If configureClock is never called, the sample rate will default to 5
microseconds timed by the PCM peripheral.

### Constants

#### CLOCK_PWM
PWM clock.

#### CLOCK_PCM
PCM clock.

