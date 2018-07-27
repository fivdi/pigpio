'use strict';

// requiring pigpio shouldn't result in the event loop being kept alive if
// nothing is actully performed. If this program doesn't terminate immediately,
// the event loop is being kept alive, which is incorrect.
const pigpio = require('../');

