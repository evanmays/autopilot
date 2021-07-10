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
    this.blocktime = 0
    this.lastTickTimestamp = Math.floor(Date.now() / 1000)
    this.intervalid = setInterval(this.runOnce.bind(this), 15000);
  }

  calcTimeBetweenFrames() {
    const k = 0.8;
    const newTickTimestamp = Math.floor(Date.now() / 1000)
    this.blocktime = this.blocktime * (1-k) + (newTickTimestamp - this.lastTickTimestamp) * k
    this.lastTickTimestamp = newTickTimestamp
    return this.blocktime
  }

  runOnce() {
    this.calcTimeBetweenFrames()
    runBotOnFrame(df.getMyPlanets());
  }

  async render(container) {
    this.container = container;
    container.style.width = "380px";
    this.root = render(html`<${App} />`, container);
  }

  destroy() {
    clearInterval(this.intervalid)
    render(null, this.container, this.root);
  }
}

export default Plugin;
