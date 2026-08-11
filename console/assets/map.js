window.CB = window.CB || {}

CB.map = (() => {
  const KENYA_ASAL_BOUNDS = [[33.9, -3.1], [42.0, 5.6]]

  function baseStyle() {
    const css = getComputedStyle(document.documentElement)
    const tok = n => css.getPropertyValue(n).trim()
    return {
      version: 8,
      sources: {
        counties: { type: 'geojson', data: CB_DATA.geo, promoteId: 'countyId' },
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': tok('--ground') } },
        {
          id: 'county-fill', type: 'fill', source: 'counties',
          paint: {
            'fill-color': ['case',
              ['==', ['feature-state', 'coverage'], false], tok('--nocov'),
              ['coalesce', ['feature-state', 'fill'], tok('--nocov')],
            ],
            'fill-opacity': ['case',
              ['boolean', ['feature-state', 'selected'], false], 0.88,
              ['boolean', ['feature-state', 'hover'], false], 0.8,
              ['boolean', ['feature-state', 'dimmed'], false], 0.32,
              0.62,
            ],
          },
        },
        {
          id: 'county-line', type: 'line', source: 'counties',
          paint: {
            'line-color': ['case',
              ['boolean', ['feature-state', 'selected'], false], tok('--teal'),
              ['boolean', ['feature-state', 'hover'], false], tok('--text-dim'),
              tok('--hairline'),
            ],
            'line-width': ['case',
              ['boolean', ['feature-state', 'selected'], false], 2,
              ['boolean', ['feature-state', 'hover'], false], 1.4,
              0.8,
            ],
          },
        },
      ],
    }
  }

  function create(container, opts = {}) {
    const map = new maplibregl.Map({
      container,
      style: baseStyle(),
      bounds: opts.bounds || KENYA_ASAL_BOUNDS,
      fitBoundsOptions: { padding: opts.padding ?? 24 },
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      ...opts.mapOptions,
    })
    map.touchZoomRotate.disableRotation()
    return map
  }

  function paintValues(map, valueByCounty, layerDef) {
    for (const c of CB_DATA.counties) {
      const v = valueByCounty[c.id]
      map.setFeatureState({ source: 'counties', id: c.id }, {
        coverage: c.hasModelCoverage,
        fill: c.hasModelCoverage ? CB.ui.colorForValue(layerDef, v) : null,
        value: v ?? null,
      })
    }
  }

  function setSelected(map, countyId, { dimOthers = true } = {}) {
    for (const c of CB_DATA.counties) {
      map.setFeatureState({ source: 'counties', id: c.id }, {
        selected: c.id === countyId,
        dimmed: dimOthers && countyId ? c.id !== countyId : false,
      })
    }
  }

  function setHover(map, countyId) {
    for (const c of CB_DATA.counties) {
      map.setFeatureState({ source: 'counties', id: c.id }, { hover: c.id === countyId })
    }
  }

  function onCountyHover(map, cb) {
    map.on('mousemove', 'county-fill', e => {
      const id = e.features?.[0]?.id
      map.getCanvas().style.cursor = id ? 'pointer' : ''
      cb(id || null)
    })
    map.on('mouseleave', 'county-fill', () => {
      map.getCanvas().style.cursor = ''
      cb(null)
    })
  }

  function onCountyClick(map, cb) {
    map.on('click', 'county-fill', e => {
      const id = e.features?.[0]?.id
      if (id) cb(id)
    })
  }

  function controls(wrapEl, map, extra = []) {
    const el = CB.el(`<div class="map-controls">
      <div class="mc-group">
        <button data-mc="locate" title="Locate">${CB.icon('locate')}</button>
        <button data-mc="fullscreen" title="Fullscreen">${CB.icon('fullscreen')}</button>
      </div>
      <div class="mc-group">
        <button data-mc="zoom-in" title="Zoom in">${CB.icon('plus')}</button>
        <button data-mc="zoom-out" title="Zoom out">${CB.icon('minus')}</button>
      </div>
      <div class="mc-group">
        <button data-mc="measure" title="Measure">${CB.icon('measure')}</button>
        <button data-mc="settings" title="Layer settings">${CB.icon('sliders')}</button>
      </div>
    </div>`)
    el.addEventListener('click', e => {
      const b = e.target.closest('button')
      if (!b) return
      const a = b.dataset.mc
      if (a === 'zoom-in') map.zoomIn()
      else if (a === 'zoom-out') map.zoomOut()
      else if (a === 'fullscreen') {
        const host = wrapEl.closest('.band-4') || wrapEl
        if (document.fullscreenElement) document.exitFullscreen()
        else host.requestFullscreen?.()
      } else if (a === 'locate') map.fitBounds(KENYA_ASAL_BOUNDS, { padding: 24 })
      else CB.toast('Not wired in this prototype')
    })
    wrapEl.appendChild(el)
    return el
  }

  return { create, paintValues, setSelected, setHover, onCountyHover, onCountyClick, controls, KENYA_ASAL_BOUNDS }
})()

CB.map.paintRamp = (map, valueByCounty, layerDef, range) => {
  for (const c of CB_DATA.counties) {
    const raw = valueByCounty[c.id]
    const v = raw && typeof raw === 'object' ? raw.value : raw
    const noData = v === null || v === undefined
    map.setFeatureState({ source: 'counties', id: c.id }, {
      coverage: !noData,
      fill: noData ? null : CB.ui.rampColor(layerDef, v, range),
      value: noData ? null : v,
    })
  }
}

CB.map.sync = maps => {
  let syncing = false
  const mirror = src => () => {
    if (syncing) return
    syncing = true
    for (const m of maps) {
      if (m === src) continue
      m.jumpTo({ center: src.getCenter(), zoom: src.getZoom(), bearing: src.getBearing(), pitch: src.getPitch() })
    }
    syncing = false
  }
  for (const m of maps) m.on('move', mirror(m))
}

CB.map.splitSlider = (container, { onPositionChange } = {}) => {
  container.classList.add('split-wrap')
  container.innerHTML = `
    <div class="split-pane split-a"><div class="split-map" id="split-map-a"></div></div>
    <div class="split-pane split-b"><div class="split-map" id="split-map-b"></div></div>
    <div class="split-divider"><div class="split-grab">${CB.icon('collapse', 'sm')}</div></div>`
  const b = container.querySelector('.split-b')
  const divider = container.querySelector('.split-divider')
  let pos = 0.5
  const apply = () => {
    b.style.clipPath = `inset(0 0 0 ${(pos * 100).toFixed(2)}%)`
    divider.style.left = `${(pos * 100).toFixed(2)}%`
  }
  apply()
  divider.addEventListener('pointerdown', ev => {
    ev.preventDefault()
    divider.setPointerCapture(ev.pointerId)
    const move = mv => {
      const rect = container.getBoundingClientRect()
      pos = Math.max(0.06, Math.min(0.94, (mv.clientX - rect.left) / rect.width))
      apply()
      if (onPositionChange) onPositionChange(pos)
    }
    const up = () => {
      divider.removeEventListener('pointermove', move)
      divider.removeEventListener('pointerup', up)
    }
    divider.addEventListener('pointermove', move)
    divider.addEventListener('pointerup', up)
  })
  return {
    elA: container.querySelector('#split-map-a'),
    elB: container.querySelector('#split-map-b'),
    setPosition: p => { pos = p; apply() },
    getPosition: () => pos,
  }
}

CB.map.fieldCanvas = (map, wrapEl, getValues, getLayer, getRange) => {
  const canvas = document.createElement('canvas')
  canvas.className = 'field-canvas'
  wrapEl.appendChild(canvas)
  const seeds = {}
  CB_DATA.counties.forEach((c, ci) => {
    const rand = (() => { let a = ci * 2654435761 % 4294967296; return () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296 } })()
    seeds[c.id] = Array.from({ length: 4 }, () => [rand(), rand(), 0.35 + rand() * 0.5])
  })
  const draw = () => {
    const el = map.getContainer()
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)
    const values = getValues(), layer = getLayer(), range = getRange()
    for (const c of CB_DATA.counties) {
      const raw = values[c.id]
      const v = raw && typeof raw === 'object' ? raw.value : raw
      if (v === null || v === undefined) continue
      const [minX, minY, maxX, maxY] = c.bbox
      const p0 = map.project([minX, maxY]), p1 = map.project([maxX, minY])
      const bw = p1.x - p0.x, bh = p1.y - p0.y
      const color = CB.ui.rampColor(layer, v, range)
      for (const [fx, fy, fr] of seeds[c.id]) {
        const cx = p0.x + fx * bw, cy = p0.y + fy * bh
        const r = Math.max(14, Math.min(bw, bh) * fr * 0.55)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        g.addColorStop(0, color.replace('rgb', 'rgba').replace(')', ',0.34)'))
        g.addColorStop(1, color.replace('rgb', 'rgba').replace(')', ',0)'))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  map.on('move', draw)
  map.on('resize', draw)
  map.on('load', draw)
  draw()
  return { redraw: draw, destroy: () => { canvas.remove(); map.off('move', draw); map.off('resize', draw) } }
}

CB.map.stationLayer = (map, stations, { onHover, onClick } = {}) => {
  const KIND_COLOR = {
    rain_gauge: '#4C93A6', weather: '#D9A84E', water_point: '#63BDC9', market: '#8F7AB2', observer: '#4FA987',
  }
  const fc = {
    type: 'FeatureCollection',
    features: stations.map(s => ({
      type: 'Feature',
      id: s.id,
      properties: { stationId: s.id, kind: s.kind, status: s.status, color: KIND_COLOR[s.kind] },
      geometry: { type: 'Point', coordinates: s.coords },
    })),
  }
  const add = () => {
    if (map.getSource('stations')) return
    map.addSource('stations', { type: 'geojson', data: fc, promoteId: 'stationId' })
    map.addLayer({
      id: 'station-dots', type: 'circle', source: 'stations',
      paint: {
        'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 7, ['boolean', ['feature-state', 'hover'], false], 6, 4.5],
        'circle-color': ['get', 'color'],
        'circle-opacity': ['case', ['==', ['get', 'status'], 'offline'], 0.35, 0.92],
        'circle-stroke-width': ['case', ['boolean', ['feature-state', 'selected'], false], 2, 1],
        'circle-stroke-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#E6EDF0', '#0D1317'],
      },
    })
    if (onHover) {
      map.on('mousemove', 'station-dots', e => {
        map.getCanvas().style.cursor = 'pointer'
        onHover(e.features?.[0]?.id || null)
      })
      map.on('mouseleave', 'station-dots', () => { map.getCanvas().style.cursor = ''; onHover(null) })
    }
    if (onClick) map.on('click', 'station-dots', e => { const id = e.features?.[0]?.id; if (id) onClick(id) })
  }
  if (map.isStyleLoaded()) add()
  else map.on('load', add)
  return {
    setSelected: id => {
      for (const s of stations) map.setFeatureState({ source: 'stations', id: s.id }, { selected: s.id === id })
    },
    setHover: id => {
      for (const s of stations) map.setFeatureState({ source: 'stations', id: s.id }, { hover: s.id === id })
    },
  }
}
