import React, { useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { PLATFORM_MAP, METRIC_FIELDS } from '../lib/constants'
import { todayISO, fmtNum, fmtDateLong } from '../lib/util'
import PageHead from '../components/PageHead'
import { LineChart } from '../components/Chart'
import { PillarChip, StatusChip } from '../components/Chips'
import Embed from '../components/Embed'
import PlatformIcon from '../components/Icons'

export default function Platform() {
  const { id } = useParams()
  const { posts, metrics, settings } = useStore()
  const platform = PLATFORM_MAP[id]
  if (!platform) return <Navigate to="/" replace />

  const today = todayISO()
  const handle = settings.handles?.[id] || ''
  const field = METRIC_FIELDS[id].primary

  const snapshots = metrics.snapshots || []
  const series = snapshots
    .map((s) => ({ date: s.date, value: s[id]?.[field] ?? null }))
    .filter((d) => d.value !== null)
  const current = series[series.length - 1]?.value

  const relevant = useMemo(() => posts.filter((p) => (p.platforms || []).includes(id)), [posts, id])
  const published = relevant
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const upcoming = relevant
    .filter((p) => p.status !== 'published' && p.date && p.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div>
      <PageHead
        kicker="Channel"
        title={
          <span className="flex" style={{ gap: 14 }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: platform.color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow)',
              }}
            >
              <PlatformIcon id={id} size={28} color="#fff" />
            </span>
            <em>{platform.name}</em>
          </span>
        }
        sub={platform.hint}
      >
        {handle ? (
          <a className="btn" href={platform.profileUrl(handle)} target="_blank" rel="noreferrer">
            @{handle} ↗
          </a>
        ) : (
          <Link className="btn" to="/settings">Set your handle →</Link>
        )}
      </PageHead>

      <div className="grid rise" style={{ gridTemplateColumns: '1.3fr 1fr', marginBottom: 18 }}>
        <div className="card card-pad">
          <div className="card-title">
            {METRIC_FIELDS[id].label} over time
            <span className="mono" style={{ fontSize: 14, color: 'var(--ink)' }}>{fmtNum(current)}</span>
          </div>
          {series.length ? (
            <LineChart series={series} color={platform.color} />
          ) : (
            <div className="empty">
              No snapshots yet — add one on the <Link to="/metrics">Metrics</Link> page.
            </div>
          )}
        </div>

        <div className="card card-pad">
          <div className="card-title">Queued for {platform.name}</div>
          {upcoming.length === 0 ? (
            <div className="empty">Nothing queued — <Link to="/composer?new=1">draft something</Link>.</div>
          ) : (
            <div className="row-list">
              {upcoming.map((p) => (
                <Link key={p.id} to={`/composer?post=${p.id}`} className="row-item" style={{ textDecoration: 'none' }}>
                  <span className="mono muted" style={{ width: 88, flexShrink: 0 }}>{fmtDateLong(p.date).split(', 2')[0]}</span>
                  <span className="grow" style={{ fontWeight: 600 }}>{p.title || 'Untitled'}</span>
                  <StatusChip id={p.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card-title" style={{ marginTop: 28 }}>Published on {platform.name}</div>
      {published.length === 0 ? (
        <div className="card empty">
          <span className="empty-glyph">nothing live yet</span>
          When you publish a post, paste its URL in the composer's "{platform.name}" tab and it will appear here
          {['x', 'instagram', 'facebook', 'youtube'].includes(id) ? ' as a live embed.' : '.'}
        </div>
      ) : (
        <div className="embed-grid rise">
          {published.map((p) => {
            const url = p.variants?.[id]?.url
            return (
              <div key={p.id} className="card" style={{ overflow: 'hidden' }}>
                <div className="card-pad" style={{ paddingBottom: 12 }}>
                  <div className="flex-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.title || 'Untitled'}</span>
                    <span className="mono muted">{p.date}</span>
                  </div>
                  <PillarChip id={p.pillar} short />
                </div>
                {url ? (
                  <Embed platform={id} url={url} title={p.title} />
                ) : (
                  <div className="embed-fallback" style={{ borderTop: '1px solid var(--line)' }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      No URL yet — <Link to={`/composer?post=${p.id}`}>paste the live link</Link> to show the embed.
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
