import Scrapbook from '../components/Scrapbook'

function Home() {
  return (
    <main className="w-full">
      <section className="relative h-auto min-h-screen overflow-x-clip">
        <Scrapbook section="home" />
      </section>
    </main>
  )
}

export default Home