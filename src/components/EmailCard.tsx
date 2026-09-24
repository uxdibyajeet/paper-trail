import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import type { LayoutEntry } from '../lib/layout'
import { colorValue } from '../lib/layout'
import { track } from '../lib/analytics'
import NoiseFilter from './NoiseFilter'
import { effectFilterId, scaledNoise } from '../lib/noise'
import type { FxKind } from '../lib/noise'

function fallbackCopy(text: string): boolean {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
}

export default function EmailCard({
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
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const timer = useRef<number>(0)
  const email = entry.content ?? ''
  const paperColor = 'var(--color-amber-100)'
  const ink = hovered ? 'var(--color-slate-700)' : colorValue(entry.color) ?? 'var(--color-slate-900)'
  const interactive = !editing && email.length > 0
  const fx: FxKind[] | undefined = entry.fx?.length ? entry.fx : undefined
  const scaledFx = fx ? scaledNoise(entry.noise, 0.5) : undefined
  const scaledFilterId = fx ? effectFilterId(fx, scaledFx) : undefined

  const copyEmail = async () => {
    if (!interactive) return
    let ok = false
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(email)
        ok = true
      } catch {
        ok = false
      }
    }
    if (!ok) ok = fallbackCopy(email)
    if (!ok) return
    setCopied(true)
    track({ event: 'email_click', email })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      void copyEmail()
    }
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Copy email ${email} to clipboard` : undefined}
      onClick={() => void copyEmail()}
      onKeyDown={handleKey}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block select-none"
      style={{
        width: entry.width ?? 494,
        height: entry.height ?? 80,
        cursor: interactive ? 'pointer' : undefined,
        transform: hovered ? 'rotate(4deg)' : 'rotate(0deg)',
        transition: 'transform 220ms ease',
      }}
    >
      <div
        className="absolute inset-0 rounded-sm border-2"
        style={{
          borderColor: paperColor,
          backgroundColor: paperColor,
          ...filterStyle,
          boxShadow: shadow,
        }}
      />
      <img
        src={entry.src}
        alt=""
        className="absolute select-none [-webkit-user-drag:none]"
        draggable={false}
        style={{
          left: '1%',
          top: '8%',
          transform: 'translate(-50%,-50%) scale(0.8)',
          filter: 'drop-shadow(var(--shadow-pinned))',
        }}
      />
<span
        className="absolute whitespace-nowrap font-hand"
        style={{
          left: '44%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          color: ink,
          fontWeight: entry.weight ?? 900,
          fontSize: 26,
          fontFamily: entry.font === 'geist' ? 'var(--font-geist)' : undefined,
        }}
      >
        {email}
      </span>
      <svg
        width="49"
        height="49"
        viewBox="0 0 49 49"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute select-none"
        style={{
          left: '81%',
          top: '50%',
          transform: 'translate(-50%,-50%) scale(0.7)',
          color: ink,
        }}
        aria-hidden="true"
      >
        <path
          d="M18.3216 36.6433C17.2019 36.6433 16.2434 36.2446 15.4461 35.4473C14.6488 34.65 14.2501 33.6915 14.2501 32.5718V8.14301C14.2501 7.02335 14.6488 6.06486 15.4461 5.26753C16.2434 4.4702 17.2019 4.07153 18.3216 4.07153H36.6432C37.7629 4.07153 38.7214 4.4702 39.5187 5.26753C40.316 6.06486 40.7147 7.02335 40.7147 8.14301V32.5718C40.7147 33.6915 40.316 34.65 39.5187 35.4473C38.7214 36.2446 37.7629 36.6433 36.6432 36.6433H18.3216ZM18.3216 32.5718H36.6432V8.14301H18.3216V32.5718ZM10.1786 44.7863C9.059 44.7863 8.1005 44.3876 7.30317 43.5903C6.50584 42.7929 6.10718 41.8344 6.10718 40.7148V12.2145H10.1786V40.7148H32.5717V44.7863H10.1786Z"
          fill="currentColor"
        />
      </svg>
      {copied && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: '81%',
            top: '-16px',
            transform: 'translate(-50%,-100%) rotate(-4deg)',
          }}
        >
          {scaledFx && <NoiseFilter fx={fx} params={scaledFx} />}
          <div
            className="absolute inset-0 rounded-sm border-2 border-amber-300 bg-amber-100"
            style={{
              filter: scaledFilterId ? `url(#${scaledFilterId})` : undefined,
              boxShadow: 'var(--shadow-pinned)',
            }}
          />
          <span className="relative block whitespace-nowrap px-2 py-0.5 font-hand text-sm text-amber-950">
            copied!
          </span>
        </div>
      )}
    </div>
  )
}