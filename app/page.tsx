'use client';
// app/page.tsx — Splash screen + auth redirect (replaces index.html)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';

const SPLASH_DURATION_MS = 5000;

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [status, setStatus] = useState('Warming up the classroom');

  useEffect(() => {
    let resolved = false;
    let destination = '/auth';
    const timers: ReturnType<typeof setTimeout>[] = [];

    function queue(ms: number, nextProgress: number, nextStatus: string) {
      timers.push(setTimeout(() => {
        setProgress(nextProgress);
        setStatus(nextStatus);
      }, ms));
    }

    // Slightly slower, smoother progression so the splash lingers pleasantly
    queue(200, 10, 'Opening the game library');
    queue(1200, 36, 'Loading resources');
    queue(2600, 64, 'Polishing your dashboard');
    queue(4000, 86, 'Almost ready');

    const finish = setTimeout(() => {
      setProgress(100);
      // small pause so the 100% state is visible before navigation
      setTimeout(() => router.replace(destination), 420);
    }, SPLASH_DURATION_MS);

    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) {
      resolved = true;
      destination = '/hub';
    }

    const unsub = onAuthStateChanged((user) => {
      if (resolved) return;
      resolved = true;
      destination = user ? '/hub' : '/auth';
    });

    return () => {
      unsub();
      clearTimeout(finish);
      timers.forEach(clearTimeout);
    };
  }, [router]);

  // Smoothly tween the numeric progress so the percentage counts up
  useEffect(() => {
    let raf = 0 as number;
    const start = performance.now();
    const from = displayedProgress;
    const to = progress;
    const duration = 600;

    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const val = Math.round(from + (to - from) * eased);
      setDisplayedProgress(val);
      if (t < 1) raf = requestAnimationFrame(step);
    }

    // if progress is behind (e.g. reset), jump immediately
    if (to < from) {
      setDisplayedProgress(to);
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return (
    <div className="splash-wrapper">
      <style suppressHydrationWarning>{`
        .splash-wrapper {
          position: fixed; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background:
            radial-gradient(circle at 50% 25%, rgba(245,200,66,0.16), transparent 26%),
            radial-gradient(circle at 18% 70%, rgba(93,189,181,0.16), transparent 28%),
            linear-gradient(160deg, #102714 0%, #1f3d24 46%, #0d2112 100%);
          overflow: hidden;
          padding: 28px;
          color: #f0ede0;
        }
        .splash-wrapper::before {
          content: "";
          position: absolute;
          inset: 28px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 30px;
          pointer-events: none;
        }
        .splash-card {
          position: relative;
          z-index: 1;
          width: min(560px, 92vw);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: clamp(28px, 6vw, 54px);
          border-radius: 30px;
          background: linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.045));
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 34px 90px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: splashCardIn 0.75s cubic-bezier(0.22,1,0.36,1) both;
        }
        .splash-icon {
          width: 96px;
          height: 96px;
          display: grid;
          place-items: center;
          border-radius: 28px;
          font-size: 4rem;
          margin-bottom: 20px;
          background: linear-gradient(135deg, rgba(245,200,66,0.24), rgba(93,189,181,0.18));
          border: 1px solid rgba(255,255,255,0.14);
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.4));
          animation: iconPop 0.65s cubic-bezier(0.34,1.4,0.64,1) 0.05s both;
        }
        .splash-title {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(2.5rem, 8vw, 4.7rem);
          font-weight: 800;
          color: #fff8e5;
          letter-spacing: 0;
          line-height: 0.95;
          margin-bottom: 8px;
          animation: fadeUp 0.5s ease 0.32s both;
        }
        .splash-sub {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 34px;
          animation: fadeUp 0.5s ease 0.5s both;
          opacity: 0;
          flex-wrap: wrap;
          justify-content: center;
        }
        .splash-sub span {
          font-size: 0.78rem; font-weight: 800;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #7ec8a0;
        }
        .splash-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(126,200,160,0.45); }
        .splash-loading {
          width: min(360px, 78vw);
          animation: fadeUp 0.5s ease 0.7s both;
        }
        .splash-track {
          height: 10px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.11);
        }
        .splash-bar {
          position: relative;
          height: 100%;
          width: 0%;
          border-radius: 999px;
          background: linear-gradient(90deg, #7ec8a0, #f5c842, #ffe27a);
          box-shadow: 0 0 20px rgba(245,200,66,0.32);
          transition: width 0.85s cubic-bezier(0.22,0.61,0.36,1);
          overflow: hidden;
        }

        .splash-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 12%, rgba(255,255,255,0.0) 30%);
          transform: translateX(-120%);
          filter: blur(8px);
          animation: splashShimmer 2.2s linear infinite;
          mix-blend-mode: screen;
        }
        .splash-status {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
          color: rgba(240,237,224,0.72);
          font-size: 0.78rem;
          font-weight: 700;
        }
        @keyframes splashCardIn {
          from { opacity: 0; transform: translateY(22px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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
        @keyframes splashShimmer {
          from { transform: translateX(-120%); }
          to   { transform: translateX(120%); }
        }
      `}</style>

      <div className="splash-card">
        <span className="splash-icon">🎓</span>
        <span className="splash-title">ESL Game Hub</span>
        <div className="splash-sub">
          <span>Learn</span><span className="splash-dot" />
          <span>Play</span><span className="splash-dot" />
          <span>Level Up</span>
        </div>
        <div className="splash-loading">
          <div className="splash-track">
            <div className="splash-bar" style={{ width: `${displayedProgress}%` }} />
          </div>
          <div className="splash-status">
            <span>{status}</span>
            <span>{displayedProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
