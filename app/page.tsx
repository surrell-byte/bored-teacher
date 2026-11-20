'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();
  const pendingPlayRef = useRef(false);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => onAuthStateChanged(user => {
    setIsAuthenticated(Boolean(user));
    setAuthReady(true);
    if (!pendingPlayRef.current) return;

    pendingPlayRef.current = false;
    if (user) {
      router.push('/hub');
      return;
    }

    localStorage.setItem('guestUser', 'true');
    localStorage.removeItem('currentUser');
    router.push('/games');
  }), [router]);

  function playNow() {
    if (isStarting) return;
    setIsStarting(true);
    if (!authReady) {
      pendingPlayRef.current = true;
      return;
    }

    if (isAuthenticated) {
      router.push('/hub');
      return;
    }

    localStorage.setItem('guestUser', 'true');
    localStorage.removeItem('currentUser');
    router.push('/games');
  }

  return (
    <section className="visitor-landing" aria-label="Bored Teacher Online">
      <Link className="visitor-landing-signin" href="/auth">Sign in</Link>

      <div className="visitor-landing-desktop-cta">
        <p className="visitor-landing-eyebrow">BORED TEACHER ONLINE</p>
        <h1>Learn English.<br />Play big.</h1>
        <p className="visitor-landing-copy">
          Practice English with fun games and challenges. Play free right away—no account needed.
        </p>
        <button type="button" className="visitor-landing-play" onClick={playNow} disabled={isStarting}>
          {isStarting ? authReady ? 'Loading games…' : 'Getting things ready…' : isAuthenticated ? 'Explore games' : 'Play a game'}
        </button>
      </div>

      <div className="visitor-landing-mobile">
        <div className="visitor-landing-mobile-brand" aria-hidden="true">🎓</div>
        <p className="visitor-landing-eyebrow">BORED TEACHER ONLINE</p>
        <h1>Learn English.<br />Play big.</h1>
        <p className="visitor-landing-copy">
          Practice English with fun games and challenges. Play free right away—no account needed.
        </p>

        <div className="visitor-landing-benefits">
          <div><span aria-hidden="true">🎮</span><strong>100+ games</strong><small>Play and practice</small></div>
          <div><span aria-hidden="true">🏆</span><strong>Earn rewards</strong><small>Collect achievements</small></div>
          <div><span aria-hidden="true">📈</span><strong>Track progress</strong><small>Keep improving</small></div>
        </div>

        <button type="button" className="visitor-landing-play" onClick={playNow} disabled={isStarting}>
          {isStarting ? authReady ? 'Loading games…' : 'Getting things ready…' : isAuthenticated ? 'Explore games' : 'Play a game'}
          {!isStarting && <span aria-hidden="true">→</span>}
        </button>
        <p className="visitor-landing-no-account">Free to start · No sign-up required</p>
        <Link className="visitor-landing-mobile-signin" href="/auth">Already have an account? Sign in</Link>
      </div>
    </section>
  );
}
