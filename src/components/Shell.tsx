import { SearchTrigger } from './CommandPalette'
import { Icon } from './Icon'

const navigation = [['home', '首页'], ['star', '收藏'], ['grid', '应用'], ['folder', '项目'], ['bolt', '快速'], ['more', '更多']]

export type AppView = 'home' | 'favorites'

export function Sidebar({ view, onNavigate }: { view: AppView; onNavigate: (view: AppView) => void }) {
  return <aside className="sidebar"><nav aria-label="主导航">
    {navigation.map(([icon, label], index) => {
      const target = index === 0 ? 'home' : 'favorites'
      const active = index < 2 && view === target
      return <button key={label} type="button" className={`nav-item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} disabled={index > 1} title={index < 2 ? label : '尚未开放'} onClick={index < 2 ? () => onNavigate(target) : undefined}><Icon name={icon} /><span>{label}</span></button>
    })}
  </nav><span className="side-bottom">PERSONAL<br />SPACE</span></aside>
}

export function TopBar() {
  const time = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  return <header className="topbar"><a href="#home" className="brand"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m4 26 12-21 12 21-12-7Z M4 26l12-4 12 4" /></svg><span><strong>ZCB</strong><i>/</i> PERSONAL OS</span></a><span className="brand-tagline">A MORE FOCUSED, MORE ME</span><div className="top-actions"><SearchTrigger compact /><button className="icon-button" disabled aria-label="设置尚未开放"><Icon name="settings" /></button><time>{time}</time><span className="avatar" aria-label="ZCB">Z</span></div></header>
}

export function Footer() {
  return <footer><div><span>ZCB / PERSONAL OS</span><small>A MORE FOCUSED, MORE ME</small></div><p>每一天，都更好的版本 <span>——</span></p></footer>
}
