import type { ReactElement, Ref } from 'react'
import { effectEdgeFilter, effectFilter, effectFilterId } from '../lib/noise'
import type { FxKind, NoiseParams } from '../lib/noise'

interface NoiseFilterProps {
  fx?: FxKind[]
  params?: NoiseParams
  hiddenRef?: Ref<SVGSVGElement>
  edge?: boolean
}

export default function NoiseFilter({ fx, params, hiddenRef, edge }: NoiseFilterProps): ReactElement {
  const id = effectFilterId(fx, params, edge)
  return (
    <svg
      ref={hiddenRef}
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
    >
      <defs dangerouslySetInnerHTML={{ __html: edge ? effectEdgeFilter(id, fx, params) : effectFilter(id, fx, params) }} />
    </svg>
  )
}