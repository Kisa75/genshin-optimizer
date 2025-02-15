import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  constant,
  greaterEq,
  lookup,
  naught,
  sum,
} from '../../../Formula/utils'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { IArtifactSheet } from '../IArtifactSheet'

const key: ArtifactSetKey = 'VourukashasGlow'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.VourukashasGlow, 2, 0.2)

const [condSet4Path, condSet4] = cond(key, 'set4')
const stacksArr = range(1, 5)
const set4_skill_dmg_ = greaterEq(
  input.artSet.VourukashasGlow,
  4,
  sum(
    0.1,
    lookup(
      condSet4,
      objKeyMap(stacksArr, (stack) => constant(stack * 0.08)),
      naught
    )
  )
)
const set4_burst_dmg_ = { ...set4_skill_dmg_ }

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    hp_: set2,
    skill_dmg_: set4_skill_dmg_,
    burst_dmg_: set4_burst_dmg_,
  },
})

const sheet: IArtifactSheet = {
  name: "Vourukasha's Glow",
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          path: condSet4Path,
          value: condSet4,
          name: st('takeDmg'),
          states: objKeyMap(stacksArr, (stack) => ({
            name: st('stack', { count: stack }),
            fields: [
              {
                node: set4_skill_dmg_,
              },
              {
                node: set4_burst_dmg_,
              },
            ],
          })),
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
