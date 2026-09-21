import type { CSSProperties } from 'react'
import type { LayoutEntry, WordLetter } from '../lib/layout'
import { colorValue, shadowValue } from '../lib/layout'
import { effectFilterId } from '../lib/noise'
import NoiseFilter from './NoiseFilter'
import './Word.css'

const DESIGN_WIDTH = 1440

function radiusValue(radius: WordLetter['radius']): string {
  if (radius === 'full') return '50%'
  if (radius === 'none') return '0'
  if (typeof radius === 'number') return `${radius}px`
  return '0.125rem'
}

export default function Word({ entry }: { entry: LayoutEntry }) {
  const letters = entry.letters ?? []

  if (letters.length === 0) return null
  const origin = entry.origin ?? { x: entry.desktop.x, y: entry.desktop.y }

  return (
    <h1 className="word">
      {letters.map((letter, i) => {
        const tileFx = letter.fx?.length ? letter.fx : undefined
        const textFx = letter.textFx?.length ? letter.textFx : undefined
        return (
          <span key={`f${i}`} className="word__filter">
            {tileFx && <NoiseFilter fx={tileFx} params={letter.noise} />}
            {textFx && <NoiseFilter fx={textFx} params={letter.textNoise} />}
          </span>
        )
      })}
      {letters.map((letter, i) => {
        const config = letter.desktop
        const text = letter.text
        const height = letter.height ?? 110
        const width = letter.width ?? 90
        const x = ((config.x - origin.x) / 100) * DESIGN_WIDTH
        const y = config.y + (height * config.scale) / 2 - origin.y
        const fill = colorValue(letter.fill) ?? 'var(--color-amber-400)'
        const tileFx = letter.fx?.length ? letter.fx : undefined
        const textFx = letter.textFx?.length ? letter.textFx : undefined
        const tileStyle: CSSProperties = {
          width: '100%',
          height: '100%',
          backgroundColor: fill,
          borderColor: fill,
          borderRadius: radiusValue(letter.radius),
          boxShadow: shadowValue(config.shadow),
          zIndex: config.z,
          filter: tileFx ? `url(#${effectFilterId(tileFx, letter.noise)})` : undefined,
        }
        const charStyle: CSSProperties = {
          color: colorValue(letter.color) ?? 'var(--color-slate-950)',
          fontSize: 24,
          textTransform: letter.transform ?? 'uppercase',
          zIndex: 10,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${text?.rotate ?? 0}deg) scale(${text?.scale ?? 5})`,
          filter: textFx ? `url(#${effectFilterId(textFx, letter.textNoise)})` : undefined,
        }
        return (
          <span
            key={`${letter.char}${i}`}
            className="word__letter"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: `translate(-50%, -50%) rotate(${config.rotate}deg) scale(${config.scale})`,
            }}
          >
            <span
              className="word__jitter"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                marginLeft: `${-width / 2}px`,
                marginTop: `${-height / 2}px`,
                transformOrigin: '50% 0%',
              }}
            >
              <span className="word__tile" style={tileStyle} />
              <span className="word__char" style={charStyle}>
                {letter.char}
              </span>
            </span>
          </span>
        )
      })}
    </h1>
  )
}