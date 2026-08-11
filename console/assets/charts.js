window.CB = window.CB || {}

CB.charts = (() => {
  const T = () => getComputedStyle(document.documentElement)
  const tok = name => T().getPropertyValue(name).trim()

  function pathFrom(pts) {
    return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')
  }

  function scale(values, min, max, outMin, outMax) {
    const span = max - min || 1
    return v => outMin + ((v - min) / span) * (outMax - outMin)
  }

  function sparkline(values, opts = {}) {
    const w = opts.w || 76, h = opts.h || 28, pad = 2
    const vals = values.filter(v => v !== null && v !== undefined)
    if (!vals.length) return `<svg class="chart-svg" width="${w}" height="${h}"></svg>`
    const min = opts.min ?? Math.min(...vals)
    const max = opts.max ?? Math.max(...vals)
    const sx = scale([], 0, values.length - 1, pad, w - pad)
    const sxv = i => pad + (i / (values.length - 1)) * (w - 2 * pad)
    const sy = scale([], min, max, h - pad, pad)
    const pts = values.map((v, i) => [sxv(i), sy(v ?? min)])
    const line = pathFrom(pts)
    const color = opts.color || tok('--teal')
    const area = line + `L${(w - pad).toFixed(1)} ${h - pad}L${pad} ${h - pad}Z`
    return `<svg class="chart-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <path d="${area}" fill="${color}" opacity="0.12"/>
      <path d="${line}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2" fill="${color}"/>
    </svg>`
  }

  function probSeries(el, { t, prob, p10, p90, threshold, forecastFrom }) {
    const w = el.clientWidth || 480
    const h = 190
    const padL = 34, padR = 12, padT = 10, padB = 22
    const n = t.length
    const yMax = Math.max(0.5, ...p90.filter(v => v != null), ...prob.filter(v => v != null)) * 1.12
    const sx = i => padL + (i / (n - 1)) * (w - padL - padR)
    const sy = v => padT + (1 - v / yMax) * (h - padT - padB)

    const gridVals = []
    for (let g = 0; g <= yMax; g += yMax > 0.6 ? 0.2 : 0.1) gridVals.push(Number(g.toFixed(2)))

    let s = `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`
    for (const g of gridVals) {
      s += `<line x1="${padL}" x2="${w - padR}" y1="${sy(g)}" y2="${sy(g)}" stroke="${tok('--hairline')}" stroke-width="0.5"/>`
      s += `<text x="${padL - 6}" y="${sy(g) + 3}" text-anchor="end">${g.toFixed(1)}</text>`
    }
    if (forecastFrom != null && forecastFrom < n) {
      s += `<rect x="${sx(forecastFrom)}" y="${padT}" width="${sx(n - 1) - sx(forecastFrom)}" height="${h - padT - padB}" fill="${tok('--teal')}" opacity="0.045"/>`
      s += `<line x1="${sx(forecastFrom)}" x2="${sx(forecastFrom)}" y1="${padT}" y2="${h - padB}" stroke="${tok('--hairline')}" stroke-width="1" stroke-dasharray="2 3"/>`
    }
    const bandTop = t.map((_, i) => [sx(i), sy(p90[i])])
    const bandBot = t.map((_, i) => [sx(i), sy(p10[i])]).reverse()
    s += `<path d="${pathFrom(bandTop)}L${bandBot.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')}Z" fill="${tok('--teal')}" opacity="0.14"/>`
    if (threshold != null && threshold < yMax) {
      s += `<line x1="${padL}" x2="${w - padR}" y1="${sy(threshold)}" y2="${sy(threshold)}" stroke="${tok('--watch')}" stroke-width="1" stroke-dasharray="5 4"/>`
      s += `<text x="${w - padR}" y="${sy(threshold) - 4}" text-anchor="end" fill="${tok('--watch')}">threshold ${threshold}</text>`
    }
    s += `<path d="${pathFrom(t.map((_, i) => [sx(i), sy(prob[i])]))}" fill="none" stroke="${tok('--teal')}" stroke-width="1.8" stroke-linejoin="round"/>`
    const last = n - 1
    s += `<circle cx="${sx(last)}" cy="${sy(prob[last])}" r="3" fill="${tok('--teal')}"/>`
    const step = Math.max(1, Math.round(n / 8))
    for (let i = 0; i < n; i += step) {
      s += `<text x="${sx(i)}" y="${h - 6}" text-anchor="middle">${CB.fmt.monthShort(t[i])}${t[i].endsWith('-01') ? ' ' + t[i].slice(2, 4) : ''}</text>`
    }
    s += '</svg>'
    el.innerHTML = s
  }

  return { sparkline, probSeries }
})()

CB.charts.lineSeries = (el, { t, series, yMin, yMax, xLabelEvery }) => {
  const w = el.clientWidth || 480, h = 200
  const padL = 38, padR = 12, padT = 12, padB = 22
  const all = series.flatMap(s => s.values).filter(v => v !== null && v !== undefined)
  const lo = yMin ?? Math.min(...all), hi = yMax ?? Math.max(...all)
  const span = (hi - lo) || 1
  const n = t.length
  const sx = i => padL + (i / (n - 1)) * (w - padL - padR)
  const sy = v => padT + (1 - (v - lo) / span) * (h - padT - padB)
  const css = getComputedStyle(document.documentElement)
  let s = `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`
  for (let g = 0; g <= 4; g++) {
    const v = lo + (span * g) / 4
    s += `<line x1="${padL}" x2="${w - padR}" y1="${sy(v)}" y2="${sy(v)}" stroke="${css.getPropertyValue('--hairline').trim()}" stroke-width="0.5"/>
      <text x="${padL - 6}" y="${sy(v) + 3}" text-anchor="end">${Math.abs(span) < 8 ? v.toFixed(1) : Math.round(v)}</text>`
  }
  series.forEach((ser, si) => {
    const color = ser.color || css.getPropertyValue(si === 0 ? '--teal' : '--watch').trim()
    const pts = ser.values.map((v, i) => [sx(i), sy(v ?? lo)])
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')
    if (si === 0) s += `<path d="${line}L${(w - padR)} ${h - padB}L${padL} ${h - padB}Z" fill="${color}" opacity="0.1"/>`
    s += `<path d="${line}" fill="none" stroke="${color}" stroke-width="1.7" stroke-linejoin="round"/>`
  })
  const step = xLabelEvery || Math.max(1, Math.round(n / 7))
  for (let i = 0; i < n; i += step) {
    const d = t[i]
    const label = d.length === 7 ? CB.fmt.monthShort(d) : d.slice(8, 10) + ' ' + CB.fmt.monthShort(d.slice(0, 7))
    s += `<text x="${sx(i)}" y="${h - 6}" text-anchor="middle">${label}</text>`
  }
  s += '</svg>'
  el.innerHTML = s
}

CB.charts.histStrip = (el, { bins, counts, layer, range, height = 44 }) => {
  const w = el.clientWidth || 300, h = height
  const maxC = Math.max(...counts, 1)
  const n = counts.length
  const bw = w / n
  let s = `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none">`
  for (let i = 0; i < n; i++) {
    const bh = (counts[i] / maxC) * (h - 4)
    const color = layer ? CB.ui.rampColor(layer, bins[i], range) : 'var(--teal)'
    s += `<rect x="${(i * bw + 0.5).toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${Math.max(1, bw - 1).toFixed(1)}" height="${bh.toFixed(1)}" fill="${color}" opacity="0.85"/>`
  }
  s += '</svg>'
  el.innerHTML = s
}

CB.charts.reliabilityDiagram = (el, { bins }) => {
  const w = el.clientWidth || 360, h = Math.min(300, w * 0.85)
  const padL = 36, padR = 10, padT = 10, padB = 30
  const sx = v => padL + v * (w - padL - padR)
  const sy = v => padT + (1 - v) * (h - padT - padB)
  const css = getComputedStyle(document.documentElement)
  const teal = css.getPropertyValue('--teal').trim()
  let s = `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`
  for (let g = 0; g <= 5; g++) {
    const v = g / 5
    s += `<line x1="${sx(0)}" x2="${sx(1)}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--hairline)" stroke-width="0.5"/>
      <text x="${padL - 5}" y="${sy(v) + 3}" text-anchor="end">${v.toFixed(1)}</text>
      <text x="${sx(v)}" y="${h - 8}" text-anchor="middle">${v.toFixed(1)}</text>`
  }
  s += `<line x1="${sx(0)}" x2="${sx(1)}" y1="${sy(0)}" y2="${sy(1)}" stroke="var(--text-faint)" stroke-width="1" stroke-dasharray="4 4"/>`
  const maxC = Math.max(...bins.map(b => b.count))
  const line = bins.map((b, i) => (i ? 'L' : 'M') + sx(b.predicted).toFixed(1) + ' ' + sy(b.observed).toFixed(1)).join('')
  s += `<path d="${line}" fill="none" stroke="${teal}" stroke-width="1.6"/>`
  for (const b of bins) {
    const r = 2.5 + (b.count / maxC) * 5.5
    s += `<circle cx="${sx(b.predicted)}" cy="${sy(b.observed)}" r="${r.toFixed(1)}" fill="${teal}" fill-opacity="0.55" stroke="${teal}"/>`
  }
  s += `<text x="${sx(0.5)}" y="${h - 20}" text-anchor="middle" opacity="0">.</text></svg>`
  el.innerHTML = s
}

CB.charts.leadTime = (el, { leads, climatologyAuc }) => {
  const w = el.clientWidth || 360, h = 220
  const padL = 36, padR = 14, padT = 12, padB = 28
  const lo = 0.45, hi = 0.8
  const sx = i => padL + (i / (leads.length - 1)) * (w - padL - padR)
  const sy = v => padT + (1 - (v - lo) / (hi - lo)) * (h - padT - padB)
  let s = `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`
  for (const g of [0.5, 0.6, 0.7, 0.8]) {
    s += `<line x1="${padL}" x2="${w - padR}" y1="${sy(g)}" y2="${sy(g)}" stroke="var(--hairline)" stroke-width="0.5"/>
      <text x="${padL - 5}" y="${sy(g) + 3}" text-anchor="end">${g.toFixed(1)}</text>`
  }
  s += `<line x1="${padL}" x2="${w - padR}" y1="${sy(climatologyAuc)}" y2="${sy(climatologyAuc)}" stroke="var(--text-faint)" stroke-width="1.2" stroke-dasharray="5 4"/>
    <text x="${w - padR}" y="${sy(climatologyAuc) - 5}" text-anchor="end">climatology ${climatologyAuc.toFixed(1)}</text>`
  const line = leads.map((l, i) => (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(l.rocAuc).toFixed(1)).join('')
  s += `<path d="${line}" fill="none" stroke="var(--teal)" stroke-width="1.8"/>`
  leads.forEach((l, i) => {
    s += `<circle cx="${sx(i)}" cy="${sy(l.rocAuc)}" r="3.5" fill="var(--teal)"/>
      <text x="${sx(i)}" y="${sy(l.rocAuc) - 9}" text-anchor="middle" fill="var(--teal)">${l.rocAuc.toFixed(2)}</text>
      <text x="${sx(i)}" y="${h - 8}" text-anchor="middle">Lead ${l.leadMonths}M</text>`
  })
  s += '</svg>'
  el.innerHTML = s
}

CB.charts.baselineBars = (el, { baselines, valueKey = 'brierSkillScore', max = 0.12 }) => {
  const rows = baselines.map(b => {
    const pct = Math.max(1.2, (b[valueKey] / max) * 100)
    const isFull = b.id === 'full'
    return `<div class="baseline-row">
      <span class="bl-label">${CB.esc(b.label)}</span>
      <span class="mb-track"><span class="mb-fill${isFull ? '' : ' mb-dim'}" style="width:${pct.toFixed(1)}%"></span></span>
      <span class="mb-value num">${b[valueKey].toFixed(2)}</span>
    </div>`
  }).join('')
  el.innerHTML = rows
}

CB.charts.ensembleFan = (el, { members, mean, p10, p90, months, threshold }) => {
  const w = el.clientWidth || 420, h = 230
  const padL = 36, padR = 14, padT = 12, padB = 26
  const hi = Math.max(0.5, ...members.flat()) * 1.08
  const n = months.length
  const sx = i => padL + (i / (n - 1)) * (w - padL - padR)
  const sy = v => padT + (1 - v / hi) * (h - padT - padB)
  let s = `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`
  for (let g = 0; g <= 4; g++) {
    const v = (hi * g) / 4
    s += `<line x1="${padL}" x2="${w - padR}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--hairline)" stroke-width="0.5"/>
      <text x="${padL - 5}" y="${sy(v) + 3}" text-anchor="end">${v.toFixed(1)}</text>`
  }
  const bandTop = months.map((_, i) => sx(i).toFixed(1) + ' ' + sy(p90[i]).toFixed(1)).join('L')
  const bandBot = months.map((_, i) => sx(i).toFixed(1) + ' ' + sy(p10[i]).toFixed(1)).reverse().join('L')
  s += `<path d="M${bandTop}L${bandBot}Z" fill="var(--teal)" opacity="0.1"/>`
  for (const m of members) {
    const line = m.map((v, i) => (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(v).toFixed(1)).join('')
    s += `<path d="${line}" fill="none" stroke="var(--teal)" stroke-width="0.7" opacity="0.16"/>`
  }
  if (threshold < hi) {
    s += `<line x1="${padL}" x2="${w - padR}" y1="${sy(threshold)}" y2="${sy(threshold)}" stroke="var(--watch)" stroke-width="1" stroke-dasharray="5 4"/>`
  }
  const meanLine = mean.map((v, i) => (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(v).toFixed(1)).join('')
  s += `<path d="${meanLine}" fill="none" stroke="var(--teal)" stroke-width="2.4"/>`
  months.forEach((m, i) => {
    s += `<text x="${sx(i)}" y="${h - 6}" text-anchor="middle">${CB.fmt.monthShort(m)}</text>`
  })
  s += '</svg>'
  el.innerHTML = s
}

CB.charts.terciles = (el, { terciles }) => {
  const labels = [['below', 'Below'], ['near', 'Near'], ['above', 'Above']]
  el.innerHTML = labels.map(([k, label]) => `<div class="baseline-row">
    <span class="bl-label">${label} normal</span>
    <span class="mb-track"><span class="mb-fill${k === 'below' ? ' mb-warn' : k === 'near' ? ' mb-dim' : ''}" style="width:${(terciles[k] * 100).toFixed(0)}%"></span></span>
    <span class="mb-value num">${(terciles[k] * 100).toFixed(0)}%</span>
  </div>`).join('')
}
