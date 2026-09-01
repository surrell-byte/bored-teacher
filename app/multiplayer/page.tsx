'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadUserState, onAuthStateChanged } from '@/lib/firebase';
import { createLobby, getAllLobbies, joinLobby, removeLobby, subscribeToLobbies, type LeagueRole } from '@/lib/league-system';

export default function MultiplayerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ uid: string; name: string; role: LeagueRole } | null>(null);
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.replace('/auth');
        return;
      }
      const profile = await loadUserState(currentUser.uid);
      setUser({
        uid: currentUser.uid,
        name: currentUser.displayName || profile?.name || 'Player',
        role: profile?.role === 'teacher' ? 'teacher' : 'student',
      });
      setReady(true);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const unsub = subscribeToLobbies((nextLobbies) => setLobbies(nextLobbies));
    return () => unsub();
  }, [ready]);

  async function refresh() {
    setLobbies(await getAllLobbies());
  }

  async function handleCreateLobby() {
    if (!user) return;
    const lobby = await createLobby({ ownerId: user.uid, ownerName: user.name, role: user.role });
    await refresh();
    setJoinCode(lobby.id);
  }

  async function handleJoinLobby(lobbyId: string) {
    if (!user) return;
    await joinLobby(lobbyId, { userId: user.uid, name: user.name, role: user.role });
    await refresh();
    setJoinCode(lobbyId);
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px 50px' }}>
      <div className="shell-card" style={{ padding: 24, marginBottom: 20 }}>
        <p className="suggestions-kicker">Play together</p>
        <h1 style={{ margin: '8px 0 10px', fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}>Multiplayer Lobby</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>Create a lobby and invite friends to play games like Tic Tac Roll head-to-head.</p>
      </div>

      <div className="shell-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="pill-btn active" onClick={handleCreateLobby}>Create lobby</button>
          <input
            className="lb-input"
            placeholder="Enter lobby code"
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
          />
          <button className="pill-btn" onClick={() => handleJoinLobby(joinCode.trim())}>Join lobby</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {lobbies.map((lobby) => (
          <div key={lobby.id} className="shell-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <p className="suggestions-kicker">Lobby</p>
                <h3 style={{ margin: '8px 0 0' }}>{lobby.ownerName}'s room</h3>
              </div>
              <strong className="teacher-class-code" style={{ padding: '6px 8px', letterSpacing: '.08em' }}>{lobby.id}</strong>
            </div>

            <div style={{ margin: '16px 0 14px', display: 'grid', gap: 8 }}>
              {lobby.players.map((player: any) => (
                <div key={player.id} className="mp-player-row" style={{ justifyContent: 'space-between' }}>
                  <span>{player.name}</span>
                  <span style={{ color: 'var(--muted)' }}>{player.role}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="pill-btn active" onClick={() => handleJoinLobby(lobby.id)}>Join</button>
              <Link href={`/multiplayer/${lobby.id}`} className="pill-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Open room</Link>
              {lobby.ownerId === user?.uid && (
                <button className="pill-btn" onClick={async () => { await removeLobby(lobby.id); await refresh(); }}>Close</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
