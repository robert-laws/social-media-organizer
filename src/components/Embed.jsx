import React, { useEffect, useRef, useState } from 'react'

// Renders a live embed of a published post from its public URL, per platform.
// Where a platform doesn't support embedding (or the URL can't be parsed),
// falls back to a styled link card.

const loadedScripts = {}
function loadScript(src) {
  if (!loadedScripts[src]) {
    loadedScripts[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = src
      s.async = true
      s.onload = resolve
      s.onerror = reject
      document.body.appendChild(s)
    })
  }
  return loadedScripts[src]
}

function youTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  return m ? m[1] : null
}

function linkedInActivityId(url) {
  // Public post URLs usually contain "activity-<digits>" or "urn:li:activity:<digits>"
  const m = url.match(/activity[-:](\d{10,25})/)
  return m ? m[1] : null
}

function FallbackCard({ title, url, note }) {
  return (
    <div className="embed-fallback">
      <div className="ef-title">{title}</div>
      {note && <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{note}</div>}
      <a href={url} target="_blank" rel="noreferrer">
        View post ↗
      </a>
    </div>
  )
}

export default function Embed({ platform, url, title }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
    if (!url || !ref.current) return
    if (platform === 'x') {
      loadScript('https://platform.twitter.com/widgets.js')
        .then(() => window.twttr?.widgets?.load(ref.current))
        .catch(() => setFailed(true))
    } else if (platform === 'instagram') {
      loadScript('https://www.instagram.com/embed.js')
        .then(() => window.instgrm?.Embeds?.process())
        .catch(() => setFailed(true))
    }
  }, [platform, url])

  if (!url) return null

  if (failed) {
    return <FallbackCard title={title} url={url} note="Embed script blocked — opening directly instead." />
  }

  switch (platform) {
    case 'x':
      return (
        <div ref={ref} className="embed-frame">
          <blockquote className="twitter-tweet" data-dnt="true">
            <a href={url}>{title || url}</a>
          </blockquote>
        </div>
      )
    case 'instagram':
      return (
        <div ref={ref} className="embed-frame">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{ margin: 0, maxWidth: 540, width: '100%' }}
          >
            <a href={url}>{title || url}</a>
          </blockquote>
        </div>
      )
    case 'facebook':
      return (
        <div className="embed-frame">
          <iframe
            title={title || 'Facebook post'}
            src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&width=350&show_text=true`}
            width="350"
            height="420"
            style={{ overflow: 'hidden' }}
            scrolling="no"
            allow="encrypted-media"
          />
        </div>
      )
    case 'youtube': {
      const id = youTubeId(url)
      if (!id) return <FallbackCard title={title} url={url} note="Couldn't parse a video ID from this URL." />
      return (
        <div className="embed-frame" style={{ aspectRatio: '16 / 9' }}>
          <iframe
            title={title || 'YouTube video'}
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            width="100%"
            height="100%"
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    case 'linkedin': {
      const id = linkedInActivityId(url)
      if (!id) {
        return <FallbackCard title={title} url={url} note="LinkedIn only embeds some public posts — link card shown instead." />
      }
      return (
        <div className="embed-frame">
          <iframe
            title={title || 'LinkedIn post'}
            src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${id}`}
            width="100%"
            height="480"
            allowFullScreen
          />
        </div>
      )
    }
    default:
      return <FallbackCard title={title} url={url} />
  }
}
