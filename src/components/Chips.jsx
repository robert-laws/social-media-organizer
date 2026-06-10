import React from 'react'
import { PILLAR_MAP, STATUS_MAP, PLATFORM_MAP } from '../lib/constants'

export function PillarChip({ id, short = false }) {
  const p = PILLAR_MAP[id]
  if (!p) return null
  const name = short && id === 'highered' ? 'Higher Ed & Libraries' : p.name
  return (
    <span className="chip" style={{ background: p.soft, color: p.color }}>
      <span className="chip-dot" style={{ background: p.color }} />
      {name}
    </span>
  )
}

export function StatusChip({ id }) {
  const s = STATUS_MAP[id]
  if (!s) return null
  return (
    <span className="chip" style={{ background: 'var(--paper-2)', color: s.color, borderColor: 'var(--line)' }}>
      <span className="chip-dot" style={{ background: s.color }} />
      {s.name}
    </span>
  )
}

export function PlatformDots({ ids = [] }) {
  return (
    <span className="platform-dots">
      {ids.map((id) => {
        const p = PLATFORM_MAP[id]
        if (!p) return null
        return <span key={id} className="pd" style={{ background: p.color }} title={p.name} />
      })}
    </span>
  )
}
