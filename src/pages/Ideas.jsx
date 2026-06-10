import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { IDEA_COLUMNS, PILLARS } from '../lib/constants'
import { uid, todayISO } from '../lib/util'
import PageHead from '../components/PageHead'
import { PillarChip } from '../components/Chips'

export default function Ideas() {
  const { ideas, addIdea, updateIdea, deleteIdea, addPost } = useStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState(null)
  const [editing, setEditing] = useState(null) // idea object or 'new'
  const [dragOver, setDragOver] = useState(null)

  const visible = filter ? ideas.filter((i) => i.pillar === filter) : ideas

  function onDrop(e, column) {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/idea-id')
    if (id) updateIdea(id, { column })
  }

  function promote(idea) {
    const id = uid('p')
    addPost({
      id,
      title: idea.title,
      pillar: idea.pillar,
      status: 'idea',
      date: '',
      time: '',
      platforms: [],
      body: idea.notes || '',
      variants: {},
      notes: `Promoted from idea backlog on ${todayISO()}.`,
      tags: [],
    })
    deleteIdea(idea.id)
    navigate(`/composer?post=${id}`)
  }

  return (
    <div>
      <PageHead
        kicker="Backlog"
        title={<>Idea <em>backlog</em></>}
        sub="Capture concepts fast, develop them across the board, then promote the keepers into real posts."
      >
        <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Capture idea</button>
      </PageHead>

      <div className="toolbar">
        <button className={`pill-toggle${filter === null ? ' on' : ''}`} onClick={() => setFilter(null)}>All pillars</button>
        {PILLARS.map((p) => (
          <button key={p.id} className={`pill-toggle${filter === p.id ? ' on' : ''}`} onClick={() => setFilter(filter === p.id ? null : p.id)}>
            <span className="chip-dot" style={{ background: p.color }} />
            {p.name}
          </button>
        ))}
      </div>

      <div className="kanban rise">
        {IDEA_COLUMNS.map((col) => {
          const items = visible.filter((i) => (i.column || 'spark') === col.id)
          return (
            <div
              key={col.id}
              className={`kan-col${dragOver === col.id ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.id) }}
              onDragLeave={() => setDragOver((d) => (d === col.id ? null : d))}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className="kan-col-head">
                <span className="kan-col-title">{col.name}</span>
                <span className="kan-col-count">{items.length}</span>
              </div>
              <div className="kan-col-blurb">{col.blurb}</div>
              {items.map((idea) => (
                <div
                  key={idea.id}
                  className="kan-card"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/idea-id', idea.id)}
                >
                  <div className="kt">{idea.title}</div>
                  {idea.notes && <div className="kn">{idea.notes}</div>}
                  <div className="kan-card-foot">
                    <PillarChip id={idea.pillar} short />
                    <span className="kan-actions">
                      <button className="icon-btn" title="Edit" onClick={() => setEditing(idea)}>✎</button>
                      <button className="icon-btn" title="Promote to post" onClick={() => promote(idea)}>→ post</button>
                      <button className="icon-btn" title="Delete" onClick={() => { if (confirm(`Delete idea "${idea.title}"?`)) deleteIdea(idea.id) }}>✕</button>
                    </span>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="empty" style={{ padding: '20px 10px' }}>Drop ideas here</div>}
            </div>
          )
        })}
      </div>

      {editing && (
        <IdeaModal
          idea={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            if (editing === 'new') addIdea({ id: uid('i'), column: 'spark', ...values })
            else updateIdea(editing.id, values)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function IdeaModal({ idea, onClose, onSave }) {
  const [title, setTitle] = useState(idea?.title || '')
  const [pillar, setPillar] = useState(idea?.pillar || 'ai')
  const [notes, setNotes] = useState(idea?.notes || '')

  return (
    <div className="modal-veil" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{idea ? 'Edit idea' : 'Capture an idea'}</h3>
        <div className="field">
          <label>Idea</label>
          <input type="text" value={title} autoFocus placeholder="e.g. Prompt patterns every academic should know" onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Pillar</label>
          <select value={pillar} onChange={(e) => setPillar(e.target.value)}>
            {PILLARS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea value={notes} placeholder="Angle, format, sources…" onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!title.trim()} onClick={() => onSave({ title: title.trim(), pillar, notes: notes.trim() })}>
            {idea ? 'Save' : 'Capture'}
          </button>
        </div>
      </div>
    </div>
  )
}
