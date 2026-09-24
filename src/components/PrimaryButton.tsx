import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { LayoutEntry } from '../lib/layout'
import { colorValue } from '../lib/layout'
import { track } from '../lib/analytics'
import NoiseFilter from './NoiseFilter'
import type { FxKind } from '../lib/noise'

export default function PrimaryButton({
  entry,
  shadow,
  filterStyle,
  editing,
}: {
  entry: LayoutEntry
  shadow: string
  filterStyle: CSSProperties
  editing?: boolean
}) {
  const fx: FxKind[] | undefined = entry.fx?.length ? entry.fx : undefined
  const [hovered, setHovered] = useState(false)
  const buttonColor = colorValue(entry.color) ?? 'var(--color-amber-500)'
  const hoverColor = 'var(--color-amber-400)'
  const bgColor = hovered && !editing ? hoverColor : buttonColor
  const radius =
    entry.radius === 'full'
      ? '50%'
      : entry.radius === 'none'
        ? '0'
        : typeof entry.radius === 'number'
          ? `${entry.radius}px`
          : '9999px'

  const body = (
    <>
      {fx && <NoiseFilter fx={fx} params={entry.noise} />}
      <div
        className="absolute inset-0 border-2"
        style={{
          borderRadius: radius,
          borderColor: bgColor,
          backgroundColor: bgColor,
          transition: 'background-color 200ms ease, border-color 200ms ease',
          ...filterStyle,
          boxShadow: shadow,
        }}
      />
      <span
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-sans font-bold capitalize text-white"
        style={{
          fontSize: entry.fontSize ?? 20,
        }}
      >
        {entry.content}
      </span>
    </>
  )

  if (!editing && entry.href) {
    return (
      <a
        href={entry.href}
        download={entry.download}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => track({ event: 'resume_download', download: entry.download, href: entry.href })}
        className="relative block cursor-pointer select-none"
        style={{
          width: entry.width ?? 200,
          height: entry.height ?? 50,
        }}
      >
        {body}
      </a>
    )
  }

  return (
    <button
      type="button"
      disabled={editing}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block select-none"
      style={{
        width: entry.width ?? 200,
        height: entry.height ?? 50,
      }}
    >
      {body}
    </button>
  )
}