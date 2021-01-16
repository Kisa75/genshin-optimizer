const refinementVals = [12, 15, 18, 21, 24]
const weapon = {
  name: "Raven Bow",
  weaponType: "bow",
  rarity: 3,
  passiveName: "Bane of Flame and Water",
  passiveDescription: (refineIndex) => <span>Increases DMG against opponents affected by <span className="text-hydro">Hydro</span> or <span className="text-pyro">Pyro</span> by {refinementVals[refineIndex]}%.</span>,
  description: "Ravens are known to be the ferrymen of the dead. This bow's limb is decorated with raven feathers, which forebode the imminent death of its target.",
  baseStats: {
    main: [40, 53, 69, 86, 102, 121, 138, 154, 171, 187, 207, 223, 239, 259, 275, 292, 311, 327, 344, 363, 380, 396, 415, 432, 448],
    subStatKey: "ele_mas",
    sub: [20, 24, 28, 32, 36, 36, 40, 44, 48, 53, 53, 57, 61, 61, 65, 69, 69, 73, 77, 77, 81, 85, 85, 90, 94],
  },
  conditional: {
    type: "weapon",
    sourceKey: "RavenBow",
    maxStack: 1,
    stats: (refineIndex) => ({
      all_dmg_bonus: refinementVals[refineIndex]
    })
  }
}
export default weapon