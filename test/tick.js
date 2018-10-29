'use strict';

const pigpio = require('../');

// Wait a half-millisecond using a 100% CPU spin-wait.
// Only suitable as a test, don't do this for real as you lock up
// the Node.js main thread with this pattern.
let startUsec = pigpio.getTick();
do {
  let nowUsec = pigpio.getTick();
  let deltaUsec = pigpio.tickDiff(startUsec - nowUsec);
} while (deltaUsec < 500);
console.log(`Start (us) = ${startUsec}, now (us) = ${pigpio.getTick()}`);
