# pigpio

Feature rich high performance GPIO on the Raspberry Pi with JavaScript.

## Features

 * Digital read and write
 * PWM on any of gpios 0 through 31
 * Servo control on any of gpios 0 through 31 (untested)
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

## Usage

Use PWM to pulse an LED connected to GPIO17 (pin 11) from fully off to fully
on continuously.

```js
var Gpio = require('pigpio'),
  led = new Gpio(17),
  dutyCycle = 0;

setInterval(function () {
  led.analogWrite(dutyCycle);

  dutyCycle += 5;
  if (dutyCycle > 255) {
    dutyCycle = 0;
  }
}, 20);

```

Turn an LED connected to GPIO17 (pin 11) on when a momentary push button connected
to GPIO4 (pin 7) is pressed. Turn the LED off when the button is released.

```js
var Gpio = require('pigpio'),
  button = new Gpio(4, {edge: Gpio.EITHER_EDGE}),
  led = new Gpio(17);

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
  - [digitalWrite(value)](https://github.com/fivdi/pigpio#digitalwritevalue)
  - [analogWrite(value)](https://github.com/fivdi/pigpio#analogwritevalue)
  - [servoWrite(value)](https://github.com/fivdi/pigpio#servowritevalue)
  - [enableInterrupt(edge, timeout)](https://github.com/fivdi/pigpio#enableinterruptedge-timeout)
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
##### pinMode(mode)
##### getPinMode()
##### pullUpDown(pud)
##### digitalRead()
##### digitalWrite(value)
##### analogWrite(value)
##### servoWrite(value)
##### enableInterrupt(edge, timeout)
##### disableInterrupt()

#### Events

##### interrupt

#### Constants

##### INPUT
##### OUTPUT
##### ALT0
##### ALT1
##### ALT2
##### ALT3
##### ALT4
##### ALT5
##### PUD_OFF
##### PUD_DOWN
##### PUD_UP
##### RISING_EDGE
##### FALLING_EDGE
##### EITHER_EDGE
##### TIMEOUT

