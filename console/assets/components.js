window.CB = window.CB || {}

CB.ui = (() => {
  const SIGNAL_LABEL = { drought: 'Drought', watch: 'Watch', normal: 'Normal', no_coverage: 'No coverage' }

  function signalPill(signal) {
    return `<span class="pill pill-${signal}"><span class="dot"></span>${SIGNAL_LABEL[signal] || signal}</span>`
  }

  function deltaArrow(v, { digits = 2, suffix = '' } = {}) {
    if (v === null || v === undefined) return `<span class="delta flat num">${CB.fmt.DASH}</span>`
    const dir = v > 0.0005 ? 'up' : v < -0.0005 ? 'down' : 'flat'
    const icon = dir === 'up' ? CB.icon('up') : dir === 'down' ? CB.icon('down') : ''
    return `<span class="delta ${dir} num">${icon}${CB.fmt.delta(v, digits)}${suffix}</span>`
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

  function metricRow({ label, value, unit, delta, deltaDigits, spark, sparkColor, sparkDomain }) {
    const sparkHtml = spark
      ? CB.charts.sparkline(spark, { color: sparkColor, min: sparkDomain?.[0], max: sparkDomain?.[1] })
      : ''
    return `<div class="metric-row">
      <span class="spark">${sparkHtml}</span>
      <span class="m-label">${CB.esc(label)}</span>
      ${delta !== undefined ? deltaArrow(delta, { digits: deltaDigits ?? 2 }) : ''}
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
