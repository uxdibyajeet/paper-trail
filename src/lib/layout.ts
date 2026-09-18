import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { Breakpoint } from './breakpoints'
import { useBreakpoint } from './breakpoints'
import layoutData from '../data/layout.json'

export interface LayoutConfig {
  xPct: number
  yPx: number
  rotate: number
  scale: number
  z: number
}

export type LayoutKind = 'note' | 'photo' | 'text'

export interface LayoutEntry {
  section: string
  hideOnMobile?: boolean
  type?: LayoutKind
  content?: string
  src?: string
  desktop: LayoutConfig
  tablet?: LayoutConfig
  mobile?: LayoutConfig
}

export type LayoutData = Record<string, LayoutEntry>

const entries = layoutData as LayoutData

export function resolveLayout(entry: LayoutEntry, bp: Breakpoint) {
  const hidden = bp === 'mobile' && entry.hideOnMobile === true
  return { config: entry[bp] ?? entry.desktop, hidden }
}

export function layoutStyle(config: LayoutConfig): CSSProperties {
  return {
    position: 'absolute',
    left: `${config.xPct}%`,
    top: `${config.yPx}px`,
    zIndex: config.z,
    transform: `rotate(${config.rotate}deg) scale(${config.scale})`,
  }
}

export function useLayoutPosition(id: string) {
  const bp = useBreakpoint()

  return useMemo(() => {
    const entry = entries[id]
    if (!entry) return { bp, entry: undefined, config: undefined, hidden: true }
    return { bp, entry, ...resolveLayout(entry, bp) }
  }, [bp, id])
}