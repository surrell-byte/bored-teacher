'use client';
// app/resources/page.tsx

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';

interface Resource {
  id: string; icon: string; title: string; desc: string;
  type: 'guide' | 'tip' | 'worksheet' | 'tool';
  subject: 'English' | 'Math' | 'Science' | 'Social Studies' | 'Art & Music' | 'Life Skills';
  dateAdded: string; // ISO date
  link?: string;
}

const TYPE_META: Record<Resource['type'], { label: string; tagColor: string; action: string }> = {
  guide:     { label: 'Study Guide', tagColor: 'tag-bio',     action: 'Read Guide' },
  tip:       { label: 'Tip Sheet',   tagColor: 'tag-grammar', action: 'Read Tip' },
  worksheet: { label: 'Worksheet',   tagColor: 'tag-words',   action: 'Download PDF' },
  tool:      { label: 'Tool',        tagColor: 'tag-vocab',   action: 'Coming Soon' },
};

const SUBJECT_ICONS: Record<Resource['subject'], string> = {
  'English': '📖', 'Math': '➗', 'Science': '🔬',
  'Social Studies': '🌍', 'Art & Music': '🎨', 'Life Skills': '🌱',
};

const SUBJECTS: Resource['subject'][] = ['English', 'Math', 'Science', 'Social Studies', 'Art & Music', 'Life Skills'];

const RESOURCES: Resource[] = [
  { id: 'r1', icon: '📖', title: 'ESL Game Hub — Teacher Guide',       desc: 'Overview of every game, suggested age groups, and classroom integration tips.',                    type: 'guide',     subject: 'English',        dateAdded: '2025-04-20' },
  { id: 'r2', icon: '🗂️', title: 'Vocabulary Game Strategies',          desc: 'How to use Unicorn Trophy Run, Word Match, and Emoji Match to build core vocabulary.',          type: 'guide',     subject: 'English',        dateAdded: '2025-04-22' },
  { id: 'r3', icon: '✏️', title: 'Grammar Games in the Classroom',      desc: 'Pair Warriors Grammar Slam and Neon Bridge of Destiny with grammar lessons for maximum impact.', type: 'guide',     subject: 'English',        dateAdded: '2025-04-24' },
  { id: 'r4', icon: '🔬', title: 'Science + ESL Cross-Curricular Pack', desc: 'Lesson plans linking Animal Kingdom Quest, Ocean Quest and Animal Class Quest to science units.', type: 'guide',     subject: 'Science',        dateAdded: '2025-04-26' },
  { id: 'r5', icon: '🔤', title: 'Phonics Integration Guide',           desc: 'Use Phonics Adventure and Phonics World as warm-up activities aligned to phonics stages.',     type: 'guide',     subject: 'English',        dateAdded: '2025-04-28' },
  { id: 't1', icon: '💡', title: 'Setting Up the Leaderboard',          desc: 'Import your class list, assign students to accounts, and sync scores automatically.',          type: 'tip',       subject: 'Life Skills',    dateAdded: '2025-04-30' },
  { id: 't2', icon: '🏆', title: 'Running a Games Tournament',          desc: 'Step-by-step guide to hosting a 30-minute in-class games tournament using the Hub.',          type: 'tip',       subject: 'Life Skills',    dateAdded: '2025-05-01' },
  { id: 't3', icon: '📊', title: 'Reading Trophy Room Data',            desc: 'How to interpret badge progress to identify struggling vs. advanced learners.',               type: 'tip',       subject: 'Life Skills',    dateAdded: '2025-05-02' },
  { id: 't4', icon: '🎯', title: 'Differentiation with Games',          desc: 'Assign Starter games to beginners and Competitive games to advanced students at once.',        type: 'tip',       subject: 'Life Skills',    dateAdded: '2025-05-03' },
  { id: 'w1', icon: '📄', title: 'Compound Word Worksheet (Printable)', desc: 'Supports Compound Word Quest — 20 compound word pairs for student practice.',                 type: 'worksheet', subject: 'English',        dateAdded: '2025-05-04' },
  { id: 'w2', icon: '📄', title: 'Farm Animal Vocabulary Sheet',        desc: 'Pre-teach animal vocabulary before students play Farm Game.',                                  type: 'worksheet', subject: 'Science',        dateAdded: '2025-05-05' },
  { id: 'w3', icon: '📄', title: 'Flags of the World — Reference Card',desc: 'A printable cheat-sheet to scaffold students before Flagmaster.',                              type: 'worksheet', subject: 'Social Studies', dateAdded: '2025-05-06' },
  { id: 'w4', icon: '📄', title: 'Ocean Creature Classification Grid',  desc: 'Supports Ocean Quest and Deep Sea Reveal — classify 24 sea creatures by type.',                type: 'worksheet', subject: 'Science',        dateAdded: '2025-05-07' },
  { id: 'c1', icon: '🛠️', title: 'Custom Word List Builder',            desc: 'Paste in any word list and the hub will generate a matching Word Match game (coming soon).', type: 'tool',      subject: 'English',        dateAdded: '2025-05-08' },
  { id: 'c2', icon: '📥', title: 'Export Leaderboard to CSV',           desc: 'Download your class leaderboard as a spreadsheet to share with parents or admin.',           type: 'tool',      subject: 'Life Skills',    dateAdded: '2025-05-09' },
];

const FEATURED_IDS = ['r1', 't2', 'w3', 'w4'];

const FORMAT_OPTIONS: Array<{ label: string; value: 'All' | Resource['type'] }> = [
  { label: 'All Formats', value: 'All' },
  { label: 'Study Guide', value: 'guide' },
  { label: 'Tip Sheet',   value: 'tip' },
  { label: 'Worksheet',   value: 'worksheet' },
  { label: 'Tool',        value: 'tool' },
];

const SORT_OPTIONS = [
  { label: 'Sort: Newest', value: 'newest' },
  { label: 'Sort: A–Z',    value: 'alpha' },
];

export default function ResourcesPage() {
  const router = useRouter();
  const [ready,   setReady]   = useState(false);
  const [search,  setSearch]  = useState('');
  const [subject, setSubject] = useState<'All' | Resource['subject']>('All');
  const [format,  setFormat]  = useState<'All' | Resource['type']>('All');
  const [sort,    setSort]    = useState('newest');

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) { setReady(true); return; }
    const unsub = onAuthStateChanged(user => {
      if (!user) { router.replace('/auth'); return; }
      setReady(true);
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of SUBJECTS) counts[s] = RESOURCES.filter(r => r.subject === s).length;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = RESOURCES.filter(r => {
      const matchSubject = subject === 'All' || r.subject === subject;
      const matchFormat  = format === 'All' || r.type === format;
      const matchQ = !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
      return matchSubject && matchFormat && matchQ;
    });
    list = sort === 'alpha'
      ? [...list].sort((a, b) => a.title.localeCompare(b.title))
      : [...list].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    return list;
  }, [search, subject, format, sort]);

  const recentlyAdded = useMemo(
    () => [...RESOURCES].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 6),
    []
  );
  const newestForSidebar = recentlyAdded.slice(0, 3);
  const featured = FEATURED_IDS.map(id => RESOURCES.find(r => r.id === id)!).filter(Boolean);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(14px,3vw,28px) clamp(14px,3vw,24px) 80px' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="shell-card resources-hero" style={{ padding: 'clamp(20px, 4vw, 40px)', marginBottom: 24, borderRadius: 32 }}>
        <div>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 8 }}>
            📚 Teaching Resources
          </div>
          <h1 style={{ fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>
            Resource Library
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.94rem', maxWidth: '50ch', lineHeight: 1.7 }}>
            Tools, worksheets, and guides to support your learning.
          </p>
        </div>
        <div className="resources-checklist">
          <div className="resources-checklist-title">What you&apos;ll find here</div>
          {[
            ['✅', 'Practice worksheets'],
            ['✅', 'Study guides'],
            ['✅', 'Tips & strategies'],
            ['✅', 'Downloadable tools'],
          ].map(([mark, label]) => (
            <div key={label} className="resources-checklist-row">{mark} {label}</div>
          ))}
        </div>
      </div>

      <div className="resources-layout">
        <div>
          {/* ── Search + filters ─────────────────────────── */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <div className="hub-search" style={{ flex: '1 1 220px' }}>
              <span className="hub-search-icon">🔍</span>
              <input
                type="search" className="hub-search-input" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search resources…"
              />
            </div>
            <select className="games-select" value={format} onChange={e => setFormat(e.target.value as 'All' | Resource['type'])}>
              {FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="games-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* ── Subject pills ────────────────────────────── */}
          <div className="resources-subject-row">
            <button className={`resources-subject-pill${subject === 'All' ? ' active' : ''}`} onClick={() => setSubject('All')}>
              All Resources
            </button>
            {SUBJECTS.map(s => (
              <button
                key={s}
                className={`resources-subject-pill${subject === s ? ' active' : ''}`}
                onClick={() => setSubject(s)}
              >
                {SUBJECT_ICONS[s]} {s} <span className="resources-subject-count">{subjectCounts[s]}</span>
              </button>
            ))}
          </div>

          {/* ── Featured Resources ───────────────────────── */}
          {subject === 'All' && format === 'All' && !search && (
            <section className="hub-section">
              <h2 className="hub-section-title">Featured Resources</h2>
              <div className="hub-featured-grid">
                {featured.map(r => (
                  <div key={r.id} className="shell-card resource-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: '1.8rem' }}>{r.icon}</span>
                      <span className={`card-tag ${TYPE_META[r.type].tagColor}`} style={{ fontSize: '0.66rem', padding: '3px 10px' }}>{TYPE_META[r.type].label}</span>
                    </div>
                    <div className="resource-card-title">{r.title}</div>
                    <div className="resource-card-desc" style={{ marginBottom: 10 }}>{r.desc}</div>
                    <button className="pill-btn" style={{ fontSize: '0.78rem', width: '100%', justifyContent: 'center' }} disabled={r.type === 'tool'}>
                      {TYPE_META[r.type].action}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Recently Added ───────────────────────────── */}
          {subject === 'All' && format === 'All' && !search && (
            <section className="hub-section">
              <h2 className="hub-section-title">Recently Added</h2>
              <div className="resources-recent-grid">
                {recentlyAdded.map(r => (
                  <div key={r.id} className="resources-recent-row">
                    <span className="resources-recent-icon">{r.icon}</span>
                    <div className="resources-recent-info">
                      <div className="resources-recent-title">{r.title}</div>
                      <div className="resources-recent-meta">{TYPE_META[r.type].label} · {r.subject}</div>
                    </div>
                    <span className="resources-recent-date">{formatDate(r.dateAdded)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── All results (shown when filtering/searching) ── */}
          {(subject !== 'All' || format !== 'All' || !!search) && (
            <section className="hub-section">
              <h2 className="hub-section-title">
                {filtered.length} Result{filtered.length === 1 ? '' : 's'}
              </h2>
              {filtered.length === 0 ? (
                <div className="shell-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>🔍</div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>No results found</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>Try a different search term, subject, or format.</div>
                  <button className="pill-btn" onClick={() => { setSearch(''); setSubject('All'); setFormat('All'); }} style={{ marginTop: 16 }}>Clear filters</button>
                </div>
              ) : (
                <div className="hub-featured-grid">
                  {filtered.map(r => (
                    <div key={r.id} className="shell-card resource-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{ fontSize: '1.8rem' }}>{r.icon}</span>
                        <span className={`card-tag ${TYPE_META[r.type].tagColor}`} style={{ fontSize: '0.66rem', padding: '3px 10px' }}>{TYPE_META[r.type].label}</span>
                      </div>
                      <div className="resource-card-title">{r.title}</div>
                      <div className="resource-card-desc" style={{ marginBottom: 10 }}>{r.desc}</div>
                      <button className="pill-btn" style={{ fontSize: '0.78rem', width: '100%', justifyContent: 'center' }} disabled={r.type === 'tool'}>
                        {TYPE_META[r.type].action}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside>
          <div className="shell-card" style={{ padding: 20, borderRadius: 20, marginBottom: 16 }}>
            <div className="hub-section-title" style={{ fontSize: '0.9rem', marginBottom: 14 }}>Resource Library Stats</div>
            <div className="resources-stats-grid">
              <div>
                <div className="hero-stat-val" style={{ color: 'var(--gold)' }}>{RESOURCES.length}</div>
                <div className="hero-stat-lbl">Total Resources</div>
              </div>
              <div>
                <div className="hero-stat-val" style={{ color: 'var(--teal)' }}>{SUBJECTS.length}</div>
                <div className="hero-stat-lbl">Subjects</div>
              </div>
              <div>
                <div className="hero-stat-val" style={{ color: 'var(--green)' }}>{Object.keys(TYPE_META).length}</div>
                <div className="hero-stat-lbl">Formats</div>
              </div>
              <div>
                <div className="hero-stat-val" style={{ color: 'var(--coral)' }}>{SUBJECTS.filter(s => subjectCounts[s] > 0).length}</div>
                <div className="hero-stat-lbl">Active Subjects</div>
              </div>
            </div>
          </div>

          <div className="shell-card" style={{ padding: 20, borderRadius: 20 }}>
            <div className="hub-section-title" style={{ fontSize: '0.9rem', marginBottom: 14 }}>Newest Resources</div>
            {newestForSidebar.map((r, i) => (
              <div key={r.id} className="resources-newest-row">
                <span className="resources-newest-rank">{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="resources-newest-title">{r.title}</div>
                  <div className="resources-newest-date">{formatDate(r.dateAdded)}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

