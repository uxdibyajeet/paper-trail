import { effectFilterId } from '../lib/noise'
import type { FxKind } from '../lib/noise'
import type { LayoutEntry } from '../lib/layout'
import NoiseFilter from './NoiseFilter'
import './Card.css'

const PAPER_WIDTH = 260
const DESC_LIMIT = 200
const PAPER_FX: FxKind[] = ['noise', 'torn']

function clampDesc(desc?: string): string {
  if (!desc) return ''
  return desc.length > DESC_LIMIT ? `${desc.slice(0, DESC_LIMIT)}…` : desc
}

export default function Card({
  entry,
  shadow,
  linkDisabled,
  width,
}: {
  entry: LayoutEntry
  shadow: string
  linkDisabled?: boolean
  width?: number
}) {
  const frameFx = entry.fx?.length ? entry.fx : undefined
  return (
    <a
      href={linkDisabled ? undefined : entry.href || undefined}
      target="_blank"
      rel="noreferrer"
      aria-label={entry.title ? `Open ${entry.title} on Behance` : 'Open project on Behance'}
      className="card"
      style={{ width: width ?? entry.width ?? 340, boxShadow: shadow }}
    >
      {frameFx && <NoiseFilter fx={frameFx} params={entry.noise} edge />}
      <span
        className="card__frame"
        style={frameFx ? { filter: `url(#${effectFilterId(frameFx, entry.noise, true)})` } : undefined}
      >
        <img className="card__img" src={entry.src} alt="" loading="lazy" />
      </span>
      <NoiseFilter fx={PAPER_FX} params={entry.noise} />
      <span className="card__paper" style={{ width: PAPER_WIDTH }}>
        <span
          className="card__shape"
          style={{
            filter: `url(#${effectFilterId(PAPER_FX, entry.noise)}) drop-shadow(0 6px 12px rgba(15, 23, 42, 0.35))`,
          }}
        />
        <span className="card__content">
          {entry.title && <strong className="card__title">{entry.title}</strong>}
          {entry.desc && <span className="card__desc">{clampDesc(entry.desc)}</span>}
        </span>
      </span>
    </a>
  )
}