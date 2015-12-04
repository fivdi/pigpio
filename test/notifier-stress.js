'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  Notifier = pigpio.Notifier;

var LED_GPIO = 18,
  FREQUENCY = 150000;

pigpio.configureClock(1, pigpio.CLOCK_PCM);

(function () {
  var led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});

  led.hardwarePwmWrite(FREQUENCY, 500000);
}());

(function () {
  var ledNotifier = new Notifier({bits: 1 << LED_GPIO}),
    notificationsReceived = 0,
    events = 0,
    seqnoErrors = 0,
    ledStateErrors = 0,
    lastSeqno,
    lastLedState,
    lastTick,
    minTickDiff = 0xffffffff,
    maxTickDiff = 0,
    restBuf = null,
    iv;

  function printInfo() {
    console.log();
    console.log('  events: %d', events);
    console.log('  notifications: %d', notificationsReceived);
    console.log('  seqno errors: %d', seqnoErrors);
    console.log('  led state errors: %d', ledStateErrors);
    console.log('  expected tick diff: %d us', 1000000 / (FREQUENCY * 2));
    console.log('  min tick diff: %d us', minTickDiff);
    console.log('  max tick diff: %d us', maxTickDiff);

    minTickDiff = 0xffffffff;
    maxTickDiff = 0;
  }

  ledNotifier.stream().on('data', function (buf) {
    var ix,
      entries,
      rest;

    events += 1;

    if (restBuf !== null) {
      buf = Buffer.concat([restBuf, buf]);
    }

    entries = Math.floor(buf.length / Notifier.NOTIFICATION_LENGTH);
    rest = buf.length % Notifier.NOTIFICATION_LENGTH;

    if (rest === 0) {
      restBuf = null;
    } else {
      restBuf = new Buffer(buf.slice(buf.length - rest));
    }

    for (ix = 0; ix < buf.length - rest; ix += Notifier.NOTIFICATION_LENGTH) {
      var seqno = buf.readUInt16LE(ix);
      var tick = buf.readUInt32LE(ix + 4);
      var level = buf.readUInt32LE(ix + 8);

      if (notificationsReceived > 0) {
        if (lastLedState === (level & (1 << LED_GPIO))) {
          console.log('  unexpected led state');
          ledStateErrors += 1;
        }

        if (((lastSeqno + 1) & 0xffff) !== seqno) {
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

    if (notificationsReceived >= 1e9) {
      ledNotifier.stream().pause();
      ledNotifier.close();
      clearInterval(iv);
      printInfo();
    }
  });

  iv = setInterval(printInfo, 5000);
}());

