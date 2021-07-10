// Autopilot v0.1
//
// Expand while you sleep


import { Manager } from "https://plugins.zkga.me/utils/RepeatAttackCore.js";
import figures from 'https://cdn.skypack.dev/figures';
import { html, render, useState, useLayoutEffect, useEffect } from
  "https://unpkg.com/htm/preact/standalone.module.js";
import Strategy from './strategies'
import {TimeKeeper, ErrorRateKeeper, Table} from './statistics'

const IS_SPED_UP_DARK_FOREST = true;
const targetFrameLength = IS_SPED_UP_DARK_FOREST ? 1500 : 15000;

function App() {
  const [framelength, setFramelength] = useState(0);
  const [frameErrorRate, setFrameErrorRate] = useState(0);
  const [planetCount, setPlanetCount] = useState(0);
  const [accountBalance, setAccountBalance] = useState(0);
  const stats = [
    ['Frame length:', framelength],
    ['Planet count:', planetCount],
    ['Frame error rate:', frameErrorRate],
    ['Account balance: ', accountBalance]
  ];
  useEffect(() => {
    const timekeeper = new TimeKeeper();
    const errorRateKeeper = new ErrorRateKeeper(targetFrameLength);
    const runOnce = () => {
      setAccountBalance(df.balance)
      setFramelength(timekeeper.tick())
      const planets = df.getMyPlanets()
      setPlanetCount(planets.length)
      try {
        Strategy.Random(planets)
        setFrameErrorRate(errorRateKeeper.tick(true))
      } catch (error) {
        setFrameErrorRate(errorRateKeeper.tick(false))
      }
    }
    const intervalId = setInterval(runOnce, targetFrameLength);
    return () => clearInterval(intervalId);
  }, []);
  return html`
    <div>
      <big>Autopilot</big>
      ${Table(stats)}
    </div>`;
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
