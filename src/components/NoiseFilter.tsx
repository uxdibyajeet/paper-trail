import type { ReactElement, Ref } from 'react'
import { effectFilter, effectFilterId } from '../lib/noise'
import type { FxKind, NoiseParams } from '../lib/noise'

interface NoiseFilterProps {
  fx?: FxKind[]
  params?: NoiseParams
  hiddenRef?: Ref<SVGSVGElement>
}

export default function NoiseFilter({ fx, params, hiddenRef }: NoiseFilterProps): ReactElement {
  const id = effectFilterId(fx, params)
  return (
    <svg
      ref={hiddenRef}
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
    >
      <defs dangerouslySetInnerHTML={{ __html: effectFilter(id, fx, params) }} />
    </svg>
  )
}