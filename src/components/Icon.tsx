const paths: Record<string, string> = {
  home: 'm3 10 9-7 9 7 M5 9v12h5v-7h4v7h5V9',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
  grid: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h6v6h-6z',
  folder: 'M3 6h6l2 2h10v12H3Z',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-8Z',
  more: 'M4 12h.01 M12 12h.01 M20 12h.01',
  Sparkles: 'm10 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z M19 2v5 M16.5 4.5h5 M20 16v6 M17 19h6',
  BriefcaseMedical: 'M8 7V4h8v3 M3 7h18v14H3Z M12 11v6 M9 14h6',
  BookOpen: 'M12 5v16 M12 5C8 2 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-6-2-10 1Z',
  ChartNoAxesCombined: 'M4 21V12 M10 21V8 M16 21V4 M22 21V1 M3 8l6-5 6 1 6-3',
  PenTool: 'm4 20 2-7L17 2l5 5-11 11Z M6 13l5 5 M14 5l5 5 M4 20l-1 1',
  Leaf: 'M20 3C8 1 1 8 5 16c7 9 17 0 15-13Z M3 22 16 9',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  arrow: 'M5 12h14 m-6-6 6 6-6 6',
  clock: 'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
  pause: 'M9 8v8 M15 8v8 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  terminal: 'm5 7 5 5-5 5 M13 17h6',
}

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.grid} /></svg>
}
