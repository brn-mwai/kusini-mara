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
