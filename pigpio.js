'use strict';

var EventEmitter = require('events').EventEmitter,
  fs = require('fs'),
  pigpio = require('bindings')('pigpio.node'),
  util = require('util'),
  initialized = false;

function initializePigpio() {
  if (!initialized) {
    pigpio.gpioInitialise();
    initialized = true;
  }
}

/* ------------------------------------------------------------------------ */
/* Gpio                                                                     */
/* ------------------------------------------------------------------------ */

function Gpio(gpio, options) {
  if (!(this instanceof Gpio)) {
    return new Gpio(gpio, options);
  }

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

  if (typeof options.alert === "boolean" && options.alert) {
    this.enableAlert();
  }

  EventEmitter.call(this);
}

util.inherits(Gpio, EventEmitter);
module.exports.Gpio = Gpio;

Gpio.prototype.mode = function (mode) {
  // What happens if the mode is INPUT, there is an ISR, and the mode is
  // changed to OUTPUT (or anything else for that matter)?
  pigpio.gpioSetMode(this.gpio, +mode);
  return this;
};

Gpio.prototype.getMode = function () {
  return pigpio.gpioGetMode(this.gpio);
};

Gpio.prototype.pullUpDown = function (pud) {
  pigpio.gpioSetPullUpDown(this.gpio, +pud);
  return this;
};

Gpio.prototype.digitalRead = function () {
  return pigpio.gpioRead(this.gpio);
};

Gpio.prototype.digitalWrite = function (level) {
  pigpio.gpioWrite(this.gpio, +level);
  return this;
};

Gpio.prototype.trigger = function (pulseLen, level) {
  pigpio.gpioTrigger(this.gpio, +pulseLen, +level);
  return this;
};

Gpio.prototype.pwmWrite = function (dutyCycle) {
  pigpio.gpioPWM(this.gpio, +dutyCycle);
  return this;
};
Gpio.prototype.analogWrite = Gpio.prototype.pwmWrite;

Gpio.prototype.hardwarePwmWrite = function (frequency, dutyCycle) {
  pigpio.gpioHardwarePWM(this.gpio, +frequency, +dutyCycle);
  return this;
};

Gpio.prototype.getPwmDutyCycle = function () {
  return pigpio.gpioGetPWMdutycycle(this.gpio);
};

Gpio.prototype.pwmRange = function (range) {
  pigpio.gpioSetPWMrange(this.gpio, +range);
  return this;
};

Gpio.prototype.getPwmRange = function () {
  return pigpio.gpioGetPWMrange(this.gpio);
};

Gpio.prototype.getPwmRealRange = function () {
  return pigpio.gpioGetPWMrealRange(this.gpio);
};

Gpio.prototype.pwmFrequency = function (frequency) {
  pigpio.gpioSetPWMfrequency(this.gpio, +frequency);
  return this;
};

Gpio.prototype.getPwmFrequency = function () {
  return pigpio.gpioGetPWMfrequency(this.gpio);
};

Gpio.prototype.servoWrite = function (pulseWidth) {
  pigpio.gpioServo(this.gpio, +pulseWidth);
  return this;
};

Gpio.prototype.getServoPulseWidth = function () {
  return pigpio.gpioGetServoPulsewidth(this.gpio);
};

Gpio.prototype.enableInterrupt = function (edge, timeout) {
  var handler = function (gpio, level, tick) {
    this.emit('interrupt', level);
  }.bind(this);

  timeout = timeout || 0;
  pigpio.gpioSetISRFunc(this.gpio, +edge, +timeout, handler);
  return this;
};

Gpio.prototype.disableInterrupt = function () {
  pigpio.gpioSetISRFunc(this.gpio, Gpio.EITHER_EDGE, 0);
  return this;
};

Gpio.prototype.enableAlert = function () {
  var handler = function (gpio, level, tick) {
    this.emit('alert', level, tick);
  }.bind(this);

  pigpio.gpioSetAlertFunc(this.gpio, handler);
  return this;
};

Gpio.prototype.disableAlert = function () {
  pigpio.gpioSetAlertFunc(this.gpio);
  return this;
};

/* mode */
Gpio.INPUT = 0; // PI_INPUT
Gpio.OUTPUT = 1; //PI_OUTPUT;
Gpio.ALT0 = 4; // PI_ALT0;
Gpio.ALT1 = 5; // PI_ALT1;
Gpio.ALT2 = 6; // PI_ALT2;
Gpio.ALT3 = 7; // PI_ALT3;
Gpio.ALT4 = 3; // PI_ALT4;
Gpio.ALT5 = 2; // PI_ALT5;

/* pud */
Gpio.PUD_OFF = 0; // PI_PUD_OFF;
Gpio.PUD_DOWN = 1; // PI_PUD_DOWN;
Gpio.PUD_UP = 2; // PI_PUD_UP;

/* isr */
Gpio.RISING_EDGE = 0; // RISING_EDGE;
Gpio.FALLING_EDGE = 1; // FALLING_EDGE;
Gpio.EITHER_EDGE = 2; // EITHER_EDGE;

/* timeout */
Gpio.TIMEOUT = 2; // PI_TIMEOUT;

/* gpio numbers */
Gpio.MIN_GPIO = 0; // PI_MIN_GPIO;
Gpio.MAX_GPIO = 53; // PI_MAX_GPIO;
Gpio.MAX_USER_GPIO = 31; // PI_MAX_USER_GPIO;

/* ------------------------------------------------------------------------ */
/* GpioBank                                                                 */
/* ------------------------------------------------------------------------ */

function GpioBank(bank) {
  if (!(this instanceof GpioBank)) {
    return new GpioBank(bank);
  }

  initializePigpio();

  this.bankNo = +bank || GpioBank.BANK1;
}

module.exports.GpioBank = GpioBank;

GpioBank.prototype.read = function () {
  if (this.bankNo === GpioBank.BANK1) {
    return pigpio.GpioReadBits_0_31();
  } else if (this.bankNo === GpioBank.BANK2) {
    return pigpio.GpioReadBits_32_53();
  }
};

GpioBank.prototype.set = function (bits) {
  if (this.bankNo === GpioBank.BANK1) {
    pigpio.GpioWriteBitsSet_0_31(+bits);
  } else if (this.bankNo === GpioBank.BANK2) {
    pigpio.GpioWriteBitsSet_32_53(+bits);
  }

  return this;
};

GpioBank.prototype.clear = function (bits) {
  if (this.bankNo === GpioBank.BANK1) {
    pigpio.GpioWriteBitsClear_0_31(+bits);
  } else if (this.bankNo === GpioBank.BANK2) {
    pigpio.GpioWriteBitsClear_32_53(+bits);
  }

  return this;
};

GpioBank.prototype.bank = function () {
  return this.bankNo;
};

GpioBank.BANK1 = 1;
GpioBank.BANK2 = 2;

/* ------------------------------------------------------------------------ */
/* Notifier                                                                 */
/* ------------------------------------------------------------------------ */

var NOTIFICATION_PIPE_PATH_PREFIX = '/dev/pigpio';

function Notifier(options) {
  if (!(this instanceof Notifier)) {
    return new Notifier(options);
  }

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

module.exports.Notifier = Notifier;

Notifier.prototype.start = function (bits) {
  pigpio.gpioNotifyBegin(this.handle, +bits);
  return this;
};

Notifier.prototype.stop = function () {
  pigpio.gpioNotifyPause(this.handle);
  return this;
};

Notifier.prototype.close = function () {
  pigpio.gpioNotifyClose(this.handle);
};

Notifier.prototype.stream = function () {
  return this.notificationStream;
};

Notifier.NOTIFICATION_LENGTH = 12;
Notifier.PI_NTFY_FLAGS_ALIVE = 1 << 6;

/* ------------------------------------------------------------------------ */
/* Configuration                                                            */
/* ------------------------------------------------------------------------ */

module.exports.hardwareRevision = function () {
  return pigpio.gpioHardwareRevision();
};

module.exports.initialize = function () {
  initializePigpio();
};

module.exports.terminate = function () {
  pigpio.gpioTerminate();

  initialized = false;
};

module.exports.configureClock = function (microseconds, peripheral) {
  pigpio.gpioCfgClock(+microseconds, +peripheral);
};

module.exports.configureSocketPort = function (port) {
  pigpio.gpioCfgSocketPort(+port);
};

module.exports.CLOCK_PWM = 0; // PI_CLOCK_PWM;
module.exports.CLOCK_PCM = 1; // PI_CLOCK_PCM;

