1.2.2 / Mar 16 2019
===================

  * update dependencies (nan v2.13.1, bindings v1.5.0)
  * document node 12 support
  * lint with jshint
  * only compile c++ code on linux

1.2.1 / Dec 19 2018
===================

  * update dependencies (nan v2.12.1, bindings v1.3.1)

1.2.0 / Nov 25 2018
===================

  * add getTick and tickDiff (thank you [@erikma](https://github.com/erikma))

1.1.4 / Oct 13 2018
===================

  * fix deprecation warnings on node.js v10.12 (see https://github.com/nodejs/nan/pull/811)

1.1.3 / Sep 29 2018
===================

  * update dependencies (nan v2.11.1)
  * adapt to V8 7.0: replace v8Value->Uint32Value() with Nan::To<uint32_t>(v8Value).FromJust()
  * adapt to V8 7.0: replace v8Value->Int32Value() with Nan::To<int32_t>(v8Value).FromJust()
  * adapting to V8 7.0 had a negative impact on performance

1.1.2 / Jul 27 2018
===================

  * modernize codebase

1.1.1 / Jul 22 2018
===================

  * add troubleshooting guide (thank you [@sznowicki](https://github.com/sznowicki))
  * construct AsyncResource for callback when callback is stored

1.1.0 / May 20 2018
===================

  * add Gpio.glitchFilter

1.0.0 / Apr 07 2018
===================

  * document difference between interrupts and alerts
  * update dependencies (nan v2.10.0)

0.7.0 / Feb 25 2018
===================

  * update dependencies (nan v2.9.2)
  * fix deprecations
  * drop support for node.js v0.10, v0.12, v5 and v7
  * use default pipe size for notifiers

0.6.4 / Dec 24 2017
===================

  * don't suppress deprecated-declaration warnings
  * update dependencies

0.6.3 / Nov 04 2017
===================

  * suppress deprecated-declaration warnings
  * document node 9 support

0.6.2 / Sep 18 2017
===================

  * document necessity for root privileges
  * update dependencies (bindings@1.3.0, nan@2.7.0)
  * allow initialize to be called after terminate has been called [#34](https://github.com/fivdi/pigpio/issues/34)

0.6.1 / Jul 15 2017
===================

  * improve documentation

0.6.0 / Jun 10 2017
===================

  * allow socket port number to be configured with configureSocketPort

0.5.1 / Apr 13 2017
===================

  * fix test script

0.5.0 / Apr 13 2017
===================

  * hardwareRevision API
  * nan v2.6.2

0.4.0 / Sep 24 2016
===================

  * example: measure distance with a HC-SR04 ultrasonic sensor
  * initialize and terminate added to public API
  * nan v2.4.0
  * document initialize and terminate

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

