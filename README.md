# pigpio

A wrapper for the [pigpio C library](https://github.com/joan2937/pigpio) to
enable fast GPIO, PWM, servo control, state change notification and interrupt
handling with **Node.js** on the Raspberry Pi Zero, 1, 2 or 3.

pigpio supports Node.js versions 4, 6, 8 and 9.

[![Mentioned in Awesome Node.js](https://awesome.re/mentioned-badge.svg)](https://github.com/sindresorhus/awesome-nodejs)

## Contents

 * [Features](#features)
 * [Installation](#installation)
 * [Usage](#usage)
   * [Pulse an LED with PWM](#pulse-an-led-with-pwm)
   * [Buttons and interrupt handling](#buttons-and-interrupt-handling)
   * [Servo control](#servo-control)
   * [Measure distance with a HC-SR04 ultrasonic sensor](#measure-distance-with-a-hc-sr04-ultrasonic-sensor)
   * [Determine the width of a pulse with alerts](#determine-the-width-of-a-pulse-with-alerts)
 * [API documentation](#api-documentation)
 * [Performance](#performance)
 * [Limitations](#limitations)
 * [Related packages](#related-packages)

## Features

 * Digital IO
   * Up to 2.1 million digital reads per second <sup>*)</sup>
   * Up to 2.3 million digital writes per second <sup>*)</sup>
 * PWM on any of GPIOs 0 through 31
   * Multiple frequencies and duty cycle ranges supported
 * Servo control on any of GPIOs 0 through 31
   * Jitter free
 * Alerts when any of GPIOs 0 through 31 change state
   * The time of the state change is available accurate to a few microseconds
 * Notification streams for monitoring state changes on any of GPIOs 0 through 31 concurrently
   * The time of the state changes are available accurate to a few microseconds
 * Low latency interrupt handlers
   * Handle up to 20000 interrupts per second <sup>*)</sup>
 * Read or write up to 32 GPIOs as one operation with banked GPIO
 * Trigger pulse generation
 * Pull up/down resistor configuration

*) On a Raspberry Pi 3 Model B V1.2 running at 1.2 GHz ([Performance](#performance))

## Installation

#### Step 1 - Install the pigpio C library

The pigpio Node.js package requires the pigpio C library V41 or higher.

Raspbian Jessie 2016-05-10 or newer comes with the pigpio C library
pre-installed so it need not be manually installed.

Raspbian Jessie Lite 2016-05-10 or newer does not come with the pigpio C
library pre-installed so it must be manually installed with the following
commands:

```
sudo apt-get update
sudo apt-get install pigpio
```

The pigpio C library contains a number of utilities. One of these utilities
is pigpiod which launches the pigpio C library as a daemon. This utility
should not be used as the pigpio Node.js package uses the C library directly.

Installation instructions for the pigpio C library on versions of Raspbian
prior to 2016-05-10 can be found
[here](http://abyz.co.uk/rpi/pigpio/download.html).

#### Step 2 - Install the pigpio Node.js package

```
npm install pigpio
```

## Usage

Assume there's an LED connected to GPIO17 (pin 11) and a momentary push button
connected to GPIO4 (pin 7).

<img src="https://raw.githubusercontent.com/fivdi/pigpio/master/example/led-button.png">

#### Pulse an LED with PWM

Use PWM to pulse the LED connected to GPIO17 from fully off to fully on
continuously.

```js
var Gpio = require('pigpio').Gpio,
  led = new Gpio(17, {mode: Gpio.OUTPUT}),
  dutyCycle = 0;

setInterval(function () {
  led.pwmWrite(dutyCycle);

  dutyCycle += 5;
  if (dutyCycle > 255) {
    dutyCycle = 0;
  }
}, 20);

```

#### Buttons and interrupt handling

Turn the LED connected to GPIO17 on when the momentary push button connected to
GPIO4 is pressed. Turn the LED off when the button is released.

```js
var Gpio = require('pigpio').Gpio,
  button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
  }),
  led = new Gpio(17, {mode: Gpio.OUTPUT});

button.on('interrupt', function (level) {
  led.digitalWrite(level);
});
```

#### Servo control

Continuously move a servo connected to GPIO10 clockwise and anti-clockwise.

<img src="https://raw.githubusercontent.com/fivdi/pigpio/master/example/servo.png">

```js
var Gpio = require('pigpio').Gpio,
  motor = new Gpio(10, {mode: Gpio.OUTPUT}),
  pulseWidth = 1000,
  increment = 100;

setInterval(function () {
  motor.servoWrite(pulseWidth);

  pulseWidth += increment;
  if (pulseWidth >= 2000) {
    increment = -100;
  } else if (pulseWidth <= 1000) {
    increment = 100;
  }
}, 1000);
```

#### Measure distance with a HC-SR04 ultrasonic sensor

The `trigger` function can be used to generate a pulse on a GPIO and alerts can
be used to determine the time of a GPIO state change accurate to a few
microseconds. These two features can be combined to measure distance using a
HC-SR04 ultrasonic sensor.

<img src="https://raw.githubusercontent.com/fivdi/pigpio/master/example/distance-hc-sr04.png">

```js
var Gpio = require('pigpio').Gpio,
  trigger = new Gpio(23, {mode: Gpio.OUTPUT}),
  echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
var MICROSECDONDS_PER_CM = 1e6/34321;

trigger.digitalWrite(0); // Make sure trigger is low

(function () {
  var startTick;

  echo.on('alert', function (level, tick) {
    var endTick,
      diff;

    if (level == 1) {
      startTick = tick;
    } else {
      endTick = tick;
      diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      console.log(diff / 2 / MICROSECDONDS_PER_CM);
    }
  });
}());

// Trigger a distance measurement once per second
setInterval(function () {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 1000);
```

#### Determine the width of a pulse with alerts

Alerts can be used to determine the time of a GPIO state change accurate to a
few microseconds. Typically, alerts will be used for GPIO inputs but they can
also be used for outputs. In this example, the `trigger` method is used to
pulse the LED connected to GPIO17 on for 15 microseconds once per second.
Alerts are used to measure the length of the pulse.

```js
// Assumption: the LED is off when the program is started

var Gpio = require('pigpio').Gpio,
  led = new Gpio(17, {
    mode: Gpio.OUTPUT,
    alert: true
  });

(function () {
  var startTick;

  // Use alerts to determine how long the LED was turned on
  led.on('alert', function (level, tick) {
    var endTick,
      diff;

    if (level == 1) {
      startTick = tick;
    } else {
      endTick = tick;
      diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      console.log(diff);
    }
  });
}());

// Turn the LED on for 15 microseconds once per second
setInterval(function () {
  led.trigger(15, 1);
}, 1000);
```

Here's an example of the typical output to the console:

```
15
15
15
15
15
15
20
15
15
15
15
```

## API documentation

### Classes

- [Gpio](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md) - General Purpose Input Output
- [GpioBank](https://github.com/fivdi/pigpio/blob/master/doc/gpiobank.md) - Banked General Purpose Input Output
- [Notifier](https://github.com/fivdi/pigpio/blob/master/doc/notifier.md) - Notification Stream

### Configuring pigpio

- [Configuration](https://github.com/fivdi/pigpio/blob/master/doc/configuration.md) - pigpio configuration

## Performance

Three of the pigpio tests are used to monitor performance:

 * digital-read-performance.js - determine max. no. of digitalRead ops per second
 * digital-write-performance.js - determine max. no. of digitalWrite ops per second
 * isr-performance.js - determine max. no. of interrupts per second

The average of ten runs of these tests are shown in the table below.

 Name | Pi 2 | Pi 3
:--- | :--- | :---
Pi Model | Raspberry Pi 2 Model B V1.1 | Raspberry Pi 3 Model B V1.2
OS | Raspbian Jessie 2016-02-09 | Raspbian Jessie 2016-02-26
Kernel | 4.1.17-v7+ | 4.1.18-v7+
Node.js | v5.6.0 armv7l | v5.7.0 armv7l
pigpio | v0.3.0 | v0.3.2
pigpio C library | V45 | V47
Reads per second | 1,232,588 | 2,129,221
Writes per second | 1,323,039 | 2,336,157
Interrupts per second | 8,881 | 20,533

## Limitations

 * The pigpio Node.js package is a wrapper for the
   [pigpio C library](https://github.com/joan2937/pigpio). A limitation of the
   pigpio C library is that it can only be used by a single running process.
 * The pigpio C library and therefore the pigpio Node.js package requires
   root/sudo privileges to access hardware peripherals.

## Related packages

Here are a few links to other hardware specific Node.js packages that may be of interest.

- [onoff](https://github.com/fivdi/onoff) - GPIO access and interrupt detection
- [i2c-bus](https://github.com/fivdi/i2c-bus) - I2C serial bus access
- [spi-device](https://github.com/fivdi/spi-device) - SPI serial bus access
- [mcp-spi-adc](https://github.com/fivdi/mcp-spi-adc) - Analog to digital conversion with the MCP3002/4/8, MCP3202/4/8 and MCP3304
- [pigpio-mock](https://github.com/deepsyx/pigpio-mock) - A pigpio mock library for development on your local machine

