window.CB = window.CB || {}

CB.ui = (() => {
  const SIGNAL_LABEL = { drought: 'Drought', watch: 'Watch', normal: 'Normal', no_coverage: 'No coverage' }

  function signalPill(signal) {
    return `<span class="pill pill-${signal}"><span class="dot"></span>${SIGNAL_LABEL[signal] || signal}</span>`
  }

  function deltaArrow(v, { digits = 2, suffix = '', inv = false } = {}) {
    if (v === null || v === undefined) return `<span class="delta flat num">${CB.fmt.DASH}</span>`
    const dir = v > 0.0005 ? 'up' : v < -0.0005 ? 'down' : 'flat'
    const icon = dir === 'up' ? CB.icon('up') : dir === 'down' ? CB.icon('down') : ''
    return `<span class="delta ${dir}${inv ? ' inv' : ''} num">${icon}${CB.fmt.delta(v, digits)}${suffix}</span>`
  }

  let geoIndex = null
  function countyPath(countyId, size) {
    if (!geoIndex) {
      geoIndex = {}
      for (const f of CB_DATA.geo.features) geoIndex[f.properties.countyId] = f.geometry
    }
    const geom = geoIndex[countyId]
    if (!geom) return ''
    let minX = 180, minY = 90, maxX = -180, maxY = -90
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
    for (const poly of polys) for (const [x, y] of poly[0]) {
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
    }
    const span = Math.max(maxX - minX, maxY - minY)
    const pad = 3
    const s = (size - 2 * pad) / span
    const ox = pad + ((size - 2 * pad) - (maxX - minX) * s) / 2
    const oy = pad + ((size - 2 * pad) - (maxY - minY) * s) / 2
    let d = ''
    for (const poly of polys) {
      const ring = poly[0]
      const step = Math.max(1, Math.floor(ring.length / 60))
      const pts = []
      for (let i = 0; i < ring.length; i += step) {
        const [x, y] = ring[i]
        pts.push([(ox + (x - minX) * s).toFixed(1), (oy + (maxY - y) * s).toFixed(1)])
      }
      d += 'M' + pts.map(p => p.join(' ')).join('L') + 'Z'
    }
    return d
  }

  function countyThumb(countyId, fill, size = 44) {
    const d = countyPath(countyId, size)
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <path d="${d}" fill="${fill}" fill-opacity="0.55" stroke="${fill}" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`
  }

  function metricRow({ label, value, unit, delta, deltaDigits, deltaInv, spark, sparkColor, sparkDomain }) {
    const sparkHtml = spark
      ? CB.charts.sparkline(spark, { color: sparkColor, min: sparkDomain?.[0], max: sparkDomain?.[1] })
      : ''
    return `<div class="metric-row">
      <span class="spark">${sparkHtml}</span>
      <span class="m-label">${CB.esc(label)}</span>
      ${delta !== undefined ? deltaArrow(delta, { digits: deltaDigits ?? 2, inv: deltaInv }) : ''}
      <span class="m-value num">${value}${unit ? `<span class="unit">${CB.esc(unit)}</span>` : ''}</span>
    </div>`
  }

  function emptyState({ icon = 'search', title, body }) {
    return `<div class="empty-state">${CB.icon(icon)}<div class="e-title">${CB.esc(title)}</div><div class="e-body">${CB.esc(body)}</div></div>`
  }

  function skelRows(n, h = 52) {
    let s = ''
    for (let i = 0; i < n; i++) {
      s += `<div style="display:flex;gap:12px;padding:10px 14px;align-items:center">
        <div class="skel" style="width:${h}px;height:${h}px;flex:none"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div class="skel" style="width:60%;height:11px"></div>
          <div class="skel" style="width:40%;height:9px"></div>
        </div>
        <div class="skel" style="width:48px;height:12px"></div>
      </div>`
    }
    return s
  }

  function skelBlock(h) {
    return `<div class="skel" style="height:${h}px"></div>`
  }

  function colorForValue(layer, v) {
    if (v === null || v === undefined) return getComputedStyle(document.documentElement).getPropertyValue('--nocov').trim()
    const { classBreaks, colourRamp } = layer
    let i = 0
    while (i < classBreaks.length && v >= classBreaks[i]) i++
    return colourRamp[Math.min(i, colourRamp.length - 1)]
  }

  return { signalPill, deltaArrow, countyThumb, countyPath, metricRow, emptyState, skelRows, skelBlock, colorForValue, SIGNAL_LABEL }
})()

CB.ui.rampColor = (layer, v, range) => {
  const ramp = layer.colourRamp
  const [lo, hi] = range || layer.domain
  if (v === null || v === undefined) return getComputedStyle(document.documentElement).getPropertyValue('--nocov').trim()
  let t = (v - lo) / ((hi - lo) || 1)
  t = Math.max(0, Math.min(1, t))
  const pos = t * (ramp.length - 1)
  const i = Math.min(ramp.length - 2, Math.floor(pos))
  const f = pos - i
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
  const a = hex(ramp[i]), b = hex(ramp[i + 1])
  const mix = a.map((x, k) => Math.round(x + (b[k] - x) * f))
  return `rgb(${mix[0]},${mix[1]},${mix[2]})`
}

CB.ui.viewModeToggle = ({ value, onChange, disabled = [] }) => {
  const MODES = [
    ['single', 'Single', 'square'],
    ['multi', 'Multi', 'grid'],
    ['slider', 'Slider', 'split'],
    ['overlay', 'Overlay', 'soil'],
  ]
  const el = CB.el(`<div class="segmented" role="tablist">${MODES.map(([id, label, icon]) =>
    `<button data-mode="${id}" class="${id === value ? 'active' : ''}${disabled.includes(id) ? ' disabled' : ''}" title="${label}${disabled.includes(id) ? ' (needs exactly 2 layers)' : ''}">
      ${CB.icon(icon, 'sm')}${label}</button>`).join('')}</div>`)
  el.addEventListener('click', e => {
    const b = e.target.closest('button[data-mode]')
    if (!b) return
    if (b.classList.contains('disabled')) { CB.toast('Slider needs exactly 2 active layers'); return }
    onChange(b.dataset.mode)
  })
  return el
}

CB.ui.timeScrubber = (host, { periods, period, months, selected, onPeriodChange, onSelect }) => {
  const render = () => {
    host.innerHTML = ''
    const pt = CB.el(`<div class="period-tabs">${periods.map(p =>
      `<button data-p="${p}" class="${p === period ? 'active' : ''}">${p}</button>`).join('')}</div>`)
    pt.addEventListener('click', e => {
      const b = e.target.closest('button[data-p]')
      if (b) { period = b.dataset.p; onPeriodChange(b.dataset.p); render() }
    })
    const idx = months.findIndex(m => m.value === selected)
    const mp = CB.el(`<div class="month-pills">
      <button class="btn btn-icon btn-ghost" data-step="-1" title="Previous month">${CB.icon('chevL')}</button>
      ${months.map(m => `<button class="pill-btn num${m.value === selected ? ' active' : ''}${m.hasData === false ? ' nodata' : ''}" data-m="${m.value}">${m.label}</button>`).join('')}
      <button class="btn btn-icon btn-ghost" data-step="1" title="Next month">${CB.icon('chevR')}</button>
    </div>`)
    mp.addEventListener('click', e => {
      const s = e.target.closest('[data-step]')
      if (s) {
        const next = months[Math.max(0, Math.min(months.length - 1, idx + Number(s.dataset.step)))]
        if (next && next.value !== selected) { selected = next.value; onSelect(next.value); render() }
        return
      }
      const b = e.target.closest('[data-m]')
      if (b && b.dataset.m !== selected) { selected = b.dataset.m; onSelect(b.dataset.m); render() }
    })
    host.appendChild(pt)
    host.appendChild(mp)
  }
  render()
  return { set: (p, m) => { if (p) period = p; if (m) selected = m; render() } }
}

CB.ui.layerPanel = (opts) => {
  const { layer, hist, align = 'left', monthLabel = '', scopeLabel = 'All counties',
    onRangeChange = () => {}, onSwapLayer = () => {}, onClose = () => {} } = opts
  let range = opts.range ? [...opts.range] : [...layer.domain]
  let collapsed = !!opts.collapsed
  const [d0, d1] = layer.domain
  const W = 200, plotH = 190, barW = 108, axisX = barW + 34, padT = 8

  const el = document.createElement('div')
  el.className = `layer-panel ${align === 'right' ? 'lp-right' : 'lp-left'}`

  const yOf = v => padT + (1 - (v - d0) / (d1 - d0)) * plotH
  const vOf = y => d0 + (1 - (y - padT) / plotH) * (d1 - d0)
  const fmtTick = v => (Math.abs(d1 - d0) <= 2 ? v.toFixed(2) : Math.abs(d1 - d0) <= 10 ? v.toFixed(1) : String(Math.round(v)))

  let raf = null
  const paint = () => {
    if (collapsed) {
      el.innerHTML = `<div class="lp-head">
        <button class="lp-ic" data-a="expand" title="Expand">${CB.icon(align === 'right' ? 'chevL' : 'chevR', 'sm')}</button>
        <span class="lp-title">${CB.esc(layer.label)}</span>
      </div>`
      return
    }
    const maxC = Math.max(...hist.counts, 1)
    const n = hist.counts.length
    const bh = plotH / n
    let bars = ''
    for (let i = 0; i < n; i++) {
      const v = hist.bins[i]
      const inRange = v >= range[0] && v <= range[1]
      const bw = (hist.counts[i] / maxC) * barW
      const y = yOf(v) - bh / 2
      const color = inRange ? CB.ui.rampColor(layer, v, range) : 'var(--nocov)'
      bars += `<rect x="0" y="${y.toFixed(1)}" width="${Math.max(1.5, bw).toFixed(1)}" height="${Math.max(1, bh - 1.2).toFixed(1)}" fill="${color}" opacity="${inRange ? 0.9 : 0.35}"/>`
    }
    let ticks = ''
    for (const b of layer.classBreaks) {
      const y = yOf(b)
      ticks += `<line x1="0" x2="${barW + 6}" y1="${y}" y2="${y}" stroke="var(--hairline)" stroke-width="1" stroke-dasharray="2 2"/>
        <text x="${barW + 10}" y="${y + 3}" class="lp-tick">${fmtTick(b)}</text>`
    }
    for (const d of [d0, d1]) {
      ticks += `<text x="${barW + 10}" y="${yOf(d) + 3}" class="lp-tick lp-tick-dom">${fmtTick(d)}</text>`
    }
    const handle = (v, which) => {
      const y = yOf(v)
      return `<line x1="0" x2="${axisX - 8}" y1="${y}" y2="${y}" stroke="var(--text)" stroke-width="1"/>
        <circle class="lp-handle" data-h="${which}" cx="${axisX - 4}" cy="${y}" r="7" fill="var(--surface-2)" stroke="var(--text)" stroke-width="1.5"/>`
    }
    el.innerHTML = `
      <div class="lp-head">
        <button class="lp-ic" data-a="collapse" title="Collapse">${CB.icon('collapse', 'sm')}</button>
        <button class="lp-ic" data-a="open" title="Open in new">${CB.icon('external', 'sm')}</button>
        <button class="lp-ic" data-a="cal" title="Valid month">${CB.icon('calendar', 'sm')}</button>
        <span class="grow"></span>
        <button class="lp-ic" data-a="close" title="Remove layer">${CB.icon('x', 'sm')}</button>
      </div>
      <label class="lp-swap">
        <select data-a="swap">${CB_DATA.layers.filter(l => l.group !== 'context').map(l =>
          `<option value="${l.id}"${l.id === layer.id ? ' selected' : ''}>${l.label}</option>`).join('')}</select>
        ${CB.icon('chevD', 'sm')}
      </label>
      <div class="lp-sub num">${CB.esc(monthLabel)}${layer.unit ? ' · ' + CB.esc(layer.unit) : ''}</div>
      <svg class="lp-plot" viewBox="0 0 ${W} ${plotH + 2 * padT}" width="${W}" height="${plotH + 2 * padT}">
        ${bars}${ticks}${handle(range[1], 'max')}${handle(range[0], 'min')}
      </svg>
      <div class="lp-foot">
        <span class="chip lp-chip">${CB.esc(scopeLabel)}</span>
        <div class="lp-stats">
          <div><span class="num">${hist.stats.primary.value}</span><label>${CB.esc(hist.stats.primary.label)}</label></div>
          <div><span class="num">${hist.stats.secondary.value}</span><label>${CB.esc(hist.stats.secondary.label)}</label></div>
        </div>
      </div>`
    el.querySelectorAll('.lp-handle').forEach(h => {
      h.addEventListener('pointerdown', ev => {
        ev.preventDefault()
        const which = h.dataset.h
        /* paint() replaces the svg mid-drag, so listeners must live on window
           and re-measure the current svg on every move */
        const move = mv => {
          const svg = el.querySelector('.lp-plot')
          if (!svg) return
          const rect = svg.getBoundingClientRect()
          const y = ((mv.clientY - rect.top) / rect.height) * (plotH + 2 * padT)
          let v = Math.max(d0, Math.min(d1, vOf(y)))
          if (which === 'min') range[0] = Math.min(v, range[1] - (d1 - d0) * 0.02)
          else range[1] = Math.max(v, range[0] + (d1 - d0) * 0.02)
          paint()
          if (raf) clearTimeout(raf)
          raf = setTimeout(() => onRangeChange([...range]), 120)
        }
        const up = () => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
          onRangeChange([...range])
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      })
    })
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-a]')
    if (!b) return
    const a = b.dataset.a
    if (a === 'collapse') { collapsed = true; paint() }
    else if (a === 'expand') { collapsed = false; paint() }
    else if (a === 'close') onClose()
    else if (a === 'open' || a === 'cal') CB.toast('Not wired in this prototype')
  })
  el.addEventListener('change', e => {
    if (e.target.matches('select[data-a="swap"]')) onSwapLayer(e.target.value)
  })
  paint()
  el.getRange = () => [...range]
  return el
}

CB.ui.metricBar = ({ label, value, max = 1, display }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return `<div class="metric-bar">
    <span class="mb-label">${CB.esc(label)}</span>
    <span class="mb-track"><span class="mb-fill" style="width:${pct.toFixed(1)}%"></span></span>
    <span class="mb-value num">${display ?? value}</span>
  </div>`
}

CB.ui.progress = ({ label, pct, icon }) => `<div class="progress-row">
  <span class="pr-label">${icon ? CB.icon(icon, 'sm') : ''}${CB.esc(label)}</span>
  <span class="mb-track"><span class="mb-fill" style="width:${pct === null ? 0 : pct}%"></span></span>
  <span class="mb-value num">${pct === null ? CB.fmt.DASH : pct + '%'}</span>
</div>`

CB.ui.photoTile = (photo, { del } = {}) => `<figure class="photo-tile" data-photo="${photo.id}">
  ${photo.previewUrl
    ? `<img src="${photo.previewUrl}" alt="">`
    : `<div class="photo-ph">${CB.icon('camera')}<span class="num">${photo.width}×${photo.height}</span></div>`}
  <figcaption class="num">${CB.esc(photo.id)}${photo.previewUrl ? '' : '.jpg'}</figcaption>
  ${del ? `<button class="photo-del" data-del="${photo.id}" title="Remove">${CB.icon('x', 'sm')}</button>` : ''}
</figure>`

CB.ui.avatarDisc = name => {
  const initials = name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return `<span class="disc-sm">${initials}</span>`
}

CB.ui.dialog = ({ title, body, wide }) => {
  const wrap = CB.el(`<div class="dialog-backdrop">
    <div class="dialog${wide ? ' dialog-wide' : ''}" role="dialog" aria-label="${CB.esc(title)}">
      <div class="dialog-head"><span>${CB.esc(title)}</span><span class="grow"></span>
        <button class="lp-ic" data-close>${CB.icon('x')}</button></div>
      <div class="dialog-body"></div>
    </div></div>`)
  wrap.querySelector('.dialog-body').append(body)
  const close = () => wrap.remove()
  wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) close() })
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc) }
  })
  document.body.appendChild(wrap)
  return { close, el: wrap }
}
