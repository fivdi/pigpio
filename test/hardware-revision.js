'use strict';

var pigpio = require('../');

console.log('Hardware Revision: ' + pigpio.hardwareRevision().toString(16));

