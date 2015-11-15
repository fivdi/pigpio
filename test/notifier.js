'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  Notifier = pigpio.Notifier;

var LED_GPIO = 17,
  LED_TOGGLES = 1000;

(function () {
  var led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT}),
    ledToggles = 0,
    iv;

  // put led in known state (off)
  led.digitalWrite(0);

  iv = setInterval(function () {
    led.digitalWrite(led.digitalRead() ^ 1);
    ledToggles += 1;
    if (ledToggles === LED_TOGGLES) {
      clearInterval(iv);
    }
  }, 1);
}());

(function () {
  var ledNotifier = new Notifier({bits: 1 << LED_GPIO}),
    notificationsReceived = 0,
    lastLedState,
    iv;

  ledNotifier.stream().on('data', function (buf) {
    var ix = 0;

    for (ix = 0; ix < buf.length; ix += Notifier.NOTIFICATION_LENGTH) {
      var seqno = buf.readUInt16LE(ix);
      var flags = buf.readUInt16LE(ix + 2);
      var tick = buf.readUInt32LE(ix + 4);
      var level = buf.readUInt32LE(ix + 8);

      if (flags & (1 << 6)) {
        console.log('  ignored alive notification');
      } else {
        if (notificationsReceived > 0) {
          if (lastLedState === (level & (1 << LED_GPIO))) {
            console.log('  unexpected notification');
          }
        }

        notificationsReceived += 1;
        lastLedState = level & (1 << LED_GPIO);
      }
    }

    if (notificationsReceived >= LED_TOGGLES) {
      clearInterval(iv);
      ledNotifier.close();
      console.log('  ' + notificationsReceived + ' notifications received');
    }
  });

  iv = setInterval(function () {
    console.log('  ' + notificationsReceived + ' notifications received');
  }, 1000);
}());

