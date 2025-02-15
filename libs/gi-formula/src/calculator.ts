import type { AnyOP, CalcResult } from '@genshin-optimizer/pando'
import { calculation, Calculator as Base } from '@genshin-optimizer/pando'
import type { Tag } from './data/util'
import { self } from './data/util'

const { arithmetic } = calculation

export type CalcMeta = {
  tag: Tag | undefined
  op: 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac' | 'res'
  ops: CalcResult<number, CalcMeta>[]
  conds: Tag[]
}

export class Calculator extends Base<CalcMeta> {
  override computeCustom(val: any[], op: string): any {
    if (op == 'res') {
      const [preRes] = val as [number]
      if (preRes >= 0.75) return 1 / (1 + 4 * preRes)
      if (preRes >= 0) return 1 - preRes
      return 1 - 0.5 * preRes
    }
    return super.computeCustom(val, op)
  }
  override computeMeta(
    op: Exclude<AnyOP, 'read'>,
    tag: Tag | undefined,
    val: any,
    x: (CalcResult<any, CalcMeta> | undefined)[],
    _br: CalcResult<any, CalcMeta>[],
    ex: any
  ): CalcMeta {
    const preConds = [
      tag?.qt === 'cond' ? [tag] : [],
      ...[...x, ..._br].map((x) => x?.meta.conds as Tag[]),
    ].filter((x) => x && x.length)
    const conds = preConds.length <= 1 ? preConds[0] ?? [] : preConds.flat()

    function constOverride(): CalcMeta {
      return { tag, op: 'const', ops: [], conds }
    }

    switch (op) {
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
      case 'sumfrac': {
        const empty = arithmetic[op]([], ex)
        const ops = x.filter((x) => x!.val !== empty) as CalcResult<
          number,
          CalcMeta
        >[]
        if (ops.length <= 1) {
          if (ops.length && ops[0].meta.conds !== conds)
            // Preserve `conds` even when short-circuiting
            return { ...ops[0].meta, conds }
          return ops[0]?.meta ?? constOverride()
        }
        if (op === 'prod' && val === 0) return constOverride()
        return { tag, op, ops, conds }
      }

      case 'const':
      case 'subscript':
        return constOverride()
      case 'match':
      case 'thres':
      case 'lookup':
        return { ...x.find((x) => x)!.meta, conds }
      case 'tag':
      case 'dtag': {
        const { tag: baseTag, op, ops } = x[0]!.meta
        return { tag: baseTag ?? tag, op, ops, conds }
      }
      case 'custom':
        if (ex == 'res') {
          const ops = x as [CalcResult<number, CalcMeta>]
          return { tag, op: ex, ops, conds }
        }
        return constOverride()
      default:
        throw new Error('Should not reach this point')
    }
  }

  listFormulas(tag: Omit<Tag, 'qt' | 'q'> & { member: string }): Tag[] {
    return this.get(self.formula.listing.withTag(tag).tag)
      .map((listing) => {
        const {
          val,
          meta: {
            tag: { ...tag },
          },
        } = listing
        // Clone and convert `tag` to appropriate shape
        tag.q = val as string
        return tag
      })
      .filter((x) => x.q)
  }
}
