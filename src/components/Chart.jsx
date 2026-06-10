import React from 'react'
import { fmtNum, fmtDate } from '../lib/util'

// Hand-rolled SVG line chart — keeps dependencies at zero and matches the
// editorial aesthetic better than a charting library would.
export function LineChart({ series, height = 180, color = 'var(--accent)' }) {
  // series: [{date, value}] sorted ascending
  const points = series.filter((d) => d.value !== null && d.value !== undefined)
  if (points.length === 0) {
    return <div className="empty">No data yet</div>
  }
  const w = 600
  const h = height
  const padL = 44
  const padR = 12
  const padT = 14
  const padB = 26

  const values = points.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const lo = min - span * 0.12
  const hi = max + span * 0.12

  const x = (i) => padL + (i / Math.max(points.length - 1, 1)) * (w - padL - padR)
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (h - padT - padB)

  const path = points.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
  const area = `${path} L${x(points.length - 1).toFixed(1)},${h - padB} L${x(0).toFixed(1)},${h - padB} Z`

  const gridLines = [0.25, 0.5, 0.75].map((f) => padT + f * (h - padT - padB))
  const labelIdx = points.length <= 6 ? points.map((_, i) => i) : [0, Math.floor((points.length - 1) / 2), points.length - 1]
  const gradId = React.useId()

  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} role="img">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((gy, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={gy} y2={gy} stroke="var(--line)" strokeDasharray="2 4" />
        ))}
        <text className="chart-label" x={padL - 6} y={y(max) + 3} textAnchor="end">{fmtNum(max)}</text>
        <text className="chart-label" x={padL - 6} y={y(min) + 3} textAnchor="end">{fmtNum(min)}</text>
        <path d={area} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.value)} r={i === points.length - 1 ? 4 : 2.5} fill={color}>
            <title>{`${fmtDate(d.date)}: ${d.value.toLocaleString()}`}</title>
          </circle>
        ))}
        {labelIdx.map((i) => (
          <text key={i} className="chart-label" x={x(i)} y={h - 8} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>
            {fmtDate(points[i].date)}
          </text>
        ))}
      </svg>
    </div>
  )
}

export function Sparkline({ values, color = 'var(--accent)', width = 90, height = 28 }) {
  const pts = values.filter((v) => v !== null && v !== undefined)
  if (pts.length < 2) return null
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const span = max - min || 1
  const x = (i) => 2 + (i / (pts.length - 1)) * (width - 4)
  const y = (v) => 2 + (1 - (v - min) / span) * (height - 4)
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1])} r="2.5" fill={color} />
    </svg>
  )
}
