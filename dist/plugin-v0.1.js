// plugins/plugin.js
import { Manager } from "https://plugins.zkga.me/utils/RepeatAttackCore.js";
import figures from "https://cdn.skypack.dev/figures";
import { html as html2, render, useState, useLayoutEffect, useEffect } from "https://unpkg.com/htm/preact/standalone.module.js";

// plugins/strategies/utils.js
function checkNumInboundVoyages(planetId, from = "") {
  if (from == "") {
    return df.getAllVoyages().filter((v) => v.toPlanet == planetId && v.arrivalTime > new Date().getTime() / 1e3).length + df.getUnconfirmedMoves().filter((m) => m.to == planetId).length;
  } else {
    return df.getAllVoyages().filter((v) => v.toPlanet == planetId).filter((v) => v.fromPlanet == from).length + df.getUnconfirmedMoves().filter((m) => m.to == planetId && m.from == from).length;
  }
}
function planetCurrentPercentEnergy(planet) {
  const unconfirmedDepartures = planet.unconfirmedDepartures.reduce((acc, dep) => {
    return acc + dep.forces;
  }, 0);
  const FUZZY_ENERGY = Math.floor(planet.energy - unconfirmedDepartures);
  return Math.floor(FUZZY_ENERGY / planet.energyCap * 100);
}
function randomSample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function distance(from, to) {
  let fromloc = from.location;
  let toloc = to.location;
  return Math.sqrt((fromloc.coords.x - toloc.coords.x) ** 2 + (fromloc.coords.y - toloc.coords.y) ** 2);
}
function pester(yourPlanetLocationId, opponentsPlanetLocationsId, percentageTrigger = 65, percentageSend = 20) {
  const match = df.getMyPlanets().filter((t) => t.locationId == yourPlanetLocationId);
  if (match.length == 0) {
    return;
  }
  const source = match[0];
  const unconfirmedDepartures = source.unconfirmedDepartures.reduce((acc, dep) => {
    return acc + dep.forces;
  }, 0);
  if (checkNumInboundVoyages(opponentsPlanetLocationsId) >= 6) {
    return;
  }
  const TRIGGER_AMOUNT = Math.floor(source.energyCap * percentageTrigger / 100);
  const FUZZY_ENERGY = Math.floor(source.energy - unconfirmedDepartures);
  if (FUZZY_ENERGY > TRIGGER_AMOUNT) {
    const overflow_send = planetCurrentPercentEnergy(source) - (percentageTrigger - percentageSend);
    const FORCES = Math.floor(source.energyCap * overflow_send / 100);
    console.log(`[pester]: launching attack from ${source.locationId}`);
    df.terminal.current.println(`[pester]: launching attack from ${source.locationId}`, 4);
    df.terminal.current.printShellLn(`df.move('${source.locationId}', '${opponentsPlanetLocationsId}', ${FORCES}, ${0})`);
    df.move(yourPlanetLocationId, opponentsPlanetLocationsId, FORCES, 0);
  }
}

// plugins/strategies/random.js
var run = (planets) => {
  const myPlanets = planets.filter((p) => p.owner === df.account);
  const source = randomSample(myPlanets);
  const target = df.getPlanetsInRange(source.locationId, 50).filter((p) => p.owner !== df.account && p.owner === "0x0000000000000000000000000000000000000000" && p.planetLevel >= 0).map((d) => {
    return [d, distance(source, d)];
  }).sort((a, b) => a[1] - b[1])[0][0];
  pester(source.locationId, target.locationId);
};
var random_default = run;

// plugins/strategies/index.js
var Strategy = {
  Random: random_default
};
var strategies_default = Strategy;

// plugins/statistics.js
import { html } from "https://unpkg.com/htm/preact/standalone.module.js";
var TimeKeeper = class {
  constructor() {
    this.blocktime = 0;
    this.lastTickTimestamp = Math.floor(Date.now() / 1e3);
  }
  tick() {
    const k = 0.25;
    const newTickTimestamp = Math.floor(Date.now() / 1e3);
    this.blocktime = this.blocktime * (1 - k) + (newTickTimestamp - this.lastTickTimestamp) * k;
    this.lastTickTimestamp = newTickTimestamp;
    return this.blocktime;
  }
};
var ErrorRateKeeper = class {
  constructor(targetFrameLength2) {
    this.framesDroppedFilter = new FirstOrderFilter(0, 10, targetFrameLength2 / 1e3);
  }
  tick(success) {
    const frames_dropped = this.framesDroppedFilter.update(success ? 0 : 1);
    return frames_dropped / (1 + frames_dropped);
  }
};
var FirstOrderFilter = class {
  constructor(x0, ts, dt) {
    this.k_ = dt / ts / (1 + dt / ts);
    this.x_ = x0;
  }
  update(x) {
    this.x_ = (1 - this.k_) * this.x_ + this.k_ * x;
    return this.x_;
  }
  reset(x) {
    this.x_ = x;
  }
};
function Table(data) {
  return html`<table style="width:100%">${data.map((row) => {
    const name = row[0];
    const value = row[1];
    return html`<tr><td style="width:50%">${name}</td><td style="width:50%">${value}</td></tr>`;
  })}
          </table>`;
}

// plugins/plugin.js
var IS_SPED_UP_DARK_FOREST = true;
var targetFrameLength = IS_SPED_UP_DARK_FOREST ? 1500 : 15e3;
function App() {
  const [framelength, setFramelength] = useState(0);
  const [frameErrorRate, setFrameErrorRate] = useState(0);
  const [planetCount, setPlanetCount] = useState(0);
  const [accountBalance, setAccountBalance] = useState(0);
  const stats = [
    ["Frame length:", framelength],
    ["Planet count:", planetCount],
    ["Frame error rate:", frameErrorRate],
    ["Account balance: ", accountBalance]
  ];
  useEffect(() => {
    const timekeeper = new TimeKeeper();
    const errorRateKeeper = new ErrorRateKeeper(targetFrameLength);
    const runOnce = () => {
      setAccountBalance(df.balance);
      setFramelength(timekeeper.tick());
      const planets = df.getMyPlanets();
      setPlanetCount(planets.length);
      try {
        strategies_default.Random(planets);
        setFrameErrorRate(errorRateKeeper.tick(true));
      } catch (error) {
        setFrameErrorRate(errorRateKeeper.tick(false));
      }
    };
    const intervalId = setInterval(runOnce, targetFrameLength);
    return () => clearInterval(intervalId);
  }, []);
  return html2`
    <div>
      <big>Autopilot</big>
      ${Table(stats)}
    </div>`;
}
var Plugin = class {
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
    this.root = render(html2`<${App} />`, container);
  }
  destroy() {
    op.killAll();
    render(null, this.container, this.root);
  }
};
var plugin_default = Plugin;
export {
  plugin_default as default
};
