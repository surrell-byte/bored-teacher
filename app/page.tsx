'use client';
// app/page.tsx — Splash screen + auth redirect (replaces index.html)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';

const SPLASH_DURATION_MS = 5000;
const STATUS_MESSAGES = [
  'Preparing achievements...',
  'Loading classroom...',
  'Sharpening pencils...',
  'Checking attendance...',
  'Powering up games...',
  'Summoning teachers...',
  'Unlocking rewards...',
  'Almost ready...',
];

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [status, setStatus] = useState(STATUS_MESSAGES[0]);
  const [exiting, setExiting] = useState(false);

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

    queue(200, 10, STATUS_MESSAGES[0]);
    queue(700, 22, STATUS_MESSAGES[1]);
    queue(1300, 42, STATUS_MESSAGES[2]);
    queue(2000, 55, STATUS_MESSAGES[3]);
    queue(2700, 70, STATUS_MESSAGES[4]);
    queue(3400, 85, STATUS_MESSAGES[5]);
    queue(4200, 94, STATUS_MESSAGES[6]);
    queue(4700, 98, STATUS_MESSAGES[7]);

    const finish = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setExiting(true), 200);
      setTimeout(() => router.replace(destination), 800);
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
    <div className={`splash-wrapper${exiting ? ' exiting' : ''}`}>
      <style suppressHydrationWarning>{`
        .splash-wrapper {
          position: fixed; inset: 0;
          z-index: 99999;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background:
            radial-gradient(circle at 22% 12%, rgba(255,225,175,0.15), transparent 14%),
            radial-gradient(circle at 90% 18%, rgba(95,197,255,0.14), transparent 16%),
            radial-gradient(circle at 12% 74%, rgba(85,212,176,0.12), transparent 18%),
            radial-gradient(circle at 82% 62%, rgba(255,220,105,0.09), transparent 20%),
            linear-gradient(160deg, #08150f 0%, #143327 40%, #07140b 100%);
          overflow: hidden;
          padding: 28px;
          color: #f0ede0;
        }
        .splash-wrapper.exiting .splash-card {
          animation: splashCardOut 0.45s ease-in both;
        }
        .splash-wrapper::before {
          content: "";
          position: absolute;
          inset: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 34px;
          pointer-events: none;
          box-shadow: inset 0 0 140px rgba(255,255,255,0.04);
        }
        .splash-wrapper::after {
          content: "";
          position: absolute;
          inset: -18%;
          pointer-events: none;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 82px 82px, 170px 170px;
          opacity: 0.16;
          animation: starsMove 28s linear infinite;
        }
        .splash-card {
          position: relative;
          z-index: 1;
          width: min(580px, 96vw);
          max-width: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: clamp(30px, 6vw, 58px);
          border-radius: 34px;
          background: linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05));
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 40px 130px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
          animation: splashCardIn 0.75s cubic-bezier(0.22,1,0.36,1) both, floatCard 8s ease-in-out infinite 1s;
        }
        .splash-icon {
          width: 104px;
          height: 104px;
          position: relative;
          display: grid;
          place-items: center;
          border-radius: 28px;
          margin-bottom: 22px;
          background: radial-gradient(circle at top, rgba(255,255,255,0.38), rgba(255,255,255,0.08));
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow: 0 0 28px rgba(90,200,255,0.26), 0 0 0 rgba(255,255,255,0.08);
          animation: iconGlow 2.2s ease-in-out infinite;
        }
        .splash-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: 0 0 28px rgba(94,221,255,0.3), 0 0 68px rgba(255,255,255,0.16);
          opacity: 0.7;
          filter: blur(0.8px);
        }
        .splash-icon span {
          position: relative;
          z-index: 1;
        }
        .splash-title {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(2.5rem, 8vw, 4.7rem);
          font-weight: 800;
          color: #fffef2;
          letter-spacing: -0.03em;
          line-height: 0.92;
          margin-bottom: 14px;
          text-shadow: 0 0 24px rgba(255,255,255,0.15), 0 8px 30px rgba(20,74,38,0.16);
          animation: titleGlow 3.5s ease-in-out infinite 0.5s;
        }
        .splash-sub {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
          animation: fadeUp 0.55s ease 0.52s both;
          opacity: 0;
          flex-wrap: wrap;
          justify-content: center;
        }
        .splash-sub span {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8fddb3;
        }
        .splash-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(174,232,207,0.65);
        }
        .splash-loading {
          width: min(380px, 78vw);
          animation: fadeUp 0.55s ease 0.72s both;
        }
        .splash-track {
          height: 12px;
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .splash-bar {
          position: relative;
          height: 100%;
          width: 0%;
          border-radius: 999px;
          background: linear-gradient(90deg, #6be2a5, #6ec8ff, #ffe47b);
          box-shadow: 0 0 24px rgba(110,200,255,0.28);
          transition: width 0.85s cubic-bezier(0.22,0.61,0.36,1);
          overflow: hidden;
        }
        .splash-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 14%, rgba(255,255,255,0) 30%);
          transform: translateX(-120%);
          filter: blur(8px);
          animation: splashShimmer 2.4s linear infinite;
          mix-blend-mode: screen;
        }
        .splash-status {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 16px;
          color: rgba(240,237,224,0.78);
          font-size: 0.78rem;
          font-weight: 700;
        }
        @keyframes splashCardIn {
          from { opacity: 0; transform: translateY(22px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes splashCardOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-20px) scale(0.96); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes iconGlow {
          0%, 100% { box-shadow: 0 0 26px rgba(94,223,255,0.28), 0 0 0 rgba(255,255,255,0.06); transform: scale(1); }
          50% { box-shadow: 0 0 38px rgba(94,223,255,0.38), 0 0 14px rgba(255,255,255,0.14); transform: scale(1.02); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 24px rgba(255,255,255,0.16), 0 8px 30px rgba(20,74,38,0.16); }
          50% { text-shadow: 0 0 38px rgba(118,228,255,0.35), 0 10px 40px rgba(255,255,255,0.18); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashShimmer {
          from { transform: translateX(-120%); }
          to   { transform: translateX(120%); }
        }
        @keyframes starsMove {
          from { transform: translateY(0); }
          to { transform: translateY(-30px); }
        }
      `}</style>

      <div className="splash-card">
        <span className="splash-icon"><span>🎓</span></span>
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
