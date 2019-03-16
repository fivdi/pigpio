/* jshint -W078 */
'use strict';

const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const pigpio = require('bindings')('pigpio.node');
const util = require('util');

/* ------------------------------------------------------------------------ */
/* Library initialization                                                   */
/* ------------------------------------------------------------------------ */

let initialized = false;

const initializePigpio = () => {
  if (!initialized) {
    pigpio.gpioInitialise();
    initialized = true;
  }
};

/* ------------------------------------------------------------------------ */
/* Global                                                                   */
/* ------------------------------------------------------------------------ */

module.exports.getTick = () => {
  return pigpio.gpioTick();
};

module.exports.tickDiff = (startUsec, endUsec) => {
  return (endUsec >> 0) - (startUsec >> 0);
};

/* ------------------------------------------------------------------------ */
/* Gpio                                                                     */
/* ------------------------------------------------------------------------ */

class Gpio extends EventEmitter {
  constructor(gpio, options) {
    super();

    initializePigpio();

    options = options || {};

    this.gpio = +gpio;

    if (typeof options.mode === 'number') {
      this.mode(options.mode);
    }

    if (typeof options.pullUpDown === 'number') {
      this.pullUpDown(options.pullUpDown);
    }

    if (typeof options.edge === 'number') {
      this.enableInterrupt(options.edge,
        typeof options.timeout === 'number' ? options.timeout : 0
      );
    }

    if (typeof options.alert === 'boolean' && options.alert) {
      this.enableAlert();
    }
  }

  mode(mode) {
    // What happens if the mode is INPUT, there is an ISR, and the mode is
    // changed to OUTPUT (or anything else for that matter)?
    pigpio.gpioSetMode(this.gpio, +mode);
    return this;
  }

  getMode() {
    return pigpio.gpioGetMode(this.gpio);
  }

  pullUpDown(pud) {
    pigpio.gpioSetPullUpDown(this.gpio, +pud);
    return this;
  }

  digitalRead() {
    return pigpio.gpioRead(this.gpio);
  }

  digitalWrite(level) {
    pigpio.gpioWrite(this.gpio, +level);
    return this;
  }

  trigger(pulseLen, level) {
    pigpio.gpioTrigger(this.gpio, +pulseLen, +level);
    return this;
  }

  pwmWrite(dutyCycle) {
    pigpio.gpioPWM(this.gpio, +dutyCycle);
    return this;
  }

  hardwarePwmWrite(frequency, dutyCycle) {
    pigpio.gpioHardwarePWM(this.gpio, +frequency, +dutyCycle);
    return this;
  }

  getPwmDutyCycle() {
    return pigpio.gpioGetPWMdutycycle(this.gpio);
  }

  pwmRange(range) {
    pigpio.gpioSetPWMrange(this.gpio, +range);
    return this;
  }

  getPwmRange() {
    return pigpio.gpioGetPWMrange(this.gpio);
  }

  getPwmRealRange() {
    return pigpio.gpioGetPWMrealRange(this.gpio);
  }

  pwmFrequency(frequency) {
    pigpio.gpioSetPWMfrequency(this.gpio, +frequency);
    return this;
  }

  getPwmFrequency() {
    return pigpio.gpioGetPWMfrequency(this.gpio);
  }

  servoWrite(pulseWidth) {
    pigpio.gpioServo(this.gpio, +pulseWidth);
    return this;
  }

  getServoPulseWidth() {
    return pigpio.gpioGetServoPulsewidth(this.gpio);
  }

  enableInterrupt(edge, timeout) {
    const handler = (gpio, level, tick) => {
      this.emit('interrupt', level);
    };

    timeout = timeout || 0;
    pigpio.gpioSetISRFunc(this.gpio, +edge, +timeout, handler);
    return this;
  }

  disableInterrupt() {
    pigpio.gpioSetISRFunc(this.gpio, Gpio.EITHER_EDGE, 0);
    return this;
  }

  enableAlert() {
    const handler = (gpio, level, tick) => {
      this.emit('alert', level, tick);
    };

    pigpio.gpioSetAlertFunc(this.gpio, handler);
    return this;
  }

  disableAlert() {
    pigpio.gpioSetAlertFunc(this.gpio);
    return this;
  }

  glitchFilter(steady) {
    pigpio.gpioGlitchFilter(this.gpio, +steady);
    return this;
  }

  /* mode */
  static get INPUT() { return 0; } // PI_INPUT
  static get OUTPUT() { return 1; } //PI_OUTPUT;
  static get ALT0() { return 4; } // PI_ALT0;
  static get ALT1() { return 5; } // PI_ALT1;
  static get ALT2() { return 6; } // PI_ALT2;
  static get ALT3() { return 7; } // PI_ALT3;
  static get ALT4() { return 3; } // PI_ALT4;
  static get ALT5() { return 2; } // PI_ALT5;

  /* pull up/down resistors */
  static get PUD_OFF() { return 0; } // PI_PUD_OFF;
  static get PUD_DOWN() { return 1; } // PI_PUD_DOWN;
  static get PUD_UP() { return 2; } // PI_PUD_UP;

  /* isr */
  static get RISING_EDGE() { return 0; } // RISING_EDGE;
  static get FALLING_EDGE() { return 1; } // FALLING_EDGE;
  static get EITHER_EDGE() { return 2; } // EITHER_EDGE;

  /* timeout */
  static get TIMEOUT() { return 2; } // PI_TIMEOUT;

  /* gpio numbers */
  static get MIN_GPIO() { return 0; } // PI_MIN_GPIO;
  static get MAX_GPIO() { return 53; } // PI_MAX_GPIO;
  static get MAX_USER_GPIO() { return 31; } // PI_MAX_USER_GPIO;
}

Gpio.prototype.analogWrite = Gpio.prototype.pwmWrite;

module.exports.Gpio = Gpio;

/* ------------------------------------------------------------------------ */
/* GpioBank                                                                 */
/* ------------------------------------------------------------------------ */

class GpioBank {
  constructor(bank) {
    initializePigpio();

    this.bankNo = +bank || GpioBank.BANK1;
  }

  read() {
    if (this.bankNo === GpioBank.BANK1) {
      return pigpio.GpioReadBits_0_31();
    } else if (this.bankNo === GpioBank.BANK2) {
      return pigpio.GpioReadBits_32_53();
    }
  }

  set(bits) {
    if (this.bankNo === GpioBank.BANK1) {
      pigpio.GpioWriteBitsSet_0_31(+bits);
    } else if (this.bankNo === GpioBank.BANK2) {
      pigpio.GpioWriteBitsSet_32_53(+bits);
    }

    return this;
  }

  clear(bits) {
    if (this.bankNo === GpioBank.BANK1) {
      pigpio.GpioWriteBitsClear_0_31(+bits);
    } else if (this.bankNo === GpioBank.BANK2) {
      pigpio.GpioWriteBitsClear_32_53(+bits);
    }

    return this;
  }

  bank() {
    return this.bankNo;
  }

  static get BANK1() { return 1; }
  static get BANK2() { return 2; }
}

module.exports.GpioBank = GpioBank;

/* ------------------------------------------------------------------------ */
/* Notifier                                                                 */
/* ------------------------------------------------------------------------ */

const NOTIFICATION_PIPE_PATH_PREFIX = '/dev/pigpio';

class Notifier {
  constructor(options) {
    initializePigpio();

    options = options || {};

    this.handle = pigpio.gpioNotifyOpenWithSize(0);

    // set highWaterMark to a multiple of NOTIFICATION_LENGTH to avoid 'data'
    // events being emitted with buffers containing partial notifications.
    this.notificationStream =
      fs.createReadStream(NOTIFICATION_PIPE_PATH_PREFIX + this.handle, {
        highWaterMark: Notifier.NOTIFICATION_LENGTH * 5000
      });

    if (typeof options.bits === 'number') {
      this.start(options.bits);
    }
  }

  start(bits) {
    pigpio.gpioNotifyBegin(this.handle, +bits);
    return this;
  }

  stop() {
    pigpio.gpioNotifyPause(this.handle);
    return this;
  }

  close() {
    pigpio.gpioNotifyClose(this.handle);
  }

  stream() {
    return this.notificationStream;
  }

  static get NOTIFICATION_LENGTH() { return 12; }
  static get PI_NTFY_FLAGS_ALIVE() { return 1 << 6; }
}

module.exports.Notifier = Notifier;

/* ------------------------------------------------------------------------ */
/* Configuration                                                            */
/* ------------------------------------------------------------------------ */

module.exports.hardwareRevision = () => {
  return pigpio.gpioHardwareRevision();
};

module.exports.initialize = () => {
  initializePigpio();
};

module.exports.terminate = () => {
  pigpio.gpioTerminate();

  initialized = false;
};

module.exports.configureClock = (microseconds, peripheral) => {
  pigpio.gpioCfgClock(+microseconds, +peripheral);
};

module.exports.configureSocketPort = (port) => {
  pigpio.gpioCfgSocketPort(+port);
};

module.exports.CLOCK_PWM = 0; // PI_CLOCK_PWM;
module.exports.CLOCK_PCM = 1; // PI_CLOCK_PCM;

