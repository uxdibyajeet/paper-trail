import './index.css'
import Home from './pages/Home'
import BuilderOverlay from './components/builder/BuilderOverlay'
import BuilderPanelMode from './components/builder/BuilderPanelMode'

function App() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('panel') === 'builder') return <BuilderPanelMode />
  return (
    <BuilderOverlay>
      <Home />
    </BuilderOverlay>
  )
}

export default App