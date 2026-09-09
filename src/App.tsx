import { useState } from 'react'
import type { AppView } from './components/Shell'
import { FavoritesProvider } from './components/Favorites'
import { FavoritesView } from './components/FavoritesView'
import { RecentProvider, RecentResources } from './components/RecentResources'
import { PaletteProvider } from './components/CommandPalette'
import { Sidebar, TopBar, Footer } from './components/Shell'
import { Hero, BentoGrid, ActivitySection } from './components/Home'

export function App() {
  const [view, setView] = useState<AppView>('home')
  function navigate(next: AppView) {
    setView(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  return <FavoritesProvider><RecentProvider><PaletteProvider>
    <div className="app-shell" id="home">
      <a className="skip-link" href="#main">跳到主要内容</a>
      <div className="ambient-scene" aria-hidden="true"><div className="mountain mountain-far" /><div className="mountain mountain-near" /><div className="lake" /></div>
      <Sidebar view={view} onNavigate={navigate} />
      <div className="app-body"><TopBar /><main id="main">
        {view === 'home' ? <><Hero /><BentoGrid /><div className="activity-stack"><ActivitySection /><RecentResources /></div></> : <FavoritesView />}
        <Footer />
      </main></div>
    </div>
  </PaletteProvider></RecentProvider></FavoritesProvider>
}
