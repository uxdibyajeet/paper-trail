import { useEffect } from 'react'
import BuilderDrawer from './BuilderDrawer'
import { BuilderProvider } from './BuilderProvider'

export default function BuilderPanelMode() {
  useEffect(() => {
    document.title = 'Builder · paper-trail'
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevOverflow
    }
  }, [])

  return (
    <BuilderProvider panelMode>
      <BuilderDrawer />
    </BuilderProvider>
  )
}