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


NAN_MODULE_INIT(InitAll) {
  /* mode */
  Nan::Set(target, Nan::New<v8::String>("PI_INPUT").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_INPUT));
  Nan::Set(target, Nan::New<v8::String>("PI_OUTPUT").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_OUTPUT));
  Nan::Set(target, Nan::New<v8::String>("PI_ALT0").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_ALT0));
  Nan::Set(target, Nan::New<v8::String>("PI_ALT1").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_ALT1));
  Nan::Set(target, Nan::New<v8::String>("PI_ALT2").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_ALT2));
  Nan::Set(target, Nan::New<v8::String>("PI_ALT3").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_ALT3));
  Nan::Set(target, Nan::New<v8::String>("PI_ALT4").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_ALT4));
  Nan::Set(target, Nan::New<v8::String>("PI_ALT5").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_ALT5));

  /* pud */
  Nan::Set(target, Nan::New<v8::String>("PI_PUD_OFF").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_PUD_OFF));
  Nan::Set(target, Nan::New<v8::String>("PI_PUD_DOWN").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_PUD_DOWN));
  Nan::Set(target, Nan::New<v8::String>("PI_PUD_UP").ToLocalChecked(),
    Nan::New<v8::Integer>(PI_PUD_UP));

  Nan::Set(target, Nan::New("gpioInitialise").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioInitialise)).ToLocalChecked());
  Nan::Set(target, Nan::New("gpioTerminate").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioTerminate)).ToLocalChecked());

  Nan::Set(target, Nan::New("gpioSetMode").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioSetMode)).ToLocalChecked());
  Nan::Set(target, Nan::New("gpioGetMode").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioGetMode)).ToLocalChecked());
  Nan::Set(target, Nan::New("gpioSetPullUpDown").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioSetPullUpDown)).ToLocalChecked());
  Nan::Set(target, Nan::New("gpioRead").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioRead)).ToLocalChecked());
  Nan::Set(target, Nan::New("gpioWrite").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioWrite)).ToLocalChecked());

  Nan::Set(target, Nan::New("gpioPWM").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioPWM)).ToLocalChecked());
  Nan::Set(target, Nan::New("gpioServo").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(gpioServo)).ToLocalChecked());
}

NODE_MODULE(pigpio, InitAll)

