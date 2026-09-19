import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import BuilderDrawer from './BuilderDrawer'
import { BuilderProvider } from './BuilderProvider'

export default function BuilderOverlay({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        setEnabled((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!import.meta.env.DEV) return <>{children}</>

  if (!enabled) {
    return (
      <>
        {children}
        <div className="pointer-events-none fixed bottom-3 left-3 z-[998] rounded border border-amber-400/20 bg-slate-950/70 px-2 py-1 font-mono text-[11px] text-slate-400/80">
          builder off &middot; Ctrl+L to enable
        </div>
      </>
    )
  }

  return (
    <BuilderProvider>
      {children}
      <BuilderDrawer />
      <div className="pointer-events-none fixed bottom-3 left-3 z-[998] rounded border border-amber-400/30 bg-slate-950/70 px-2 py-1 font-mono text-[11px] text-amber-200/80">
        drag roots to move &middot; Esc cancel &middot; Ctrl+Z undo &middot; Ctrl+S save &middot; / drawer &middot; Ctrl+L off
      </div>
    </BuilderProvider>
  )
}