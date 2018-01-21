## Class GpioBank - Banked General Purpose Input Output

There are 54 GPIOs named GPIO0 through GPIO53.

They are split into two banks. Bank 1 consists of GPIO0 through GPIO31. Bank 2
consists of GPIO32 through GPIO53.

All the GPIOs which are safe for the user to read and write are in bank 1. Not
all GPIOs in bank 1 are safe though, it depends on the board type.

A GpioBank object can be used to read or write up to 32 GPIOs as one operation.

#### Methods
  - [GpioBank(bank)](#gpiobankbank)
  - [read()](#read)
  - [set(bits)](#setbits)
  - [clear(bits)](#clearbits)
  - [bank()](#bank)

#### Constants
  - [BANK1](#bank1)
  - [BANK2](#bank2)

### Methods

#### GpioBank(bank)
- bank - BANK1 or BANK2 (optional, defaults to BANK1)

Returns a new GpioBank object for accessing up to 32 GPIOs as one operation.

#### read()
Returns the current level of all GPIOs in the bank.

#### set(bits)
bits - a bit mask of the the GPIOs to set to 1

For each GPIO in the bank, sets the GPIO level to 1 if the corresponding bit in
bits is set. Returns this.

#### clear(bits)
bits - a bit mask of the the GPIOs to clear or set to 0

For each GPIO in the bank, sets the GPIO level to 0 if the corresponding bit in
bits is set. Returns this.

#### bank()
Returns the bank identifier (BANK1 or BANK2.)

### Constants

#### BANK1
Identifies bank 1.

#### BANK2
Identifies bank 2.

