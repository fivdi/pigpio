'use strict';

var Gpio = require('../'),
  button = new Gpio(4, {edge: Gpio.EITHER_EDGE}),
  led = new Gpio(17);

button.on('interrupt', function (gpio, level, tick) {
  led.digitalWrite(level);
});

