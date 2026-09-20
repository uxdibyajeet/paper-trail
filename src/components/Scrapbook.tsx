import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { CSSProperties } from 'react'
import type { LayoutEntry, LayoutData } from '../lib/layout'
import { layoutStyle, shadowValue, fontClass, colorValue, useLayoutPosition } from '../lib/layout'
import { effectFilterId } from '../lib/noise'
import type { FxKind } from '../lib/noise'
import GraffitiText from './GraffitiText'
import NameCard from './NameCard'
import Card from './Card'
import CardFan from './CardFan'
import NoiseFilter from './NoiseFilter'
import SectionLabel from './SectionLabel'
import TicTacToe from './TicTacToe'
import Word from './Word'
import { useBuilder } from './builder/builderContext'

function anchoredBelow(data: LayoutData, parentId: string, section: string): string[] {
  return Object.keys(data).filter((id) => {
    const anchor = data[id].anchor
    return id !== parentId && data[id].section === section && anchor === parentId && anchor in data
  })
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function ScrapbookCard({ entry, shadow, editing }: { entry: LayoutEntry; shadow: string; editing?: boolean }) {
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

  if (entry.type === 'card') {
    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <Card entry={entry} shadow={shadow} linkDisabled={editing} />
      </>
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

  if (entry.type === 'tape') {
    const tapeColor = colorValue(entry.color) ?? 'var(--color-blue-300)'
    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <div
          className="rounded-sm border-2"
          style={{
            width: entry.width ?? 160,
            height: entry.height ?? 40,
            borderColor: tapeColor,
            backgroundColor: tapeColor,
            opacity: 0.8,
            boxShadow: shadow,
            ...filterStyle,
          }}
        />
      </>
    )
  }

  if (entry.type === 'section-label') {
    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <SectionLabel entry={entry} shadow={shadow} filterStyle={filterStyle} />
      </>
    )
  }

  if (entry.type === 'tic-tac-toe') {
    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <TicTacToe entry={entry} shadow={shadow} filterStyle={filterStyle} />
      </>
    )
  }

  if (entry.type === 'word') {
    return <Word entry={entry} />
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

    const paperColor = colorValue(entry.color) ?? 'var(--color-amber-100)'

    return (
      <>
        {fx && <NoiseFilter fx={fx} params={entry.noise} />}
        <div
          className="rounded-sm border-2"
          style={{
            width: entry.width ?? 200,
            height: entry.height ?? 120,
            borderRadius: radius,
            borderColor: paperColor,
            backgroundColor: paperColor,
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

interface DragRef {
  startX: number
  startY: number
  x: number
  y: number
  parent: HTMLElement
  moved: boolean
}

function EntryNode({ id, section }: { id: string; section: string }) {
  const { data, editing, selectedId, select, updateConfig, beginDrag, endDrag, dragSession } = useBuilder()
  const { config, hidden, entry, bp } = useLayoutPosition(id, data)
  const dragRef = useRef<DragRef | null>(null)

  useEffect(() => {
    if (!dragSession && dragRef.current) dragRef.current = null
  }, [dragSession])

  if (hidden || !config || !entry) return null

  const shadow = shadowValue(config.shadow)
  const isChild = entry.anchor !== undefined && entry.anchor !== id && entry.anchor in data
  const children = anchoredBelow(data, id, section)
  const selected = editing && selectedId === id
  const isDraggingNode = editing && dragSession !== null && dragSession.id === id

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    select(id)
    if (isChild) return
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const parent = el.parentElement
    if (!parent) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, x: config.x, y: config.y, parent, moved: false }
  }

  const moveDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d) return
    if (!d.moved) {
      d.moved = true
      beginDrag({ id, bp, x: d.x, y: d.y })
    }
    const dx = ((e.clientX - d.startX) / Math.max(d.parent.clientWidth, 1)) * 100
    const dy = e.clientY - d.startY
    updateConfig(id, bp, { x: round1(d.x + dx), y: round1(d.y + dy) }, { silent: true })
  }

  const stopDrag = () => {
    dragRef.current = null
    endDrag()
  }

  return (
    <div
      data-section={section}
      data-anchor={entry.anchor}
      style={{
        ...layoutStyle(config, { child: isChild }),
        width: 'max-content',
        cursor: editing ? (isChild ? 'pointer' : isDraggingNode ? 'grabbing' : 'grab') : undefined,
        touchAction: editing && !isChild ? 'none' : undefined,
        userSelect: editing ? 'none' : undefined,
        outline: selected ? '1.5px dashed rgba(251,191,36,0.9)' : undefined,
        outlineOffset: selected ? 3 : undefined,
      }}
      onPointerDown={editing ? startDrag : undefined}
      onPointerMove={editing ? moveDrag : undefined}
      onPointerUp={editing ? stopDrag : undefined}
      onPointerCancel={editing ? stopDrag : undefined}
      onLostPointerCapture={stopDrag}
    >
      {selected && (
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-950">
          {id}
        </span>
      )}
      <ScrapbookCard entry={entry} shadow={shadow} editing={editing} />
      {children.map((childId) => (
        <EntryNode key={childId} id={childId} section={section} />
      ))}
    </div>
  )
}

export default function Scrapbook({ section }: { section: string }) {
  const { data } = useBuilder()
  const ids = Object.keys(data).filter((id) => {
    const entry = data[id]
    if (!entry) return false
    const anchor = entry.anchor
    return entry.section === section && (!anchor || anchor === id || !(anchor in data))
  })
  const cardIds = new Set(ids.filter((id) => data[id]?.type === 'card'))

  return (
    <>
      {cardIds.size > 0 && <CardFan section={section} />}
      {ids.map((id) =>
        cardIds.has(id) ? null : <EntryNode key={id} id={id} section={section} />,
      )}
    </>
  )
}