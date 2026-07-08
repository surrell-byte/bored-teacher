'use client';
// features/profiles/components/ProfileModal.tsx

import { useState, useEffect } from 'react';
import { useGame } from '@/providers/GameProvider';
import { auth, setDisplayName } from '@/lib/firebase';
import { AVATARS } from '@/constants/index';

const ALL_AVATARS = [...new Set(Object.values(AVATARS).flat())];
type Cat = 'all' | keyof typeof AVATARS;

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { state, setState } = useGame();

  const [name, setName]       = useState(state.name !== 'Explorer' ? state.name : '');
  const [username, setUname]  = useState(state.username || '');
  const [avatar, setAvatar]   = useState(state.avatar || '👤');
  const [cat, setCat]         = useState<Cat>('all');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, setSaving]   = useState(false);

  const avatarList = cat === 'all' ? ALL_AVATARS : (AVATARS[cat as keyof typeof AVATARS] ?? []);

  // Lock body scroll while modal is open (prevents iOS background scroll)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  async function save() {
    if (!name.trim()) { setFeedback({ ok: false, msg: 'Display name cannot be empty.' }); return; }
    if (username && !/^[a-zA-Z0-9_]{1,24}$/.test(username)) {
      setFeedback({ ok: false, msg: 'Username: letters, numbers and underscores only.' });
      return;
    }
    setSaving(true);
    setState({ name: name.trim(), username: username.replace(/^@/, ''), avatar });
    try {
      const user = auth.currentUser;
      if (user) await setDisplayName(user, name.trim());
    } catch (_) {}
    setFeedback({ ok: true, msg: '✅ Profile saved!' });
    setSaving(false);
    setTimeout(onClose, 1200);
  }

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="profileTitle"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        // Stack from top on mobile so keyboard doesn't push it off screen
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        padding: '24px 16px 40px',
        // Use dvh so iOS browser chrome is accounted for
        minHeight: '100dvh',
      }}
    >
      <div
        style={{
          background: 'var(--surface-strong)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '28px 24px 32px',
          width: '100%',
          maxWidth: 520,
          // Let the card be as tall as its content — no fixed height
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="modal-title" id="profileTitle" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            ✏️ Edit Profile
          </div>
          <button
            className="lb-modal-close"
            onClick={onClose}
            aria-label="Close profile editor"
            style={{ flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Avatar preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--surface-soft)',
            border: '2px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.6rem',
          }}>
            {avatar}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Pick an avatar below</span>
        </div>

        {/* Display Name */}
        <div style={{ marginBottom: 16 }}>
          <label className="lb-field-label" htmlFor="pName">Display Name</label>
          <input
            id="pName" className="lb-input" type="text" maxLength={32}
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name…" autoComplete="off"
          />
        </div>

        {/* Username */}
        <div style={{ marginBottom: 16 }}>
          <label className="lb-field-label" htmlFor="pUser">Username</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)', pointerEvents: 'none',
            }}>@</span>
            <input
              id="pUser" className="lb-input" type="text" maxLength={24}
              value={username} onChange={e => setUname(e.target.value)}
              placeholder="yourhandle" autoComplete="off" spellCheck={false}
              style={{ paddingLeft: 26 }}
            />
          </div>
        </div>

        {/* Avatar category tabs */}
        <div style={{ marginBottom: 20 }}>
          <label className="lb-field-label">Avatar</label>

          {/* Scrollable tab row */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 12 }}>
            <div className="avatar-cats" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', ...Object.keys(AVATARS)] as Cat[]).map(c => (
                <button
                  key={c}
                  className={`avatar-cat-btn${cat === c ? ' active' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar grid — fixed height with scroll so modal doesn't grow infinitely */}
          <div
            className="avatar-grid"
            role="group"
            aria-label="Choose an avatar"
            style={{ maxHeight: 220, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
          >
            {avatarList.map(e => (
              <button
                key={e}
                className={`avatar-option${e === avatar ? ' selected' : ''}`}
                onClick={() => setAvatar(e)}
                aria-label={`Avatar: ${e}`}
                aria-pressed={e === avatar}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Save button + feedback */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.9rem', width: 'auto', borderRadius: 999, flexShrink: 0 }}
            onClick={save}
            disabled={saving}
          >
            {saving ? '⏳ Saving…' : 'Save Changes'}
          </button>
          {feedback && (
            <span style={{
              fontSize: '0.82rem', padding: '9px 14px', borderRadius: 12, flex: 1,
              background: feedback.ok ? 'rgba(125,187,138,0.12)' : 'rgba(233,109,109,0.1)',
              border: `1px solid ${feedback.ok ? 'rgba(125,187,138,0.28)' : 'rgba(233,109,109,0.28)'}`,
              color: feedback.ok ? 'var(--green)' : 'var(--red)',
            }}>
              {feedback.msg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
