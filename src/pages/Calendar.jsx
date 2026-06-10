import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { STATUS_MAP, PLATFORM_MAP } from '../lib/constants'
import { todayISO, localISO, uid } from '../lib/util'
import PageHead from '../components/PageHead'
import { PlatformDots } from '../components/Chips'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const { posts, updatePost, addPost } = useStore()
  const navigate = useNavigate()
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [dragOver, setDragOver] = useState(null)

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1)
    const start = new Date(first)
    start.setDate(1 - first.getDay())
    const out = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      out.push({ iso: localISO(d), inMonth: d.getMonth() === cursor.m, day: d.getDate() })
    }
    // trim a trailing fully-out-of-month week
    return out.slice(35).every((c) => !c.inMonth) ? out.slice(0, 35) : out
  }, [cursor])

  const byDate = useMemo(() => {
    const map = {}
    for (const p of posts) {
      if (!p.date) continue
      ;(map[p.date] ||= []).push(p)
    }
    for (const k of Object.keys(map)) map[k].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
    return map
  }, [posts])

  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function move(n) {
    setCursor(({ y, m }) => {
      const d = new Date(y, m + n, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  function onDrop(e, iso) {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/post-id')
    if (id) updatePost(id, { date: iso })
  }

  function quickAdd(iso) {
    const id = uid('p')
    addPost({ id, title: '', pillar: 'ai', status: 'idea', date: iso, time: '', platforms: [], body: '', variants: {}, notes: '', tags: [] })
    navigate(`/composer?post=${id}`)
  }

  return (
    <div>
      <PageHead
        kicker="Schedule"
        title={<>Content <em>calendar</em></>}
        sub="Drag posts between days to reschedule. Click a post to open it in the composer."
      />

      <div className="cal-head">
        <div className="cal-month">{monthName}</div>
        <div className="flex">
          <button className="btn btn-sm" onClick={() => move(-1)}>← Prev</button>
          <button className="btn btn-sm" onClick={() => setCursor(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })}>Today</button>
          <button className="btn btn-sm" onClick={() => move(1)}>Next →</button>
        </div>
      </div>

      <div className="cal-grid">
        {DOW.map((d) => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {cells.map((c) => (
          <div
            key={c.iso}
            className={`cal-cell${c.inMonth ? '' : ' other'}${c.iso === today ? ' today' : ''}${dragOver === c.iso ? ' drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(c.iso) }}
            onDragLeave={() => setDragOver((d) => (d === c.iso ? null : d))}
            onDrop={(e) => onDrop(e, c.iso)}
          >
            <div className="cal-date">
              <span>{c.day}</span>
              <button className="cal-add" title="Add post on this day" onClick={() => quickAdd(c.iso)}>＋</button>
            </div>
            {(byDate[c.iso] || []).map((p) => (
              <div
                key={p.id}
                className="cal-post"
                style={{ borderLeftColor: STATUS_MAP[p.status]?.color }}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/post-id', p.id)}
                onClick={() => navigate(`/composer?post=${p.id}`)}
                title={`${p.title || 'Untitled'} · ${STATUS_MAP[p.status]?.name}${p.time ? ` · ${p.time}` : ''}\n${(p.platforms || []).map((id) => PLATFORM_MAP[id]?.name).join(', ')}`}
              >
                <span className="t">{p.title || 'Untitled'}</span>
                <PlatformDots ids={p.platforms || []} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex wrap mt" style={{ gap: 16 }}>
        {Object.values(STATUS_MAP).map((s) => (
          <span key={s.id} className="flex" style={{ gap: 6, fontSize: 12, color: 'var(--ink-2)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}
