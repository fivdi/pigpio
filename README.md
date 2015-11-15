# pigpio

Fast GPIO, PWM and servo control on the Raspberry Pi with Node.js.

## Features

 * Digital read and write
   * Up to 1.3 million digital writes per second
   * Up to 1.2 million digital reads per second
 * PWM on any of GPIOs 0 through 31
 * Servo control on any of GPIOs 0 through 31
 * Pull up/down resistors
 * Low latency interrupt handlers
   * Handle up to 8500 interrupts per second

## Installation

### Step 1

The pigpio package is based on the
[pigpio C library](https://github.com/joan2937/pigpio) so the C library needs
to be installed first. This can be achieved with the following commands:

```
wget abyz.co.uk/rpi/pigpio/pigpio.zip
unzip pigpio.zip
cd PIGPIO
make
sudo make install
```

Note that the `make` command takes a while to complete so please be patient.

### Step 2

```
npm install pigpio
```

If you're using io.js v3 or Node.js v4 and seeing lots of compile errors when
installing pigpio, it's very likely that gcc/g++ 4.8 or higher are not
installed. See
[Node.js v4 and native addons](https://github.com/fivdi/onoff/wiki/Node.js-v4-and-native-addons)
for details.

## Usage

Assume there's an LED connected to GPIO17 (pin 11) and a momentary push button
connected to GPIO4 (pin 7).

<img src="https://raw.githubusercontent.com/fivdi/pigpio/master/example/pigpio.png">

Use PWM to pulse the LED connected to GPIO17 from fully off to fully on
continuously.

```js
var Gpio = require('pigpio').Gpio,
  led = new Gpio(17, {mode: Gpio.OUTPUT}),
  dutyCycle = 0;

setInterval(function () {
  led.analogWrite(dutyCycle);

  dutyCycle += 5;
  if (dutyCycle > 255) {
    dutyCycle = 0;
  }
}, 20);

```

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

Simple servo control.

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

## Performance

Three of the pigpio tests are used to monitor performance:

 * digital-read-performance.js - determine max. no. of digitalRead ops per second
 * digital-write-performance.js - determine max. no. of digitalWrite ops per second
 * isr-performance.js - determine max. no. of interrupts per second

The average of ten runs of these tests are shown in the table below.

 Name | Description
:--- | :---
Pi Model | Raspberry Pi 2 Model B V1.1
OS | Raspbian Jessie 2015-09-24
Kernel | 4.1.7-v7+
Node.js | v4.2.1 armv7l
pigpio | v0.0.3
pigpio C library | V39
Reads per second | 1,226,264
Writes per second | 1,307,190
Interrupts per second | 8,665

## API Documentation

### Classes

- [Gpio](https://github.com/fivdi/pigpio/doc/gpio.md) - General Purpose Input Output

