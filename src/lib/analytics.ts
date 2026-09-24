declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export type TrackEvent =
  | { event: 'resume_download'; download?: string; href?: string }
  | { event: 'project_card_click'; title?: string; href?: string }
  | { event: 'social_link_click'; network?: string; href?: string }
  | { event: 'email_click'; email?: string }

export function track(e: TrackEvent) {
  const gtag = typeof window !== 'undefined' ? window.gtag : undefined
  if (typeof gtag !== 'function') return
  const { event, ...params } = e
  gtag('event', event, params)
}

export default track