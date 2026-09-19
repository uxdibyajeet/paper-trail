import type { CSSProperties } from 'react'
import type { LayoutEntry } from '../lib/layout'
import { colorValue } from '../lib/layout'
import './SectionLabel.css'

export default function SectionLabel({
  entry,
  shadow,
  filterStyle,
}: {
  entry: LayoutEntry
  shadow: string
  filterStyle: CSSProperties
}) {
  const fill = colorValue(entry.fill) ?? 'var(--color-amber-100)'
  const radius =
    entry.radius === 'full'
      ? '50%'
      : entry.radius === 'none'
        ? '0'
        : typeof entry.radius === 'number'
          ? `${entry.radius}px`
          : undefined

  const filter = filterStyle.filter

  return (
    <div className="section-label" style={{ width: entry.width ?? 400 }}>
      <div
        className="section-label__bg"
        style={{
          borderRadius: radius,
          borderColor: fill,
          backgroundColor: fill,
          boxShadow: shadow,
          ...(filter ? { filter } : {}),
        }}
      />
      <h2
        className="section-label__text"
        style={{
          fontSize: entry.fontSize ?? 32,
          color: colorValue(entry.color) ?? 'var(--color-slate-950)',
          fontWeight: entry.weight ?? 900,
          textTransform: entry.textTransform ?? 'uppercase',
        }}
      >
        {entry.content}
      </h2>
    </div>
  )
}