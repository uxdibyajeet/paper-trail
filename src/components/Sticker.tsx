import { useState } from 'react'
import type { LayoutEntry } from '../lib/layout'
import { effectFilterId, scaledNoise } from '../lib/noise'
import type { FxKind } from '../lib/noise'
import NoiseFilter from './NoiseFilter'

export default function Sticker({
  entry,
  shadow,
  editing,
}: {
  entry: LayoutEntry
  shadow: string
  editing?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const fx: FxKind[] | undefined = entry.fx?.length ? entry.fx : undefined
  const scaledFx = fx ? scaledNoise(entry.noise, 0.5) : undefined
  const scaledFilterId = fx ? effectFilterId(fx, scaledFx) : undefined
  const showTooltip = !editing && Boolean(entry.tooltip) && hovered
  const atBottom = entry.tooltipPosition === 'bottom'
  const tooltipStyle: Record<string, string | number> = atBottom
    ? { left: '50%', bottom: '-12px', transform: 'translate(-50%,100%) rotate(4deg)', zIndex: 50 }
    : { left: '50%', top: '-12px', transform: 'translate(-50%,-100%) rotate(-4deg)', zIndex: 50 }

  return (
    <div
      className="relative block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={entry.src}
        alt=""
        className={[
          'block select-none [-webkit-user-drag:none]',
          entry.hover === 'rotate' ? 'transition-transform duration-200 ease-out hover:rotate-3' : '',
        ].join(' ')}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: 'max-content',
          filter: shadow === 'none' ? undefined : `drop-shadow(${shadow})`,
        }}
      />
      {showTooltip && (
        <div className="pointer-events-none absolute" style={tooltipStyle}>
          {scaledFx && <NoiseFilter fx={fx} params={scaledFx} />}
          <div
            className="absolute inset-0 rounded-sm border-2 border-amber-300 bg-amber-100"
            style={{
              filter: scaledFilterId ? `url(#${scaledFilterId})` : undefined,
              boxShadow: 'var(--shadow-pinned)',
            }}
          />
          <span className="relative block whitespace-nowrap px-2.5 py-1 font-hand text-base text-amber-950">
            {entry.tooltip}
          </span>
        </div>
      )}
    </div>
  )
}