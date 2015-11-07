# pigpio

Feature rich fast GPIO on the Raspberry Pi with Node.js.

## Features

 * Digital read and write
 * PWM on any of GPIOs 0 through 31
 * Servo control on any of GPIOs 0 through 31
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

button.on('interrupt', function (level) {
  led.digitalWrite(level);
});
```

Simple servo control.

```js
var Gpio = require('pigpio'),
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

## API

### Class Gpio

##### Methods
- Coustructor
  - [Gpio(gpio[, options])](https://github.com/fivdi/pigpio#gpiogpio-options)
- Mode
  - [mode(mode)](https://github.com/fivdi/pigpio#modemode)
  - [getMode()](https://github.com/fivdi/pigpio#getmode)
- Pull-Type
  - [pullUpDown(pud)](https://github.com/fivdi/pigpio#pullupdownpud)
- Digital IO
  - [digitalRead()](https://github.com/fivdi/pigpio#digitalread)
  - [digitalWrite(level)](https://github.com/fivdi/pigpio#digitalwritelevel)
- PWM
  - [analogWrite(dutyCycle)](https://github.com/fivdi/pigpio#analogwritedutycycle)
  - [getPwmDutyCycle()](https://github.com/fivdi/pigpio#getpwmdutycycle)
  - [pwmRange(range)](https://github.com/fivdi/pigpio#pwmrangerange)
  - [getPwmRange()](https://github.com/fivdi/pigpio#getpwmrange)
  - [getPwmRealRange()](https://github.com/fivdi/pigpio#getpwmrealrange)
  - [pwmFrequency(frequency)](https://github.com/fivdi/pigpio#pwmfrequencyfrequency)
  - [getPwmFrequency()](https://github.com/fivdi/pigpio#getpwmfrequency)
- Servo Control
  - [servoWrite(pulseWidth)](https://github.com/fivdi/pigpio#servowritepulsewidth)
  - [getServoPulseWidth()](https://github.com/fivdi/pigpio#getservopulsewidth)
- Interrupts
  - [enableInterrupt(edge[, timeout])](https://github.com/fivdi/pigpio#enableinterruptedge-timeout)
  - [disableInterrupt()](https://github.com/fivdi/pigpio#disableinterrupt)

##### Events
  - [Event: 'interrupt'](https://github.com/fivdi/pigpio#event-interrupt)

##### Constants
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
  - [TIMEOUT](https://github.com/fivdi/pigpio#timeout-2)
  - [MIN_GPIO](https://github.com/fivdi/pigpio#min_gpio)
  - [MAX_GPIO](https://github.com/fivdi/pigpio#max_gpio)
  - [MAX_USER_GPIO](https://github.com/fivdi/pigpio#max_user_gpio)

#### Methods

##### Gpio(gpio[, options])
- gpio - an unsigned integer specifying the GPIO number
- options - object (optional)

Returns a new Gpio object for accessing a GPIO. The optional options object can
be used to configure the mode, pull type, interrupting edge(s), and interrupt
timeout for the GPIO.

A Gpio object is an EventEmitter.

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to the Gpio constructor. For example, pin 7 on the Raspberry
Pi P1 expansion header corresponds to GPIO4 in Raspbian Linux. 4 is therefore
the number to pass to the Gpio constructor when using pin 7 on the P1 expansion
header.

The following options are supported:
- mode - INPUT, OUTPUT, ALT0, ALT1, ALT2, ALT3, ALT4, or ALT5 (optional, no default)
- pullUpDown - PUD_OFF, PUD_DOWN, or PUD_UP (optional, no default)
- edge - interrupt edge for inputs. RISING_EDGE, FALLING_EDGE, or EITHER_EDGE (optional, no default)
- timeout - interrupt timeout in milliseconds (optional, defaults to 0 meaning no timeout if edge specified)

If no mode option is specified, the GPIO will be left in it's current mode. If
pullUpDown is not not specified, the pull-type for the GPIO will not be
modified. This makes it possible to implement programs that do things like
print information about the current mode and logic level for all GPIOs, for
example:

```js
var Gpio = require('pigpio'),
  gpio,
  gpioNo;

for (gpioNo = Gpio.MIN_GPIO; gpioNo <= Gpio.MAX_GPIO; gpioNo += 1) {
  gpio = new Gpio(gpioNo);

  console.log('GPIO ' + gpioNo + ':' +
    ' mode=' + gpio.getMode() +
    ' level=' + gpio.digitalRead()
  );
}
```

Interrupts can have an optional timeout. The level argument passed to the
interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout
expires.

##### mode(mode)
- mode - INPUT, OUTPUT, ALT0, ALT1, ALT2, ALT3, ALT4, or ALT5

Sets the GPIO mode. Returns this.

##### getMode()
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
- dutyCycle - an unsigned integer between 0 (off) and range (fully on). Range defaults to 255.

Starts PWM on the GPIO. Returns this.

##### getPwmDutyCycle()
Returns the PWM duty cycle setting on the GPIO.

##### pwmRange(range)
- range - an unsigned integer in the range 25 through 40000

Selects the duty cycle range to be used for the gpio. Subsequent calls to
analogWrite will use a dutycycle between 0 (off) and range (fully on).

If PWM is currently active on the gpio its duty cycle will be scaled to reflect
the new range. 

The real range, the number of steps between fully off and fully on for each
frequency, is given in the following table. 

Frequency (Hz) | Range
---: | ---:
8000 | 25
4000 | 50
2000 | 100
1600 | 125
1000 | 200
800 | 250
500 | 400
400 | 500
320 | 625
250 | 800
200 | 1000
160 | 1250
100 | 2000
80 | 2500
50 | 4000
40 | 5000
20 | 10000
10 | 20000

The real value set by analogWrite is (dutyCycle * real range) / range. 

##### getPwmRange()
Returns the duty cycle range used for the gpio.

##### getPwmRealRange()
Returns the real range used for the gpio.

##### pwmFrequency(frequency)
- frequency - an unsigned integer >= 0

Sets the frequency in hertz to be used for the gpio. The default frequency is
800Hz. The Returns this.

Each gpio can be independently set to one of 18 different PWM frequencies. 

If PWM is currently active on the gpio it will be switched off and then back on
at the new frequency.

The frequencies are:

Frequency (Hz) |
---: |
8000 |
4000 |
2000 |
1600 |
1000 |
800 |
500 |
400 |
320 |
250 |
200 |
160 |
100 |
80 |
50 |
40 |
20 |
10 |

##### getPwmFrequency()
Returns the frequency (in hertz) used for the gpio. The default frequency is
800Hz.

##### servoWrite(pulseWidth)
- pulseWidth - pulse width in microseconds, an unsigned integer, 0 or a number in the range 500 through 2500

Starts servo pulses on the GPIO, 0 (off), 500 (most anti-clockwise) to 2500
(most clockwise). Returns this.

##### getServoPulseWidth()
Returns the servo pulse width setting on the GPIO.

##### enableInterrupt(edge[, timeout])
- edge - RISING_EDGE, FALLING_EDGE, or EITHER_EDGE
- timeout - interrupt timeout in milliseconds (optional, defaults to 0 meaning no timeout)

Enables interrupts for the GPIO. Returns this.

Interrupts can have an optional timeout. The level argument passed to the
interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout
expires.

##### disableInterrupt()
Disables interrupts for the GPIO. Returns this.

#### Events

##### Event: 'interrupt'
- level - the GPIO level when the interrupt occured, 0, 1, or TIMEOUT (2)

Emitted on interrupts.

Interrupts can have an optional timeout. The level argument passed to the
interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout
expires.

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

##### TIMEOUT (2)
The level argument passed to an interrupt event listener when an interrupt
timeout expires.

##### MIN_GPIO
The smallest GPIO number.

##### MAX_GPIO
The largest GPIO number.

##### MAX_USER_GPIO
The largest user GPIO number.

