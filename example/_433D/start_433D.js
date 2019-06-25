/* Example:
   ** Send ONLY codes 1234 then 5667 then 8888
   node test_433.js 0 1234 5667 8888
   
   ** Receive ONLY
   node test_433.js 1

  ** Send and Receive
   node test_433.js 1 1234 5666 8888
*/
let pi = require("../../").Gpio;
let _433 = require("./_433.js");

function promised_send(tx, list) {
  return new Promise((res, rej) => {
    send_single(tx, list, 0, {
      resolve: res,
      reject: rej
    })
  })
}

function send_single(tx, list, idx, promisefx) {
  tx.send(parseInt(list[idx])).then(() => {
    console.log("Send complete", idx)
  }).catch(e => {
    console.log("error sending: ", idx, e.stack);

  }).then(() => {
    if (list[idx + 1]) {
      setTimeout(() => {
        send_single(tx, list, idx + 1, promisefx);
      }, 2000)

    } else
      promisefx.resolve();
  })
}
const RX = 6;
const TX = 5;

if (process.argv[2] == 1) {
  console.log("starting rx on BCM" + RX)
  const rx = new _433.rx(pi, {
    gpio: RX,
    max_bits: 64,
    min_bits: 24,
    cb: (code, bits, gap, t0, t1) => {
      console.log("code: " + code + ", bits: " + bits + ", gap: " + gap + ", t0: " + t0 + ", t1: " + t1);

    }
  })
}



if (process.argv.length > 3) {
  console.log("starting tx on BCM" + TX)
  const tx = new _433.tx(pi, {
    gpio: TX,
    repeats: 12
  })

  console.log("sending TX")
  promised_send(tx, process.argv.slice(3)).then(() => {
    console.log("All message sent")
  }).catch(e => {
    console.log("error sending all message ", e.stack)
  })

}