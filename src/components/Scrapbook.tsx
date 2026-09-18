import type { LayoutEntry, LayoutData } from '../lib/layout'
import layoutData from '../data/layout.json'
import PositionedElement from './PositionedElement'

const entries = layoutData as LayoutData

function ScrapbookCard({ entry }: { entry: LayoutEntry }) {
  if (entry.type === 'photo') {
    return (
      <div className="w-48 rounded-sm bg-white p-2 pb-3 shadow-xl">
        <img src={entry.src} alt="" className="block aspect-square w-full object-cover" />
      </div>
    )
  }

  if (entry.type === 'note') {
    return (
      <div className="w-48 rounded-sm border-2 border-amber-300 bg-amber-100 p-3 font-hand text-amber-950 shadow-lg">
        {entry.content}
      </div>
    )
  }

  return <p className="font-hand text-2xl text-slate-100">{entry.content}</p>
}

export default function Scrapbook({ section }: { section: string }) {
  const ids = Object.keys(entries).filter((id) => entries[id].section === section)

  return (
    <>
      {ids.map((id) => {
        const entry = entries[id]
        return (
          <PositionedElement key={id} id={id} section={section}>
            <ScrapbookCard entry={entry} />
          </PositionedElement>
        )
      })}
    </>
  )
}