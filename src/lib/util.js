export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function todayISO() {
  const d = new Date()
  return localISO(d)
}

export function localISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function fmtDate(iso, opts = {}) {
  const d = parseISO(iso)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...opts })
}

export function fmtDateLong(iso) {
  const d = parseISO(iso)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function addDays(iso, n) {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return localISO(d)
}

export function startOfWeek(iso) {
  const d = parseISO(iso)
  d.setDate(d.getDate() - d.getDay()) // Sunday start
  return localISO(d)
}

export function fmtNum(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString('en-US')
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}
