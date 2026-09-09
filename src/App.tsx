import { useEffect, useRef, useState } from 'react'
import type { AppView } from './lib/spaces'
import { SpaceView } from './components/SpaceView'
import { FavoritesProvider } from './components/Favorites'
import { FavoritesView } from './components/FavoritesView'
import { RecentProvider, RecentResources } from './components/RecentResources'
import { PaletteProvider } from './components/CommandPalette'
import { Sidebar, TopBar, Footer } from './components/Shell'
import { Hero, BentoGrid, ActivitySection } from './components/Home'

export function App() {
  const [view, setView] = useState<AppView>({ kind: 'home' })
  const mainRef = useRef<HTMLElement>(null)
  const previousView = useRef(view)
  useEffect(() => {
    if (previousView.current === view) return
    previousView.current = view
    // A Space entry unmounts on navigation; move keyboard focus to the new content.
    mainRef.current?.focus({ preventScroll: true })
  }, [view])
  const openSpace = (spaceId: string) => navigate({ kind: 'space', spaceId })
  function navigate(next: AppView) {
    setView(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  return <FavoritesProvider><RecentProvider><PaletteProvider>
    <div className="app-shell" id="home">
      <a className="skip-link" href="#main">跳到主要内容</a>
      <div className="ambient-scene" aria-hidden="true"><div className="mountain mountain-far" /><div className="mountain mountain-near" /><div className="lake" /></div>
      <Sidebar view={view.kind} onNavigate={kind => navigate({ kind })} />
      <div className="app-body"><TopBar /><main id="main" ref={mainRef} tabIndex={-1}>
        {view.kind === 'home' ? <><Hero onOpenSpace={openSpace} /><BentoGrid onOpenSpace={openSpace} /><div className="activity-stack"><ActivitySection /><RecentResources /></div></> : view.kind === 'favorites' ? <FavoritesView /> : <SpaceView spaceId={view.spaceId} onOpenSpace={openSpace} onHome={() => navigate({ kind: 'home' })} />}
        <Footer />
      </main></div>
    </div>
  </PaletteProvider></RecentProvider></FavoritesProvider>
}
