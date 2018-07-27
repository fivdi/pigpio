'use strict';

const pigpio = require('../');

console.log('Hardware Revision: ' + pigpio.hardwareRevision().toString(16));

