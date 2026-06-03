'use client';
// app/resources/page.tsx

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';

interface Resource {
  id: string; icon: string; title: string; desc: string;
  tag: string; tagColor: string; link?: string;
  type: 'guide' | 'video' | 'worksheet' | 'tool' | 'tip';
}

const RESOURCES: Resource[] = [
  { id: 'r1', icon: '📖', title: 'ESL Game Hub — Teacher Guide',         desc: 'Overview of every game, suggested age groups, and classroom integration tips.',                        tag: 'Guide',     tagColor: 'tag-bio',     type: 'guide' },
  { id: 'r2', icon: '🗂️', title: 'Vocabulary Game Strategies',            desc: 'How to use Unicorn Trophy Run, Word Match, and Emoji Match to build core vocabulary.',              tag: 'Vocab',     tagColor: 'tag-vocab',   type: 'guide' },
  { id: 'r3', icon: '✏️', title: 'Grammar Games in the Classroom',        desc: 'Pair Warriors Grammar Slam and Neon Bridge of Destiny with grammar lessons for maximum impact.',      tag: 'Grammar',   tagColor: 'tag-grammar', type: 'guide' },
  { id: 'r4', icon: '🔬', title: 'Science + ESL Cross-Curricular Pack',   desc: 'Lesson plans linking Animal Kingdom Quest, Ocean Quest and Animal Class Quest to science units.',    tag: 'Science',   tagColor: 'tag-bio',     type: 'guide' },
  { id: 'r5', icon: '🔤', title: 'Phonics Integration Guide',             desc: 'Use Phonics Adventure and Phonics World as warm-up activities aligned to phonics programme stages.', tag: 'Phonics',   tagColor: 'tag-words',   type: 'guide' },
  { id: 't1', icon: '💡', title: 'Setting Up the Leaderboard',            desc: 'Import your class list, assign students to accounts, and sync scores automatically.',               tag: 'Tip',       tagColor: 'tag-grammar', type: 'tip' },
  { id: 't2', icon: '🏆', title: 'Running a Games Tournament',            desc: 'Step-by-step guide to hosting a 30-minute in-class games tournament using the Hub.',               tag: 'Tip',       tagColor: 'tag-grammar', type: 'tip' },
  { id: 't3', icon: '📊', title: 'Reading Trophy Room Data',              desc: 'How to interpret badge progress and tier levels to identify struggling vs. advanced learners.',      tag: 'Tip',       tagColor: 'tag-grammar', type: 'tip' },
  { id: 't4', icon: '🎯', title: 'Differentiation with Games',            desc: 'Assign Starter games to beginners and Competitive games to advanced students simultaneously.',       tag: 'Tip',       tagColor: 'tag-grammar', type: 'tip' },
  { id: 'w1', icon: '📄', title: 'Compound Word Worksheet (Printable)',   desc: 'Supports Compound Word Quest — 20 compound word pairs for student practice.',                      tag: 'Worksheet', tagColor: 'tag-words',   type: 'worksheet' },
  { id: 'w2', icon: '📄', title: 'Farm Animal Vocabulary Sheet',          desc: 'Pre-teach vocabulary before students play Farm Animal Quiz and Farm Game.',                         tag: 'Worksheet', tagColor: 'tag-vocab',   type: 'worksheet' },
  { id: 'w3', icon: '📄', title: 'Flags of the World — Reference Card',   desc: 'A printable cheat-sheet to scaffold students before Flagmaster.',                                  tag: 'Worksheet', tagColor: 'tag-bio',     type: 'worksheet' },
  { id: 'w4', icon: '📄', title: 'Ocean Creature Classification Grid',    desc: 'Supports Ocean Quest and Deep Sea Reveal — classify 24 sea creatures by type.',                    tag: 'Worksheet', tagColor: 'tag-bio',     type: 'worksheet' },
  { id: 'c1', icon: '🛠️', title: 'Custom Word List Builder',             desc: 'Paste in any word list and the hub will generate a matching Word Match game (coming soon).',       tag: 'Tool',      tagColor: 'tag-vocab',   type: 'tool' },
  { id: 'c2', icon: '📥', title: 'Export Leaderboard to CSV',             desc: 'Download your class leaderboard as a spreadsheet to share with parents or administration.',        tag: 'Tool',      tagColor: 'tag-grammar', type: 'tool' },
];

const TAGS = ['All', 'Guide', 'Tip', 'Worksheet', 'Tool', 'Vocab', 'Grammar', 'Science', 'Phonics', 'Words'];

export default function ResourcesPage() {
  const router = useRouter();
  const [ready,  setReady]  = useState(false);
  const [search, setSearch] = useState('');
  const [tag,    setTag]    = useState('All');

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return RESOURCES.filter(r => {
      const matchTag = tag === 'All' || r.tag === tag;
      const matchQ   = !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
      return matchTag && matchQ;
    });
  }, [search, tag]);

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(14px,3vw,28px) clamp(14px,3vw,24px) 80px' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="shell-card" style={{ padding: 'clamp(20px, 4vw, 40px)', marginBottom: 24, borderRadius: 32 }}>
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 8 }}>
          📚 Teaching Resources
        </div>
        <h1 style={{ fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>
          Resource Library
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.94rem', maxWidth: '50ch', lineHeight: 1.7 }}>
          Lesson guides, worksheets, tips, and classroom tools to help you get the most from ESL Game Hub.
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            ['📖', RESOURCES.filter(r => r.type === 'guide').length,     'Guides'],
            ['💡', RESOURCES.filter(r => r.type === 'tip').length,       'Tips'],
            ['📄', RESOURCES.filter(r => r.type === 'worksheet').length, 'Worksheets'],
            ['🛠️', RESOURCES.filter(r => r.type === 'tool').length,      'Tools'],
          ].map(([icon, count, label]) => (
            <div key={label as string}>
              <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--gold)', lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 3 }}>{icon} {label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter bar ────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>🔍</span>
          <input
            type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search resources…"
            style={{
              width: '100%', padding: '11px 16px 11px 40px',
              borderRadius: 999, border: '1px solid var(--border)',
              background: 'var(--surface-strong)', color: 'var(--text)',
              fontFamily: 'var(--font-body, DM Sans)', fontSize: '0.88rem', outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TAGS.map(t => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`pill-btn${tag === t ? ' active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Resource grid ─────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No results found</div>
          <div style={{ fontSize: '0.88rem' }}>Try a different search term or tag.</div>
          <button className="pill-btn" onClick={() => { setSearch(''); setTag('All'); }} style={{ marginTop: 16 }}>Clear filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} className="shell-card" style={{ padding: 'clamp(14px, 2vw, 20px)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.8rem' }}>{r.icon}</span>
                <span className={`card-tag ${r.tagColor}`} style={{ fontSize: '0.68rem', padding: '3px 10px' }}>{r.tag}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.93rem', lineHeight: 1.4 }} className="resource-card-title">{r.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, flex: 1 }} className="resource-card-desc">{r.desc}</div>
              {r.link ? (
                <a href={r.link} target="_blank" rel="noreferrer" className="pill-btn" style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.8rem' }}>
                  Open →
                </a>
              ) : (
                <button
                  className="pill-btn"
                  style={{ fontSize: '0.8rem', opacity: r.type === 'tool' ? 0.6 : 1, cursor: r.type === 'tool' ? 'not-allowed' : 'default' }}
                  disabled={r.type === 'tool'}
                >
                  {r.type === 'tool' ? 'Coming Soon' : r.type === 'worksheet' ? 'Download PDF' : 'Read Guide'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}