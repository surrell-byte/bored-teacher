'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged, setDisplayName } from '@/lib/firebase';
import { useGame } from '@/providers/GameProvider';
import { AVATARS, THEMES } from '@/constants/index';
import { SHOP_ITEMS } from '@/features/shop/catalog';

const baseAvatars = [...new Set(Object.values(AVATARS).flat())];
const avatarItems = SHOP_ITEMS.filter(item => item.type === 'avatar');

function Avatar({ value, size = 76 }: { value: string; size?: number }) {
  return value.startsWith('/') ? <img src={value} alt="" style={{ width: size, height: size, objectFit: 'contain' }} /> : <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>{value}</span>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { state, setState, applyTheme } = useGame();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('guestUser') === 'true') { setReady(true); return; }
    return onAuthStateChanged(user => { if (!user) router.replace('/auth'); else setReady(true); });
  }, [router]);
  useEffect(() => { setName(state.name === 'Explorer' ? '' : state.name); setUsername(state.username || ''); setAvatar(state.avatar || '👤'); }, [state.name, state.username, state.avatar]);

  async function save() {
    if (!name.trim()) { setFeedback('Display name cannot be empty.'); return; }
    const cleanUsername = username.replace(/^@/, '');
    if (cleanUsername && !/^[a-zA-Z0-9_]{1,24}$/.test(cleanUsername)) { setFeedback('Username may use letters, numbers, and underscores only.'); return; }
    setSaving(true);
    setState({ name: name.trim(), username: cleanUsername, avatar });
    try { if (auth?.currentUser) await setDisplayName(auth.currentUser, name.trim()); } catch (_) { /* local profile still saves */ }
    setFeedback('Profile saved.');
    setSaving(false);
  }

  if (!ready) return null;
  const purchased = avatarItems.filter(item => state.ownedItems.includes(item.id)).map(item => item.value);
  const available = [...new Set([...baseAvatars, ...purchased])];

  return <main className="profile-page hub-page">
    <div className="profile-page-header"><div><p className="suggestions-kicker">Your account</p><h1 className="hub-welcome-title">Profile</h1><p className="hub-welcome-sub">Manage your identity, avatar, and learning look.</p></div><button type="button" className="pill-btn" onClick={() => router.push('/hub')}>← Dashboard</button></div>
    <div className="profile-layout">
      <section className="shell-card profile-preview"><div className="profile-preview-avatar"><Avatar value={avatar} size={124} /></div><h2>{name.trim() || 'Explorer'}</h2><p>{username ? `@${username.replace(/^@/, '')}` : 'Choose a username'}</p><div className="profile-preview-stats"><span><b>{state.level}</b><small>Level</small></span><span><b>{state.coins}</b><small>Coins</small></span><span><b>{state.xp}</b><small>XP</small></span></div></section>
      <section className="shell-card profile-form"><h2>Profile details</h2><label className="lb-field-label" htmlFor="profile-name">Display name</label><input id="profile-name" className="lb-input" value={name} maxLength={32} onChange={event => setName(event.target.value)} placeholder="Your name" /><label className="lb-field-label" htmlFor="profile-username">Username</label><input id="profile-username" className="lb-input" value={username} maxLength={24} onChange={event => setUsername(event.target.value)} placeholder="yourhandle" /><label className="lb-field-label" htmlFor="profile-theme">Preferred theme</label><select id="profile-theme" className="lb-input" value={state.theme} onChange={event => applyTheme(event.target.value)}>{THEMES.map(theme => <option key={theme.value} value={theme.value}>{theme.label}</option>)}</select><div className="profile-save-row"><button type="button" className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>{feedback && <span role="status">{feedback}</span>}</div></section>
    </div>
    <section className="shell-card profile-avatars"><div className="profile-section-heading"><div><h2>Choose your avatar</h2><p>Owned shop avatars appear alongside the starter collection.</p></div><button type="button" className="pill-btn" onClick={() => router.push('/shop')}>Visit shop</button></div><div className="profile-avatar-grid">{available.map(value => <button type="button" key={value} className={`profile-avatar-option${value === avatar ? ' selected' : ''}`} onClick={() => setAvatar(value)} aria-label="Choose avatar" aria-pressed={value === avatar}><Avatar value={value} size={72} /></button>)}</div></section>
  </main>;
}
