## Class Notifier - Notification Stream

A Notifier contains a stream which provides notifications about state changes
on any of GPIOs 0 through 31 concurrently. Each notification read from the
stream contains information about the logic levels of the GPIOs and the time of
the state changes accurate to a few microseconds. It's possible to handle in
excess of 100000 notifications per second.

#### Methods
  - [Notifier([options])](#notifieroptions)
  - [start(bits)](#startbits)
  - [stop()](#stop)
  - [close()](#close)
  - [stream()](#stream)

#### Constants
  - [NOTIFICATION_LENGTH](#notification_length)
  - [PI_NTFY_FLAGS_ALIVE](#pi_ntfy_flags_alive)

### Methods

#### Notifier([options])
- options - object (optional)

Returns a new Notifier object that contains a stream which provides
notifications about state changes on any of GPIOs 0 through 31 concurrently.
Each notification read from the stream contains information about the logic
levels of the GPIOs and the time of the state changes accurate to a few
microseconds. The optional options object can be used to configure which GPIOs
notifications should be provided for.

The following options are supported:
- bits - a bit mask indicating the GPIOs of interest, bit0 corresponds to
GPIO0, bit1 corresponds to GPIO1, ..., bit31 corresponds to GPIO31. If a bit
is set, the corresponding GPIO will be monitored for state changes. (optional,
no default)

If bits are specified, notifications will be started. If no bits are specified,
the `start` method can be used to start notifications at a later point in time.

Each notification in the stream occupies 12 bytes and has the following
structure:

- seqno - UInt16, little-endian
  - seqno starts at 0 and increments by one for each notification. It wraps
    around after 2^16 notifications.
- flags - UInt16, little-endian
  - One flag is defined. If bit 6 is set (PI_NTFY_FLAGS_ALIVE) this indicates
    a keep alive signal on the stream and is sent once a minute in the absence
    of other notification activity. 
- tick - UInt32, little-endian
  - The number of microseconds since system boot. It wraps around after 1h12m.
    See [Event: 'alert'](https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#event-alert)
    for further information about unsigned 32 bit arithmetic in JavaScript.
- level - UInt32, little-endian
  - Indicates the level of each GPIO. If bit x is set then GPIOx is high. 

#### start(bits)
- bits - a bit mask indicating the GPIOs of interest, bit0 corresponds to
GPIO0, bit1 corresponds to GPIO1, ..., bit31 corresponds to GPIO31. If a bit
is set, the corresponding GPIO will be monitored for state changes.

Starts notifications for the GPIOs specified in the bit mask. Returns this.

#### stop()
Stops notifications. Notifications can be restarted with the `start` method.
Returns this.

#### close()
Stops notifications and releases resources. Returns undefined.

#### stream()
Returns the notification stream which is a `Readable` stream.

### Constants

#### NOTIFICATION_LENGTH
The number of bytes occupied by a notification in the notification stream.

#### PI_NTFY_FLAGS_ALIVE
Indicates a keep alive signal on the stream and is sent once a minute in the
absence of other notification activity.

