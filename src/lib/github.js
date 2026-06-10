// Thin client for the GitHub Contents API.
// All data files live in a (typically private) data repo the user configures
// in Settings. The token never leaves the browser (localStorage only).

const API = 'https://api.github.com'

function headers(cfg) {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function b64encode(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function b64decode(b64) {
  const bin = atob(b64.replace(/\n/g, ''))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export async function ghGetFile(cfg, path) {
  const branch = cfg.branch || 'main'
  const res = await fetch(
    `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(branch)}`,
    { headers: headers(cfg) }
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub read failed (${res.status}) for ${path}`)
  const json = await res.json()
  return { sha: json.sha, content: b64decode(json.content) }
}

export async function ghPutFile(cfg, path, content, sha, message) {
  const body = {
    message: message || `Update ${path}`,
    content: b64encode(content),
    branch: cfg.branch || 'main',
  }
  if (sha) body.sha = sha
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = new Error(`GitHub write failed (${res.status}) for ${path}`)
    err.status = res.status
    throw err
  }
  const json = await res.json()
  return { sha: json.content.sha }
}

export async function ghTestConnection(cfg) {
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}`, { headers: headers(cfg) })
  if (res.status === 404) throw new Error('Repo not found — check owner/name, and that your token has access to it.')
  if (res.status === 401) throw new Error('Token rejected — check that it is valid and not expired.')
  if (!res.ok) throw new Error(`GitHub returned ${res.status}`)
  const json = await res.json()
  if (!json.permissions?.push) {
    throw new Error('Connected, but the token cannot write to this repo. Grant "Contents: Read and write".')
  }
  return { name: json.full_name, private: json.private }
}
