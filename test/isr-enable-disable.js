'use strict';

// GPIO7 needs to be connected to GPIO8 with a 1K resistor for this test.

var Gpio = require('../').Gpio,
  input = new Gpio(7, {mode: Gpio.INPUT}),
  output = new Gpio(8, {mode: Gpio.OUTPUT}),
  risingCount = 0,
  fallingCount = 0,
  iv;

// Put output (and input) in a known state.
output.digitalWrite(0);

// Toggle output (and input) every 10 ms
iv = setInterval(function () {
  output.digitalWrite(output.digitalRead() ^ 1);
}, 10);

// ISR
input.on('interrupt', function (level) {
  if (level === 0) {
    fallingCount += 1;
  } else if (level === 1) {
    risingCount += 1;
  }
});

function noEdge() {
  console.log('  no edge');

  input.disableInterrupt();
  risingCount = 0;
  fallingCount = 0;

  setTimeout(function () {
    console.log('    ' + risingCount + ' rising edge interrupts (0 expected)');
    console.log('    ' + fallingCount + ' falling edge interrupts (0 expected)');

    clearInterval(iv);
    input.disableInterrupt();
  }, 1000)
}

function fallingEdge() {
  console.log('  falling edge');

  input.enableInterrupt(Gpio.FALLING_EDGE);
  risingCount = 0;
  fallingCount = 0;

  setTimeout(function () {
    console.log('    ' + risingCount + ' rising edge interrupts (0 expected)');
    console.log('    ' + fallingCount + ' falling edge interrupts (~50 expected)');

    noEdge();
  }, 1000)
}

function risingEdge() {
  console.log('  rising edge');

  input.enableInterrupt(Gpio.RISING_EDGE);
  risingCount = 0;
  fallingCount = 0;

  setTimeout(function () {
    console.log('    ' + risingCount + ' rising edge interrupts (~50 expected)');
    console.log('    ' + fallingCount + ' falling edge interrupts (0 expected)');

    fallingEdge();
  }, 1000)
}

(function eitherEdge() {
  console.log('  either edge');

  input.enableInterrupt(Gpio.EITHER_EDGE);
  risingCount = 0;
  fallingCount = 0;

  setTimeout(function () {
    console.log('    ' + risingCount + ' rising edge interrupts (~50 expected)');
    console.log('    ' + fallingCount + ' falling edge interrupts (~50 expected)');

    risingEdge();
  }, 1000);
}());

