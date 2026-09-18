export type FxKind = 'noise' | 'torn'

export interface NoiseParams {
  size?: number
  density?: number
  color?: string
  seed?: number
  rough?: number
}

const DEFAULT_SIZE = 5
const DEFAULT_DENSITY = 30
const DEFAULT_SEED = 0
const DEFAULT_ROUGH = 8

const FILTER_REGION = 1600

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function baseFrequency(size?: number): number {
  const s = clamp(size ?? DEFAULT_SIZE, 0.5, 150)
  return clamp(1 / s, 0.005, 2)
}

function speckleTable(density?: number): string {
  const d = clamp(density ?? DEFAULT_DENSITY, 0, 100)
  const n = Math.round(50 * (d / 100))
  const values = new Array<number>(100).fill(0)
  if (n === 0) return values.join(' ')
  const step = Math.floor(68 / Math.max(1, n - 1))
  for (let i = 0; i < n; i++) values[15 + Math.min(69, i * step)] = 1
  return values.join(' ')
}

export function effectFilterId(fx?: FxKind[], params?: NoiseParams): string {
  const base = JSON.stringify({ fx: fx ?? [], params: params ?? {} })
  let h = 0
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0
  return `pt-fx-${h.toString(36)}`
}

function filterOpen(id: string): string {
  return `<filter id="${id}" x="0" y="0" width="${FILTER_REGION}" height="${FILTER_REGION}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`
}

function shapeBlend(): string {
  return `<feFlood flood-opacity="0" result="bg"/>
  <feBlend mode="normal" in="SourceGraphic" in2="bg" result="shape"/>`
}

function speckleChain(params?: NoiseParams): string {
  const size = baseFrequency(params?.size)
  const color = params?.color?.trim() || 'rgba(0, 0, 0, 0.25)'
  const seed = params?.seed ?? DEFAULT_SEED
  const floodColor = /^[a-z]+-\d+$/.test(color) ? `var(--color-${color})` : color

  return `<feTurbulence type="fractalNoise" baseFrequency="${size} ${size}" stitchTiles="stitch" numOctaves="3" seed="${seed}" result="noise"/>
  <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise"/>
  <feComponentTransfer in="alphaNoise" result="coloredNoise">
    <feFuncA type="discrete" tableValues="${speckleTable(params?.density)}"/>
  </feComponentTransfer>
  <feComposite operator="in" in2="shape" in="coloredNoise" result="clippedNoise"/>
  <feFlood style="flood-color:${floodColor}" result="flood"/>
  <feComposite operator="in" in2="clippedNoise" in="flood" result="dots"/>
  <feMerge result="textured">
    <feMergeNode in="shape"/>
    <feMergeNode in="dots"/>
  </feMerge>`
}

function displacementChain(source: string, params?: NoiseParams): string {
  const size = baseFrequency(params?.size) * 0.833
  const rough = clamp(params?.rough ?? DEFAULT_ROUGH, 0, 20)
  const seed = params?.seed ?? DEFAULT_SEED

  return `<feTurbulence type="fractalNoise" baseFrequency="${size} ${size}" numOctaves="3" seed="${seed + 1}" result="disp"/>
  <feDisplacementMap in="${source}" scale="${rough}" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
  <feMerge result="fxOut">
    <feMergeNode in="displaced"/>
  </feMerge>`
}

export function textureFilter(id: string, params?: NoiseParams): string {
  return `${filterOpen(id)}
  ${shapeBlend()}
  ${speckleChain(params)}
</filter>`
}

export function tornFilter(id: string, params?: NoiseParams): string {
  return `${filterOpen(id)}
  ${shapeBlend()}
  ${speckleChain(params)}
  ${displacementChain('textured', params)}
</filter>`
}

export function effectFilter(id: string, fx?: FxKind[], params?: NoiseParams): string {
  const hasNoise = fx?.includes('noise') ?? false
  const hasTorn = fx?.includes('torn') ?? false
  if (!hasNoise && !hasTorn) return ''

  const out: string[] = [filterOpen(id), shapeBlend()]
  if (hasNoise) out.push(speckleChain(params))
  if (hasTorn) out.push(displacementChain(hasNoise ? 'textured' : 'shape', params))
  out.push('</filter>')
  return out.join('\n  ')
}