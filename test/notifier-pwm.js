'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  Notifier = pigpio.Notifier;

var LED_GPIO = 17;

(function () {
  var led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});

  led.pwmFrequency(8000);
  led.pwmRange(100);
  led.analogWrite(50);
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

    if (notificationsReceived >= 20000) {
      clearInterval(iv);
      ledNotifier.stream().pause();
      ledNotifier.close();
      console.log('  ' + notificationsReceived + ' notifications received');
    }
  });

  iv = setInterval(function () {
    console.log('  ' + notificationsReceived + ' notifications received');
  }, 1000);
}());

