import React from 'react'

// Hand-drawn editorial spot illustrations — pure SVG, ink-and-paper style.

export function PillarArt({ id, size = 72 }) {
  const art = {
    ai: (
      <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r="42" fill="#E7ECFB" />
        {/* neural lattice */}
        <g stroke="#3B5BDB" strokeWidth="1.6" fill="none" opacity="0.85">
          <line x1="30" y1="38" x2="48" y2="27" />
          <line x1="48" y1="27" x2="66" y2="40" />
          <line x1="30" y1="38" x2="40" y2="58" />
          <line x1="66" y1="40" x2="58" y2="57" />
          <line x1="40" y1="58" x2="58" y2="57" />
          <line x1="40" y1="58" x2="48" y2="73" />
          <line x1="58" y1="57" x2="48" y2="73" />
          <line x1="30" y1="38" x2="58" y2="57" />
          <line x1="48" y1="27" x2="40" y2="58" />
        </g>
        <g fill="#3B5BDB">
          <circle cx="48" cy="27" r="5" />
          <circle cx="30" cy="38" r="4.5" />
          <circle cx="66" cy="40" r="4.5" />
          <circle cx="40" cy="58" r="4" />
          <circle cx="58" cy="57" r="4" />
          <circle cx="48" cy="73" r="5" />
        </g>
        <circle cx="48" cy="27" r="2" fill="#E7ECFB" />
        <circle cx="48" cy="73" r="2" fill="#E7ECFB" />
      </svg>
    ),
    highered: (
      <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r="42" fill="#E3F1E6" />
        {/* open book */}
        <g stroke="#2B8A3E" strokeWidth="2" fill="#FFFEFB" strokeLinejoin="round">
          <path d="M26 62 Q37 54 48 60 Q59 54 70 62 L70 66 Q59 58 48 64 Q37 58 26 66 Z" />
          <path d="M26 62 Q37 54 48 60 L48 64" fill="none" />
        </g>
        <g stroke="#2B8A3E" strokeWidth="1.2" fill="none" opacity="0.7">
          <path d="M31 59 Q38 55 44 58" />
          <path d="M52 58 Q58 55 65 59" />
        </g>
        {/* graduation cap */}
        <g>
          <polygon points="48,28 68,36 48,44 28,36" fill="#2B8A3E" />
          <rect x="44" y="40" width="8" height="5" rx="1" fill="#2B8A3E" />
          <line x1="64" y1="38" x2="64" y2="48" stroke="#2B8A3E" strokeWidth="1.6" />
          <circle cx="64" cy="50" r="2" fill="#D9750B" />
        </g>
      </svg>
    ),
    creativity: (
      <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r="42" fill="#FBEFDD" />
        {/* bulb */}
        <circle cx="48" cy="42" r="14" fill="#FFFEFB" stroke="#D9750B" strokeWidth="2" />
        <path d="M44 48 Q48 42 46 38 M52 48 Q48 44 50 38" stroke="#D9750B" strokeWidth="1.5" fill="none" />
        <rect x="43" y="56" width="10" height="3" rx="1.5" fill="#D9750B" />
        <rect x="44" y="61" width="8" height="3" rx="1.5" fill="#D9750B" opacity="0.7" />
        {/* rays */}
        <g stroke="#D9750B" strokeWidth="1.8" strokeLinecap="round">
          <line x1="48" y1="20" x2="48" y2="14" />
          <line x1="66" y1="28" x2="70" y2="24" />
          <line x1="30" y1="28" x2="26" y2="24" />
          <line x1="70" y1="44" x2="76" y2="44" />
          <line x1="26" y1="44" x2="20" y2="44" />
        </g>
        {/* spark */}
        <path d="M68 62 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#D9750B" opacity="0.85" />
      </svg>
    ),
  }
  return art[id] || null
}

export function EmptyArt({ width = 150 }) {
  // a quiet desk: sheet of paper, pencil, coffee
  return (
    <svg width={width} viewBox="0 0 150 92" aria-hidden="true" style={{ display: 'block', margin: '0 auto 10px' }}>
      <g stroke="var(--ink-3)" strokeWidth="1.6" fill="none" strokeLinecap="round">
        {/* desk */}
        <line x1="10" y1="76" x2="140" y2="76" />
        {/* paper */}
        <path d="M44 76 L50 32 L92 32 L86 76 Z" fill="var(--card)" />
        <line x1="55" y1="42" x2="84" y2="42" opacity="0.6" />
        <line x1="54" y1="50" x2="83" y2="50" opacity="0.6" />
        <line x1="53" y1="58" x2="76" y2="58" opacity="0.6" />
        {/* coffee */}
        <path d="M108 58 L112 76 L126 76 L130 58 Z" fill="var(--card)" />
        <path d="M130 61 Q137 62 134 68 Q132 71 129 70" />
        <path d="M115 50 Q113 46 116 43 M122 50 Q120 46 123 43" opacity="0.65" />
      </g>
      {/* pencil */}
      <g transform="rotate(24 30 60)">
        <rect x="16" y="56" width="26" height="5" rx="1" fill="var(--accent)" opacity="0.9" />
        <polygon points="42,56 48,58.5 42,61" fill="var(--ink-2)" />
        <rect x="13" y="56" width="4" height="5" fill="var(--ink-3)" />
      </g>
    </svg>
  )
}
