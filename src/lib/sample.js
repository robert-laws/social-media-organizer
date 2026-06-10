import { uid, todayISO, addDays } from './util'

// Seed data so the app feels alive before real content exists.
export function buildSampleData() {
  const t = todayISO()
  return {
    posts: [
      {
        id: uid('p'),
        title: 'Why every librarian should try NotebookLM-style tools',
        pillar: 'highered',
        status: 'published',
        date: addDays(t, -6),
        time: '09:00',
        platforms: ['linkedin', 'x'],
        body: 'AI research assistants are changing how patrons interact with collections. Three ways libraries can pilot them responsibly…',
        variants: {
          linkedin: { text: 'AI research assistants are changing how patrons interact with collections.\n\nHere are three ways libraries can pilot them responsibly — without compromising privacy or information literacy. 🧵\n\n1. Start with public-domain collections…', url: '' },
          x: { text: 'AI research assistants are quietly reshaping library reference work. 3 ways to pilot them responsibly (a thread) 👇', url: '' },
        },
        notes: 'Repurpose into a YouTube explainer later.',
        tags: ['libraries', 'tools'],
      },
      {
        id: uid('p'),
        title: 'My 5-step AI-assisted writing workflow',
        pillar: 'creativity',
        status: 'scheduled',
        date: addDays(t, 2),
        time: '10:30',
        platforms: ['linkedin', 'instagram'],
        body: 'The workflow I use to go from rough idea to polished draft in 45 minutes, with AI as the editor — not the author.',
        variants: {
          linkedin: { text: 'I write everything in 45 minutes now.\n\nNot because I type faster — because I changed the order of operations. My 5-step AI-assisted workflow:', url: '' },
          instagram: { text: 'From rough idea → polished draft in 45 min ✍️\nThe 5-step workflow (save this) ↓', url: '' },
        },
        notes: '',
        tags: ['workflow'],
      },
      {
        id: uid('p'),
        title: 'What faculty get wrong about AI detectors',
        pillar: 'highered',
        status: 'drafted',
        date: addDays(t, 5),
        time: '09:00',
        platforms: ['linkedin', 'x', 'facebook'],
        body: 'False positives hurt real students. The evidence on AI detection accuracy, and what to do instead.',
        variants: {},
        notes: 'Cite the 2025 studies. Keep tone constructive, not scolding.',
        tags: ['teaching', 'assessment'],
      },
      {
        id: uid('p'),
        title: 'Claude vs ChatGPT for literature reviews — honest comparison',
        pillar: 'ai',
        status: 'idea',
        date: addDays(t, 9),
        time: '',
        platforms: ['youtube'],
        body: '',
        variants: {},
        notes: 'Could be first long-form video. Screen recording + talking head.',
        tags: ['video'],
      },
    ],
    ideas: [
      { id: uid('i'), title: 'Prompt patterns every academic should know', pillar: 'ai', column: 'ready', notes: 'Carousel format? 8 patterns max.' },
      { id: uid('i'), title: 'AI office hours: what students actually ask', pillar: 'highered', column: 'developing', notes: 'Collect anonymized questions first.' },
      { id: uid('i'), title: 'A week of planning my content with AI (meta post)', pillar: 'creativity', column: 'developing', notes: '' },
      { id: uid('i'), title: 'Library guide to evaluating AI search tools', pillar: 'highered', column: 'spark', notes: '' },
      { id: uid('i'), title: 'The 80/20 of AI productivity for busy professionals', pillar: 'creativity', column: 'spark', notes: '' },
    ],
    metrics: {
      snapshots: [-28, -21, -14, -7, 0].map((offset, i) => ({
        date: addDays(t, offset),
        x: { followers: 410 + i * 14 },
        linkedin: { followers: 1280 + i * 36 },
        instagram: { followers: 530 + i * 9 },
        facebook: { followers: 615 + i * 4 },
        youtube: { subscribers: 92 + i * 6, views: 4100 + i * 420 },
      })),
    },
  }
}
