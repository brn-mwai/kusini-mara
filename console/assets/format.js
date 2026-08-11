window.CB = window.CB || {}

CB.fmt = (() => {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const DASH = '—'

  const isNil = v => v === null || v === undefined || Number.isNaN(v)

  function prob(v) {
    if (isNil(v)) return DASH
    return v.toFixed(3)
  }

  function delta(v, digits = 2) {
    if (isNil(v)) return DASH
    const s = v > 0 ? '+' : v < 0 ? '−' : '±'
    return s + Math.abs(v).toFixed(digits)
  }

  function int(v) {
    if (isNil(v)) return DASH
    return v.toLocaleString('en-KE')
  }

  function pct(v, signed = true) {
    if (isNil(v)) return DASH
    const s = signed && v > 0 ? '+' : v < 0 ? '−' : ''
    return s + Math.abs(v) + '%'
  }

  function num1(v) {
    if (isNil(v)) return DASH
    return v.toFixed(1)
  }

  function degC(v, signed = true) {
    if (isNil(v)) return DASH
    const s = signed && v > 0 ? '+' : v < 0 ? '−' : ''
    return s + Math.abs(v).toFixed(1) + '°C'
  }

  function ym(key) {
    const [y, m] = key.split('-').map(Number)
    return MONTHS[m - 1] + ' ' + y
  }

  function monthShort(key) {
    const m = Number(key.split('-')[1])
    return MONTHS[m - 1]
  }

  function coord([lon, lat]) {
    const ns = lat >= 0 ? 'N' : 'S'
    const ew = lon >= 0 ? 'E' : 'W'
    return Math.abs(lat).toFixed(2) + '°' + ns + ' ' + Math.abs(lon).toFixed(2) + '°' + ew
  }

  function members(above, total) {
    if (isNil(above) || isNil(total)) return DASH
    return above + ' of ' + total
  }

  function hashShort(h) {
    return h ? h.slice(0, 8) : DASH
  }

  return { prob, delta, int, pct, num1, degC, ym, monthShort, coord, members, hashShort, DASH, MONTHS }
})()
