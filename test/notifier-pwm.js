'use strict';

const pigpio = require('../');
const Gpio = pigpio.Gpio;
const Notifier = pigpio.Notifier;

const LED_GPIO = 18;
const FREQUENCY = 25000;

const blinkLed = () => {
  const led = new Gpio(LED_GPIO, {mode: Gpio.OUTPUT});

  led.hardwarePwmWrite(FREQUENCY, 500000);
};

const watchLed = () => {
  const ledNotifier = new Notifier({bits: 1 << LED_GPIO});

  let notificationsReceived = 0;
  let seqnoErrors = 0;
  let ledStateErrors = 0;
  let lastSeqno;
  let lastLedState;
  let lastTick;
  let minTickDiff = 0xffffffff;
  let maxTickDiff = 0;

  ledNotifier.stream().on('data', (buf) => {
    for (let ix = 0; ix < buf.length; ix += Notifier.NOTIFICATION_LENGTH) {
      const seqno = buf.readUInt16LE(ix);
      const tick = buf.readUInt32LE(ix + 4);
      const level = buf.readUInt32LE(ix + 8);

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

    if (notificationsReceived >= 50000) {
      ledNotifier.stream().pause();
      ledNotifier.close();
      console.log('  notifications: %d', notificationsReceived);
      console.log('  seqno errors: %d', seqnoErrors);
      console.log('  led state errors: %d', ledStateErrors);
      console.log('  expected tick diff: %d us', 1000000 / (FREQUENCY * 2));
      console.log('  min tick diff: %d us', minTickDiff);
      console.log('  max tick diff: %d us', maxTickDiff);
    }
  });
};

blinkLed();
watchLed();

