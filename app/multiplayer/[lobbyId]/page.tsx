'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadUserState, onAuthStateChanged } from '@/lib/firebase';
import { joinLobby, recordLobbyResult, removeLobby, subscribeToLobby, type LeagueRole, type LobbyRecord } from '@/lib/league-system';

export default function MultiplayerRoomPage() {
  const params = useParams();
  const router = useRouter();
  const lobbyId = String(params?.lobbyId ?? '');
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ uid: string; name: string; role: LeagueRole } | null>(null);
  const [lobby, setLobby] = useState<LobbyRecord | null>(null);
  const [score, setScore] = useState('120');
  const [accuracy, setAccuracy] = useState('88');

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
    if (!ready || !lobbyId) return;
    const unsub = subscribeToLobby(lobbyId, setLobby);
    return () => unsub();
  }, [ready, lobbyId]);

  useEffect(() => {
    if (!ready || !user || !lobby) return;
    const alreadyJoined = lobby.players.some((player) => player.id === user.uid);
    if (!alreadyJoined) {
      void joinLobby(lobbyId, { userId: user.uid, name: user.name, role: user.role });
    }
  }, [ready, user, lobby, lobbyId]);

  if (!ready) return null;
  if (!lobby) {
    return (
      <div style={{ maxWidth: 680, margin: '32px auto', padding: '0 16px' }}>
        <div className="shell-card" style={{ padding: 30 }}>
          <p className="suggestions-kicker">Lobby</p>
          <h1 style={{ margin: '8px 0 8px' }}>Room not found</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 18 }}>This lobby code may be invalid or has already closed.</p>
          <Link href="/multiplayer" className="pill-btn" style={{ textDecoration: 'none' }}>Back to lobbies</Link>
        </div>
      </div>
    );
  }

  const isOwner = lobby.ownerId === user?.uid;

  async function handleRecordResult() {
    if (!user) return;
    await recordLobbyResult(lobbyId, {
      playerId: user.uid,
      playerName: user.name,
      score: Number(score) || 0,
      accuracy: Number(accuracy) || 0,
      role: user.role,
    });
  }

  async function handleClose() {
    await removeLobby(lobbyId);
    router.push('/multiplayer');
  }

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px 50px' }}>
      <div className="shell-card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <p className="suggestions-kicker">Live room</p>
            <h1 style={{ margin: '8px 0 6px', fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>{lobby.ownerName}'s room</h1>
          </div>
          <strong className="teacher-class-code" style={{ padding: '8px 10px', letterSpacing: '.12em' }}>{lobby.id}</strong>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <Link href="/multiplayer" className="pill-btn" style={{ textDecoration: 'none' }}>← Back to lobby list</Link>
          <Link href={`/games/${lobby.gameId}`} className="pill-btn active" style={{ textDecoration: 'none' }}>Launch {lobby.gameName}</Link>
          {isOwner && (
            <button className="pill-btn" type="button" onClick={handleClose}>Close room</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="shell-card" style={{ padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Players</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {lobby.players.map((player) => (
              <div key={player.id} className="mp-player-row" style={{ justifyContent: 'space-between' }}>
                <span>{player.name}</span>
                <span style={{ color: 'var(--muted)' }}>{player.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-card" style={{ padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Match result</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: 'var(--muted)' }}>Score</span>
              <input className="lb-input" value={score} onChange={(event) => setScore(event.target.value)} inputMode="numeric" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: 'var(--muted)' }}>Accuracy %</span>
              <input className="lb-input" value={accuracy} onChange={(event) => setAccuracy(event.target.value)} inputMode="decimal" />
            </label>
            <button className="pill-btn active" type="button" onClick={handleRecordResult}>Save result</button>
          </div>
        </div>
      </div>

      <div className="shell-card" style={{ padding: 18, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Recent matches</h2>
        {lobby.matches.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No results recorded yet. Start a match and save the score to populate the room.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {lobby.matches.slice(0, 8).map((match, index) => (
              <div key={`${match.playerId}-${match.createdAt}-${index}`} className="mp-player-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span>{match.playerName}</span>
                <span style={{ color: 'var(--muted)' }}>{match.score} pts • {match.accuracy}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
