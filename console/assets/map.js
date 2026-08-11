window.CB = window.CB || {}

CB.map = (() => {
  const KENYA_ASAL_BOUNDS = [[33.9, -3.1], [42.0, 5.6]]

  function baseStyle() {
    const css = getComputedStyle(document.documentElement)
    const tok = n => css.getPropertyValue(n).trim()
    const bm = CB_DATA.basemap
    return {
      version: 8,
      sources: {
        counties: { type: 'geojson', data: CB_DATA.geo, promoteId: 'countyId' },
        'bm-countries': { type: 'geojson', data: bm.countries },
        'bm-counties47': { type: 'geojson', data: bm.counties47 },
        'bm-lakes': { type: 'geojson', data: bm.lakes },
        'bm-rivers': { type: 'geojson', data: bm.rivers },
        'bm-towns': { type: 'geojson', data: bm.towns },
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': '#0A1116' } },
        { id: 'bm-land', type: 'fill', source: 'bm-countries', paint: { 'fill-color': '#10181E' } },
        { id: 'bm-kenya', type: 'fill', source: 'bm-counties47', paint: { 'fill-color': '#131D24' } },
        { id: 'bm-borders', type: 'line', source: 'bm-countries', paint: { 'line-color': '#2C3B46', 'line-width': 1, 'line-dasharray': [4, 2] } },
        { id: 'bm-counties47-line', type: 'line', source: 'bm-counties47', paint: { 'line-color': '#1D2932', 'line-width': 0.7 } },
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
        { id: 'bm-lakes', type: 'fill', source: 'bm-lakes', paint: { 'fill-color': '#173648', 'fill-opacity': 0.94 } },
        { id: 'bm-lakes-line', type: 'line', source: 'bm-lakes', paint: { 'line-color': '#28556B', 'line-width': 0.8 } },
        { id: 'bm-rivers', type: 'line', source: 'bm-rivers', paint: { 'line-color': '#28556B', 'line-width': 0.9, 'line-opacity': 0.6 } },
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
        { id: 'bm-towns', type: 'circle', source: 'bm-towns', paint: {
          'circle-radius': ['case', ['==', ['get', 'tier'], 1], 3.2, ['==', ['get', 'tier'], 2], 2.5, 1.8],
          'circle-color': '#9FB2BB',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#0A1116',
        } },
      ],
    }
  }

  /* town names as DOM markers: symbol layers need glyph fetches, which file://
     blocks, so labels ride on markers instead */
  function addTownLabels(map, container) {
    const markers = []
    for (const f of CB_DATA.basemap.towns.features) {
      const el = document.createElement('div')
      el.className = 'town-label t' + f.properties.tier
      el.textContent = f.properties.name
      markers.push({
        tier: f.properties.tier,
        marker: new maplibregl.Marker({ element: el, anchor: 'top' })
          .setLngLat(f.geometry.coordinates).addTo(map),
      })
    }
    const update = () => {
      const z = map.getZoom()
      const small = container.clientWidth < 430
      for (const { tier, marker } of markers) {
        const show = tier === 1 ? z >= 4.6 : tier === 2 ? (small ? z >= 6 : z >= 5.1) : z >= 6.2
        marker.getElement().style.display = show && map.__townsOn !== false ? '' : 'none'
      }
    }
    map.__updateTowns = update
    map.on('zoom', update)
    map.on('load', update)
    update()
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
      preserveDrawingBuffer: true,
      ...opts.mapOptions,
    })
    map.touchZoomRotate.disableRotation()
    if (opts.towns !== false) addTownLabels(map, container)
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
      else if (a === 'measure') CB.map.toggleMeasure(map, wrapEl, b)
      else if (a === 'settings') CB.map.toggleBasemapPanel(map, wrapEl)
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
  return {
    redraw: draw,
    canvas,
    setOpacity: o => { canvas.style.opacity = o },
    destroy: () => { canvas.remove(); map.off('move', draw); map.off('resize', draw) },
  }
}

CB.map.stationLayer = (map, stations, { onHover, onClick } = {}) => {
  const KIND_COLOR = {
    rain_gauge: '#4C93A6', weather: '#D9A84E', water_point: '#63BDC9', market: '#8F7AB2', observer: '#4FA987',
  }
  const toFc = list => ({
    type: 'FeatureCollection',
    features: list.map(s => ({
      type: 'Feature',
      id: s.id,
      properties: { stationId: s.id, kind: s.kind, status: s.status, color: KIND_COLOR[s.kind] },
      geometry: { type: 'Point', coordinates: s.coords },
    })),
  })
  const fc = toFc(stations)
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
    refresh: list => {
      stations = list
      map.getSource('stations')?.setData(toFc(list))
    },
  }
}

CB.map.toggleMeasure = (map, wrapEl, btn) => {
  if (map.__measure) {
    const m = map.__measure
    map.off('click', m.onClick)
    if (map.getLayer('measure-line')) map.removeLayer('measure-line')
    if (map.getLayer('measure-pts')) map.removeLayer('measure-pts')
    if (map.getSource('measure')) map.removeSource('measure')
    m.label?.remove()
    map.getCanvas().style.cursor = ''
    btn?.classList.remove('active-tool')
    map.__measure = null
    return
  }
  const state = { pts: [], label: null }
  const paint = () => {
    const data = {
      type: 'FeatureCollection',
      features: [
        ...(state.pts.length > 1 ? [{ type: 'Feature', geometry: { type: 'LineString', coordinates: state.pts } }] : []),
        ...state.pts.map(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: p } })),
      ],
    }
    if (map.getSource('measure')) map.getSource('measure').setData(data)
    else {
      map.addSource('measure', { type: 'geojson', data })
      map.addLayer({ id: 'measure-line', type: 'line', source: 'measure', paint: { 'line-color': '#E6EDF0', 'line-width': 1.6, 'line-dasharray': [3, 2] } })
      map.addLayer({ id: 'measure-pts', type: 'circle', source: 'measure', paint: { 'circle-radius': 3.5, 'circle-color': '#E6EDF0' } })
    }
  }
  const km = (a, b) => {
    const R = 6371, dLat = (b[1] - a[1]) * Math.PI / 180, dLon = (b[0] - a[0]) * Math.PI / 180
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * Math.PI / 180) * Math.cos(b[1] * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(s))
  }
  state.onClick = e => {
    if (state.pts.length >= 2) { state.pts = []; state.label?.remove(); state.label = null }
    state.pts.push([e.lngLat.lng, e.lngLat.lat])
    paint()
    if (state.pts.length === 2) {
      const d = km(state.pts[0], state.pts[1])
      const el = document.createElement('div')
      el.className = 'measure-label num'
      el.textContent = (d >= 100 ? Math.round(d) : d.toFixed(1)) + ' km'
      state.label = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -6] })
        .setLngLat(state.pts[1]).addTo(map)
    }
  }
  map.on('click', state.onClick)
  map.getCanvas().style.cursor = 'crosshair'
  btn?.classList.add('active-tool')
  map.__measure = state
  CB.toast('Measure: click two points, click again to restart')
}

CB.map.toggleBasemapPanel = (map, wrapEl) => {
  const existing = wrapEl.querySelector('.basemap-panel')
  if (existing) { existing.remove(); return }
  const vis = id => !map.getLayer(id) || map.getLayoutProperty(id, 'visibility') !== 'none'
  const row = (label, key, on) => `<label class="bm-row"><span>${label}</span>
    <button class="toggle${on ? ' on' : ''}" data-bm="${key}" aria-label="${label}"></button></label>`
  const el = CB.el(`<div class="basemap-panel">
    <div class="bm-title">Basemap layers</div>
    ${row('Towns', 'towns', map.__townsOn !== false)}
    ${row('Lakes', 'lakes', vis('bm-lakes'))}
    ${row('Rivers', 'rivers', vis('bm-rivers'))}
    ${row('All 47 counties', 'counties47', vis('bm-counties47-line'))}
    ${row('Country borders', 'borders', vis('bm-borders'))}
    <label class="bm-row"><span>Fill opacity</span>
      <input type="range" min="10" max="100" value="${Math.round((map.__fillOpacity ?? 0.62) * 100)}" data-bm-op></label>
  </div>`)
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-bm]')
    if (!b) return
    const key = b.dataset.bm
    const turnOn = !b.classList.contains('on')
    b.classList.toggle('on', turnOn)
    const setVis = ids => ids.forEach(id => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', turnOn ? 'visible' : 'none'))
    if (key === 'towns') { map.__townsOn = turnOn; setVis(['bm-towns']); map.__updateTowns?.() }
    else if (key === 'lakes') setVis(['bm-lakes', 'bm-lakes-line'])
    else if (key === 'rivers') setVis(['bm-rivers'])
    else if (key === 'counties47') setVis(['bm-counties47-line', 'bm-kenya'])
    else if (key === 'borders') setVis(['bm-borders'])
  })
  el.querySelector('[data-bm-op]').addEventListener('input', e => {
    const v = Number(e.target.value) / 100
    map.__fillOpacity = v
    map.setPaintProperty('county-fill', 'fill-opacity', ['case',
      ['boolean', ['feature-state', 'selected'], false], Math.min(1, v + 0.26),
      ['boolean', ['feature-state', 'hover'], false], Math.min(1, v + 0.18),
      ['boolean', ['feature-state', 'dimmed'], false], v * 0.5,
      v,
    ])
  })
  wrapEl.appendChild(el)
}
