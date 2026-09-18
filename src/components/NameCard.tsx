import type { CSSProperties } from 'react'
import './name-card.css'

interface NameCardProps {
  className?: string
  style?: CSSProperties
}

export default function NameCard({ className, style }: NameCardProps) {
  return (
    <div className={`name-card${className ? ` ${className}` : ''}`} style={style}>
      <p className="name-card__title">hello!</p>
      <p className="name-card__subtitle">my name is</p>
      <div className="name-card__divider" />
    </div>
  )
}