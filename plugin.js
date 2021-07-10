// Autopilot v0.1
//
// Expand while you sleep


import { Manager } from "https://plugins.zkga.me/utils/RepeatAttackCore.js";
import figures from 'https://cdn.skypack.dev/figures';
import { html, render, useState, useLayoutEffect } from
  "https://unpkg.com/htm/preact/standalone.module.js";

function randomSample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function distance(from, to) {
  let fromloc = from.location;
  let toloc = to.location;
  return Math.sqrt((fromloc.coords.x - toloc.coords.x) ** 2 + (fromloc.coords.y - toloc.coords.y) ** 2);
}

function runBotOnFrame(planets) {
  const myPlanets = planets.filter(p => p.owner === df.account)
  const source = randomSample(myPlanets)
  const target = df.getPlanetsInRange(source.locationId, 50)
  .filter(p => (
    p.owner !== df.account &&
    p.owner === "0x0000000000000000000000000000000000000000" &&
    p.planetLevel >= 0
  ))
  .map(d => {
    return [d, distance(source, d)]
  })
  .sort((a, b) => a[1] - b[1])
  [0][0];
  op.pester(source.locationId, target.locationId);
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
    this.lock = false;
    this.framerun = this.runOnce.bind(this)
    df.ethConnection.provider.on('block', this.framerun);
    this.blocktime = 0
    this.lastTickTimestamp = Math.floor(Date.now() / 1000)
  }

  calcAverageFps() {
    const k = 0.5;
    const newTickTimestamp = Math.floor(Date.now() / 1000)
    const blocktime = newTickTimestamp - this.lastTickTimestamp
    this.lastTickTimestamp = newTickTimestamp
    this.blocktime = this.blocktime * (1-k) + blocktime * k
    return this.blocktime
  }

  runOnce(latestBlockNumber) {
    setTimeout(() => {
      if (this.lock === true) {
        return;
      }
      this.lock = true;
      console.log("its here " + this.calcAverageFps())
      //runBotOnFrame(df.getMyPlanets());
      this.lock = false;
    }, 1000, this);
  }

  async render(container) {
    this.container = container;
    container.style.width = "380px";
    this.root = render(html`<${App} />`, container);
  }

  destroy() {
    df.ethConnection.provider.off('block', this.framerun);
    render(null, this.container, this.root);
  }
}

export default Plugin;
