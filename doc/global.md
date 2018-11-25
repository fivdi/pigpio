## Global

The global functions are defined at the pigpio module level.

#### Functions
  - [getTick()](#getTick)
  - [tickDiff(startTick, endTick)](#tickdiffstarttick-endtick)

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

