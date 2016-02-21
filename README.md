# pigpio

Fast GPIO, PWM, servo control, state change notification, and interrupt
handling on the Raspberry Pi with Node.js.

## Features

 * Digital IO
   * Up to 1.3 million digital writes per second
   * Up to 1.2 million digital reads per second
 * PWM on any of GPIOs 0 through 31
   * Multiple frequencies and duty cycle ranges supported
 * Servo control on any of GPIOs 0 through 31
   * Jitter free
 * Alerts when any of GPIOs 0 through 31 change state
   * The time of the state change is available accurate to a few microseconds
 * Notification streams for monitoring state changes on any of GPIOs 0 through 31 concurrently
   * The time of the state changes are available accurate to a few microseconds
   * Handle in excess of 100000 notifications per second
 * Low latency interrupt handlers
   * Handle up to 8500 interrupts per second
 * Read or write up to 32 GPIOs as one operation with banked GPIO
 * Trigger pulse generation
 * Pull up/down resistor configuration

## Installation

#### Step 1

The pigpio package is based on the
[pigpio C library](https://github.com/joan2937/pigpio) so the C library needs
to be installed first. Version V41 or higher of the pigpio C library is
required. It can be installed with the following commands:

```
wget abyz.co.uk/rpi/pigpio/pigpio.zip
unzip pigpio.zip
cd PIGPIO
make
sudo make install
```

The `make` command may take a while to complete so please be patient.

Installing the pigpio C library will also install a number of utilities. One of
these utilities is pigpiod which launches the pigpio library as a daemon. This
utility should not be used as the pigpio Node.js module uses the C library
directly.

#### Step 2

```
npm install pigpio
```

If you're using io.js v3 or Node.js v4 or higher and seeing lots of compile
errors when installing pigpio, it's very likely that gcc/g++ 4.8 or higher are
not installed. See
[Node.js v4 and native addons](https://github.com/fivdi/onoff/wiki/Node.js-v4-and-native-addons)
for details.

If you're using Node.js v0.10.29 on the Raspberry Pi and seeing a compile
error saying that `‘REPLACE_INVALID_UTF8’ is not a member of ‘v8::String’`
see [Node.js v0.10.29 and native addons on the Raspberry Pi](https://github.com/fivdi/onoff/wiki/Node.js-v0.10.29-and-native-addons-on-the-Raspberry-Pi).

## Usage

Assume there's an LED connected to GPIO17 (pin 11) and a momentary push button
connected to GPIO4 (pin 7).

<img src="https://raw.githubusercontent.com/fivdi/pigpio/master/example/pigpio.png">

#### PWM

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

#### Interrupt Handling

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

#### Servo Control

Continuously move a servo connected to GPIO10 clockwise and anti-clockwise.

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

#### Alerts

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

#### Handling 100000 notifications per second

Notifications can be use to determine the time of state changes on multiple
GPIOs concurrently. Typically, notifications will be used for GPIO inputs but
they can also be used for outputs. In this example, hardware PWM is started on
GPIO18 at 50KHz with a duty cycle of 50%. This implies 100000 state changes per
second on GPIO18. A Notifier is used to monitor these state changes.
Information about the time between state changes is collected in the array
`tickDiffs` and printed to the console one per second.

```js
'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  Notifier = pigpio.Notifier,
  led,
  ledNotifier,
  notificationCount = 0,
  errorCount = 0,
  tickDiffs = [],
  restBuf = null;

var lastSeqno,
  lastTick,
  lastLevel;

var LED_GPIO = 18,
  FREQUENCY = 50000;

// Set sample rate to 1 microsecond
pigpio.configureClock(1, pigpio.CLOCK_PCM);

// Start hardware PWM on GPIO18, 50KHz, 50% duty cycle
led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});
led.hardwarePwmWrite(FREQUENCY, 500000);

// Create a Notifier for monitoring state changes on GPIO18
ledNotifier = new Notifier({bits: 1 << LED_GPIO});

ledNotifier.stream().on('data', function (buf) {
  var rest,
    ix,
    tickDiff;

  var seqno,
    tick,
    level;

  // If there's a partial notification from the last data event, stick it at
  // start of buf so that it can be processed now.
  if (restBuf !== null) {
    buf = Buffer.concat([restBuf, buf]);
  }

  // There may be a partial notification at the end of buf. If this is the
  // case, save the part that is there in restBuf, and process it when the
  // remaining bytes arrives with the next data event.
  rest = buf.length % Notifier.NOTIFICATION_LENGTH;
  if (rest === 0) {
    restBuf = null;
  } else {
    restBuf = new Buffer(buf.slice(buf.length - rest));
  }

  // Loop over the notifications in buf
  for (ix = 0; ix < buf.length - rest; ix += Notifier.NOTIFICATION_LENGTH) {
    seqno = buf.readUInt16LE(ix);
    tick = buf.readUInt32LE(ix + 4);
    level = buf.readUInt32LE(ix + 8);

    // The first notification isn't taken into account here
    if (notificationCount > 0) {
      // The state of the LED is expected to toggle on every state change
      if ((lastLevel & (1 << LED_GPIO)) === (level & (1 << LED_GPIO))) {
        console.log('unexpected led state');
        errorCount += 1;
      }

      // The seqno is expected to increase by one on each notification
      if (((lastSeqno + 1) & 0xffff) !== seqno) {
        console.log('seqno error, was %d, expected %d', seqno, lastSeqno + 1);
        errorCount += 1;
      }

      // Determine how long it's been since the last state change. Note that
      // the sign propagating right shift operator >> is used for unsigned 32
      // bit arithmetic.
      tickDiff = (tick >> 0) - (lastTick >> 0);
      if (tickDiffs[tickDiff] === undefined) {
        tickDiffs[tickDiff] = 0;
      }
      tickDiffs[tickDiff] += 1;
    }

    lastSeqno = seqno;
    lastTick = tick;
    lastLevel = level;

    notificationCount += 1;
  }
});

setInterval(function () {
  var i;

  console.log('-------------------------------');
  console.log('notificationCount: ' + notificationCount);
  console.log('errorCount: ' + errorCount);

  for (i = 0; i != tickDiffs.length; i += 1) {
    if (tickDiffs[i] !== undefined) {
      console.log(i + 'us: ' + tickDiffs[i]);
    }
  }

  tickDiffs = [];
}, 1000);

```

Here's an example of the typical output to the console:

```
notificationCount: 426639263
errorCount: 0
8us: 26
9us: 948
10us: 99093
11us: 1001
12us: 2
15us: 1
16us: 3
17us: 1
18us: 1
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
OS | Raspbian Jessie 2016-02-09
Kernel | 4.1.17-v7+
Node.js | v5.6.0 armv7l
pigpio | v0.3.0
pigpio C library | V45
Reads per second | 1,232,588
Writes per second | 1,323,039
Interrupts per second | 8,881

## API Documentation

- [Configuration](https://github.com/fivdi/pigpio/blob/master/doc/configuration.md) - pigpio configuration

### Classes

- [Gpio](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md) - General Purpose Input Output
- [GpioBank](https://github.com/fivdi/pigpio/blob/master/doc/gpiobank.md) - Banked General Purpose Input Output
- [Notifier](https://github.com/fivdi/pigpio/blob/master/doc/notifier.md) - Notification Stream

