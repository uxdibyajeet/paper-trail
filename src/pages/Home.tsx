import { useMemo } from 'react'
import Scrapbook from '../components/Scrapbook'
import { useBuilder } from '../components/builder/builderContext'

function Home() {
  const { data } = useBuilder()
  const sections = useMemo(
    () => Array.from(new Set(Object.values(data).map((e) => e.section))),
    [data],
  )

  return (
    <main className="mx-auto w-full max-w-[1440px]">
      {sections.map((s) => (
        <section key={s} className="relative h-auto min-h-screen">
          <Scrapbook section={s} />
        </section>
      ))}
    </main>
  )
}

export default Home