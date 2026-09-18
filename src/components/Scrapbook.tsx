import type { CSSProperties } from 'react'
import type { LayoutEntry, LayoutData } from '../lib/layout'
import { layoutStyle, shadowValue, fontClass, colorValue, useLayoutPosition } from '../lib/layout'
import { effectFilterId } from '../lib/noise'
import type { FxKind } from '../lib/noise'
import layoutData from '../data/layout.json'
import GraffitiText from './GraffitiText'
import NameCard from './NameCard'
import NoiseFilter from './NoiseFilter'

const entries = layoutData as LayoutData

function anchoredBelow(parentId: string, section: string): string[] {
  return Object.keys(entries).filter((id) => {
    const anchor = entries[id].anchor
    return id !== parentId && entries[id].section === section && anchor === parentId && anchor in entries
  })
}

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
        className="block select-none [-webkit-user-drag:none]"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: 'max-content',
          filter: shadow === 'none' ? undefined : `drop-shadow(${shadow})`,
        }}
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

  if (entry.type === 'paper') {
    const radius =
      entry.radius === 'full'
        ? '50%'
        : entry.radius === 'none'
          ? '0'
          : typeof entry.radius === 'number'
            ? `${entry.radius}px`
            : undefined

    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <div
          className="rounded-sm border-2 border-amber-100 bg-amber-100"
          style={{
            width: entry.width ?? 200,
            height: entry.height ?? 120,
            borderRadius: radius,
            ...filterStyle,
            boxShadow: shadow,
          }}
        />
      </>
    )
  }

  return (
    <>
      {fx && <NoiseFilter fx={fx} params={entry.noise} />}
      <p
        className={`${fontClass(entry.font)} text-2xl text-slate-100`}
        style={{
          color: colorValue(entry.color),
          fontWeight: entry.weight,
          maxWidth: entry.width,
          textTransform: entry.textTransform,
          whiteSpace: entry.width === undefined ? 'nowrap' : undefined,
          ...filterStyle,
        }}
      >
        {entry.content}
      </p>
    </>
  )
}

function EntryNode({ id, section }: { id: string; section: string }) {
  const { config, hidden, entry } = useLayoutPosition(id)
  if (hidden || !config || !entry) return null

  const shadow = shadowValue(config.shadow)
  const children = anchoredBelow(id, section)
  const isChild = entry.anchor !== undefined && entry.anchor !== id && entry.anchor in entries

  return (
    <div
      data-section={section}
      data-anchor={entry.anchor}
      style={{ ...layoutStyle(config, { child: isChild }), width: 'max-content' }}
    >
      <ScrapbookCard entry={entry} shadow={shadow} />
      {children.map((childId) => (
        <EntryNode key={childId} id={childId} section={section} />
      ))}
    </div>
  )
}

export default function Scrapbook({ section }: { section: string }) {
  const ids = Object.keys(entries).filter((id) => {
    const entry = entries[id]
    const anchor = entry.anchor
    return entry.section === section && (!anchor || anchor === id || !(anchor in entries))
  })

  return (
    <>
      {ids.map((id) => (
        <EntryNode key={id} id={id} section={section} />
      ))}
    </>
  )
}