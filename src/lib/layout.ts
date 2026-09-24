import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { Breakpoint } from './breakpoints'
import { useBreakpoint, useViewportWidth } from './breakpoints'
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
  | 'tape'
  | 'photo'
  | 'sticker'
  | 'graffiti'
  | 'name-card'
  | 'section-label'
  | 'tic-tac-toe'
  | 'word'
  | 'card'
  | 'email-card'
  | 'primary-button'
  | 'text'

export type FontKind = 'geist' | 'playpen'

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'

export type PaperRadius = 'none' | 'full' | number

export type StickerHover = 'rotate'

export interface WordLetterText {
  scale: number
  rotate?: number
}

export interface WordLetter {
  char: string
  fill?: string
  color?: string
  radius?: PaperRadius
  width?: number
  height?: number
  transform?: TextTransform
  fx?: FxKind[]
  noise?: NoiseParams
  textFx?: FxKind[]
  textNoise?: NoiseParams
  text?: WordLetterText
  desktop: LayoutConfig
}

export interface LayoutEntry {
  section: string
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  anchor?: string
  type?: LayoutKind
  content?: string
  title?: string
  desc?: string
  href?: string
  download?: string
  src?: string
  copySrc?: string
  hover?: StickerHover
  tooltip?: string
  tooltipPosition?: 'top' | 'bottom'
  fill?: string
  width?: number
  height?: number
  radius?: PaperRadius
  fontSize?: number
  font?: FontKind
  weight?: number
  textTransform?: TextTransform
  color?: string
  fx?: FxKind[]
  noise?: NoiseParams
  letters?: WordLetter[]
  origin?: { x: number; y: number }
  desktop: LayoutConfig
  laptop?: LayoutConfig
  tablet?: LayoutConfig
  mobile?: LayoutConfig
}

export type LayoutData = Record<string, LayoutEntry>

const entries = layoutData as LayoutData

// Design anchor widths per breakpoint used for continuous interpolation.
// These mirror the collage's fixed 1440-wide design and the breakpoint edges.
const ANCHOR_WIDTHS: Record<Breakpoint, number> = {
  desktop: 1440,
  laptop: 1280,
  tablet: 900,
  mobile: 390,
}

const ANCHOR_ORDER: Breakpoint[] = ['desktop', 'laptop', 'tablet', 'mobile']

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function configAt(entry: LayoutEntry, bp: Breakpoint): LayoutConfig {
  return entry[bp] ?? entry.desktop
}

/**
 * Resolve a layout entry against a viewport width.
 *
 * If `width` is provided the numeric fields (x, y, rotate, scale, z) are
 * linearly interpolated between the two nearest breakpoint anchors, so the
 * collage scrolls/rotates continuously as the viewport resizes instead of
 * snapping between breakpoints. `shadow` and `hidden` stay discrete by
 * breakpoint (they are categorical, not spatial). Missing anchors fall back
 * to `entry.desktop`, so an entry with no laptop/tablet configs interpolates
 * flat between desktop and mobile.
 *
 * If `width` is omitted the behaviour is the old discrete snapshot (`entry[bp]`)
 * — used by the builder while editing per-breakpoint configs.
 */
export function resolveLayout(entry: LayoutEntry, bp: Breakpoint, width?: number) {
  const hidden =
    (bp === 'mobile' && entry.hideOnMobile === true) || (bp === 'tablet' && entry.hideOnTablet === true)

  if (width === undefined) {
    return { config: entry[bp] ?? entry.desktop, hidden }
  }

  const w = Math.min(Math.max(width, ANCHOR_WIDTHS.mobile), ANCHOR_WIDTHS.desktop)

  let loI = ANCHOR_ORDER.length - 1 // index of last anchor atom (mobile)
  let hiI = 0
  for (let i = 0; i < ANCHOR_ORDER.length - 1; i++) {
    if (w <= ANCHOR_WIDTHS[ANCHOR_ORDER[i]]) {
      hiI = i
      loI = i + 1
      break
    }
  }

  const loBp = ANCHOR_ORDER[loI]
  const hiBp = ANCHOR_ORDER[hiI]
  const wLo = ANCHOR_WIDTHS[loBp]
  const wHi = ANCHOR_WIDTHS[hiBp]
  const t = wHi === wLo ? 1 : (w - wLo) / (wHi - wLo)

  const hi = configAt(entry, hiBp)
  const lo = configAt(entry, loBp)
  const cfg: LayoutConfig = {
    x: round1(lerp(lo.x, hi.x, t)),
    y: round1(lerp(lo.y, hi.y, t)),
    rotate: round1(lerp(lo.rotate, hi.rotate, t)),
    scale: round2(lerp(lo.scale, hi.scale, t)),
    z: Math.round(lerp(lo.z ?? 0, hi.z ?? 0, t)),
    shadow: t >= 0.5 ? hi.shadow : lo.shadow,
  }

  return { config: cfg, hidden }
}

/**
 * Fluid font size: render a builder font size (px) as a CSS `clamp()` so text
 * scales continuously with the viewport instead of staying fixed. The builder
 * keeps storing the plain number; we only make the string fluid at render time.
 *
 *   clamp(0.625 * px, <vw-scaled>, px)
 *
 * The vw factor uses 1440 (the collage's fixed design width), so at exactly
 * 1440 wide the clamped size equals the authored `px`. Never grows past `px`
 * (it's the max anchor) and shrinks on smaller screens.
 */
export function fluidFont(px?: number | string): string | undefined {
  if (px === undefined) return undefined
  if (typeof px === 'string') return px
  const max = Math.round(px * 10) / 10
  const min = Math.round(px * 0.6 * 10) / 10
  const vw = Math.round((max / 1440) * 1000) / 1000
  return `clamp(${min}px, ${vw}vw, ${max}px)`
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

export function useLayoutPosition(id: string, data: LayoutData = entries) {
  const bp = useBreakpoint()
  const width = useViewportWidth()

  return useMemo(() => {
    const entry = data[id]
    if (!entry) return { bp, entry: undefined, config: undefined, hidden: true }
    return { bp, entry, ...resolveLayout(entry, bp, width) }
  }, [bp, width, id, data])
}