export const PLATFORMS = [
  {
    id: 'x',
    name: 'X',
    short: 'X',
    color: '#16140F',
    limit: 280,
    limitLabel: '280 chars',
    profileUrl: (h) => `https://x.com/${h}`,
    hint: 'Punchy, one idea per post. Threads for depth. Best: weekday mornings 9–11am.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    short: 'Li',
    color: '#0A66C2',
    limit: 3000,
    limitLabel: '3,000 chars',
    profileUrl: (h) => `https://www.linkedin.com/in/${h}`,
    hint: 'First 2 lines decide the click-through. Professional insight + personal angle. Best: Tue–Thu 8–10am.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    short: 'Ig',
    color: '#D6336C',
    limit: 2200,
    limitLabel: '2,200 chars',
    profileUrl: (h) => `https://www.instagram.com/${h}`,
    hint: 'Visual-first — caption supports the image/reel. 3–5 focused hashtags. Best: 11am–1pm or 7–9pm.',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    short: 'Fb',
    color: '#1877F2',
    limit: 2000,
    limitLabel: '~2,000 chars practical',
    profileUrl: (h) => `https://www.facebook.com/${h}`,
    hint: 'Conversational tone, questions drive comments. Best: 1–3pm.',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    short: 'Yt',
    color: '#E03131',
    limit: 5000,
    limitLabel: '5,000 chars (description)',
    profileUrl: (h) => `https://www.youtube.com/@${h}`,
    hint: 'Title ≤ 60 chars, front-load keywords. Description: hook in first 2 lines, then chapters & links.',
  },
]

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]))

export const PILLARS = [
  { id: 'ai', name: 'AI', color: '#3B5BDB', soft: '#E7ECFB' },
  { id: 'highered', name: 'AI in Higher Ed & Libraries', color: '#2B8A3E', soft: '#E3F1E6' },
  { id: 'creativity', name: 'Creativity & Productivity', color: '#D9750B', soft: '#FBEFDD' },
]

export const PILLAR_MAP = Object.fromEntries(PILLARS.map((p) => [p.id, p]))

export const STATUSES = [
  { id: 'idea', name: 'Idea', color: '#8A857A' },
  { id: 'drafted', name: 'Drafted', color: '#D9750B' },
  { id: 'scheduled', name: 'Scheduled', color: '#3B5BDB' },
  { id: 'published', name: 'Published', color: '#2B8A3E' },
]

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.id, s]))

export const IDEA_COLUMNS = [
  { id: 'spark', name: 'Sparks', blurb: 'Raw concepts, captured fast' },
  { id: 'developing', name: 'Developing', blurb: 'Being researched & shaped' },
  { id: 'ready', name: 'Ready to draft', blurb: 'Promote these into posts' },
]

// Metric fields tracked per platform in weekly snapshots
export const METRIC_FIELDS = {
  x: { primary: 'followers', label: 'Followers' },
  linkedin: { primary: 'followers', label: 'Followers' },
  instagram: { primary: 'followers', label: 'Followers' },
  facebook: { primary: 'followers', label: 'Followers' },
  youtube: { primary: 'subscribers', label: 'Subscribers' },
}
