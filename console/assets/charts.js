window.CB = window.CB || {}

CB.charts = (() => {
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
  const MONO = 'ui-monospace, SF Mono, Cascadia Mono, Menlo, Consolas, monospace'
  const live = new Set()

  window.addEventListener('resize', () => {
    for (const inst of [...live]) {
      if (!inst.getDom().isConnected) { inst.dispose(); live.delete(inst) }
      else inst.resize()
    }
  })

  function mount(el, height, option) {
    if (!el) return null
    el.style.height = height + 'px'
    if (!el.clientWidth) {
      requestAnimationFrame(() => mount(el, height, option))
      return null
    }
    const prev = echarts.getInstanceByDom(el)
    if (prev) { prev.dispose(); live.delete(prev) }
    const inst = echarts.init(el, null, { renderer: 'svg' })
    inst.setOption(option)
    live.add(inst)
    return inst
  }

  const axis = extra => ({
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: tok('--text-faint'), fontFamily: MONO, fontSize: 10 },
    splitLine: { show: false },
    ...extra,
  })
  const yGrid = () => ({ splitLine: { show: true, lineStyle: { color: tok('--hairline'), width: 0.6, opacity: 0.7 } } })
  const tooltip = fmt => ({
    trigger: 'axis',
    backgroundColor: tok('--surface-2'),
    borderColor: tok('--hairline'),
    textStyle: { color: tok('--text'), fontSize: 11, fontFamily: MONO },
    confine: true,
    ...(fmt ? { formatter: fmt } : {}),
  })

  function sparkline(values, opts = {}) {
    const w = opts.w || 76, h = opts.h || 28, pad = 2
    const vals = values.filter(v => v !== null && v !== undefined)
    if (!vals.length) return `<svg class="chart-svg" width="${w}" height="${h}"></svg>`
    const min = opts.min ?? Math.min(...vals)
    const max = opts.max ?? Math.max(...vals)
    const sxv = i => pad + (i / (values.length - 1)) * (w - 2 * pad)
    const syv = v => pad + (1 - ((v ?? min) - min) / ((max - min) || 1)) * (h - 2 * pad)
    const pts = values.map((v, i) => [sxv(i), syv(v)])
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')
    const color = opts.color || tok('--teal')
    return `<svg class="chart-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <path d="${line}L${(w - pad).toFixed(1)} ${h - pad}L${pad} ${h - pad}Z" fill="${color}" opacity="0.12"/>
      <path d="${line}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2" fill="${color}"/>
    </svg>`
  }

  function probSeries(el, { t, prob, p10, p90, threshold, forecastFrom }) {
    const teal = tok('--teal'), watch = tok('--watch')
    const band = t.map((_, i) => (p90[i] ?? 0) - (p10[i] ?? 0))
    const yMax = Math.max(0.5, ...p90.filter(v => v != null), ...prob.filter(v => v != null)) * 1.12
    mount(el, 190, {
      animation: false,
      grid: { left: 36, right: 14, top: 12, bottom: 24 },
      tooltip: tooltip(params => {
        const i = params[0].dataIndex
        return `<b>${CB.fmt.ym(t[i])}</b><br>P ${CB.fmt.prob(prob[i])}<br>p10–p90 ${CB.fmt.prob(p10[i])}–${CB.fmt.prob(p90[i])}`
      }),
      xAxis: { type: 'category', data: t, boundaryGap: false, ...axis({ axisLabel: { color: tok('--text-faint'), fontFamily: MONO, fontSize: 9.5, formatter: v => CB.fmt.monthShort(v) } }) },
      yAxis: { type: 'value', max: Number(yMax.toFixed(2)), ...axis(yGrid()) },
      series: [
        { type: 'line', data: p10, stack: 'band', lineStyle: { opacity: 0 }, symbol: 'none', silent: true },
        { type: 'line', data: band, stack: 'band', lineStyle: { opacity: 0 }, symbol: 'none', silent: true, areaStyle: { color: teal, opacity: 0.14 } },
        {
          type: 'line', data: prob, symbol: 'none', lineStyle: { color: teal, width: 1.9 },
          markLine: {
            silent: true, symbol: 'none',
            data: [
              ...(threshold != null ? [{ yAxis: threshold, lineStyle: { color: watch, type: 'dashed', width: 1 }, label: { show: true, position: 'insideEndTop', color: watch, fontFamily: MONO, fontSize: 9.5, formatter: 'threshold ' + threshold } }] : []),
              ...(forecastFrom != null && forecastFrom < t.length ? [{ xAxis: forecastFrom, lineStyle: { color: tok('--hairline'), type: 'dashed', width: 1 }, label: { show: false } }] : []),
            ],
          },
          markArea: forecastFrom != null && forecastFrom < t.length ? {
            silent: true,
            itemStyle: { color: teal, opacity: 0.045 },
            data: [[{ xAxis: forecastFrom }, { xAxis: 'max' }]],
          } : undefined,
        },
      ],
    })
  }

  function lineSeries(el, { t, series, yMin, yMax }) {
    const colors = [tok('--teal'), tok('--watch')]
    mount(el, 200, {
      grid: { left: 42, right: 14, top: 12, bottom: 24 },
      tooltip: tooltip(),
      legend: series.length > 1 ? { bottom: 0, show: false } : undefined,
      xAxis: { type: 'category', data: t, boundaryGap: false, ...axis({ axisLabel: { color: tok('--text-faint'), fontFamily: MONO, fontSize: 9.5, formatter: v => (v.length === 7 ? CB.fmt.monthShort(v) : v.slice(8, 10) + ' ' + CB.fmt.monthShort(v.slice(0, 7))) } }) },
      yAxis: { type: 'value', min: yMin, max: yMax, ...axis(yGrid()) },
      series: series.map((s, i) => ({
        name: s.label, type: 'line', data: s.values, symbol: 'none',
        lineStyle: { color: s.color || colors[i % 2], width: 1.8 },
        itemStyle: { color: s.color || colors[i % 2] },
        areaStyle: i === 0 ? { color: s.color || colors[0], opacity: 0.1 } : undefined,
      })),
    })
  }

  function histStrip(el, { bins, counts, layer, range, height = 44 }) {
    mount(el, height, {
      animation: false,
      grid: { left: 0, right: 0, top: 2, bottom: 0 },
      xAxis: { type: 'category', data: bins, show: false },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'bar', barCategoryGap: '8%', silent: true,
        data: counts.map((c, i) => ({
          value: c,
          itemStyle: { color: layer ? CB.ui.rampColor(layer, bins[i], range) : tok('--teal'), opacity: 0.85 },
        })),
      }],
    })
  }

  function reliabilityDiagram(el, { bins }) {
    const teal = tok('--teal')
    const maxC = Math.max(...bins.map(b => b.count))
    mount(el, 270, {
      grid: { left: 36, right: 14, top: 10, bottom: 28 },
      tooltip: {
        ...tooltip(), trigger: 'item',
        formatter: p => Array.isArray(p.value)
          ? `predicted ${p.value[0].toFixed(2)}<br>observed ${p.value[1].toFixed(3)}<br>n = ${p.value[2]}`
          : '',
      },
      xAxis: { type: 'value', min: 0, max: 1, name: 'predicted', nameLocation: 'middle', nameGap: 18, nameTextStyle: { color: tok('--text-faint'), fontSize: 9.5, fontFamily: MONO }, ...axis(yGrid()) },
      yAxis: { type: 'value', min: 0, max: 1, ...axis(yGrid()) },
      series: [
        {
          type: 'line', data: bins.map(b => [b.predicted, b.observed]), symbol: 'none',
          lineStyle: { color: teal, width: 1.6 }, silent: true,
          markLine: {
            silent: true, symbol: 'none',
            lineStyle: { color: tok('--text-faint'), type: 'dashed', width: 1 },
            data: [[{ coord: [0, 0] }, { coord: [1, 1] }]],
            label: { show: false },
          },
        },
        {
          type: 'scatter',
          data: bins.map(b => [b.predicted, b.observed, b.count]),
          symbolSize: v => 5 + (v[2] / maxC) * 11,
          itemStyle: { color: teal, opacity: 0.6, borderColor: teal, borderWidth: 1 },
        },
      ],
    })
  }

  function leadTime(el, { leads, climatologyAuc }) {
    const teal = tok('--teal')
    mount(el, 230, {
      grid: { left: 36, right: 16, top: 18, bottom: 24 },
      tooltip: tooltip(),
      xAxis: { type: 'category', data: leads.map(l => 'Lead ' + l.leadMonths + 'M'), boundaryGap: true, ...axis() },
      yAxis: { type: 'value', min: 0.45, max: 0.8, ...axis(yGrid()) },
      series: [{
        name: 'ROC AUC', type: 'line', data: leads.map(l => l.rocAuc),
        symbolSize: 7, lineStyle: { color: teal, width: 1.9 }, itemStyle: { color: teal },
        label: { show: true, position: 'top', color: teal, fontFamily: MONO, fontSize: 10, formatter: p => p.value.toFixed(2) },
        markLine: {
          silent: true, symbol: 'none',
          data: [{ yAxis: climatologyAuc, lineStyle: { color: tok('--text-faint'), type: 'dashed', width: 1.2 }, label: { position: 'insideEndTop', color: tok('--text-faint'), fontFamily: MONO, fontSize: 9.5, formatter: 'climatology ' + climatologyAuc.toFixed(1) } }],
        },
      }],
    })
  }

  function baselineBars(el, { baselines, valueKey = 'brierSkillScore', max = 0.12 }) {
    mount(el, baselines.length * 36 + 14, {
      grid: { left: 90, right: 44, top: 4, bottom: 4 },
      tooltip: { ...tooltip(), trigger: 'item' },
      xAxis: { type: 'value', max, show: false },
      yAxis: { type: 'category', inverse: true, data: baselines.map(b => b.label), ...axis({ axisLabel: { color: tok('--text-dim'), fontSize: 11 } }) },
      series: [{
        type: 'bar', barWidth: 9,
        data: baselines.map(b => ({
          value: b[valueKey],
          itemStyle: { color: b.id === 'full' ? tok('--teal') : tok('--nocov'), borderRadius: 4 },
        })),
        label: { show: true, position: 'right', color: tok('--text'), fontFamily: MONO, fontSize: 11, formatter: p => p.value.toFixed(2) },
      }],
    })
  }

  function ensembleFan(el, { members, mean, p10, p90, months, threshold }) {
    const teal = tok('--teal'), watch = tok('--watch')
    const band = months.map((_, i) => p90[i] - p10[i])
    const hi = Math.max(0.5, ...members.flat()) * 1.08
    mount(el, 230, {
      animation: false,
      grid: { left: 34, right: 14, top: 10, bottom: 22 },
      tooltip: tooltip(params => {
        const i = params[0].dataIndex
        return `<b>${CB.fmt.monthShort(months[i])}</b><br>mean ${CB.fmt.prob(mean[i])}<br>p10–p90 ${CB.fmt.prob(p10[i])}–${CB.fmt.prob(p90[i])}`
      }),
      xAxis: { type: 'category', data: months, boundaryGap: false, ...axis({ axisLabel: { color: tok('--text-faint'), fontFamily: MONO, fontSize: 9.5, formatter: v => CB.fmt.monthShort(v) } }) },
      yAxis: { type: 'value', max: Number(hi.toFixed(2)), ...axis(yGrid()) },
      series: [
        { type: 'line', data: p10, stack: 'band', lineStyle: { opacity: 0 }, symbol: 'none', silent: true, tooltip: { show: false } },
        { type: 'line', data: band, stack: 'band', lineStyle: { opacity: 0 }, symbol: 'none', silent: true, areaStyle: { color: teal, opacity: 0.1 }, tooltip: { show: false } },
        ...members.map(m => ({
          type: 'line', data: m, symbol: 'none', silent: true,
          lineStyle: { color: teal, width: 0.7, opacity: 0.15 }, tooltip: { show: false },
        })),
        {
          type: 'line', data: mean, symbol: 'none', lineStyle: { color: teal, width: 2.4 },
          markLine: threshold < hi ? {
            silent: true, symbol: 'none',
            data: [{ yAxis: threshold, lineStyle: { color: watch, type: 'dashed', width: 1 }, label: { show: false } }],
          } : undefined,
        },
      ],
    })
  }

  function terciles(el, { terciles: t }) {
    const colors = { below: tok('--watch'), near: tok('--nocov'), above: tok('--normal') }
    const keys = ['below', 'near', 'above']
    mount(el, 118, {
      grid: { left: 94, right: 44, top: 4, bottom: 4 },
      xAxis: { type: 'value', max: 1, show: false },
      yAxis: { type: 'category', inverse: true, data: ['Below normal', 'Near normal', 'Above normal'], ...axis({ axisLabel: { color: tok('--text-dim'), fontSize: 11 } }) },
      series: [{
        type: 'bar', barWidth: 9, silent: true,
        data: keys.map(k => ({ value: t[k], itemStyle: { color: colors[k], borderRadius: 4 } })),
        label: { show: true, position: 'right', color: tok('--text'), fontFamily: MONO, fontSize: 11, formatter: p => Math.round(p.value * 100) + '%' },
      }],
    })
  }

  return { sparkline, probSeries, lineSeries, histStrip, reliabilityDiagram, leadTime, baselineBars, ensembleFan, terciles }
})()
