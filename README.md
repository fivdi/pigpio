# pigpio

Feature rich high performance GPIO on the Raspberry Pi with JavaScript.

## Features

 * Digital read and write
 * PWM on any of GPIOs 0 through 31
 * Servo control on any of GPIOs 0 through 31 (untested)
 * Pull up/down resistors
 * Interrupt handlers

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
var Gpio = require('pigpio'),
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
var Gpio = require('pigpio'),
  button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
  }),
  led = new Gpio(17, {mode: Gpio.OUTPUT});

button.on('interrupt', function (gpio, level, tick) {
  led.digitalWrite(level);
});
```

## API

### Class Gpio

- Methods
  - [Gpio(gpio[, options])](https://github.com/fivdi/pigpio#gpiogpio-options)
  - [pinMode(mode)](https://github.com/fivdi/pigpio#pinmodemode)
  - [getPinMode()](https://github.com/fivdi/pigpio#getpinmode)
  - [pullUpDown(pud)](https://github.com/fivdi/pigpio#pullupdownpud)
  - [digitalRead()](https://github.com/fivdi/pigpio#digitalread)
  - [digitalWrite(level)](https://github.com/fivdi/pigpio#digitalwritelevel)
  - [analogWrite(dutyCycle)](https://github.com/fivdi/pigpio#analogwritedutycycle)
  - [servoWrite(pulseWidth)](https://github.com/fivdi/pigpio#servowritepulsewidth)
  - [enableInterrupt(edge[, timeout])](https://github.com/fivdi/pigpio#enableinterruptedge-timeout)
  - [disableInterrupt()](https://github.com/fivdi/pigpio#disableinterrupt)

- Events
  - [interrupt](https://github.com/fivdi/pigpio#interrupt)

- Constants
  - [INPUT](https://github.com/fivdi/pigpio#input)
  - [OUTPUT](https://github.com/fivdi/pigpio#output)
  - [ALT0](https://github.com/fivdi/pigpio#alt0)
  - [ALT1](https://github.com/fivdi/pigpio#alt1)
  - [ALT2](https://github.com/fivdi/pigpio#alt2)
  - [ALT3](https://github.com/fivdi/pigpio#alt3)
  - [ALT4](https://github.com/fivdi/pigpio#alt4)
  - [ALT5](https://github.com/fivdi/pigpio#alt5)
  - [PUD_OFF](https://github.com/fivdi/pigpio#pud_off)
  - [PUD_DOWN](https://github.com/fivdi/pigpio#pud_down)
  - [PUD_UP](https://github.com/fivdi/pigpio#pud_up)
  - [RISING_EDGE](https://github.com/fivdi/pigpio#rising_edge)
  - [FALLING_EDGE](https://github.com/fivdi/pigpio#falling_edge)
  - [EITHER_EDGE](https://github.com/fivdi/pigpio#either_edge)
  - [TIMEOUT](https://github.com/fivdi/pigpio#timeout)

#### Methods

##### Gpio(gpio[, options])
- gpio - an unsigned integer specifying the GPIO number
- options - object (optional)

Returns a new Gpio object for accessing a GPIO. The optional options object can
be used to configure the mode, pull type, interrupting edge or edges, and
interrupt timeout for the GPIO. A Gpio object is an EventEmitter.

The following options are supported:
- mode - INPUT, OUTPUT, ALT0, ALT1, ALT2, ALT3, ALT4, or ALT5 (optional, no default)
- pullUpDown - PUD_OFF, PUD_DOWN, or PUD_UP (optional, no default)
- edge - RISING_EDGE, FALLING_EDGE, or EITHER_EDGE (optional, no default)
- timeout - interrupt timeout in milliseconds (optional, defaults to 0 if edge specified)

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to the Gpio constructor. For example, pin 8 on the Raspberry
Pi P1 expansion header corresponds to GPIO14 in Raspbian Linux. 14 is therefore
the number to pass to the Gpio constructor when using pin 8 on the P1 expansion
header.

##### pinMode(mode)
- mode - INPUT, OUTPUT, ALT0, ALT1, ALT2, ALT3, ALT4, or ALT5

Sets the GPIO mode. Returns this.

##### getPinMode()
Returns the GPIO mode.

##### pullUpDown(pud)
- pud - PUD_OFF, PUD_DOWN, or PUD_UP

Sets or clears the pull type for the GPIO. Returns this.

##### digitalRead()
Returns the GPIO level, 0 or 1.

##### digitalWrite(level)
- level - 0 or 1

Sets the GPIO level to 0 or 1. If PWM or servo pulses are active on the GPIO
they are switched off. Returns this.

##### analogWrite(dutyCycle)
- dutyCycle - an unsigned integer in the range 0 (off) through 255 (fully on)

Starts PWM on the GPIO. Returns this.

##### servoWrite(pulseWidth)
- pulseWidth - pulse width in microseconds, an unsigned integer, 0 or a number in the range 500 through 2500

Starts servo pulses on the GPIO, 0 (off), 500 (most anti-clockwise) to 2500
(most clockwise). Returns this.

##### enableInterrupt(edge[, timeout])
- edge - RISING_EDGE, FALLING_EDGE, or EITHER_EDGE
- timeout - interrupt timeout in milliseconds (optional, defaults to 0 meaning no timeout)

Enables interrupts for the GPIO. Returns this.

##### disableInterrupt()
Disables interrupts for the GPIO. Returns this.

#### Events

##### interrupt
Emitted on interrupts.

#### Constants

##### INPUT
Indicates that the GPIO is an input.

##### OUTPUT
Indicates that the GPIO is an output.

##### ALT0
Indicates that the GPIO is in alternative mode 0.

##### ALT1
Indicates that the GPIO is in alternative mode 1.

##### ALT2
Indicates that the GPIO is in alternative mode 2.

##### ALT3
Indicates that the GPIO is in alternative mode 3.

##### ALT4
Indicates that the GPIO is in alternative mode 4.

##### ALT5
Indicates that the GPIO is in alternative mode 5.

##### PUD_OFF
Niether the pull-up nor the pull-down resistor should be enabled.

##### PUD_DOWN
Enable pull-down resistor.

##### PUD_UP
Enable pull-up resistor.

##### RISING_EDGE
Indicates that the GPIO fires interrupts on rising edges.

##### FALLING_EDGE
Indicates that the GPIO fires interrupts on falling edges.

##### EITHER_EDGE
Indicates that the GPIO fires interrupts on both rising and falling edges.

##### TIMEOUT

## Performance

Three of the pigpio tests are used to monitor performance:

 * digital-read-performance.js - determine max. no. of digitalRead ops per second
 * digital-write-performance.js - determine max. no. of digitalWrite ops per second
 * isr-performance.js - determine max. no. of interrupts per second

The average of ten runs of these tests are shown in the table below.

:---: | :---:
Pi Model | Raspberry Pi 2 Model B V1.1
Node.js | v4.2.1 armv7l
pigpio | v0.0.3
pigpio C-IF | V39
OS | Raspbian Jessie 2015-09-24
Kernel | 4.1.7-v7+
Reads per second | 1,226,264
Writes per second | 1,307,190
Interrupts per second | 8,665

