import { useEffect, useState } from 'react'

export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

export function getBreakpoint(width: number): Breakpoint {
  if (width >= 1024) return 'desktop'
  if (width >= 768) return 'tablet'
  return 'mobile'
}

export function useBreakpoint(delay = 100): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window === 'undefined' ? 'desktop' : getBreakpoint(window.innerWidth),
  )

  useEffect(() => {
    let timer: number | undefined
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setBp(getBreakpoint(window.innerWidth)), delay)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [delay])

  return bp
}