'use strict';

var pigpio = require('bindings')('pigpio.node'),
  irqCount = 0;

var INPUT = 7,
  OUTPUT = 8;

pigpio.gpioInitialise();

pigpio.gpioWrite(OUTPUT, 0);

pigpio.gpioSetISRFunc(INPUT, pigpio.EITHER_EDGE, 0, function(gpio, level, tick) {
  irqCount += 1;
  pigpio.gpioWrite(OUTPUT, level ^ 1);
});

// Delay for 1ms before triggering the first interrupt. This delay is necessary
// inorder to give the thread started by the call to gpioSetISRFunc above
// enough time to consume any existing interrupt before calling poll for the
// first time. Without the 1ms delay, the first interrupt which is triggered by
// gpioWrite below may also be consumed and thrown away.
setTimeout(function () {
  var time = process.hrtime();

  pigpio.gpioWrite(OUTPUT, 1);

  setTimeout(function () {
    var irqPerSec;

    time = process.hrtime(time);
    irqPerSec = Math.floor(irqCount / (time[0] + time[1] / 1E9));

    console.log(irqPerSec + ' interrupts per second');

    // Stop listening for interrupts
    pigpio.gpioSetISRFunc(INPUT, pigpio.EITHER_EDGE, 0);
  }, 1000);
}, 1);

