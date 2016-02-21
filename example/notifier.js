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

// Set sample rate to 1 microsecond
pigpio.configureClock(1, pigpio.CLOCK_PCM);

// Start hardware PWM on GPIO18, 50KHz, 50% duty cycle
led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});
led.hardwarePwmWrite(FREQUENCY, 500000);

// Create a Notifier for monitoring state changes on GPIO18
ledNotifier = new Notifier({bits: 1 << LED_GPIO});

ledNotifier.stream().on('data', function (buf) {
  var rest,
    ix,
    tickDiff;

  var seqno,
    tick,
    level;

  // If there's a partial notification from the last data event, stick it at
  // start of buf so that it can be processed now.
  if (restBuf !== null) {
    buf = Buffer.concat([restBuf, buf]);
  }

  // There may be a partial notification at the end of buf. If this is the
  // case, save the part that is there in restBuf, and process it when the
  // remaining bytes arrives with the next data event.
  rest = buf.length % Notifier.NOTIFICATION_LENGTH;
  if (rest === 0) {
    restBuf = null;
  } else {
    restBuf = new Buffer(buf.slice(buf.length - rest));
  }

  // Loop over the notifications in buf
  for (ix = 0; ix < buf.length - rest; ix += Notifier.NOTIFICATION_LENGTH) {
    seqno = buf.readUInt16LE(ix);
    tick = buf.readUInt32LE(ix + 4);
    level = buf.readUInt32LE(ix + 8);

    // The first notification isn't taken into account here
    if (notificationCount > 0) {
      // The state of the LED is expected to toggle on every state change
      if ((lastLevel & (1 << LED_GPIO)) === (level & (1 << LED_GPIO))) {
        console.log('unexpected led state');
        errorCount += 1;
      }

      // The seqno is expected to increase by one on each notification
      if (((lastSeqno + 1) & 0xffff) !== seqno) {
        console.log('seqno error, was %d, expected %d', seqno, lastSeqno + 1);
        errorCount += 1;
      }

      // Determine how long it's been since the last state change. Note that
      // the sign propagating right shift operator >> is used for unsigned 32
      // bit arithmetic.
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

