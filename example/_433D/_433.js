let pi;
class _433 {
	constructor(pi, props) {
		pi = pi;
		this.state = {
			config: {}
		}
	}
	get_current_tick() {

		return this.state.pi.tick(); // 2^32-1 or 4294967295, the max unsigned 32 bit integer

	}
	tick_diff(t1, t2) {

		var tDiff = t2 - t1
		if (tDiff < 0)
			tDiff += (1 << 32);
		return tDiff;


	}
}
class rx433 extends _433 {
	constructor(pi, props) {
		super(pi, props);
		this.state.config.gpio = props.gpio;
		this.state.config.cb = props.cb || null;
		this.state.config.min_bits = props.min_bits || 8;
		this.state.config.max_bits = props.max_bits || 32;
		this.state.config.glitch = props.glitch || 150;

		this.state.in_code = false;
		this.state.edge = 0;
		this.state.code = 0;
		this.state.gap = 0;

		this.state.ready = false;

		this.state.pi = new pi(this.state.config.gpio, {
			mode: pi.OUTPUT
		});
		this.state.pi.glitchFilter(this.state.config.glitch);

		this.state.last_edge_tick = this.get_current_tick()
		this.state.pi.enableInterrupt(pi.EITHER_EDGE);
		this.state.pi.on("interrupt", (level, tick) => {

			this._cbf(level, tick);
		})


	}
	_timings(e0, e1) {
		var shorter, longer;
		if (e0 < e1) {
			shorter = e0;
			longer = e1;
		} else {
			shorter = e1;
			longer = e0;
		}
		if (this.state.bits) {
			this.state.t0 += shorter;
			this.state.t1 += longer;
		} else {
			this.state.t0 = shorter;
			this.state.t1 = longer;
		}
		this.state.bits += 1;

	}
	_calibrate(e0, e1) {

		this.state.bits = 0;
		this._timings(e0, e1)
		this.state.bits = 0;

		var ratio = parseFloat(this.state.t1) / parseFloat(this.state.t0)

		if (ratio < 1.5) {
			this.state.in_code = false
		}
		var slack0 = parseInt(0.3 * this.state.t0)
		var slack1 = parseInt(0.2 * this.state.t1)

		this.state.min_0 = this.state.t0 - slack0;
		this.state.max_0 = this.state.t0 + slack0;

		this.state.min_1 = this.state.t1 - slack1;
		this.state.max_1 = this.state.t1 + slack1;
	}
	_test_bit(e0, e1) {
		this._timings(e0, e1);
		if (this.state.min_0 < e0 && e0 < this.state.max_0 &&
			this.state.min_1 < e1 && e1 < this.state.max_1)
			return 0;
		else if (this.state.min_0 < e1 && e1 < this.state.max_0 &&
			this.state.min_1 < e0 && e0 < this.state.max_1)
			return 1;
		else
			return 2;

	}
	_cbf(l, t) {
		var edge_len = this.tick_diff(this.state.last_edge_tick, t)
		this.state.last_edge_tick = t;

		if (edge_len > 5000) {

			if (this.state.in_code) {
				if (this.state.config.min_bits <= this.state.bits &&
					this.state.bits <= this.state.config.max_bits) {
					this.state.lbits = this.state.bits;
					this.state.lcode = this.state.code;
					this.state.lgap = this.state.gap;
					this.state.lt0 = this.state.t0 / this.state.bits;
					this.state.lt1 = this.state.t1 / this.state.bits;
					this.state.ready = true;

					if (typeof this.state.config.cb === "function")
						this.state.config.cb(this.state.lcode, this.state.lbits, this.state.lgap, this.state.lt0, this.state.lt1)

				}
			}
			this.state.in_code = true;
			this.state.gap = edge_len;
			this.state.edge = 0;
			this.state.bits = 0;
			this.state.code = 0;

		} else if (this.state.in_code) {
			if (this.state.edge == 0) {

				this.state.e0 = edge_len;
			} else if (this.state.edge == 1) {

				this._calibrate(this.state.e0, edge_len);
			}
			if (this.state.edge % 2) {

				var bit = this._test_bit(this.state.even_edge_len, edge_len);
				this.state.code = this.state.code << 1
				if (bit == 1)
					this.state.code += 1
				else if (bit != 0)
					this.state.in_code = false;
			} else {

				this.state.even_edge_len = edge_len;
			}
			this.state.edge += 1
		}

	}
	ready() {
		return this.state.ready;
	}
	code() {
		this.state.ready = false;
		return this.state.lcode;
	}
	details() {
		this.state.ready = false;
		return {
			code: this.state.lcode,
			bits: this.state.lbits,
			gap: this.state.lgap,
			t0: this.state.lt0,
			t1: this.stat.lt1
		}
	}
	cancel() {
		if (typeof this.state.config.cb === "function") {
			this.state.pi.glitchFilter(0);
			this.state.config.cb.cancel();
			this.state.config.cb = false
		}
	}

}
class tx433 extends _433 {
	constructor(pi, props) {
		super(pi, props)
		this.state.config.gpio = props.gpio;
		this.state.config.repeats = props.repeats || 6;
		this.state.config.bits = props.bits || 24;
		this.state.config.gap = props.gap || 9000;
		this.state.config.t0 = props.t0 || 300;
		this.state.config.t1 = props.t1 || 900;



		this.state.pi = new pi(this.state.config.gpio, {
			mode: pi.OUTPUT
		})
		this._make_waves();

	}
	_make_waves() {
		var wf = [];
		wf.push({
			gpioOn: (1 << this.state.config.gpio),
			gpioOff: (0),
			usDelay: this.state.config.t0
		})
		wf.push({
			gpioOn: 0,
			gpioOff: 1 << this.state.config.gpio,
			usDelay: this.state.config.gap
		})
		this.state.pi.waveAddGeneric(wf.length, wf)

		this.state.amble = this.state.pi.waveCreate();


		var wf2 = [];
		wf2.push({
			gpioOn: (1 << this.state.config.gpio),
			gpioOff: 0,
			usDelay: this.state.config.t0
		})
		wf2.push({
			gpioOn: 0,
			gpioOff: (1 << this.state.config.gpio),
			usDelay: this.state.config.t1
		})
		this.state.pi.waveAddGeneric(wf2.length, wf2);

		this.state.wid0 = this.state.pi.waveCreate();

		var wf3 = [];
		wf3.push({
			gpioOn: (1 << this.state.config.gpio),
			gpioOff: 0,
			usDelay: this.state.config.t1
		})
		wf3.push({
			gpioOn: 0,
			gpioOff: (1 << this.state.config.gpio),
			usDelay: this.state.config.t0

		})
		this.state.pi.waveAddGeneric(wf3.length, wf3)

		this.state.wid1 = this.state.pi.waveCreate();

	}
	set_repeats(repeats) {
		if (1 < repeats &&
			repeats < 100) {
			this.state.config.repeats = repeats;
		}
	}
	set_timings(gap, t0, t1) {
		this.state.config.gap = gap;
		this.state.config.t0 = t0;
		this.state.config.t1 = t1;

		this.state.pi.waveDelete(this.state.amble);
		this.state.pi.waveDelete(this.state.wid0);
		this.state.pi.waveDelete(this.state.wid1);

		this._make_waves();
	}
	sleep(ms) {
		var d = Date.now();
		while (new Date().getTime() < (stop + time)) {;
		}
	}
	send(code) {

		return new Promise((res, rej) => {
			var chain = [this.state.amble, 255, 0];
			var bit = (1 << (this.state.config.bits - 1))
			for (var x = 0; x < this.state.config.bits; x++) {
				if (code & bit)
					chain.push(this.state.wid1)
				else chain.push(this.state.wid0)
				bit = bit >> 1
			}
			chain.push(this.state.amble)
			chain.push(255)
			chain.push(1)
			chain.push(this.state.config.repeats)
			chain.push(0);
			var bufchain = Buffer.from(chain)
			this.state.pi.waveChain(bufchain, bufchain.length);
			this.check_tx_busy({
				resolve: res,
				reject: rej
			})

		});


	}
	check_tx_busy(promisefx) {
		if (this.state.pi.waveTxBusy())
			this.state.checkbusytimer = setTimeout(() => {

				this.check_tx_busy(promisefx)
			}, 100);
		else
			promisefx.resolve();
	}
	cancel() {
		this.state.pi.waveDelete(this.state.amble);
		this.state.pi.waveDelete(this.state.wid0);
		this.state.pi.waveDelete(this.state.wid1);
	}

}
module.exports = {
	rx: rx433,
	tx: tx433
};