'use client';
// app/page.tsx — Splash screen + auth redirect (replaces index.html)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) { router.replace('/hub'); return; }

    let resolved = false;

    // Safety net: if Firebase is slow, go to auth
    const fallback = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      runSplash(() => router.replace('/auth'));
    }, 2800);

    const unsub = onAuthStateChanged((user) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(fallback);
      if (user) {
        router.replace('/hub');
      } else {
        runSplash(() => router.replace('/auth'));
      }
    });

    function runSplash(done: () => void) {
      // Animate progress bar then redirect
      setTimeout(() => setProgress(100), 100);
      setTimeout(done, 1800);
    }

    return () => { unsub(); clearTimeout(fallback); };
  }, [router]);

  return (
    <div className="splash-wrapper">
      <style suppressHydrationWarning>{`
        .splash-wrapper {
          position: fixed; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: var(--bg, #1a4d2e);
          gap: 0;
        }
        .splash-icon {
          font-size: 5.4rem;
          margin-bottom: 18px;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.4));
          animation: iconPop 0.65s cubic-bezier(0.34,1.4,0.64,1) 0.05s both;
        }
        .splash-title {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(2.4rem, 7vw, 3.8rem);
          font-weight: 800;
          color: #f0ede0;
          letter-spacing: 0.03em;
          margin-bottom: 8px;
          animation: fadeUp 0.5s ease 0.32s both;
        }
        .splash-sub {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 44px;
          animation: fadeUp 0.5s ease 0.5s both;
          opacity: 0;
        }
        .splash-sub span {
          font-size: 0.78rem; font-weight: 800;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #7ec8a0;
        }
        .splash-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(126,200,160,0.45); }
        .splash-track {
          width: min(220px, 55vw); height: 2px;
          background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;
          animation: trackIn 0.4s ease 0.65s both;
          opacity: 0;
        }
        .splash-bar {
          height: 100%; width: 0%; border-radius: 2px;
          background: linear-gradient(90deg, #7ec8a0, #f5c842);
          transition: width 1.55s cubic-bezier(0.22,0.61,0.36,1);
        }
        @keyframes iconPop {
          0%   { opacity: 0; transform: scale(0.4) rotate(-12deg); }
          65%  { opacity: 1; transform: scale(1.08) rotate(4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes trackIn {
          from { opacity: 0; transform: scaleX(0.6); }
          to   { opacity: 1; transform: scaleX(1); }
        }
      `}</style>

      <span className="splash-icon">🎓</span>
      <span className="splash-title">ESL Game Hub</span>
      <div className="splash-sub">
        <span>Learn</span><span className="splash-dot" />
        <span>Play</span><span className="splash-dot" />
        <span>Level Up</span>
      </div>
      <div className="splash-track">
        <div className="splash-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}