#include <errno.h>
#include <pigpio.h>
#include <nan.h>

static void gpioISREventLoopHandler(uv_async_t* handle);
static void gpioAlertEventLoopHandler(uv_async_t* handle);

// TODO errors returned by uv calls are ignored


/* ------------------------------------------------------------------------ */
/* Gpio                                                                     */
/* ------------------------------------------------------------------------ */


class GpioCallback_t {
public:
  GpioCallback_t() : callback_(0), async_resource_(0) {
    Nan::HandleScope scope;
  }

  virtual ~GpioCallback_t() {
    Nan::HandleScope scope;

    if (callback_) {
      uv_unref((uv_handle_t *) &async_);
      delete callback_;
    }

    if (async_resource_) {
      delete async_resource_;
    }

    uv_close((uv_handle_t *) &async_, 0);

    callback_ = 0;
    async_resource_ = 0;
  }

  void AsyncSend() {
    uv_async_send(&async_);
  }

  void SetCallback(Nan::Callback *callback) {
    if (callback_) {
      uv_unref((uv_handle_t *) &async_);
      delete callback_;
    }

    if (async_resource_) {
      delete async_resource_;
    }

    callback_ = callback;
    async_resource_ = 0;

    if (callback_) {
      async_resource_ = new Nan::AsyncResource("pigpio:eventHandler");
      uv_ref((uv_handle_t *) &async_);
    }
  }

  Nan::Callback *Callback() {
    return callback_;
  }

  Nan::AsyncResource *Resource() {
    return async_resource_;
  }

protected:
  uv_async_t async_;

private:
  Nan::Callback *callback_;
  Nan::AsyncResource *async_resource_;
};


class GpioISR_t : public GpioCallback_t {
public:
  GpioISR_t() : GpioCallback_t() {
    uv_async_init(uv_default_loop(), &async_, gpioISREventLoopHandler);

    // Prevent async from keeping event loop alive, for the time being.
    uv_unref((uv_handle_t *) &async_);
  }
};


class GpioAlert_t : public GpioCallback_t {
public:
  GpioAlert_t() : GpioCallback_t() {
    uv_async_init(uv_default_loop(), &async_, gpioAlertEventLoopHandler);

    // Prevent async from keeping event loop alive, for the time being.
    uv_unref((uv_handle_t *) &async_);
  }
};


static GpioISR_t *gpioISR_g;
static GpioAlert_t *gpioAlert_g;
static int gpio_g;
static int level_g;
static uint32_t tick_g;
static uv_sem_t sem_g;


void ThrowPigpioError(int err, const char *pigpiocall) {
  char buf[128];

  snprintf(buf, sizeof(buf), "pigpio error %d in %s", err, pigpiocall);

  Nan::ThrowError(buf);
}


NAN_METHOD(gpioHardwareRevision) {
  info.GetReturnValue().Set(gpioHardwareRevision());
}


NAN_METHOD(gpioCfgInterfaces) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioCfgInterfaces", ""));
  }

  unsigned ifFlags = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioCfgInterfaces(ifFlags);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioCfgInterfaces");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioInitialise) {
  int rc = gpioInitialise();
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioInitialise");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioTerminate) {
  gpioTerminate();
}


NAN_METHOD(gpioSetMode) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetMode", ""));
  }

  unsigned gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned mode = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioSetMode(gpio, mode);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioSetMode");
  }
}


NAN_METHOD(gpioGetMode) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioGetMode", ""));
  }

  unsigned gpio = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioGetMode(gpio);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioGetMode");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioSetPullUpDown) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetPullUpDown", ""));
  }

  unsigned gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned pud = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioSetPullUpDown(gpio, pud);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioSetPullUpDown");
  }
}


NAN_METHOD(gpioRead) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioRead", ""));
  }

  unsigned gpio = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioRead(gpio);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioRead");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioWrite) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetPullUpDown", ""));
  }

  unsigned gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned level = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioWrite(gpio, level);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioWrite");
  }
}


NAN_METHOD(gpioTrigger) {
  if (info.Length() < 3 || !info[0]->IsUint32() || !info[1]->IsUint32() || !info[2]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioTrigger", ""));
  }

  unsigned gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned pulseLen = Nan::To<uint32_t>(info[1]).FromJust();
  unsigned level = Nan::To<uint32_t>(info[2]).FromJust();

  int rc = gpioTrigger(gpio, pulseLen, level);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioTrigger");
  }
}

NAN_METHOD(gpioTick) {
    uint32_t rc = gpioTick();
    info.GetReturnValue().Set(rc);
}

NAN_METHOD(gpioPWM) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioPWM", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned dutycycle = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioPWM(user_gpio, dutycycle);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioPWM");
  }
}


NAN_METHOD(gpioHardwarePWM) {
  if (info.Length() < 3 ||
      !info[0]->IsUint32() ||
      !info[1]->IsUint32() ||
      !info[2]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioHardwarePWM", ""));
  }

  unsigned gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned frequency = Nan::To<uint32_t>(info[1]).FromJust();
  unsigned dutycycle = Nan::To<uint32_t>(info[2]).FromJust();

  int rc = gpioHardwarePWM(gpio, frequency, dutycycle);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioHardwarePWM");
  }
}


NAN_METHOD(gpioGetPWMdutycycle) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioGetPWMdutycycle", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioGetPWMdutycycle(user_gpio);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioGetPWMdutycycle");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioSetPWMrange) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetPWMrange", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned range = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioSetPWMrange(user_gpio, range);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioSetPWMrange");
  }
}


NAN_METHOD(gpioGetPWMrange) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioGetPWMrange", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioGetPWMrange(user_gpio);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioGetPWMrange");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioGetPWMrealRange) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioGetPWMrealRange", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioGetPWMrealRange(user_gpio);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioGetPWMrealRange");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioSetPWMfrequency) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetPWMfrequency", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned frequency = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioSetPWMfrequency(user_gpio, frequency);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioSetPWMfrequency");
  }
}


NAN_METHOD(gpioGetPWMfrequency) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioGetPWMfrequency", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioGetPWMfrequency(user_gpio);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioGetPWMfrequency");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioServo) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioServo", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned pulsewidth = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioServo(user_gpio, pulsewidth);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioServo");
  }
}


NAN_METHOD(gpioGetServoPulsewidth) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioGetServoPulsewidth", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioGetServoPulsewidth(user_gpio);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioGetServoPulsewidth");
  }

  info.GetReturnValue().Set(rc);
}


// gpioISRHandler is not executed in the event loop thread
static void gpioISRHandler(int gpio, int level, uint32_t tick) {
  uv_sem_wait(&sem_g);

  gpio_g = gpio;
  level_g = level;
  tick_g = tick;

  gpioISR_g[gpio].AsyncSend();
}


// gpioISREventLoopHandler is executed in the event loop thread.
static void gpioISREventLoopHandler(uv_async_t* handle) {
  Nan::HandleScope scope;

  if (gpioISR_g[gpio_g].Callback()) {
    v8::Local<v8::Value> args[3] = {
      Nan::New<v8::Integer>(gpio_g),
      Nan::New<v8::Integer>(level_g),
      Nan::New<v8::Integer>(tick_g)
    };

    gpioISR_g[gpio_g].Callback()->Call(
      3,
      args,
      gpioISR_g[gpio_g].Resource()
    );
  }

  uv_sem_post(&sem_g);
}


static NAN_METHOD(gpioSetISRFunc) {
  if (info.Length() < 3 ||
      !info[0]->IsUint32() ||
      !info[1]->IsUint32() ||
      !info[2]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetISRFunc", ""));
  }

  if (info.Length() >= 4 &&
      !info[3]->IsFunction() &&
      !info[3]->IsNull() &&
      !info[3]->IsUndefined()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetISRFunc", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned edge = Nan::To<uint32_t>(info[1]).FromJust();
  int timeout = Nan::To<int32_t>(info[2]).FromJust();
  Nan::Callback *callback = 0;
  gpioISRFunc_t isrFunc = 0;

  if (info.Length() >= 4 && info[3]->IsFunction()) {
    callback = new Nan::Callback(info[3].As<v8::Function>());
    isrFunc = gpioISRHandler;
  }

  gpioISR_g[user_gpio].SetCallback(callback);

  int rc = gpioSetISRFunc(user_gpio, edge, timeout, isrFunc);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioSetISRFunc");
  }
}


// gpioAlertHandler is not executed in the event loop thread
static void gpioAlertHandler(int gpio, int level, uint32_t tick) {
  uv_sem_wait(&sem_g);

  gpio_g = gpio;
  level_g = level;
  tick_g = tick;

  gpioAlert_g[gpio].AsyncSend();
}


// gpioAlertEventLoopHandler is executed in the event loop thread.
static void gpioAlertEventLoopHandler(uv_async_t* handle) {
  Nan::HandleScope scope;

  if (gpioAlert_g[gpio_g].Callback()) {
    v8::Local<v8::Value> args[3] = {
      Nan::New<v8::Integer>(gpio_g),
      Nan::New<v8::Integer>(level_g),
      Nan::New<v8::Integer>(tick_g)
    };

    gpioAlert_g[gpio_g].Callback()->Call(
      3,
      args,
      gpioAlert_g[gpio_g].Resource()
    );
  }

  uv_sem_post(&sem_g);
}


static NAN_METHOD(gpioSetAlertFunc) {
  if (info.Length() < 1 ||
      !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetAlertFunc"));
  }

  if (info.Length() >= 2 &&
      !info[1]->IsFunction() &&
      !info[1]->IsNull() &&
      !info[1]->IsUndefined()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetAlertFunc"));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();
  Nan::Callback *callback = 0;
  gpioAlertFunc_t alertFunc = 0;

  if (info.Length() >= 2 && info[1]->IsFunction()) {
    callback = new Nan::Callback(info[1].As<v8::Function>());
    alertFunc = gpioAlertHandler;
  }

  gpioAlert_g[user_gpio].SetCallback(callback);

  int rc = gpioSetAlertFunc(user_gpio, alertFunc);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioSetAlertFunc");
  }
}

NAN_METHOD(gpioGlitchFilter) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioGlitchFilter", ""));
  }

  unsigned user_gpio = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned steady = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioGlitchFilter(user_gpio, steady);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioGlitchFilter");
  }
}


/* ------------------------------------------------------------------------ */
/* GpioBank                                                                 */
/* ------------------------------------------------------------------------ */


NAN_METHOD(GpioReadBits_0_31) {
  info.GetReturnValue().Set(gpioRead_Bits_0_31());
}


NAN_METHOD(GpioReadBits_32_53) {
  info.GetReturnValue().Set(gpioRead_Bits_32_53());
}


NAN_METHOD(GpioWriteBitsSet_0_31) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "GpioWriteBitsSet_0_31", ""));
  }

  unsigned bits = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioWrite_Bits_0_31_Set(bits);
  if (rc < 0) {
    return ThrowPigpioError(rc, "GpioWriteBitsSet_0_31");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(GpioWriteBitsSet_32_53) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "GpioWriteBitsSet_32_53", ""));
  }

  unsigned bits = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioWrite_Bits_32_53_Set(bits);
  if (rc < 0) {
    return ThrowPigpioError(rc, "GpioWriteBitsSet_32_53");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(GpioWriteBitsClear_0_31) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "GpioWriteBitsClear_0_31", ""));
  }

  unsigned bits = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioWrite_Bits_0_31_Clear(bits);
  if (rc < 0) {
    return ThrowPigpioError(rc, "GpioWriteBitsClear_0_31");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(GpioWriteBitsClear_32_53) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "GpioWriteBitsClear_32_53", ""));
  }

  unsigned bits = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioWrite_Bits_32_53_Clear(bits);
  if (rc < 0) {
    return ThrowPigpioError(rc, "GpioWriteBitsClear_32_53");
  }

  info.GetReturnValue().Set(rc);
}

/* ------------------------------------------------------------------------ */
/* Notifier                                                                 */
/* ------------------------------------------------------------------------ */


NAN_METHOD(gpioNotifyOpen) {
  int rc = gpioNotifyOpen();
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioNotifyOpen");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioNotifyOpenWithSize) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioNotifyOpenWithSize", ""));
  }

  unsigned bufSize = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioNotifyOpenWithSize(bufSize);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioNotifyOpen");
  }

  info.GetReturnValue().Set(rc);
}


NAN_METHOD(gpioNotifyBegin) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioNotifyBegin", ""));
  }

  unsigned handle = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned bits = Nan::To<uint32_t>(info[1]).FromJust();

  int rc = gpioNotifyBegin(handle, bits);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioNotifyBegin");
  }
}


NAN_METHOD(gpioNotifyPause) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioNotifyPause", ""));
  }

  unsigned handle = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioNotifyPause(handle);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioNotifyPause");
  }
}


NAN_METHOD(gpioNotifyClose) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioNotifyClose", ""));
  }

  unsigned handle = Nan::To<uint32_t>(info[0]).FromJust();

  int rc = gpioNotifyClose(handle);
  if (rc < 0) {
    return ThrowPigpioError(rc, "gpioNotifyClose");
  }
}


/* ------------------------------------------------------------------------ */
/* Configuration                                                            */
/* ------------------------------------------------------------------------ */


NAN_METHOD(gpioCfgClock) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioCfgClock", ""));
  }

  unsigned cfgMicros = Nan::To<uint32_t>(info[0]).FromJust();
  unsigned cfgPeripheral = Nan::To<uint32_t>(info[1]).FromJust();
  unsigned cfgSource = 0;

  gpioCfgClock(cfgMicros, cfgPeripheral, cfgSource);
}


NAN_METHOD(gpioCfgSocketPort) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioCfgSocketPort", ""));
  }

  unsigned cfgPort = Nan::To<uint32_t>(info[0]).FromJust();

  gpioCfgSocketPort(cfgPort);
}


/*static void SetConst(
  Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target,
  const char* name,
  int value
) {
  Nan::Set(target,
    Nan::New<v8::String>(name).ToLocalChecked(),
    Nan::New<v8::Integer>(value)
  );
}*/


static void SetFunction(
  Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target,
  const char* name,
  Nan::FunctionCallback callback
) {
  Nan::Set(target,
    Nan::New(name).ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(callback)).ToLocalChecked()
  );
}


NAN_MODULE_INIT(InitAll) {
  uv_sem_init(&sem_g, 1);

  /* mode constants */
/*  SetConst(target, "PI_INPUT", PI_INPUT);
  SetConst(target, "PI_OUTPUT", PI_OUTPUT);
  SetConst(target, "PI_ALT0", PI_ALT0);
  SetConst(target, "PI_ALT1", PI_ALT1);
  SetConst(target, "PI_ALT2", PI_ALT2);
  SetConst(target, "PI_ALT3", PI_ALT3);
  SetConst(target, "PI_ALT4", PI_ALT4);
  SetConst(target, "PI_ALT5", PI_ALT5);*/

  /* pud constants */
/*  SetConst(target, "PI_PUD_OFF", PI_PUD_OFF);
  SetConst(target, "PI_PUD_DOWN", PI_PUD_DOWN);
  SetConst(target, "PI_PUD_UP", PI_PUD_UP);*/

  /* isr constants */
/*  SetConst(target, "RISING_EDGE", RISING_EDGE);
  SetConst(target, "FALLING_EDGE", FALLING_EDGE);
  SetConst(target, "EITHER_EDGE", EITHER_EDGE);*/

  /* timeout constant */
/*  SetConst(target, "PI_TIMEOUT", PI_TIMEOUT); */

  /* gpio number constants */
/*  SetConst(target, "PI_MIN_GPIO", PI_MIN_GPIO);
  SetConst(target, "PI_MAX_GPIO", PI_MAX_GPIO);
  SetConst(target, "PI_MAX_USER_GPIO", PI_MAX_USER_GPIO);*/

  /* error code constants */
/*  SetConst(target, "PI_INIT_FAILED", PI_INIT_FAILED);*/

  /* gpioCfgClock cfgPeripheral constants */
/*  SetConst(target, "PI_CLOCK_PWM", PI_CLOCK_PWM);
  SetConst(target, "PI_CLOCK_PCM", PI_CLOCK_PCM);*/

  /* functions */
  SetFunction(target, "gpioHardwareRevision", gpioHardwareRevision);
  SetFunction(target, "gpioCfgInterfaces", gpioCfgInterfaces);
  SetFunction(target, "gpioInitialise", gpioInitialise);
  SetFunction(target, "gpioTerminate", gpioTerminate);

  SetFunction(target, "gpioSetMode", gpioSetMode);
  SetFunction(target, "gpioGetMode", gpioGetMode);

  SetFunction(target, "gpioSetPullUpDown", gpioSetPullUpDown);

  SetFunction(target, "gpioRead", gpioRead);
  SetFunction(target, "gpioWrite", gpioWrite);
  SetFunction(target, "gpioTrigger", gpioTrigger);

  SetFunction(target, "gpioPWM", gpioPWM);
  SetFunction(target, "gpioHardwarePWM", gpioHardwarePWM);
  SetFunction(target, "gpioGetPWMdutycycle", gpioGetPWMdutycycle);
  SetFunction(target, "gpioSetPWMrange", gpioSetPWMrange);
  SetFunction(target, "gpioGetPWMrange", gpioGetPWMrange);
  SetFunction(target, "gpioGetPWMrealRange", gpioGetPWMrealRange);
  SetFunction(target, "gpioSetPWMfrequency", gpioSetPWMfrequency);
  SetFunction(target, "gpioGetPWMfrequency", gpioGetPWMfrequency);

  SetFunction(target, "gpioServo", gpioServo);
  SetFunction(target, "gpioGetServoPulsewidth", gpioGetServoPulsewidth);

  SetFunction(target, "gpioSetISRFunc", gpioSetISRFunc);
  SetFunction(target, "gpioSetAlertFunc", gpioSetAlertFunc);
  SetFunction(target, "gpioGlitchFilter", gpioGlitchFilter);

  SetFunction(target, "GpioReadBits_0_31", GpioReadBits_0_31);
  SetFunction(target, "GpioReadBits_32_53", GpioReadBits_32_53);
  SetFunction(target, "GpioWriteBitsSet_0_31", GpioWriteBitsSet_0_31);
  SetFunction(target, "GpioWriteBitsSet_32_53", GpioWriteBitsSet_32_53);
  SetFunction(target, "GpioWriteBitsClear_0_31", GpioWriteBitsClear_0_31);
  SetFunction(target, "GpioWriteBitsClear_32_53", GpioWriteBitsClear_32_53);

  SetFunction(target, "gpioNotifyOpen", gpioNotifyOpen);
  SetFunction(target, "gpioNotifyOpenWithSize", gpioNotifyOpenWithSize);
  SetFunction(target, "gpioNotifyBegin", gpioNotifyBegin);
  SetFunction(target, "gpioNotifyPause", gpioNotifyPause);
  SetFunction(target, "gpioNotifyClose", gpioNotifyClose);

  SetFunction(target, "gpioCfgClock", gpioCfgClock);
  SetFunction(target, "gpioCfgSocketPort", gpioCfgSocketPort);

  SetFunction(target, "gpioTick", gpioTick);
  
  gpioISR_g = new GpioISR_t[PI_MAX_USER_GPIO + 1];
  gpioAlert_g = new GpioAlert_t[PI_MAX_USER_GPIO + 1];
}

NODE_MODULE(pigpio, InitAll)

