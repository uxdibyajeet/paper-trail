import type { CSSProperties, ReactNode } from 'react'
import './graffiti-text.css'

function fillValue(token?: string): string | undefined {
  if (!token) return undefined
  if (token.startsWith('#') || token.startsWith('rgb') || token.startsWith('var(')) return token
  return `var(--color-${token})`
}

interface GraffitiTextProps {
  fill?: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export default function GraffitiText({ fill, children, className, style: styleProp }: GraffitiTextProps) {
  const style: CSSProperties = {
    ...styleProp,
    ...(fill ? { ['--graffiti-fill' as string]: fillValue(fill) } : {}),
  }

  return (
    <p className={`graffiti-text${className ? ` ${className}` : ''}`} style={style}>
      {children}
    </p>
  )
}