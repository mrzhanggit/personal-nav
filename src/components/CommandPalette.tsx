import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import resources from '../../docs/zcb-personal-os/data/links.v1.json'
import spaces from '../../docs/zcb-personal-os/data/spaces.v1.json'
import { createSearchIndex, nextSelection, paletteAction, resourceHref, searchResources } from '../lib/search'
import type { Resource } from '../lib/search'
import { Icon } from './Icon'
import './command-palette.css'

const index = createSearchIndex(resources, spaces)
const PaletteContext = createContext<(trigger: HTMLElement) => void>(() => {})

export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  const open = useContext(PaletteContext)
  return <button type="button" className={compact ? 'icon-button search-trigger' : 'command-search search-trigger'} aria-label={compact ? '打开全局搜索' : '搜索网站、项目、工具或输入命令'} aria-haspopup="dialog" onClick={(event: MouseEvent<HTMLButtonElement>) => open(event.currentTarget)}>
    <Icon name="search" />
    {!compact && <><span className="search-placeholder">搜索网站、项目、工具或输入命令…</span><kbd>⌘ K</kbd></>}
  </button>
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const results = useMemo(() => searchResources(index, query), [query])
  const active = results[selected]
  const close = useCallback(() => setOpen(false), [])
  const open = useCallback((trigger: HTMLElement) => {
    triggerRef.current = trigger
    setQuery('')
    setSelected(0)
    setOpen(true)
  }, [])

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const action = paletteAction(event)
      if (action !== 'toggle' && action !== 'ignore') return
      event.preventDefault()
      if (action === 'ignore') return
      if (isOpen) close()
      else open(document.activeElement instanceof HTMLElement && document.activeElement !== document.body
        ? document.activeElement : document.querySelector<HTMLElement>('.command-search')!)
    }
    document.addEventListener('keydown', shortcut)
    return () => document.removeEventListener('keydown', shortcut)
  }, [isOpen, open, close])

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current!
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    inputRef.current?.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = oldOverflow
      if (triggerRef.current?.isConnected) triggerRef.current.focus({ preventScroll: true })
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) document.getElementById(`palette-option-${active?.resource.id}`)?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, active?.resource.id])

  function openSelected(resource: Resource) {
    window.open(resourceHref(resource, import.meta.env.BASE_URL), '_blank', 'noopener,noreferrer')
    close()
  }

  return <PaletteContext.Provider value={open}>{children}<dialog ref={dialogRef} className="command-dialog" aria-label="搜索资源" aria-modal="true" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }} onKeyDown={event => {
    if (event.key === 'Tab') {
      event.preventDefault()
      // Only two tab stops: combobox and close. Options use aria-activedescendant.
      if (document.activeElement === inputRef.current) closeRef.current?.focus()
      else inputRef.current?.focus()
      return
    }
    const action = paletteAction(event.nativeEvent)
    if (action === 'close') { event.preventDefault(); close() }
    if (action === 'next' || action === 'previous') {
      event.preventDefault()
      inputRef.current?.focus()
      setSelected(current => nextSelection(current, action === 'next' ? 1 : -1, results.length))
    }
    if (action === 'open' && document.activeElement === inputRef.current) {
      event.preventDefault()
      if (active) openSelected(active.resource)
    }
  }}><div className="palette-panel">
    <div className="palette-search"><Icon name="search" /><input ref={inputRef} role="combobox" aria-label="搜索真实资源" aria-autocomplete="list" aria-expanded={isOpen} aria-controls="palette-results" aria-activedescendant={active ? `palette-option-${active.resource.id}` : undefined} autoComplete="off" spellCheck={false} value={query} placeholder="搜索网站、项目、工具…" onChange={event => { setQuery(event.target.value); setSelected(0) }} /><button ref={closeRef} type="button" onClick={close} aria-label="关闭搜索">esc</button></div>
    <div className="palette-label" aria-live="polite"><span>{query.trim() ? '搜索结果' : '全部资源'}</span><span>{results.length} 个资源</span></div>
    <div className="palette-results" id="palette-results" role="listbox" aria-label="资源列表">
      {results.map((entry, position) => <div id={`palette-option-${entry.resource.id}`} key={entry.resource.id} role="option" aria-selected={position === selected} className="palette-option" onMouseEnter={() => setSelected(position)} onMouseDown={event => event.preventDefault()} onClick={() => openSelected(entry.resource)}>
        <span className="resource-icon" aria-hidden="true">{entry.resource.icon}</span><div className="palette-result-copy"><strong>{entry.resource.name}</strong><p>{entry.resource.description}</p><small>{entry.spaceName}{entry.resource.category ? ` / ${entry.resource.category}` : ''}</small></div><span className="palette-destination">{entry.resource.hostingType === 'internal-static' ? '站内' : '外部'}</span><span className="palette-enter" aria-hidden="true">↵</span>
      </div>)}
    </div>
    {!results.length && <div className="palette-empty"><Icon name="search" /><p>没有找到相关资源</p><span>试试其他名称、标签或空间</span></div>}
    <div className="palette-footer"><span>↑↓ 选择</span><span>↵ 新标签页打开</span><span>esc 关闭</span></div>
  </div></dialog></PaletteContext.Provider>
}
