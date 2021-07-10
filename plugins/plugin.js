// Autopilot v0.1
//
// Expand while you sleep


import { Manager } from "https://plugins.zkga.me/utils/RepeatAttackCore.js";
import figures from 'https://cdn.skypack.dev/figures';
import { html, render, useState, useLayoutEffect, useEffect } from
  "https://unpkg.com/htm/preact/standalone.module.js";
import Strategy from './strategies'

const IS_SPED_UP_DARK_FOREST = true;

class TimeKeeper {
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

function App() {
  const [framelength, setFramelength] = useState(0);
  useEffect(() => {
    const timekeeper = new TimeKeeper();
    const runOnce = () => {
      setFramelength(timekeeper.tick())
      Strategy.Random(df.getMyPlanets());
    }
    const intervalId = setInterval(runOnce, IS_SPED_UP_DARK_FOREST ? 1500 : 15000);
    return () => clearInterval(intervalId);
  }, []);
  return html`<div><big>Autopilot</big><p>Frame length: ${framelength}</p></div>`;
}

class Plugin {
  constructor() {
    if (typeof window.op === "undefined") {
      window.op = new Manager();
    }
    this.root = null;
    this.container = null;
  }

  async render(container) {
    this.container = container;
    container.style.width = "380px";
    this.root = render(html`<${App} />`, container);
  }

  destroy() {
    op.killAll()
    render(null, this.container, this.root);
  }
}

export default Plugin;
