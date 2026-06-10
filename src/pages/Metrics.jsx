import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { PLATFORMS, METRIC_FIELDS } from '../lib/constants'
import { todayISO, fmtDate, fmtNum } from '../lib/util'
import PageHead from '../components/PageHead'
import { LineChart } from '../components/Chart'
import PlatformIcon from '../components/Icons'

export default function Metrics() {
  const { metrics, addSnapshot, deleteSnapshot } = useStore()
  const snapshots = metrics.snapshots || []
  const latest = snapshots[snapshots.length - 1]

  const [date, setDate] = useState(todayISO())
  const [values, setValues] = useState(() => {
    const v = {}
    for (const p of PLATFORMS) v[p.id] = latest?.[p.id]?.[METRIC_FIELDS[p.id].primary] ?? ''
    return v
  })
  const [savedFlash, setSavedFlash] = useState(false)

  function save() {
    const snapshot = { date }
    for (const p of PLATFORMS) {
      const raw = values[p.id]
      const n = raw === '' || raw === null ? null : Number(raw)
      if (n !== null && !Number.isNaN(n)) snapshot[p.id] = { [METRIC_FIELDS[p.id].primary]: n }
    }
    addSnapshot(snapshot)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }

  const charts = useMemo(
    () =>
      PLATFORMS.map((p) => ({
        platform: p,
        series: snapshots
          .map((s) => ({ date: s.date, value: s[p.id]?.[METRIC_FIELDS[p.id].primary] ?? null }))
          .filter((d) => d.value !== null),
      })),
    [snapshots]
  )

  return (
    <div>
      <PageHead
        kicker="Growth"
        title={<>The <em>numbers</em></>}
        sub="A one-minute weekly check-in: type the current counts, the charts do the rest. Consistency beats precision."
      />

      <div className="card card-pad mb rise">
        <div className="card-title">Weekly check-in</div>
        <div className="grid" style={{ gridTemplateColumns: `140px repeat(${PLATFORMS.length}, 1fr) auto`, alignItems: 'end', gap: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {PLATFORMS.map((p) => (
            <div key={p.id} className="field" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PlatformIcon id={p.id} size={12} />
                {p.short} {METRIC_FIELDS[p.id].label}
              </label>
              <input
                type="number"
                min="0"
                value={values[p.id]}
                placeholder="—"
                onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
              />
            </div>
          ))}
          <button className="btn btn-primary" onClick={save}>{savedFlash ? '✓ Saved' : 'Save snapshot'}</button>
        </div>
        <p className="muted" style={{ fontSize: 12, marginBottom: 0, marginTop: 10 }}>
          Saving on a date that already has a snapshot replaces it. Leave a field blank to skip that platform.
        </p>
      </div>

      <div className="grid rise" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
        {charts.map(({ platform, series }) => {
          const cur = series[series.length - 1]?.value
          const first = series[0]?.value
          const growth = cur != null && first != null && first > 0 ? (((cur - first) / first) * 100).toFixed(1) : null
          return (
            <div key={platform.id} className="card card-pad">
              <div className="card-title">
                <span className="flex" style={{ gap: 7 }}>
                  <PlatformIcon id={platform.id} size={13} />
                  {platform.name} · {METRIC_FIELDS[platform.id].label}
                </span>
                <span className="mono">
                  {fmtNum(cur)} {growth !== null && <span style={{ color: growth >= 0 ? 'var(--good)' : 'var(--danger)' }}>({growth >= 0 ? '+' : ''}{growth}%)</span>}
                </span>
              </div>
              <LineChart series={series} color={platform.color} />
            </div>
          )
        })}
      </div>

      {snapshots.length > 0 && (
        <div className="card card-pad mt rise">
          <div className="card-title">Snapshot history</div>
          <div className="row-list">
            {[...snapshots].reverse().map((s) => (
              <div key={s.date} className="row-item">
                <span className="mono" style={{ width: 90 }}>{fmtDate(s.date, { year: 'numeric' })}</span>
                {PLATFORMS.map((p) => (
                  <span key={p.id} className="mono muted" style={{ width: 90 }}>
                    {p.short}: {fmtNum(s[p.id]?.[METRIC_FIELDS[p.id].primary])}
                  </span>
                ))}
                <span className="grow" />
                <button className="icon-btn" title="Delete snapshot" onClick={() => { if (confirm(`Delete snapshot for ${s.date}?`)) deleteSnapshot(s.date) }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
