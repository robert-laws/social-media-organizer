import React, { useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { ghTestConnection } from '../lib/github'
import { PLATFORMS, PILLARS } from '../lib/constants'
import { buildSampleData } from '../lib/sample'
import PageHead from '../components/PageHead'

export default function Settings() {
  const store = useStore()
  const { config, connected, settings, updateSettings, setConfig, replaceAll, sync } = store

  const [token, setToken] = useState(config?.token || '')
  const [owner, setOwner] = useState(config?.owner || '')
  const [repo, setRepo] = useState(config?.repo || '')
  const [branch, setBranch] = useState(config?.branch || 'main')
  const [test, setTest] = useState({ state: 'idle', message: '' })
  const fileInput = useRef(null)

  async function testAndSave() {
    const cfg = { token: token.trim(), owner: owner.trim(), repo: repo.trim(), branch: branch.trim() || 'main' }
    setTest({ state: 'testing', message: '' })
    try {
      const info = await ghTestConnection(cfg)
      setTest({ state: 'ok', message: `Connected to ${info.name}${info.private ? ' (private ✓)' : ' — ⚠ this repo is PUBLIC; your drafts will be visible'}` })
      setConfig(cfg)
    } catch (e) {
      setTest({ state: 'fail', message: e.message })
    }
  }

  function disconnect() {
    if (confirm('Disconnect GitHub? Data stays in the repo and in this browser; the app stops syncing.')) {
      setConfig(null)
      setTest({ state: 'idle', message: '' })
    }
  }

  function exportJSON() {
    const blob = new Blob(
      [JSON.stringify({ posts: store.posts, ideas: store.ideas, metrics: store.metrics, settings: store.settings }, null, 2)],
      { type: 'application/json' }
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `masthead-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function importJSON(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (confirm('Importing replaces ALL current posts, ideas, metrics, and settings. Continue?')) {
          replaceAll(data)
        }
      } catch {
        alert('That file is not valid JSON.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  function loadSample() {
    if (confirm('Load sample data? This replaces current posts, ideas, and metrics (settings are kept).')) {
      replaceAll(buildSampleData())
    }
  }

  return (
    <div>
      <PageHead
        kicker="Setup"
        title={<>Settings</>}
        sub="Connect your private data repo, set your handles, and tune your hashtag sets."
      />

      <div className="grid rise" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <div className="card card-pad">
          <div className="card-title">GitHub sync {connected && <span style={{ color: 'var(--good)' }}>● connected</span>}</div>

          <div className="callout mb">
            Your data lives as JSON in a GitHub repo you control (make it <strong>private</strong> so drafts stay
            private). The token is stored <strong>only in this browser</strong> — never committed, never sent
            anywhere except <span className="mono-snippet">api.github.com</span>.
          </div>

          <div className="field">
            <label>Fine-grained personal access token</label>
            <input type="password" value={token} placeholder="github_pat_…" onChange={(e) => setToken(e.target.value)} />
            <span className="help">
              Create at GitHub → Settings → Developer settings → Fine-grained tokens. Scope it to <em>only</em> your
              data repo with <strong>Contents: Read and write</strong>.
            </span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 100px', gap: 12 }}>
            <div className="field">
              <label>Owner</label>
              <input type="text" value={owner} placeholder="your-username" onChange={(e) => setOwner(e.target.value)} />
            </div>
            <div className="field">
              <label>Data repo</label>
              <input type="text" value={repo} placeholder="masthead-data" onChange={(e) => setRepo(e.target.value)} />
            </div>
            <div className="field">
              <label>Branch</label>
              <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
          </div>

          <div className="flex">
            <button className="btn btn-primary" disabled={!token || !owner || !repo || test.state === 'testing'} onClick={testAndSave}>
              {test.state === 'testing' ? 'Testing…' : 'Test & connect'}
            </button>
            {connected && <button className="btn btn-ghost btn-danger" onClick={disconnect}>Disconnect</button>}
          </div>
          {test.message && (
            <p style={{ fontSize: 13, color: test.state === 'ok' ? 'var(--good)' : 'var(--danger)', marginBottom: 0 }}>{test.message}</p>
          )}
          {sync.state === 'error' && (
            <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 0 }}>Last sync error: {sync.message}</p>
          )}
        </div>

        <div className="card card-pad">
          <div className="card-title">Profile & handles</div>
          <div className="field">
            <label>Display name</label>
            <input
              type="text"
              value={settings.displayName || ''}
              placeholder="Robert"
              onChange={(e) => updateSettings({ displayName: e.target.value })}
            />
          </div>
          {PLATFORMS.map((p) => (
            <div key={p.id} className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="chip-dot" style={{ background: p.color }} />
                {p.name} handle
              </label>
              <input
                type="text"
                value={settings.handles?.[p.id] || ''}
                placeholder={p.id === 'youtube' ? 'channel-handle (without @)' : 'username (without @)'}
                onChange={(e) => updateSettings({ handles: { ...settings.handles, [p.id]: e.target.value.replace(/^@/, '') } })}
              />
            </div>
          ))}
        </div>

        <div className="card card-pad">
          <div className="card-title">Hashtag sets · per pillar</div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 0 }}>
            One-click append in the composer. Keep each set focused — 3–5 tags beats 15.
          </p>
          {PILLARS.map((p) => (
            <div key={p.id} className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="chip-dot" style={{ background: p.color }} />
                {p.name}
              </label>
              <textarea
                style={{ minHeight: 52 }}
                value={settings.hashtags?.[p.id] || ''}
                placeholder="#AIinEducation #HigherEd #AcademicLibraries"
                onChange={(e) => updateSettings({ hashtags: { ...settings.hashtags, [p.id]: e.target.value } })}
              />
            </div>
          ))}
        </div>

        <div className="card card-pad">
          <div className="card-title">Data management</div>
          <div className="flex wrap">
            <button className="btn" onClick={exportJSON}>Export backup (.json)</button>
            <button className="btn" onClick={() => fileInput.current?.click()}>Import backup</button>
            <button className="btn btn-ghost" onClick={loadSample}>Load sample data</button>
            <input ref={fileInput} type="file" accept="application/json" style={{ display: 'none' }} onChange={importJSON} />
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 0, marginTop: 12 }}>
            Sample data is useful for a first look around — replace it with your real content whenever you're ready.
          </p>
        </div>
      </div>
    </div>
  )
}
