import type { ReactNode } from 'react'
import { layoutStyle, useLayoutPosition } from '../lib/layout'

interface PositionedElementProps {
  id: string
  section: string
  className?: string
  children?: ReactNode
}

export default function PositionedElement({ id, section, className, children }: PositionedElementProps) {
  const { config, hidden } = useLayoutPosition(id)

  if (hidden || !config) return null

  return (
    <div style={layoutStyle(config)} className={className} data-section={section}>
      {children}
    </div>
  )
}