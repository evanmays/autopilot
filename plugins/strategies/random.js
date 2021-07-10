import {randomSample, distance, pester} from './utils'

const run = (planets) => {
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
  pester(source.locationId, target.locationId);
}
export default run
