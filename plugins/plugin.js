// Autopilot v0.1
//
// Expand while you sleep


import { Manager } from "https://plugins.zkga.me/utils/RepeatAttackCore.js";
import figures from 'https://cdn.skypack.dev/figures';
import { html, render, useState, useLayoutEffect } from
  "https://unpkg.com/htm/preact/standalone.module.js";
import Strategy from './strategies'

class TimeKeeper {
  constructor() {
    this.blocktime = 0
    this.lastTickTimestamp = Math.floor(Date.now() / 1000)
  }

  tick() {
    const k = 0.8;
    const newTickTimestamp = Math.floor(Date.now() / 1000)
    this.blocktime = this.blocktime * (1-k) + (newTickTimestamp - this.lastTickTimestamp) * k
    this.lastTickTimestamp = newTickTimestamp
    return this.blocktime
  }
}

function App() {
  return html`<p>Hello there</p>`;
}

class Plugin {
  constructor() {
    if (typeof window.op === "undefined") {
      window.op = new Manager();
    }
    this.root = null;
    this.container = null;
    this.intervalid = setInterval(this.runOnce.bind(this), 1500);
    this.timekeeper = new TimeKeeper();
  }

  runOnce() {
    this.timekeeper.tick()
    Strategy.Random(df.getMyPlanets());
  }

  async render(container) {
    this.container = container;
    container.style.width = "380px";
    this.root = render(html`<${App} />`, container);
  }

  destroy() {
    clearInterval(this.intervalid)
    op.killAll()
    render(null, this.container, this.root);
  }
}

export default Plugin;
