'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  Notifier = pigpio.Notifier;

var LED_GPIO = 17,
  LED_TOGGLES = 1000;

(function () {
  var led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT}),
    ledToggles = 0,
    lastTime = process.hrtime(),
    minSetIntervalDiff = 0xffffffff,
    maxSetIntervalDiff = 0,
    iv;

  iv = setInterval(function () {
    var time = process.hrtime(),
      diff = Math.floor(((time[0] * 1e9 + time[1]) - (lastTime[0] * 1e9 + lastTime[1])) / 1000);

    lastTime = time;

    if (diff < minSetIntervalDiff) {
      minSetIntervalDiff = diff;
    }

    if (diff > maxSetIntervalDiff) {
      maxSetIntervalDiff = diff;
    }

    led.digitalWrite(led.digitalRead() ^ 1);

    ledToggles += 1;
    if (ledToggles === LED_TOGGLES) {
      clearInterval(iv);

      console.log('  led toggles: %d', ledToggles);
      console.log('  min setInterval diff: %d us', minSetIntervalDiff);
      console.log('  max setInterval diff: %d us', maxSetIntervalDiff);
    }
  }, 1);
}());

(function () {
  var ledNotifier = new Notifier({bits: 1 << LED_GPIO}),
    notificationsReceived = 0,
    seqnoErrors = 0,
    ledStateErrors = 0,
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
          console.log('  unexpected led state');
          ledStateErrors += 1;
        }

        if ((lastSeqno + 1) !== seqno) {
          console.log('  seqno error, was %d, expected %d', seqno, lastSeqno + 1);
          seqnoErrors += 1;
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

    if (notificationsReceived >= LED_TOGGLES) {
      ledNotifier.close();
      console.log('  notifications: %d', notificationsReceived);
      console.log('  seqno errors: %d', seqnoErrors);
      console.log('  led state errors: %d', ledStateErrors);
      console.log('  min tick diff: %d us', minTickDiff);
      console.log('  max tick diff: %d us', maxTickDiff);
    }
  });
}());

