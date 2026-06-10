import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { PLATFORMS, PLATFORM_MAP, PILLARS, STATUSES } from '../lib/constants'
import { uid, todayISO, fmtDate } from '../lib/util'
import PageHead from '../components/PageHead'
import { StatusChip, PlatformDots } from '../components/Chips'
import PlatformIcon from '../components/Icons'

export default function Composer() {
  const { posts, addPost, updatePost, deletePost, settings } = useStore()
  const [params, setParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState(null)

  const selectedId = params.get('post')
  const selected = posts.find((p) => p.id === selectedId) || null

  // ?new=1 creates a post and selects it
  useEffect(() => {
    if (params.get('new')) {
      const id = uid('p')
      addPost({ id, title: '', pillar: 'ai', status: 'idea', date: todayISO(), time: '', platforms: [], body: '', variants: {}, notes: '', tags: [] })
      setParams({ post: id }, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    const filtered = statusFilter ? posts.filter((p) => p.status === statusFilter) : posts
    return [...filtered].sort((a, b) => (b.date || '0000').localeCompare(a.date || '0000'))
  }, [posts, statusFilter])

  function createPost() {
    const id = uid('p')
    addPost({ id, title: '', pillar: 'ai', status: 'idea', date: todayISO(), time: '', platforms: [], body: '', variants: {}, notes: '', tags: [] })
    setParams({ post: id })
  }

  return (
    <div>
      <PageHead
        kicker="Write"
        title={<>The <em>composer</em></>}
        sub="Draft the core idea once, then tailor it to each channel's voice and limits."
      >
        <button className="btn btn-primary" onClick={createPost}>+ New post</button>
      </PageHead>

      <div className="toolbar">
        <button className={`pill-toggle${statusFilter === null ? ' on' : ''}`} onClick={() => setStatusFilter(null)}>All</button>
        {STATUSES.map((s) => (
          <button key={s.id} className={`pill-toggle${statusFilter === s.id ? ' on' : ''}`} onClick={() => setStatusFilter(statusFilter === s.id ? null : s.id)}>
            <span className="chip-dot" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
      </div>

      <div className="composer-layout">
        <div className="card" style={{ overflow: 'hidden', maxHeight: '72vh', overflowY: 'auto' }}>
          {list.length === 0 ? (
            <div className="empty">
              <span className="empty-glyph">blank page</span>
              No posts yet — start one.
            </div>
          ) : (
            list.map((p) => (
              <div
                key={p.id}
                className={`post-list-item${p.id === selectedId ? ' active' : ''}`}
                onClick={() => setParams({ post: p.id })}
              >
                <div className="plt">{p.title || 'Untitled'}</div>
                <div className="pls">
                  <span>{p.date ? fmtDate(p.date) : 'unscheduled'}</span>
                  <PlatformDots ids={p.platforms || []} />
                  <span className="grow" />
                  <StatusChip id={p.status} />
                </div>
              </div>
            ))
          )}
        </div>

        {selected ? (
          <Editor
            key={selected.id}
            post={selected}
            settings={settings}
            onChange={(patch) => updatePost(selected.id, patch)}
            onDelete={() => {
              if (confirm(`Delete "${selected.title || 'Untitled'}"? This can't be undone.`)) {
                deletePost(selected.id)
                setParams({})
              }
            }}
          />
        ) : (
          <div className="card card-pad empty" style={{ minHeight: 300 }}>
            <span className="empty-glyph">pick a draft</span>
            Select a post from the list, or create a new one.
          </div>
        )}
      </div>
    </div>
  )
}

function Editor({ post, settings, onChange, onDelete }) {
  const activePlatforms = post.platforms || []
  const [tab, setTab] = useState(activePlatforms[0] || null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (tab && !activePlatforms.includes(tab)) setTab(activePlatforms[0] || null)
    if (!tab && activePlatforms.length) setTab(activePlatforms[0])
  }, [activePlatforms.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  function togglePlatform(id) {
    const next = activePlatforms.includes(id) ? activePlatforms.filter((p) => p !== id) : [...activePlatforms, id]
    onChange({ platforms: next })
  }

  function setVariant(id, patch) {
    onChange({ variants: { ...(post.variants || {}), [id]: { ...(post.variants?.[id] || {}), ...patch } } })
  }

  function applyMasterToAll() {
    const variants = { ...(post.variants || {}) }
    for (const id of activePlatforms) {
      variants[id] = { ...(variants[id] || {}), text: post.body || '' }
    }
    onChange({ variants })
  }

  async function copyVariant(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard blocked — ignore
    }
  }

  const platform = tab ? PLATFORM_MAP[tab] : null
  const variant = tab ? post.variants?.[tab] || {} : {}
  const text = variant.text || ''
  const over = platform && text.length > platform.limit
  const hashtags = settings.hashtags?.[post.pillar] || ''

  return (
    <div className="card card-pad">
      <div className="field">
        <label>Working title</label>
        <input type="text" value={post.title} placeholder="What is this post about?" onChange={(e) => onChange({ title: e.target.value })} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div className="field">
          <label>Pillar</label>
          <select value={post.pillar} onChange={(e) => onChange({ pillar: e.target.value })}>
            {PILLARS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select value={post.status} onChange={(e) => onChange({ status: e.target.value })}>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={post.date || ''} onChange={(e) => onChange({ date: e.target.value })} />
        </div>
        <div className="field">
          <label>Time</label>
          <input type="time" value={post.time || ''} onChange={(e) => onChange({ time: e.target.value })} />
        </div>
      </div>

      <div className="field">
        <label>Core idea (master draft)</label>
        <textarea
          value={post.body || ''}
          placeholder="Write the heart of the post once — the insight, the hook, the takeaway…"
          onChange={(e) => onChange({ body: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Channels</label>
        <div className="flex wrap">
          {PLATFORMS.map((p) => (
            <button key={p.id} className={`pill-toggle${activePlatforms.includes(p.id) ? ' on' : ''}`} onClick={() => togglePlatform(p.id)}>
              <PlatformIcon id={p.id} size={13} color="currentColor" />
              {p.name}
            </button>
          ))}
          {activePlatforms.length > 0 && (
            <button className="btn btn-sm btn-ghost" onClick={applyMasterToAll} title="Copy the master draft into every selected channel's variant">
              ⇣ master → all
            </button>
          )}
        </div>
      </div>

      {activePlatforms.length > 0 && (
        <>
          <div className="variant-tabs">
            {activePlatforms.map((id) => {
              const p = PLATFORM_MAP[id]
              const len = (post.variants?.[id]?.text || '').length
              return (
                <button key={id} className={`variant-tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
                  <PlatformIcon id={id} size={13} />
                  {p.name}
                  {len > 0 && <span className={`char-counter${len > p.limit ? ' over' : ''}`}>{len}</span>}
                </button>
              )
            })}
          </div>

          {platform && (
            <>
              <div className="platform-hint">💡 {platform.hint}</div>
              <div className="field">
                <div className="flex-between">
                  <label>{platform.name} version</label>
                  <span className={`char-counter${over ? ' over' : ''}`}>
                    {text.length} / {platform.limit} {over && '— over limit!'}
                  </span>
                </div>
                <textarea
                  value={text}
                  style={{ minHeight: 130 }}
                  placeholder={`Adapt for ${platform.name} (${platform.limitLabel})…`}
                  onChange={(e) => setVariant(tab, { text: e.target.value })}
                />
                <div className="flex" style={{ marginTop: 4 }}>
                  <button className="btn btn-sm" onClick={() => copyVariant(text)}>{copied ? '✓ Copied' : 'Copy text'}</button>
                  {hashtags && (
                    <button className="btn btn-sm btn-ghost" title={hashtags} onClick={() => setVariant(tab, { text: text ? `${text}\n\n${hashtags}` : hashtags })}>
                      + {post.pillar} hashtags
                    </button>
                  )}
                </div>
              </div>
              <div className="field">
                <label>Published URL <span style={{ textTransform: 'none', letterSpacing: 0 }}>(paste after posting — powers the embed view)</span></label>
                <input
                  type="url"
                  value={variant.url || ''}
                  placeholder={`https://… link to the live ${platform.name} post`}
                  onChange={(e) => setVariant(tab, { url: e.target.value })}
                />
              </div>
            </>
          )}
        </>
      )}

      <div className="field">
        <label>Private notes</label>
        <textarea value={post.notes || ''} style={{ minHeight: 60 }} placeholder="Sources, follow-ups, repurposing plans…" onChange={(e) => onChange({ notes: e.target.value })} />
      </div>

      <hr className="divider" />
      <div className="flex-between">
        <span className="mono muted">Saved automatically as you type</span>
        <button className="btn btn-sm btn-ghost btn-danger" onClick={onDelete}>Delete post</button>
      </div>
    </div>
  )
}
