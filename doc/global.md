## Global

The global functions are defined at the pigpio module level.

#### Functions
  - [getTick()](#getTick)
  - [tickDiff(startTick, endTick)](#tickdiffstarttick-endtick)

#### Waveforms
  - [waveClear()](#waveclear)
  - [waveAddNew()](#waveaddnew)
  - [waveAddGeneric(pulses)](#waveaddgenericpulses)
  - [waveCreate()](#wavecreate)
  - [waveDelete(waveId)](#wavedeletewaveid)
  - [waveTxSend(waveId, waveMode)](#wavetxsendwaveid-wavemode)
  - [waveChain(chain)](#wavechainchain)
  - [waveTxAt()](#wavetxat)
  - [waveTxBusy()](#wavetxbusy)
  - [waveTxStop()](#wavetxstop)
  - [waveGetMicros()](#wavegetmicros)
  - [waveGetHighMicros()](#wavegethighmicros)
  - [waveGetMaxMicros()](#wavegetmaxmicros)
  - [waveGetPulses()](#wavegetpulses)
  - [waveGetHighPulses()](#wavegethighpulses)
  - [waveGetMaxPulses()](#wavegetmaxpulses)
  - [waveGetCbs()](#wavegetcbs)
  - [waveGetHighCbs()](#wavegethighcbs)
  - [waveGetMaxCbs()](#wavegetmaxcbs)

#### Constants
  - [WAVE_MODE_ONE_SHOT](#wave_mode_one_shot)
  - [WAVE_MODE_REPEAT](#wave_mode_repeat)
  - [WAVE_MODE_ONE_SHOT_SYNC](#wave_mode_one_shot_sync)
  - [WAVE_MODE_REPEAT_SYNC](#wave_mode_repeat_sync)

### Functions

#### getTick()
Gets the current unsigned 32-bit integer value of the number of microseconds
since system boot. This value wraps around the 32-bit space in just over an
hour. Use [tickDiff()](#tickdiffstarttick-endtick) to get the difference
between two tick values, to ensure the correct JavaScript operations are used
to account for the possibility of overflow.

```js
const pigpio = require('pigpio');

let startUsec = pigpio.getTick();

// Do some time-consuming things.

let currentUsec = pigpio.getTick();
let deltaUsec = pigpio.tickDiff(startUsec, currentUsec);
```

#### tickDiff(startTick, endTick)
Returns the difference in microseconds between the end and start tick counts.
The tick counts can be retrieved using [getTick()](#getTick), or may be passed
in a GPIO event callback.

```js
const pigpio = require('pigpio');

let startUsec = pigpio.getTick();

// Do some time-consuming things.

let currentUsec = pigpio.getTick();
let deltaUsec = pigpio.tickDiff(startUsec, currentUsec);
```

### Waveforms

#### waveClear()
Clears all waveforms and any data added by calls to the `waveAdd*` functions.

#### waveAddNew()
Starts a new empty waveform. 

You wouldn't normally need to call this function as it is automatically called after a waveform is created with the gpioWaveCreate function. 

#### waveAddGeneric(pulses)
- pulses - an array of pulses objects.

Adds a series of pulses to the current waveform. Returns the new total number of pulses in the current waveform.

The pulse objects are built with the following properties:
- gpioOn - an unsigned integer specifying the GPIO number to be turned on.
- gpioOff - an unsigned integer specifying the GPIO number to be turned off.
- usDelay - an unsigned integer specifying the pulse length in microseconds.

If you don't want to change a GPIO you can use 0 as a value for gpioOn or gpioOff.

The following example shows a pulse that switches GPIO 17 on for 50 microseconds.
```js
{
  gpioOn: 17,
  gpioOff: 0,
  usDelay: 50
}
```
The following example generates a waveform that starts with a 1µs pulse, then has a 2µs pause, followed by a 3µs pulse and so on.

```js
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const outPin = 17;

const output = new Gpio(outPin, {
  mode: Gpio.OUTPUT
});
  
let waveform = [];

for (let x = 0; x < 20; x++) {
  if (x % 2 == 1) {
    waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: x + 1 });
  } else {
    waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: x + 1 });
  }
}

pigpio.waveClear();

pigpio.waveAddGeneric(waveform);

let waveId = pigpio.waveCreate();

if (waveId >= 0) {
  pigpio.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (pigpio.waveTxBusy()) {}

pigpio.waveDelete(waveId);
```

#### waveCreate()
Creates a waveform from added data. Returns a wave id.
All data previously added with `waveAdd*` methods get cleared.

#### waveDelete(waveId)
- waveId - >=0, as returned by waveCreate

Deletes a waveform by the given wave id.

#### waveTxSend(waveId, waveMode)
- waveId - >=0, as returned by waveCreate
- waveMode - WAVE_MODE_ONE_SHOT, WAVE_MODE_REPEAT, WAVE_MODE_ONE_SHOT_SYNC or WAVE_MODE_REPEAT_SYNC

Transmits a waveform. Returns the number of DMA control blocks in the waveform.

The SYNC variants of the waveMode wait for the current waveform to reach the end of a cycle or finish before starting the new waveform.

WARNING: bad things may happen if you delete the previous waveform before it has been synced to the new waveform.

NOTE: Any hardware PWM started by hardwarePwmWrite will be cancelled.

#### waveChain(chain)
- chain - Array of waves to be transmitted, contains an ordered list of wave_ids and optional command codes and related data.

Transmits a chain of waveforms.

NOTE: Any hardware PWM started by hardwarePwmWrite will be cancelled.

The following command codes are supported:

Name | Command & Data | Description |
---: | ---: | ---: |
Loop Start | 255 0	| Identify start of a wave block
Loop Repeat	| 255 1 x y	| loop x + y*256 times
Delay	| 255 2 x y	| delay x + y*256 microseconds
Loop Forever |	255 3	| loop forever

Each wave is transmitted in the order specified. A wave may occur multiple times per chain. 
Blocks of waves may be transmitted multiple times by using the loop commands. The block is bracketed by loop start and end commands. Loops may be nested.
Delays between waves may be added with the delay command. 
If present Loop Forever must be the last entry in the chain.

For example, the following code creates a chain containing four simple waves and chains them together using all the above modifiers.
```js
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const outPin = 17;
const output = new Gpio(outPin, {
  mode: Gpio.OUTPUT
});

let firstWaveForm =   [{ gpioOn: outPin, gpioOff: 0, usDelay: 10 }, { gpioOn: 0, gpioOff: outPin, usDelay: 10 }];
let secondWaveForm =  [{ gpioOn: outPin, gpioOff: 0, usDelay: 20 }, { gpioOn: 0, gpioOff: outPin, usDelay: 20 }];
let thirdWaveForm =   [{ gpioOn: outPin, gpioOff: 0, usDelay: 30 }, { gpioOn: 0, gpioOff: outPin, usDelay: 30 }];
let fourthWaveForm =  [{ gpioOn: outPin, gpioOff: 0, usDelay: 40 }, { gpioOn: 0, gpioOff: outPin, usDelay: 40 }];

pigpio.waveClear();
pigpio.waveAddGeneric(firstWaveForm);
let firstWaveId = pigpio.waveCreate();

pigpio.waveAddGeneric(secondWaveForm);
let secondWaveId = pigpio.waveCreate();

pigpio.waveAddGeneric(thirdWaveForm);
let thirdWaveId = pigpio.waveCreate();

pigpio.waveAddGeneric(fourthWaveForm);
let fourthWaveId = pigpio.waveCreate();

let chain = [
  firstWaveId,      // transmits firstWaveId
  secondWaveId,	    // transmits secondWaveId
  firstWaveId,      // transmits again firstWaveId
  255, 2, 136, 19,  // delay for 5000 microseconds (136 + 19 * 256 = 5000)
  255, 0,           // marks the beginning of a new wave
  thirdWaveId,	    // transmits thirdWaveId
  255, 1, 30, 0,    // repeats the waves since the last beginning mark 30 times (30 + 0 * 256 = 30)
  255, 0,           // marks the beginning of a new wave
  fourthWaveId,	    // transmits fourthWaveId
  255, 3            // loops forever until waveTxStop is called
];

pigpio.waveChain(chain);
while (pigpio.waveTxBusy()) {}
```

#### waveTxAt()
Returns the current transmitting wave id.

#### waveTxBusy()
Returns 1 if the current waveform is still transmitting, otherwise 0.

#### waveTxStop()
Aborts the current waveform.

#### waveGetMicros()
Returns the length in microseconds of the current waveform.

#### waveGetHighMicros()
Returns the length in microseconds of the longest waveform created since gpioInitialise was called.

#### waveGetMaxMicros()
Returns the maximum possible size of a waveform in microseconds.

#### waveGetPulses()
Returns the length in pulses of the current waveform.

#### waveGetHighPulses()
Returns the length in pulses of the longest waveform created since gpioInitialise was called.

#### waveGetMaxPulses()
Returns the maximum possible size of a waveform in pulses.

#### waveGetCbs()
Returns the length in DMA control blocks of the current waveform.

#### waveGetHighCbs()
Returns the length in DMA control blocks of the longest waveform created since gpioInitialise was called.

#### waveGetMaxCbs()
Returns the maximum possible size of a waveform in DMA control blocks.

### Constants

#### WAVE_MODE_ONE_SHOT
The waveform is sent once.

#### WAVE_MODE_REPEAT
The waveform cycles repeatedly.

#### WAVE_MODE_ONE_SHOT_SYNC
The waveform is sent once, waiting for the current waveform to finish before starting the new waveform.

#### WAVE_MODE_REPEAT_SYNC
The waveform cycles repeatedly, waiting for the current waveform to finish before starting the new waveform.

