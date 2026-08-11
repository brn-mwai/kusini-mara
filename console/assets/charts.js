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
