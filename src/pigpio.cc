#include <pigpio.h>
#include <nan.h>

NAN_METHOD(gpioInitialise) {
  info.GetReturnValue().Set(gpioInitialise());
}


NAN_METHOD(gpioTerminate) {
  gpioTerminate();
}


NAN_METHOD(gpioSetMode) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetMode"));
  }

  unsigned gpio = info[0]->Uint32Value();
  unsigned mode = info[1]->Uint32Value();

  info.GetReturnValue().Set(gpioSetMode(gpio, mode));
}


NAN_METHOD(gpioGetMode) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioGetMode"));
  }

  unsigned gpio = info[0]->Uint32Value();

  info.GetReturnValue().Set(gpioGetMode(gpio));
}


NAN_METHOD(gpioSetPullUpDown) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetPullUpDown"));
  }

  unsigned gpio = info[0]->Uint32Value();
  unsigned pud = info[1]->Uint32Value();

  info.GetReturnValue().Set(gpioSetPullUpDown(gpio, pud));
}


NAN_METHOD(gpioRead) {
  if (info.Length() < 1 || !info[0]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioRead"));
  }

  unsigned gpio = info[0]->Uint32Value();

  info.GetReturnValue().Set(gpioRead(gpio));
}


NAN_METHOD(gpioWrite) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioSetPullUpDown"));
  }

  unsigned gpio = info[0]->Uint32Value();
  unsigned level = info[1]->Uint32Value();

  info.GetReturnValue().Set(gpioWrite(gpio, level));
}


NAN_METHOD(gpioPWM) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioPWM"));
  }

  unsigned user_gpio = info[0]->Uint32Value();
  unsigned dutycycle = info[1]->Uint32Value();

  info.GetReturnValue().Set(gpioPWM(user_gpio, dutycycle));
}


NAN_METHOD(gpioServo) {
  if (info.Length() < 2 || !info[0]->IsUint32() || !info[1]->IsUint32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "gpioServo"));
  }

  unsigned user_gpio = info[0]->Uint32Value();
  unsigned pulsewidth = info[1]->Uint32Value();

  info.GetReturnValue().Set(gpioServo(user_gpio, pulsewidth));
}


static void SetConst(
  Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target,
  const char* name,
  int value
) {
  Nan::Set(target,
    Nan::New<v8::String>(name).ToLocalChecked(),
    Nan::New<v8::Integer>(value)
  );
}


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
  /* mode */
  SetConst(target, "PI_INPUT", PI_INPUT);
  SetConst(target, "PI_OUTPUT", PI_OUTPUT);
  SetConst(target, "PI_ALT0", PI_ALT0);
  SetConst(target, "PI_ALT1", PI_ALT1);
  SetConst(target, "PI_ALT2", PI_ALT2);
  SetConst(target, "PI_ALT3", PI_ALT3);
  SetConst(target, "PI_ALT4", PI_ALT4);
  SetConst(target, "PI_ALT5", PI_ALT5);

  /* pud */
  SetConst(target, "PI_PUD_OFF", PI_PUD_OFF);
  SetConst(target, "PI_PUD_DOWN", PI_PUD_DOWN);
  SetConst(target, "PI_PUD_UP", PI_PUD_UP);

  SetFunction(target, "gpioInitialise", gpioInitialise);
  SetFunction(target, "gpioTerminate", gpioTerminate);

  SetFunction(target, "gpioSetMode", gpioSetMode);
  SetFunction(target, "gpioGetMode", gpioGetMode);
  SetFunction(target, "gpioSetPullUpDown", gpioSetPullUpDown);
  SetFunction(target, "gpioRead", gpioRead);
  SetFunction(target, "gpioWrite", gpioWrite);

  SetFunction(target, "gpioPWM", gpioPWM);
  SetFunction(target, "gpioServo", gpioServo);
}

NODE_MODULE(pigpio, InitAll)

