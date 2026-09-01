'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { createLeague, createLobby, deleteLeague, getLeagues, getLeaguesForUser, joinLeague, leaveLeague, submitLeagueScore, type LeagueRole, type LeagueType, type LeagueRecord } from '@/lib/league-system';

const TYPES: LeagueType[] = ['daily', 'weekly', 'monthly'];

export default function LeaguesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ uid: string; displayName?: string | null; role?: LeagueRole } | null>(null);
  const [leagues, setLeagues] = useState<LeagueRecord[]>([]);
  const [selectedType, setSelectedType] = useState<LeagueType>('daily');
  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.replace('/auth');
        return;
      }
      const profile = await import('@/lib/firebase').then(({ loadUserState }) => loadUserState(currentUser.uid));
      setUser({
        uid: currentUser.uid,
        displayName: currentUser.displayName ?? profile?.name ?? 'Player',
        role: profile?.role === 'teacher' ? 'teacher' : 'student',
      });
      setReady(true);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const load = async () => setLeagues(await getLeagues());
    load();
  }, [ready]);

  const myLeagues = useMemo(
    () => (user ? leagues.filter((league) => league.members.some((member) => member.userId === user.uid)) : []),
    [user, leagues],
  );

  const filteredLeagues = useMemo(
    () => leagues.filter((league) => league.type === selectedType),
    [leagues, selectedType],
  );

  async function refreshLeagues() {
    setLeagues(await getLeagues());
  }

  async function handleCreateLeague() {
    if (!user || !name.trim()) return;
    await createLeague({
      name,
      type: selectedType,
      ownerId: user.uid,
      ownerName: user.displayName || 'Player',
      ownerRole: user.role || 'student',
    });
    setName('');
    await refreshLeagues();
  }

  async function handleJoinLeague(leagueId: string) {
    if (!user) return;
    await joinLeague(leagueId, { userId: user.uid, name: user.displayName || 'Player', role: user.role || 'student' });
    await refreshLeagues();
  }

  async function handleLeaveLeague(leagueId: string) {
    if (!user) return;
    await leaveLeague(leagueId, user.uid);
    await refreshLeagues();
  }

  async function handleSubmitScore(leagueId: string, score: number) {
    if (!user) return;
    await submitLeagueScore({
      leagueId,
      userId: user.uid,
      name: user.displayName || 'Player',
      role: user.role || 'student',
      score,
    });
    await refreshLeagues();
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '24px auto', padding: '0 16px 50px' }}>
      <div className="shell-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
        <p className="suggestions-kicker">Community challenge</p>
        <h1 style={{ margin: '8px 0 12px', fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(2.3rem, 4vw, 3rem)' }}>Leagues & Daily Challenges</h1>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Create or join leagues, then compete in daily, weekly, and monthly challenges.</p>
      </div>

      <div className="shell-card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="lb-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name your new league"
            style={{ minWidth: 220, flex: 1 }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map((type) => (
              <button
                key={type}
                className={`lb-tab${selectedType === type ? ' active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <button className="pill-btn active" onClick={handleCreateLeague}>Create league</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {filteredLeagues.map((league) => {
          const isMember = league.members.some((member) => member.userId === user?.uid);
          const memberCount = league.members.length;
          const leader = [...league.members].sort((a, b) => b.score - a.score)[0];

          return (
            <div key={league.id} className="shell-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div>
                  <p className="suggestions-kicker">{league.type}</p>
                  <h3 style={{ margin: '6px 0 4px' }}>{league.name}</h3>
                </div>
                <span className="teacher-class-code" style={{ fontSize: '.72rem', letterSpacing: '.08em', padding: '6px 8px' }}>{memberCount} members</span>
              </div>

              <div style={{ margin: '12px 0', color: 'var(--muted)' }}>
                Leader: <strong>{leader?.name ?? league.ownerName}</strong>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {league.members.slice(0, 4).map((member) => (
                  <div key={member.userId} className="mp-player-row" style={{ justifyContent: 'space-between' }}>
                    <span>{member.name}</span>
                    <strong style={{ color: 'var(--gold)' }}>{member.score}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
                {!isMember ? (
                  <button className="pill-btn active" onClick={() => handleJoinLeague(league.id)}>Join</button>
                ) : (
                  <button className="pill-btn" onClick={() => handleLeaveLeague(league.id)}>Leave</button>
                )}
                {league.ownerId === user?.uid && (
                  <button className="pill-btn" onClick={async () => { await deleteLeague(league.id); await refreshLeagues(); }}>Delete</button>
                )}
                {isMember && (
                  <button className="pill-btn" onClick={() => handleSubmitScore(league.id, 100)}>Submit demo score</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="shell-card" style={{ padding: 20, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>My leagues</h2>
        {myLeagues.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>You haven’t joined any leagues yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {myLeagues.map((league) => (
              <div key={league.id} className="mp-player-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                  <strong>{league.name}</strong>
                  <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{league.type} • {league.members.length} members</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="pill-btn active" onClick={() => handleSubmitScore(league.id, 150)}>Daily challenge</button>
                  <button className="pill-btn" onClick={() => handleLeaveLeague(league.id)}>Leave</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shell-card" style={{ padding: 20, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Create lobby</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input className="lb-input" value={roomName} onChange={(event) => setRoomName(event.target.value)} placeholder="Lobby name" />
          <button className="pill-btn active" onClick={async () => { if (!user) return; const lobby = await createLobby({ ownerId: user.uid, ownerName: user.displayName || 'Player', role: user.role || 'student' }); setRoomName(lobby.id); await refreshLeagues(); }}>Create lobby</button>
        </div>
        <div style={{ marginTop: 14, color: 'var(--muted)' }}>Lobby code: <strong>{roomName || '—'}</strong></div>
      </div>
    </div>
  );
}
