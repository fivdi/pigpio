'use strict';

const pigpio = require('../');

pigpio.initialize();

// Wait a half-millisecond using a 100% CPU spin-wait.
// Only suitable as a test, don't do this for real as you lock up
// the Node.js main thread with this pattern.
let startUsec = pigpio.getTick();
let nowUsec;
let deltaUsec;
do {
  nowUsec = pigpio.getTick();
  deltaUsec = pigpio.tickDiff(startUsec - nowUsec);
} while (deltaUsec < 500);

console.log(`Start (us) = ${startUsec}, now (us) = ${nowUsec}, diff (us) = ${deltaUsec}`);

pigpio.terminate();
