'use client';
// features/players/components/ManagePlayersModal.tsx

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/lib/gameState';
import { auth } from '@/lib/firebase';
import {
  loadLeaderboard, saveLeaderboard, addPlayersToLeaderboard, removePlayer,
  clearLeaderboard, parseCSVToNames, getSortedLeaderboard,
  type LBPlayerWithScore,
} from '@/features/leaderboard/api';

// Optional: Firestore sync for leaderboard (teacher-level)
async function syncToFirestore(uid: string) {
  try {
    const { saveLeaderboardState } = await import('@/lib/firebase');
    const lb = loadLeaderboard();
    await saveLeaderboardState(uid, lb);
  } catch (_) {}
}

interface Props { onClose: () => void; }

export default function ManagePlayersModal({ onClose }: Props) {
  const { showToast } = useGame();

  const [players,   setPlayers]   = useState<LBPlayerWithScore[]>([]);
  const [rawNames,  setRawNames]  = useState('');
  const [tab,       setTab]       = useState<'add' | 'list' | 'import'>('list');
  const [search,    setSearch]    = useState('');
  const [saving,    setSaving]    = useState(false);
  const [confirm,   setConfirm]   = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPlayers(getSortedLeaderboard());
  }, []);

  function reload() { setPlayers(getSortedLeaderboard()); }

  async function handleAdd() {
    if (!rawNames.trim()) return;
    const names = rawNames.split('\n').map(n => n.trim()).filter(Boolean);
    const added = addPlayersToLeaderboard(names);
    reload();
    setRawNames('');
    showToast(added > 0 ? `✅ Added ${added} player${added > 1 ? 's' : ''}.` : '⚠️ All names already exist.');
    await maybeSyncFirestore();
  }

  async function handleRemove(id: string, name: string) {
    removePlayer(id);
    reload();
    showToast(`🗑️ Removed ${name}.`);
    await maybeSyncFirestore();
  }

  async function handleClear() {
    if (!confirm) { setConfirm(true); return; }
    clearLeaderboard();
    reload();
    setConfirm(false);
    showToast('🗑️ Leaderboard cleared.');
    await maybeSyncFirestore();
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const names = parseCSVToNames(text);
    if (names.length === 0) { showToast('⚠️ No names found in CSV.'); return; }
    const added = addPlayersToLeaderboard(names);
    reload();
    showToast(`✅ Imported ${added} player${added !== 1 ? 's' : ''} from CSV.`);
    await maybeSyncFirestore();
    e.target.value = '';
  }

  function handleExportCSV() {
    const rows = ['Name,Total Score,Games Played,Avg %', ...players.map(p =>
      `"${p.name}",${p.score.total},${p.score.gamesPlayed},${p.score.avg}%`
    )];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'leaderboard.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  async function maybeSyncFirestore() {
    const uid = auth.currentUser?.uid;
    if (uid) await syncToFirestore(uid);
  }

  const filtered = search
    ? players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : players;

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal aria-labelledby="mpTitle">
      <div className="modal modal-animated" style={{
        maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'thin',
        width: 'min(96vw, 580px)', padding: 0,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="modal-title" id="mpTitle">👥 Manage Players</div>
          <button className="lb-modal-close" onClick={onClose} aria-label="Close player manager">✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 24px', borderBottom: '1px solid var(--border)' }}>
          {([['list', `📋 Class (${players.length})`], ['add', '➕ Add'], ['import', '📥 Import / Export']] as const).map(([t, label]) => (
            <button
              key={t}
              className={`lb-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
              style={{ fontSize: '0.76rem' }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px' }}>

          {/* ── LIST TAB ─────────────────────────────── */}
          {tab === 'list' && (
            <>
              {players.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎒</div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>No players yet</div>
                  <div style={{ fontSize: '0.82rem' }}>Use the Add or Import tabs to build your class list.</div>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <input
                    type="search"
                    className="lb-input"
                    placeholder="Search players…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ marginBottom: 12 }}
                  />

                  {/* Player list */}
                  <div style={{ maxHeight: 320, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {filtered.map((p, i) => (
                      <div key={p.id} className="mp-player-row">
                        <span style={{ color: 'var(--muted)', fontSize: '0.72rem', width: 22, flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span className="mp-player-name">{p.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontFamily: 'var(--font-display, Syne)', fontWeight: 800, marginRight: 10 }}>
                          {p.score.total > 0 ? `${p.score.total}pts` : '—'}
                        </span>
                        <button
                          className="mp-remove-btn"
                          onClick={() => handleRemove(p.id, p.name)}
                          title={`Remove ${p.name}`}
                        >✕</button>
                      </div>
                    ))}
                  </div>

                  {filtered.length === 0 && search && (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: '0.84rem' }}>
                      No players match "{search}"
                    </div>
                  )}

                  {/* Clear all */}
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="pill-btn"
                      onClick={handleClear}
                      style={{ fontSize: '0.74rem', color: confirm ? 'var(--red)' : undefined, borderColor: confirm ? 'var(--red)' : undefined }}
                    >
                      {confirm ? '⚠️ Confirm clear all' : '🗑️ Clear all players'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── ADD TAB ──────────────────────────────── */}
          {tab === 'add' && (
            <>
              <label className="lb-field-label" htmlFor="mpNames">
                Player Names (one per line)
              </label>
              <textarea
                id="mpNames"
                ref={textareaRef}
                className="lb-input"
                rows={8}
                placeholder={"Alice\nBob\nCharlie\n..."}
                value={rawNames}
                onChange={e => setRawNames(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'var(--font-body, DM Sans)' }}
              />
              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '12px 28px', width: 'auto', borderRadius: 999, fontSize: '0.86rem' }}
                  onClick={handleAdd}
                  disabled={!rawNames.trim()}
                >
                  ➕ Add to Class
                </button>
                <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                  Duplicates are skipped automatically.
                </span>
              </div>
            </>
          )}

          {/* ── IMPORT / EXPORT TAB ───────────────────── */}
          {tab === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* CSV Import */}
              <div className="mp-section">
                <div className="mp-section-title">Import from CSV</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 14 }}>
                  Upload a spreadsheet CSV. Player names are read from the first column.
                  Duplicates are skipped. Format: one name per row (with or without a header).
                </p>
                <label
                  htmlFor="csvUpload"
                  className="btn-primary"
                  style={{ display: 'inline-block', cursor: 'pointer', borderRadius: 12, textAlign: 'center', padding: '11px 22px', fontSize: '0.84rem', width: 'auto' }}
                >
                  📂 Choose CSV file
                  <input
                    id="csvUpload"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCSVImport}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Export */}
              <div className="mp-section">
                <div className="mp-section-title">Export Leaderboard</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 14 }}>
                  Download the current leaderboard as a CSV file — useful for sharing with parents or admin.
                </p>
                <button
                  className="pill-btn"
                  onClick={handleExportCSV}
                  disabled={players.length === 0}
                  style={{ opacity: players.length === 0 ? 0.5 : 1 }}
                >
                  📥 Export CSV ({players.length} players)
                </button>
              </div>

              {/* Sync note */}
              <div style={{ padding: '14px', borderRadius: 12, background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.76rem', color: 'var(--muted)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--text)' }}>ℹ️ Sync note:</strong> Your player list saves locally on this device.
                Signed-in teachers also get automatic cloud backup — your list will be restored on any device.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
