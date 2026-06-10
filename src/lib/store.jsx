import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { ghGetFile, ghPutFile } from './github'

const CONFIG_KEY = 'masthead.config'
const LOCAL_DATA_KEY = 'masthead.data'

const FILES = {
  posts: 'data/posts.json',
  ideas: 'data/ideas.json',
  metrics: 'data/metrics.json',
  settings: 'data/settings.json',
}

const DEFAULT_DATA = {
  posts: [],
  ideas: [],
  metrics: { snapshots: [] },
  settings: {
    displayName: '',
    handles: { x: '', linkedin: '', instagram: '', facebook: '', youtube: '' },
    hashtags: { ai: '', highered: '', creativity: '' },
  },
}

export function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY)) || null
  } catch {
    return null
  }
}

export function saveConfig(cfg) {
  if (cfg) localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
  else localStorage.removeItem(CONFIG_KEY)
}

export function isConfigured(cfg) {
  return Boolean(cfg && cfg.token && cfg.owner && cfg.repo)
}

function loadLocalData() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_DATA_KEY))
    if (!raw) return structuredClone(DEFAULT_DATA)
    return { ...structuredClone(DEFAULT_DATA), ...raw, settings: { ...structuredClone(DEFAULT_DATA.settings), ...(raw.settings || {}) } }
  } catch {
    return structuredClone(DEFAULT_DATA)
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [config, setConfigState] = useState(loadConfig)
  const [data, setData] = useState(loadLocalData)
  // sync.state: 'local' | 'loading' | 'synced' | 'saving' | 'error'
  const [sync, setSync] = useState({ state: isConfigured(loadConfig()) ? 'loading' : 'local', message: '' })

  const shas = useRef({})        // file key -> last known git blob sha
  const writeQueue = useRef({})  // file key -> promise chain (serializes writes per file)
  const dataRef = useRef(data)
  dataRef.current = data

  const connected = isConfigured(config)

  // ---- Initial load / reload when config changes ----
  useEffect(() => {
    let cancelled = false
    if (!connected) {
      setSync({ state: 'local', message: '' })
      return
    }
    setSync({ state: 'loading', message: '' })
    ;(async () => {
      try {
        const next = structuredClone(DEFAULT_DATA)
        for (const [key, path] of Object.entries(FILES)) {
          const file = await ghGetFile(config, path)
          if (file) {
            shas.current[key] = file.sha
            try {
              const parsed = JSON.parse(file.content)
              next[key] = key === 'settings'
                ? { ...next.settings, ...parsed, handles: { ...next.settings.handles, ...(parsed.handles || {}) }, hashtags: { ...next.settings.hashtags, ...(parsed.hashtags || {}) } }
                : parsed
            } catch {
              // corrupt file: keep defaults, will be overwritten on next save
            }
          } else {
            shas.current[key] = null
          }
        }
        if (cancelled) return
        setData(next)
        localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(next))
        setSync({ state: 'synced', message: '' })
      } catch (e) {
        if (cancelled) return
        setSync({ state: 'error', message: e.message })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [config])

  // ---- Persistence ----
  const persist = useCallback(
    (key, value) => {
      // Always mirror to localStorage so nothing is lost offline
      const snapshot = { ...dataRef.current, [key]: value }
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(snapshot))
      if (!isConfigured(config)) return

      const doWrite = async () => {
        setSync((s) => (s.state === 'error' ? s : { state: 'saving', message: '' }))
        const content = JSON.stringify(value, null, 2) + '\n'
        try {
          const res = await ghPutFile(config, FILES[key], content, shas.current[key], `masthead: update ${key}`)
          shas.current[key] = res.sha
          setSync({ state: 'synced', message: '' })
        } catch (e) {
          if (e.status === 409 || e.status === 422) {
            // sha out of date (edited elsewhere) — refetch sha and retry once
            try {
              const fresh = await ghGetFile(config, FILES[key])
              shas.current[key] = fresh ? fresh.sha : null
              const res = await ghPutFile(config, FILES[key], content, shas.current[key], `masthead: update ${key}`)
              shas.current[key] = res.sha
              setSync({ state: 'synced', message: '' })
              return
            } catch (e2) {
              setSync({ state: 'error', message: e2.message })
              return
            }
          }
          setSync({ state: 'error', message: e.message })
        }
      }
      writeQueue.current[key] = (writeQueue.current[key] || Promise.resolve()).then(doWrite)
    },
    [config]
  )

  const mutate = useCallback(
    (key, fn) => {
      setData((prev) => {
        const value = fn(prev[key])
        persist(key, value)
        return { ...prev, [key]: value }
      })
    },
    [persist]
  )

  // ---- Public API ----
  const api = useMemo(() => {
    const now = () => new Date().toISOString()
    return {
      // posts
      addPost(post) {
        mutate('posts', (posts) => [...posts, { createdAt: now(), updatedAt: now(), ...post }])
      },
      updatePost(id, patch) {
        mutate('posts', (posts) => posts.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)))
      },
      deletePost(id) {
        mutate('posts', (posts) => posts.filter((p) => p.id !== id))
      },
      // ideas
      addIdea(idea) {
        mutate('ideas', (ideas) => [...ideas, { createdAt: now(), ...idea }])
      },
      updateIdea(id, patch) {
        mutate('ideas', (ideas) => ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)))
      },
      deleteIdea(id) {
        mutate('ideas', (ideas) => ideas.filter((i) => i.id !== id))
      },
      // metrics
      addSnapshot(snapshot) {
        mutate('metrics', (m) => {
          const others = (m.snapshots || []).filter((s) => s.date !== snapshot.date)
          return { ...m, snapshots: [...others, snapshot].sort((a, b) => a.date.localeCompare(b.date)) }
        })
      },
      deleteSnapshot(date) {
        mutate('metrics', (m) => ({ ...m, snapshots: (m.snapshots || []).filter((s) => s.date !== date) }))
      },
      // settings
      updateSettings(patch) {
        mutate('settings', (s) => ({ ...s, ...patch }))
      },
      // bulk (sample data / import)
      replaceAll(next) {
        for (const key of Object.keys(FILES)) {
          if (next[key] !== undefined) mutate(key, () => next[key])
        }
      },
      setConfig(cfg) {
        saveConfig(cfg)
        shas.current = {}
        setConfigState(cfg)
      },
    }
  }, [mutate])

  const value = useMemo(
    () => ({ ...data, config, connected, sync, ...api }),
    [data, config, connected, sync, api]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
