import { useMemo } from 'react'
import type { LayoutEntry } from '../lib/layout'
import { resolveLayout, shadowValue } from '../lib/layout'
import { useBreakpoint } from '../lib/breakpoints'
import { useBuilder } from './builder/builderContext'
import Card from './Card'
import './CardFan.css'

// ---- tunables -------------------------------------------------------

const CARD_WIDTH = 480 // desktop / laptop
const CARD_WIDTH_TABLET = 300 // tablet
const CARD_WIDTH_MOBILE = 280 // mobile
const GRID_COLUMNS = 2 // desktop / laptop / tablet
const GRID_COLUMNS_MOBILE = 1
const GRID_GAP = 32
const GRID_ROTATION_MIN = -6 // degrees, left edge of the rotation range
const GRID_ROTATION_MAX = 6 // degrees, right edge of the rotation range
const GRID_TOP_OFFSET = 310 // px, pushes the grid down within the section

function frac(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453123
  return x - Math.floor(x)
}

function computeGridHeight(cardHeight: number, rows: number, gap: number): number {
  return rows * cardHeight + Math.max(0, rows - 1) * gap
}

function computeGridWidth(cardWidth: number, columns: number, gap: number): number {
  return columns * cardWidth + Math.max(0, columns - 1) * gap
}

function CardShell({ entry, editing, width }: { entry: LayoutEntry; editing: boolean; width: number }) {
  const bp = useBreakpoint()
  const { config } = resolveLayout(entry, bp)
  const shadow = shadowValue(config.shadow)
  return <Card entry={entry} width={width} shadow={shadow} linkDisabled={editing} />
}

export default function CardFan({ section }: { section: string }) {
  const { data, editing } = useBuilder()
  const bp = useBreakpoint()
  const cards = useMemo(
    () =>
      Object.keys(data)
        .filter((id) => data[id]?.type === 'card' && data[id]?.section === section)
        .map((id) => ({ id, entry: data[id] })),
    [data, section],
  )

  const maxColumns = bp === 'mobile' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS
  const columns = Math.max(1, Math.min(maxColumns, cards.length))
  const rows = Math.ceil(cards.length / columns)

  let cardW = bp === 'mobile' ? CARD_WIDTH_MOBILE : bp === 'tablet' ? CARD_WIDTH_TABLET : CARD_WIDTH
  let cardH = cardW / 1.618
  let gridWidth = computeGridWidth(cardW, columns, GRID_GAP)
  let gridHeight = computeGridHeight(cardH, rows, GRID_GAP)

  if (cards.length === 0) return null

  return (
    <div className="cardfan" style={{ height: gridHeight + GRID_TOP_OFFSET, paddingTop: GRID_TOP_OFFSET }}>
      <div className="cardfan__grid" style={{ width: gridWidth, height: gridHeight }}>
        {cards.map(({ id, entry }, i) => {
          const col = i % columns
          const row = Math.floor(i / columns)
          const rotate = GRID_ROTATION_MIN + frac(i * 7 + 1) * (GRID_ROTATION_MAX - GRID_ROTATION_MIN)
          return (
            <div
              key={id}
              className="cardfan__cell"
              style={{
                left: col * (cardW + GRID_GAP),
                top: row * (cardH + GRID_GAP),
                width: cardW,
                height: cardH,
                transform: `rotate(${rotate.toFixed(2)}deg)`,
              }}
            >
              <CardShell entry={entry} editing={editing} width={cardW} />
            </div>
          )
        })}
      </div>
    </div>
  )
}