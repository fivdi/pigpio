'use strict';

var pigpio = require('../'),
  Gpio = pigpio.Gpio,
  Notifier = pigpio.Notifier,
  led,
  ledNotifier,
  notificationCount = 0,
  errorCount = 0,
  tickDiffs = [],
  restBuf = null;

var lastSeqno,
  lastTick,
  lastLevel;

var LED_GPIO = 18,
  FREQUENCY = 50000;

pigpio.configureClock(1, pigpio.CLOCK_PCM);

led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});
led.hardwarePwmWrite(FREQUENCY, 500000);

ledNotifier = new Notifier({bits: 1 << LED_GPIO});

ledNotifier.stream().on('data', function (buf) {
  var rest,
    ix,
    tickDiff;

  var seqno,
    tick,
    level;

  if (restBuf !== null) {
    buf = Buffer.concat([restBuf, buf]);
  }

  rest = buf.length % Notifier.NOTIFICATION_LENGTH;

  if (rest === 0) {
    restBuf = null;
  } else {
    restBuf = new Buffer(buf.slice(buf.length - rest));
  }

  for (ix = 0; ix < buf.length - rest; ix += Notifier.NOTIFICATION_LENGTH) {
    seqno = buf.readUInt16LE(ix);
    tick = buf.readUInt32LE(ix + 4);
    level = buf.readUInt32LE(ix + 8);

    if (notificationCount > 0) {
      if ((lastLevel & (1 << LED_GPIO)) === (level & (1 << LED_GPIO))) {
        console.log('unexpected led state');
        errorCount += 1;
      }

      if (((lastSeqno + 1) & 0xffff) !== seqno) {
        console.log('seqno error, was %d, expected %d', seqno, lastSeqno + 1);
        errorCount += 1;
      }

      tickDiff = (tick >> 0) - (lastTick >> 0);

      if (tickDiffs[tickDiff] === undefined) {
        tickDiffs[tickDiff] = 0;
      }

      tickDiffs[tickDiff] += 1;
    }

    lastSeqno = seqno;
    lastTick = tick;
    lastLevel = level;

    notificationCount += 1;
  }
});

setInterval(function () {
  var i;

  console.log('-------------------------------');
  console.log('notificationCount: ' + notificationCount);
  console.log('errorCount: ' + errorCount);

  for (i = 0; i != tickDiffs.length; i += 1) {
    if (tickDiffs[i] !== undefined) {
      console.log(i + 'us: ' + tickDiffs[i]);
    }
  }

  tickDiffs = [];
}, 1000);

