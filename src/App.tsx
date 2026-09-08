import { Sidebar, TopBar, Footer } from './components/Shell'
import { Hero, BentoGrid, ActivitySection } from './components/Home'

export function App() {
  return <div className="app-shell" id="home"><a className="skip-link" href="#main">跳到主要内容</a><div className="ambient-scene" aria-hidden="true"><div className="mountain mountain-far" /><div className="mountain mountain-near" /><div className="lake" /></div><Sidebar /><div className="app-body"><TopBar /><main id="main"><Hero /><BentoGrid /><div className="activity-stack"><ActivitySection /><ActivitySection recent /></div><Footer /></main></div></div>
}
