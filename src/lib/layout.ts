import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { Breakpoint } from './breakpoints'
import { useBreakpoint } from './breakpoints'
import type { FxKind, NoiseParams } from './noise'
import layoutData from '../data/layout.json'

export interface LayoutConfig {
  x: number
  y: number
  rotate: number
  scale: number
  z: number
  shadow?: string
}

export type LayoutKind =
  | 'note'
  | 'paper'
  | 'photo'
  | 'sticker'
  | 'graffiti'
  | 'name-card'
  | 'text'

export type FontKind = 'geist' | 'playpen'

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'

export type PaperRadius = 'none' | 'full' | number

export interface LayoutEntry {
  section: string
  hideOnMobile?: boolean
  anchor?: string
  type?: LayoutKind
  content?: string
  src?: string
  fill?: string
  width?: number
  height?: number
  radius?: PaperRadius
  font?: FontKind
  weight?: number
  textTransform?: TextTransform
  color?: string
  fx?: FxKind[]
  noise?: NoiseParams
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

export function shadowValue(token?: string): string {
  if (!token || token === 'none') return 'none'
  return `var(--shadow-${token})`
}

export interface LayoutStyleOptions {
  child?: boolean
}

export function layoutStyle(config: LayoutConfig, options: LayoutStyleOptions = {}): CSSProperties {
  const child = options.child
  return {
    position: 'absolute',
    left: `${config.x}%`,
    top: child ? `${config.y}%` : `${config.y}px`,
    zIndex: config.z,
    transform: `translateX(-50%)${child ? ' translateY(-50%)' : ''} rotate(${config.rotate}deg) scale(${config.scale})`,
  }
}

export function colorValue(token?: string): string | undefined {
  if (!token) return undefined
  if (/^[a-z]+-\d+$/.test(token)) return `var(--color-${token})`
  return token
}

export function fontClass(token?: FontKind): string {
  return token === 'geist' ? 'font-sans' : 'font-hand'
}

export function useLayoutPosition(id: string) {
  const bp = useBreakpoint()

  return useMemo(() => {
    const entry = entries[id]
    if (!entry) return { bp, entry: undefined, config: undefined, hidden: true }
    return { bp, entry, ...resolveLayout(entry, bp) }
  }, [bp, id])
}