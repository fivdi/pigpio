'use strict';

const assert = require('assert');
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

console.log(`  start = ${startUsec} us, now = ${nowUsec} us, diff = ${deltaUsec} us`);

assert(deltaUsec >= 500 && deltaUsec <= 510, `expected tick diff to be approximately 500 us, got ${deltaUsec} us`);

pigpio.terminate();

