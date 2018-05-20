'use strict';

// Connect pin 18 to pin 23 (18 is used as signal source),
// it is safe to do so when these pins were not previously used.
// In other cases, run this script first without connecting the pins, 
// to ensure the right pin configuration. After that first run, they
// can be safely connected.
var assert = require('assert'),
  Gpio = require('../').Gpio,
  output = new Gpio(18, { 
  	mode: Gpio.OUTPUT
  }),
  input = new Gpio(23, { 
  	mode: Gpio.INPUT,
  	pullUpDown: Gpio.PUD_OFF,
  	alert: true
  }),
  count = 0;

output.digitalWrite(0);
input.glitchFilter(50);
input.on('alert', (level, tick) => {
	if (level === 1) {
		count++;
		console.log('Rising edge, count=' + count);
	}
});

output.trigger(30, 1);	// alert function should not be executed (blocked by glitchFilter)

setTimeout(() => { 
	output.trigger(70, 1);	// alert function should be executed
}, 500);

setTimeout(() => {
	assert.strictEqual(count, 1, 'expected 1 alert function call instead of ' + count);
	console.log("Success...");
	process.exit(0);
}, 1000);
