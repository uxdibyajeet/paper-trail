import { useEffect, useState } from 'react'

export type Breakpoint = 'desktop' | 'laptop' | 'tablet' | 'mobile'

export function getBreakpoint(width: number): Breakpoint {
  if (width >= 1440) return 'desktop'
  if (width >= 1024) return 'laptop'
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

export function useViewportWidth(delay = 0): number {
  const [width, setWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth,
  )

  useEffect(() => {
    let timer: number | undefined
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setWidth(window.innerWidth), delay)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [delay])

  return width
}

export function useViewportSize(delay = 0): { width: number; height: number } {
  const [width, setWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth,
  )
  const [height, setHeight] = useState<number>(() =>
    typeof window === 'undefined' ? 900 : window.innerHeight,
  )

  useEffect(() => {
    let timer: number | undefined
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
      }, delay)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [delay])

  return { width, height }
}