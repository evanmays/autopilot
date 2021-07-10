import { html } from
  "https://unpkg.com/htm/preact/standalone.module.js";

export class TimeKeeper {
  constructor() {
    this.blocktime = 0
    this.lastTickTimestamp = Math.floor(Date.now() / 1000)
  }

  tick() {
    const k = 0.25;
    const newTickTimestamp = Math.floor(Date.now() / 1000)
    this.blocktime = this.blocktime * (1-k) + (newTickTimestamp - this.lastTickTimestamp) * k
    this.lastTickTimestamp = newTickTimestamp
    return this.blocktime
  }
}

export class ErrorRateKeeper {
  constructor(targetFrameLength) {
    this.framesDroppedFilter = new FirstOrderFilter(0.0, 10, targetFrameLength / 1000);
  }

  tick(success) {
    const frames_dropped = this.framesDroppedFilter.update(success ? 0 : 1)
    return frames_dropped / (1 + frames_dropped)
  }
}

export class FirstOrderFilter {
  constructor(x0, ts, dt) {
    this.k_ = (dt / ts) / (1.0 + dt / ts);
    this.x_ = x0;
  }

  update(x) {
    this.x_ = (1. - this.k_) * this.x_ + this.k_ * x;
    return this.x_;
  }

  reset(x) {
    this.x_ = x;
  }
};

export function Table(data) {
  return html`<table style="width:100%">${
            data.map((row) => {
              const name = row[0]
              const value = row[1]
              return html`<tr><td style="width:50%">${name}</td><td style="width:50%">${value}</td></tr>`
            })
            }
          </table>`
}
