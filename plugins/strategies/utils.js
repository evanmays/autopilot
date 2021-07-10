export function checkNumInboundVoyages(planetId, from = "") {
  if (from == "") {
    return (
      df.getAllVoyages()
        .filter(
          (v) =>
            v.toPlanet == planetId &&
            v.arrivalTime > new Date().getTime() / 1000
        ).length +
      df.getUnconfirmedMoves().filter((m) => m.to == planetId).length
    );
  } else {
    return (
      df
        .getAllVoyages()
        .filter((v) => v.toPlanet == planetId)
        .filter((v) => v.fromPlanet == from).length +
      df.getUnconfirmedMoves().filter((m) => m.to == planetId && m.from == from)
        .length
    );
  }
}

export function planetPercentEnergy(planet, percentCap = 25) {
  const unconfirmedDepartures = planet.unconfirmedDepartures.reduce(
    (acc, dep) => {
      return acc + dep.forces;
    },
    0
  );
  const FUZZY_ENERGY = Math.floor(planet.energy - unconfirmedDepartures);
  return (FUZZY_ENERGY * percentCap) / 100;
}

function planetCurrentPercentEnergy(planet) {
  const unconfirmedDepartures = planet.unconfirmedDepartures.reduce(
    (acc, dep) => {
      return acc + dep.forces;
    },
    0
  );
  const FUZZY_ENERGY = Math.floor(planet.energy - unconfirmedDepartures);
  return Math.floor((FUZZY_ENERGY / planet.energyCap) * 100);
}

export function randomSample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function distance(from, to) {
  let fromloc = from.location;
  let toloc = to.location;
  return Math.sqrt((fromloc.coords.x - toloc.coords.x) ** 2 + (fromloc.coords.y - toloc.coords.y) ** 2);
}

export function pester(
  yourPlanetLocationId,
  opponentsPlanetLocationsId,
  percentageTrigger = 65,
  percentageSend = 20
) {
  const match = df
    .getMyPlanets()
    .filter((t) => t.locationId == yourPlanetLocationId);
  if (match.length == 0) {
    return;
  }
  const source = match[0];
  const unconfirmedDepartures = source.unconfirmedDepartures.reduce(
    (acc, dep) => {
      return acc + dep.forces;
    },
    0
  );
  if (checkNumInboundVoyages(opponentsPlanetLocationsId) >= 6) {
    //Too many inbound
    return;
  }
  const TRIGGER_AMOUNT = Math.floor(
    (source.energyCap * percentageTrigger) / 100
  );
  const FUZZY_ENERGY = Math.floor(source.energy - unconfirmedDepartures);

  if (FUZZY_ENERGY > TRIGGER_AMOUNT) {
    //If significantly over the trigger amount just batch include excess energy in the attack
    // If current energy is 90% instead of sending 20% and landing at 70%, send 45% then recover;

    const overflow_send =
      planetCurrentPercentEnergy(source) - (percentageTrigger - percentageSend);

    const FORCES = Math.floor((source.energyCap * overflow_send) / 100);
    console.log(`[pester]: launching attack from ${source.locationId}`);
    df.terminal.current.println(
      `[pester]: launching attack from ${source.locationId}`,
      4
    );

    //send attack
    df.terminal.current.printShellLn(
      `df.move('${
        source.locationId
      }', '${opponentsPlanetLocationsId}', ${FORCES}, ${0})`
    );
    df.move(yourPlanetLocationId, opponentsPlanetLocationsId, FORCES, 0);
  }
}
