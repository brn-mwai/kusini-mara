/* Classic scripts throughout, not ES modules: module and fetch requests from
   file:// are blocked by CORS in Chromium and Gecko, and double-click open with
   no server is acceptance check 1. Data ships embedded in assets/data.js for
   the same reason; the JSON files in data/ remain the canonical contract. */
window.CB = window.CB || {}

CB.icons = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  counties: '<path d="M4.5 9.5 8 5l6 1 5.5 3-1.5 6-6 4-5.5-2.5z"/>',
  stations: '<circle cx="12" cy="12" r="1.4"/><path d="M8.8 15.2a4.5 4.5 0 0 1 0-6.4M15.2 8.8a4.5 4.5 0 0 1 0 6.4M6.2 17.8a8.2 8.2 0 0 1 0-11.6M17.8 6.2a8.2 8.2 0 0 1 0 11.6"/>',
  maps: '<path d="M9 4 15 6 21 4V18L15 20 9 18 3 20V6z M9 4v14M15 6v14"/>',
  vegetation: '<path d="M12 20v-7M12 13c0-4 2.8-6 6.8-6 0 4-2.8 6-6.8 6zM12 13c0-4-2.8-6-6.8-6 0 4 2.8 6 6.8 6z"/>',
  rainfall: '<path d="M17.3 14.5a3.6 3.6 0 0 0 .5-7.15 5.8 5.8 0 0 0-11.2-.6A3.9 3.9 0 0 0 7 14.5z M8.3 17.5l-1 2.6M12.3 17.5l-1 2.6M16.3 17.5l-1 2.6"/>',
  soil: '<path d="M12 3l9 5-9 5-9-5z M21 12.5l-9 5-9-5 M21 16.5l-9 5-9-5"/>',
  outlook: '<circle cx="9" cy="9" r="3"/><path d="M9 3.2v1.6M3.2 9h1.6M4.9 4.9l1.1 1.1M13.1 4.9 12 6M13.4 20h4.7a2.9 2.9 0 0 0 .5-5.76A4.8 4.8 0 0 0 9.4 13.6 3.1 3.1 0 0 0 13.4 20z"/>',
  reports: '<path d="M12 21s-6.5-5.2-6.5-10.4a6.5 6.5 0 1 1 13 0C18.5 15.8 12 21 12 21z"/><circle cx="12" cy="10.4" r="2.2"/>',
  triggers: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10.5h16M8.5 3.5v4M15.5 3.5v4"/>',
  scorecard: '<path d="M4 20h16M7 20v-7M12 20V6M17 20v-9.5"/>',
  alerts: '<path d="M18 16H6c1.2-1.4 1.8-3 1.8-5.4a4.2 4.2 0 0 1 8.4 0c0 2.4.6 4 1.8 5.4zM10.3 19a1.8 1.8 0 0 0 3.4 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18"/>',
  search: '<circle cx="11" cy="11" r="5.5"/><path d="M15.2 15.2 20 20"/>',
  filter: '<path d="M4 6h16M7.5 12h9M10.5 18h3"/>',
  more: '<circle cx="5" cy="12" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="19" cy="12" r="1.1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevD: '<path d="M6.5 9.5 12 15l5.5-5.5"/>',
  chevU: '<path d="M6.5 14.5 12 9l5.5 5.5"/>',
  chevL: '<path d="M14.5 6.5 9 12l5.5 5.5"/>',
  chevR: '<path d="M9.5 6.5 15 12l-5.5 5.5"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  external: '<path d="M9 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15M13.5 5H19v5.5M19 5l-8.5 8.5"/>',
  collapse: '<path d="M9.5 6 5 12l4.5 6M14.5 6 19 12l-4.5 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  warn: '<path d="M12 4.5 21 19H3z M12 10.5v3.5"/><circle cx="12" cy="16.6" r="0.4"/>',
  locate: '<path d="M4.5 11 20 4.5 13.5 20l-2.2-6.3z"/>',
  fullscreen: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  minus: '<path d="M5 12h14"/>',
  measure: '<path d="M3.5 15.5 15.5 3.5l5 5L8.5 20.5z M8 11l1.6 1.6M11 8l1.6 1.6M14 5l1.6 1.6"/>',
  sliders: '<path d="M5 4v5M5 13v7M12 4v9M12 17v3M19 4v3M19 11v9M3 11h4M10 15h4M17 9h4"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10.5h16M8.5 3.5v4M15.5 3.5v4"/>',
  camera: '<path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v10H4z"/><circle cx="12" cy="13.5" r="3"/>',
  attach: '<path d="M8 12.5 14.5 6a3.2 3.2 0 0 1 4.5 4.5l-8 8a5 5 0 0 1-7-7l7.5-7.5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
}

CB.icon = (name, cls) =>
  `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${CB.icons[name] || ''}</svg>`

CB.state = (() => {
  const read = () => new URLSearchParams(location.search)
  const get = (k, def) => read().get(k) ?? def
  function set(patch, opts = {}) {
    const p = read()
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === undefined || v === '') p.delete(k)
      else p.set(k, v)
    }
    const url = location.pathname + (p.toString() ? '?' + p.toString() : '')
    history[opts.push ? 'pushState' : 'replaceState'](null, '', url)
    document.dispatchEvent(new CustomEvent('cb:state', { detail: { patch } }))
  }
  return { get, set, read }
})()

CB.shell = (() => {
  const RAIL = [
    { group: [
      { id: 'counties', label: 'Counties', href: 'counties.html', icon: 'counties' },
      { id: 'stations', label: 'Stations', href: 'stations.html', icon: 'stations' },
    ] },
    { group: [
      { id: 'maps', label: 'Maps', href: 'maps.html', icon: 'maps' },
      { id: 'vegetation', label: 'Vegetation', href: 'vegetation.html', icon: 'vegetation' },
      { id: 'rainfall', label: 'Rainfall', href: 'rainfall.html', icon: 'rainfall' },
      { id: 'soil-moisture', label: 'Soil Moisture', href: 'soil-moisture.html', icon: 'soil' },
      { id: 'outlook', label: 'Outlook', href: 'outlook.html', icon: 'outlook' },
    ] },
    { group: [
      { id: 'reports', label: 'Field Reports', href: 'reports.html', icon: 'reports' },
      { id: 'triggers', label: 'Triggers', href: 'triggers.html', icon: 'triggers' },
      { id: 'scorecard', label: 'Scorecard', href: 'scorecard.html', icon: 'scorecard' },
    ] },
    { group: [
      { id: 'alerts', label: 'Alerts', href: 'alerts.html', icon: 'alerts' },
      { id: 'settings', label: 'Settings', href: 'settings.html', icon: 'settings' },
    ] },
  ]

  function renderRail(active) {
    const el = document.getElementById('rail')
    if (!el) return
    let html = `<button class="rail-btn rail-hamburger" id="rail-toggle" aria-label="Toggle navigation">${CB.icon('menu', 'lg')}<span class="rail-label">Cascade Bridge</span></button>`
    RAIL.forEach((g, i) => {
      if (i > 0) html += '<hr class="rail-sep">'
      html += '<div class="rail-group">'
      for (const item of g.group) {
        html += `<a class="rail-btn${item.id === active ? ' active' : ''}" href="${item.href}" title="${item.label}">${CB.icon(item.icon, 'lg')}<span class="rail-label">${item.label}</span></a>`
      }
      html += '</div>'
    })
    html += '<div class="rail-spacer"></div>'
    html += '<div class="rail-avatar"><span class="disc num">NK</span><span class="rail-label">N. Kiplagat</span></div>'
    el.innerHTML = html
    document.getElementById('rail-toggle').addEventListener('click', toggleRail)
  }

  function toggleRail() {
    document.body.classList.toggle('rail-open')
    try { localStorage.setItem('cb-rail', document.body.classList.contains('rail-open') ? '1' : '0') } catch {}
  }

  function isTyping(e) {
    const t = e.target
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
  }

  function init(opts) {
    try { if (localStorage.getItem('cb-rail') === '1') document.body.classList.add('rail-open') } catch {}
    renderRail(opts.page)
    document.addEventListener('keydown', e => {
      if (isTyping(e)) return
      if (e.key === '[') { e.preventDefault(); toggleRail(); return }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        document.dispatchEvent(new CustomEvent('cb:month-step', { detail: { dir: e.key === 'ArrowRight' ? 1 : -1 } }))
        return
      }
      if (['1', '2', '3', '4'].includes(e.key)) {
        const modes = ['single', 'multi', 'slider', 'overlay']
        document.dispatchEvent(new CustomEvent('cb:mode', { detail: { mode: modes[Number(e.key) - 1] } }))
      }
    })
  }

  return { init, toggleRail, RAIL }
})()

CB.toast = (() => {
  let stack
  return msg => {
    if (!stack) {
      stack = document.createElement('div')
      stack.className = 'toast-stack'
      document.body.appendChild(stack)
    }
    const t = document.createElement('div')
    t.className = 'toast'
    t.textContent = msg
    stack.appendChild(t)
    setTimeout(() => t.remove(), 2600)
  }
})()

CB.el = (html) => {
  const t = document.createElement('template')
  t.innerHTML = html.trim()
  return t.content.firstElementChild
}
CB.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
