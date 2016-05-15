0.3.4 / May 15 2016
===================

  * installation instructions updated

0.3.3 / May 04 2016
===================

  * nan v2.3.2

0.3.2 / Feb 21 2016
===================

  * notifier-leak-check now functions correctly
  * notifier example

0.3.1 / Feb 21 2016
===================

  * document notification streams
  * documentation tweaks
  * notifier-leak-check added

0.3.0 / Feb 14 2016
===================

  * upgrade to nan v2.2.0
  * alerts

0.2.0 / Dec 13 2015
===================

  * trigger pulse generation
  * banked gpio

0.1.3 / Dec 05 2015
===================

  * prevent Nan::ErrnoException related segmentation faults in v0.10.29

0.1.2 / Dec 05 2015
===================

  * include errno.h for node v0.10.29

0.1.1 / Nov 28 2015
===================

  * document dependency on V41 or higher of the pigpio C library

0.1.0 / Nov 28 2015
===================

  * export Gpio constructor as exports.Gpio
  * high precision notifications with Notifier
  * hardware pwm support
  * renamed analogWrite to pwmWrite
  * clock configuration with configureClock
  * notification pipe size set to 1048576
  * notification stress test

0.0.8 / Nov 08 2015
===================

  * allow PWM range control with pwmRange, getPwmRange, getPwmRealRange
  * allow pwm frequency control with pwmFrequency, and getPwmFrequency
  * pwm tests
  * pinMode renamed to mode
  * getPinMode renamed to getMode

0.0.7 / Nov 03 2015
===================

  * fixed version in package.json (v0.0.5 -> v0.0.7)
  * v0.0.6 was never published on npm

0.0.6 / Nov 03 2015
===================

  * constants MIN_GPIO, MAX_GPIO, and MAX_USER_GPIO added
  * mode tests
  * multiple interrupt sources test
  * allow access to PWM duty cycle with getPwmDutyCycle
  * allow access to servo pulse width with getServoPulseWidth
  * servo control test

0.0.5 / Nov 03 2015
===================

  * documentation improved
  * tick argument for interrupt event removed
  * fixed getPinMode bug
  * gpio-info example

0.0.4 / Nov 02 2015
===================

  * documentation, tests, and examples improved
  * gpio argument for interrupt event removed
  * simple servo example

0.0.3 / Nov 01 2015
===================

  * enableInterrupt timeout argument made optional
  * interrupt timeout integration tests

0.0.2 / Nov 01 2015
===================

  * integration tests
  * documentation

0.0.1 / Oct 31 2015
===================

  * interrupt support with gpioSetISRFunc
  * throw errors when pigpio c interface returns errors
  * export Gpio constructor rather than pigpio c interface
  * simple examples

0.0.0 / Oct 14 2015
===================

  * minimalistic pigpio api

