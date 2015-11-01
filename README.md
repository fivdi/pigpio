# pigpio

Feature rich high performance GPIO on the Raspberry Pi with JavaScript.

## Features

 * Digital read and write
 * PWM on any of gpios 0 through 31
 * Servo control on any of gpios 0 through 31
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

Coming soon!


