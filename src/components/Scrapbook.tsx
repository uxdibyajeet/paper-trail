import type { CSSProperties } from 'react'
import type { LayoutEntry, LayoutData } from '../lib/layout'
import { resolveLayout, shadowValue } from '../lib/layout'
import { effectFilterId } from '../lib/noise'
import type { FxKind } from '../lib/noise'
import { useBreakpoint } from '../lib/breakpoints'
import layoutData from '../data/layout.json'
import PositionedElement from './PositionedElement'
import GraffitiText from './GraffitiText'
import NameCard from './NameCard'
import NoiseFilter from './NoiseFilter'

const entries = layoutData as LayoutData

function ScrapbookCard({ entry, shadow }: { entry: LayoutEntry; shadow: string }) {
  const fx: FxKind[] | undefined = entry.fx?.length ? entry.fx : undefined
  const filterStyle = fx
    ? ({ filter: `url(#${effectFilterId(fx, entry.noise)})` } as CSSProperties)
    : {}

  if (entry.type === 'graffiti') {
    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <GraffitiText fill={entry.fill} style={filterStyle}>
          {entry.content}
        </GraffitiText>
      </>
    )
  }

  if (entry.type === 'name-card') {
    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <NameCard style={filterStyle} />
      </>
    )
  }

  if (entry.type === 'sticker') {
    return (
      <img
        src={entry.src}
        alt=""
        className="block"
        style={{ filter: shadow === 'none' ? undefined : `drop-shadow(${shadow})` }}
      />
    )
  }

  if (entry.type === 'photo') {
    return (
      <img
        src={entry.src}
        alt=""
        className="block aspect-square w-full object-cover"
        style={{ boxShadow: shadow }}
      />
    )
  }

  if (entry.type === 'note') {
    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <div
          className="w-48 rounded-sm border-2 border-amber-300 bg-amber-100 p-3 font-hand text-amber-950"
          style={{ ...filterStyle, boxShadow: shadow }}
        >
          {entry.content}
        </div>
      </>
    )
  }

  return (
    <>
      {fx && <NoiseFilter fx={fx} params={entry.noise} />}
      <p className="font-hand text-2xl text-slate-100" style={filterStyle}>
        {entry.content}
      </p>
    </>
  )
}

export default function Scrapbook({ section }: { section: string }) {
  const bp = useBreakpoint()
  const ids = Object.keys(entries).filter((id) => entries[id].section === section)

  return (
    <>
      {ids.map((id) => {
        const entry = entries[id]
        const { config } = resolveLayout(entry, bp)
        return (
          <PositionedElement key={id} id={id} section={section}>
            <ScrapbookCard entry={entry} shadow={shadowValue(config.shadow)} />
          </PositionedElement>
        )
      })}
    </>
  )
}