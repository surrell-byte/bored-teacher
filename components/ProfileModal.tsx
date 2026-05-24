'use client';
// components/ProfileModal.tsx

import { useState } from 'react';
import { useGame } from '@/lib/gameState';
import { auth, setDisplayName } from '@/lib/firebase';
import { AVATARS } from '@/lib/constants';

const ALL_AVATARS = [...new Set(Object.values(AVATARS).flat())];
type Cat = 'all' | keyof typeof AVATARS;

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { state, setState, showToast } = useGame();

  const [name, setName]       = useState(state.name !== 'Explorer' ? state.name : '');
  const [username, setUname]  = useState(state.username || '');
  const [avatar, setAvatar]   = useState(state.avatar || '👤');
  const [cat, setCat]         = useState<Cat>('all');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, setSaving]   = useState(false);

  const avatarList = cat === 'all' ? ALL_AVATARS : (AVATARS[cat as keyof typeof AVATARS] ?? []);

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
      if (user) {
        await setDisplayName(user, name.trim());
      }
    } catch (_) {}
    setFeedback({ ok: true, msg: '✅ Profile saved!' });
    setSaving(false);
    setTimeout(onClose, 1200);
  }

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal aria-labelledby="profileTitle">
      <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'thin', width: 'min(96vw,520px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="modal-title" id="profileTitle">✏️ Edit Profile</div>
          <button className="lb-modal-close" onClick={onClose} aria-label="Close profile editor">✕</button>
        </div>

        {/* Avatar preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--surface-soft)', border: '2px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
            {avatar}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Pick an avatar below</span>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 18 }}>
          <label className="lb-field-label" htmlFor="pName">Display Name</label>
          <input id="pName" className="lb-input" type="text" maxLength={32}
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name…" autoComplete="off" />
        </div>

        {/* Username */}
        <div style={{ marginBottom: 18 }}>
          <label className="lb-field-label" htmlFor="pUser">Username</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>@</span>
            <input id="pUser" className="lb-input" type="text" maxLength={24}
              value={username} onChange={e => setUname(e.target.value)}
              placeholder="yourhandle" autoComplete="off" spellCheck={false}
              style={{ paddingLeft: 26 }} />
          </div>
        </div>

        {/* Avatar category tabs */}
        <div style={{ marginBottom: 22 }}>
          <label className="lb-field-label">Avatar</label>
          <div className="avatar-cats">
            {(['all', ...Object.keys(AVATARS)] as Cat[]).map(c => (
              <button key={c} className={`avatar-cat-btn${cat === c ? ' active' : ''}`}
                onClick={() => setCat(c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <div className="avatar-grid" role="group" aria-label="Choose an avatar">
            {avatarList.map(e => (
              <button key={e}
                className={`avatar-option${e === avatar ? ' selected' : ''}`}
                onClick={() => setAvatar(e)}
                aria-label={`Avatar: ${e}`}
                aria-pressed={e === avatar}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.88rem', width: 'auto', borderRadius: 999 }}
            onClick={save} disabled={saving}>
            {saving ? '⏳ Saving…' : 'Save Changes'}
          </button>
          {feedback && (
            <span style={{ fontSize: '0.82rem', padding: '9px 14px', borderRadius: 12, flex: 1,
              background: feedback.ok ? 'rgba(125,187,138,0.12)' : 'rgba(233,109,109,0.1)',
              border: `1px solid ${feedback.ok ? 'rgba(125,187,138,0.28)' : 'rgba(233,109,109,0.28)'}`,
              color: feedback.ok ? 'var(--green)' : 'var(--red)' }}>
              {feedback.msg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}