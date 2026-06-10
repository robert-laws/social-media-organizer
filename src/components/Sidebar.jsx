import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { PLATFORMS } from '../lib/constants'
import { useStore } from '../lib/store'

const SYNC_LABEL = {
  local: 'Local only',
  loading: 'Loading…',
  synced: 'Synced to GitHub',
  saving: 'Saving…',
  error: 'Sync error',
}

export default function Sidebar() {
  const { sync, connected } = useStore()
  return (
    <aside className="sidebar">
      <Link to="/" className="wordmark">
        Masthead<span className="dot">.</span>
      </Link>
      <div className="wordmark-sub">Social Media Studio</div>

      <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Dashboard
      </NavLink>
      <NavLink to="/calendar" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Calendar
      </NavLink>
      <NavLink to="/ideas" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Ideas
      </NavLink>
      <NavLink to="/composer" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Composer
      </NavLink>
      <NavLink to="/metrics" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Metrics
      </NavLink>

      <div className="nav-label">Channels</div>
      {PLATFORMS.map((p) => (
        <NavLink
          key={p.id}
          to={`/platform/${p.id}`}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <span className="nav-dot" style={{ background: p.color, opacity: 0.55 }} />
          {p.name}
        </NavLink>
      ))}

      <div className="nav-label">Setup</div>
      <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Settings
      </NavLink>

      <div className="sidebar-foot">
        <span className={`sync-pill sync-${sync.state}`} title={sync.message || SYNC_LABEL[sync.state]}>
          <span className="dot" />
          {SYNC_LABEL[sync.state]}
        </span>
        {!connected && (
          <div style={{ marginTop: 6, fontSize: 11.5 }}>
            <Link to="/settings" style={{ color: 'var(--accent)' }}>
              Connect GitHub →
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
