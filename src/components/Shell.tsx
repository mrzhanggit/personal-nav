import { SearchTrigger } from './CommandPalette'
import { Icon } from './Icon'

const navigation = [['home', '首页'], ['star', '收藏'], ['grid', '应用'], ['folder', '项目'], ['bolt', '快速'], ['more', '更多']]

export function Sidebar() {
  return <aside className="sidebar"><nav aria-label="主导航">
    {navigation.map(([icon, label], index) => <button key={label} className={`nav-item ${index === 0 ? 'is-active' : ''}`} aria-current={index === 0 ? 'page' : undefined} disabled={index !== 0} title={index === 0 ? '首页' : '尚未开放'} onClick={index === 0 ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : undefined}><Icon name={icon} /><span>{label}</span></button>)}
  </nav><span className="side-bottom">PERSONAL<br />SPACE</span></aside>
}

export function TopBar() {
  const time = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  return <header className="topbar"><a href="#home" className="brand"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m4 26 12-21 12 21-12-7Z M4 26l12-4 12 4" /></svg><span><strong>ZCB</strong><i>/</i> PERSONAL OS</span></a><span className="brand-tagline">A MORE FOCUSED, MORE ME</span><div className="top-actions"><SearchTrigger compact /><button className="icon-button" disabled aria-label="设置尚未开放"><Icon name="settings" /></button><time>{time}</time><span className="avatar" aria-label="ZCB">Z</span></div></header>
}

export function Footer() {
  return <footer><div><span>ZCB / PERSONAL OS</span><small>A MORE FOCUSED, MORE ME</small></div><p>每一天，都更好的版本 <span>——</span></p></footer>
}
