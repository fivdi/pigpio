'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  Notifier = pigpio.Notifier;

var LED_GPIO = 18,
  FREQUENCY = 25000;

(function () {
  var led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});

  led.hardwarePwmWrite(FREQUENCY, 500000);
}());

(function () {
  var ledNotifier = new Notifier({bits: 1 << LED_GPIO}),
    notificationsReceived = 0,
    lastSeqno,
    lastLedState,
    lastTick,
    minTickDiff = 0xffffffff,
    maxTickDiff = 0;

  ledNotifier.stream().on('data', function (buf) {
    var ix = 0;

    for (ix = 0; ix < buf.length; ix += Notifier.NOTIFICATION_LENGTH) {
      var seqno = buf.readUInt16LE(ix);
      var tick = buf.readUInt32LE(ix + 4);
      var level = buf.readUInt32LE(ix + 8);

      if (notificationsReceived > 0) {
        if (lastLedState === (level & (1 << LED_GPIO))) {
          console.log('  unexpected notification');
        }

        if ((lastSeqno + 1) !== seqno) {
          console.log('  unexpected sequence number');
        }

        if (tick - lastTick < minTickDiff) {
          minTickDiff = tick - lastTick;
        }

        if (tick - lastTick > maxTickDiff) {
          maxTickDiff = tick - lastTick;
        }
      }

      notificationsReceived += 1;
      lastSeqno = seqno;
      lastLedState = level & (1 << LED_GPIO);
      lastTick = tick;
    }

    if (notificationsReceived >= 50000) {
      ledNotifier.stream().pause();
      ledNotifier.close();
      console.log('  notifications: %d', notificationsReceived);
      console.log('  last seqno: %d', lastSeqno);
      console.log('  expected tick diff: %d us', 1000000 / (FREQUENCY * 2));
      console.log('  min tick diff: %d us', minTickDiff);
      console.log('  max tick diff: %d us', maxTickDiff);
    }
  });
}());

