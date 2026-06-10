import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { PLATFORMS, PILLARS, STATUSES, METRIC_FIELDS } from '../lib/constants'
import { todayISO, addDays, fmtNum, fmtDateLong } from '../lib/util'
import PageHead from '../components/PageHead'
import { Sparkline } from '../components/Chart'
import { PillarChip, StatusChip, PlatformDots } from '../components/Chips'
import PlatformIcon from '../components/Icons'
import { EmptyArt } from '../components/Art'

export default function Dashboard() {
  const { posts, ideas, metrics, settings, connected } = useStore()
  const today = todayISO()
  const weekOut = addDays(today, 7)

  const snapshots = metrics.snapshots || []
  const latest = snapshots[snapshots.length - 1]
  const previous = snapshots[snapshots.length - 2]

  const upcoming = posts
    .filter((p) => p.date && p.date >= today && p.date <= weekOut && p.status !== 'published')
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))

  const pipeline = STATUSES.map((s) => ({ ...s, count: posts.filter((p) => p.status === s.id).length }))

  const recentCutoff = addDays(today, -30)
  const pillarCounts = PILLARS.map((pl) => ({
    ...pl,
    count: posts.filter((p) => p.pillar === pl.id && (p.status === 'published' || p.status === 'scheduled') && (p.date || '') >= recentCutoff).length,
  }))
  const pillarMax = Math.max(...pillarCounts.map((p) => p.count), 1)

  const name = settings.displayName ? `, ${settings.displayName.split(' ')[0]}` : ''
  const avatar = settings.avatarUrl

  return (
    <div>
      <PageHead
        kicker={fmtDateLong(today)}
        title={
          <span className="flex" style={{ gap: 16 }}>
            {avatar && (
              <img
                src={avatar}
                alt=""
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--card)',
                  boxShadow: 'var(--shadow-lift)',
                }}
              />
            )}
            <span>The week <em>ahead</em>{name}.</span>
          </span>
        }
        sub="Your personal press office — what's queued, what's growing, and where the pillars stand."
      >
        <Link to="/composer?new=1" className="btn btn-primary">+ New post</Link>
        <Link to="/ideas" className="btn">+ Capture idea</Link>
      </PageHead>

      {!connected && (
        <div className="banner warn">
          <span className="grow">
            You're working <strong>locally in this browser</strong>. Connect your private GitHub data repo to sync
            and back up everything.
          </span>
          <Link to="/settings" className="btn btn-sm btn-accent">Connect</Link>
        </div>
      )}

      <div className="stat-row rise" style={{ marginBottom: 18 }}>
        {PLATFORMS.map((p) => {
          const field = METRIC_FIELDS[p.id].primary
          const cur = latest?.[p.id]?.[field]
          const prev = previous?.[p.id]?.[field]
          const delta = cur != null && prev != null ? cur - prev : null
          const history = snapshots.map((s) => s[p.id]?.[field]).filter((v) => v != null)
          return (
            <Link key={p.id} to={`/platform/${p.id}`} className="card stat" style={{ textDecoration: 'none' }}>
              <div className="stat-platform">
                <PlatformIcon id={p.id} size={13} />
                {p.name}
              </div>
              <div className="stat-num">{fmtNum(cur)}</div>
              <div className="flex-between">
                <div className={`stat-delta ${delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : 'delta-flat'}`}>
                  {delta == null ? METRIC_FIELDS[p.id].label.toLowerCase() : delta > 0 ? `▲ ${delta}` : delta < 0 ? `▼ ${Math.abs(delta)}` : '— flat'}
                </div>
                {history.length > 1 && <Sparkline values={history.slice(-10)} color={p.color} />}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid rise" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div className="card card-pad">
          <div className="card-title">
            Next 7 days
            <Link to="/calendar" className="mono" style={{ color: 'var(--accent)', textDecoration: 'none' }}>calendar →</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty">
              <EmptyArt />
              Nothing scheduled this week — pull something from the <Link to="/ideas">idea backlog</Link>.
            </div>
          ) : (
            <div className="row-list">
              {upcoming.map((p) => (
                <Link key={p.id} to={`/composer?post=${p.id}`} className="row-item" style={{ textDecoration: 'none' }}>
                  <span className="mono muted" style={{ width: 72, flexShrink: 0 }}>
                    {fmtDateLong(p.date).split(',')[0]} {p.time || ''}
                  </span>
                  <span className="grow" style={{ fontWeight: 600 }}>{p.title || 'Untitled'}</span>
                  <PlatformDots ids={p.platforms || []} />
                  <StatusChip id={p.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card card-pad">
            <div className="card-title">Pipeline</div>
            <div className="row-list">
              {pipeline.map((s) => (
                <div key={s.id} className="row-item">
                  <span className="chip-dot" style={{ background: s.color, width: 8, height: 8 }} />
                  <span className="grow">{s.name}</span>
                  <span className="mono" style={{ fontSize: 15 }}>{s.count}</span>
                </div>
              ))}
              <div className="row-item">
                <span className="chip-dot" style={{ background: 'var(--ink-3)', width: 8, height: 8, opacity: 0.4 }} />
                <span className="grow muted">Ideas in backlog</span>
                <span className="mono" style={{ fontSize: 15 }}>{ideas.length}</span>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <div className="card-title">Pillar balance · last 30 days</div>
            {pillarCounts.map((pl) => (
              <div key={pl.id} className="pillar-bar-row">
                <span className="pillar-bar-name">{pl.name}</span>
                <div className="pillar-bar-track">
                  <div className="pillar-bar-fill" style={{ width: `${(pl.count / pillarMax) * 100}%`, background: pl.color }} />
                </div>
                <span className="pillar-bar-count">{pl.count}</span>
              </div>
            ))}
            <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>
              Scheduled + published posts. Keep the three pillars in rotation so the brand reads as one voice.
            </p>
          </div>
        </div>
      </div>

      {ideas.filter((i) => i.column === 'ready').length > 0 && (
        <div className="card card-pad mt rise">
          <div className="card-title">
            Ready to draft
            <Link to="/ideas" className="mono" style={{ color: 'var(--accent)', textDecoration: 'none' }}>backlog →</Link>
          </div>
          <div className="flex wrap">
            {ideas
              .filter((i) => i.column === 'ready')
              .map((i) => (
                <span key={i.id} className="flex" style={{ gap: 8, border: '1px solid var(--line)', borderRadius: 8, padding: '7px 12px', background: 'var(--paper)' }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{i.title}</span>
                  <PillarChip id={i.pillar} short />
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
