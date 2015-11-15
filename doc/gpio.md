## Class Gpio - General Purpose Input Output

#### Methods
- Coustructor
  - [Gpio(gpio[, options])](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#gpiogpio-options)
- Mode
  - [mode(mode)](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#modemode)
  - [getMode()](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#getmode)
- Pull-Type
  - [pullUpDown(pud)](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#pullupdownpud)
- Digital IO
  - [digitalRead()](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#digitalread)
  - [digitalWrite(level)](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#digitalwritelevel)
- PWM
  - [analogWrite(dutyCycle)](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#analogwritedutycycle)
  - [getPwmDutyCycle()](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#getpwmdutycycle)
  - [pwmRange(range)](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#pwmrangerange)
  - [getPwmRange()](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#getpwmrange)
  - [getPwmRealRange()](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#getpwmrealrange)
  - [pwmFrequency(frequency)](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#pwmfrequencyfrequency)
  - [getPwmFrequency()](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#getpwmfrequency)
- Servo Control
  - [servoWrite(pulseWidth)](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#servowritepulsewidth)
  - [getServoPulseWidth()](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#getservopulsewidth)
- Interrupts
  - [enableInterrupt(edge[, timeout])](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#enableinterruptedge-timeout)
  - [disableInterrupt()](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#disableinterrupt)

#### Events
  - [Event: 'interrupt'](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#event-interrupt)

#### Constants
  - [INPUT](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#input)
  - [OUTPUT](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#output)
  - [ALT0](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#alt0)
  - [ALT1](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#alt1)
  - [ALT2](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#alt2)
  - [ALT3](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#alt3)
  - [ALT4](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#alt4)
  - [ALT5](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#alt5)
  - [PUD_OFF](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#pud_off)
  - [PUD_DOWN](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#pud_down)
  - [PUD_UP](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#pud_up)
  - [RISING_EDGE](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#rising_edge)
  - [FALLING_EDGE](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#falling_edge)
  - [EITHER_EDGE](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#either_edge)
  - [TIMEOUT](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#timeout-2)
  - [MIN_GPIO](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#min_gpio)
  - [MAX_GPIO](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#max_gpio)
  - [MAX_USER_GPIO](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#max_user_gpio)

### Methods

#### Gpio(gpio[, options])
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
var Gpio = require('pigpio').Gpio,
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

#### mode(mode)
- mode - INPUT, OUTPUT, ALT0, ALT1, ALT2, ALT3, ALT4, or ALT5

Sets the GPIO mode. Returns this.

#### getMode()
Returns the GPIO mode.

#### pullUpDown(pud)
- pud - PUD_OFF, PUD_DOWN, or PUD_UP

Sets or clears the pull type for the GPIO. Returns this.

#### digitalRead()
Returns the GPIO level, 0 or 1.

#### digitalWrite(level)
- level - 0 or 1

Sets the GPIO level to 0 or 1. If PWM or servo pulses are active on the GPIO
they are switched off. Returns this.

#### analogWrite(dutyCycle)
- dutyCycle - an unsigned integer between 0 (off) and range (fully on). Range defaults to 255.

Starts PWM on the GPIO. Returns this.

#### getPwmDutyCycle()
Returns the PWM duty cycle setting on the GPIO.

#### pwmRange(range)
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

#### getPwmRange()
Returns the duty cycle range used for the gpio.

#### getPwmRealRange()
Returns the real range used for the gpio.

#### pwmFrequency(frequency)
- frequency - an unsigned integer >= 0

Sets the frequency in hertz to be used for the gpio. The default frequency is
800Hz. Returns this.

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

#### getPwmFrequency()
Returns the frequency (in hertz) used for the gpio. The default frequency is
800Hz.

#### servoWrite(pulseWidth)
- pulseWidth - pulse width in microseconds, an unsigned integer, 0 or a number in the range 500 through 2500

Starts servo pulses on the GPIO, 0 (off), 500 (most anti-clockwise) to 2500
(most clockwise). Returns this.

#### getServoPulseWidth()
Returns the servo pulse width setting on the GPIO.

#### enableInterrupt(edge[, timeout])
- edge - RISING_EDGE, FALLING_EDGE, or EITHER_EDGE
- timeout - interrupt timeout in milliseconds (optional, defaults to 0 meaning no timeout)

Enables interrupts for the GPIO. Returns this.

Interrupts can have an optional timeout. The level argument passed to the
interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout
expires.

#### disableInterrupt()
Disables interrupts for the GPIO. Returns this.

### Events

#### Event: 'interrupt'
- level - the GPIO level when the interrupt occured, 0, 1, or TIMEOUT (2)

Emitted on interrupts.

Interrupts can have an optional timeout. The level argument passed to the
interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout
expires.

### Constants

#### INPUT
Indicates that the GPIO is an input.

#### OUTPUT
Indicates that the GPIO is an output.

#### ALT0
Indicates that the GPIO is in alternative mode 0.

#### ALT1
Indicates that the GPIO is in alternative mode 1.

#### ALT2
Indicates that the GPIO is in alternative mode 2.

#### ALT3
Indicates that the GPIO is in alternative mode 3.

#### ALT4
Indicates that the GPIO is in alternative mode 4.

#### ALT5
Indicates that the GPIO is in alternative mode 5.

#### PUD_OFF
Niether the pull-up nor the pull-down resistor should be enabled.

#### PUD_DOWN
Enable pull-down resistor.

#### PUD_UP
Enable pull-up resistor.

#### RISING_EDGE
Indicates that the GPIO fires interrupts on rising edges.

#### FALLING_EDGE
Indicates that the GPIO fires interrupts on falling edges.

#### EITHER_EDGE
Indicates that the GPIO fires interrupts on both rising and falling edges.

#### TIMEOUT (2)
The level argument passed to an interrupt event listener when an interrupt
timeout expires.

#### MIN_GPIO
The smallest GPIO number.

#### MAX_GPIO
The largest GPIO number.

#### MAX_USER_GPIO
The largest user GPIO number.

