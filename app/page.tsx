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
      setExiting(true);
      setTimeout(() => router.replace(destination), 450);
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

  useEffect(() => {
    router.prefetch('/auth');
    router.prefetch('/hub');
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
          align-items: center; justify-content: flex-end;
          background: transparent;
          overflow: hidden;
          padding: 0 28px 64px;
          color: #f0ede0;
          opacity: 1;
          transition: opacity 0.45s ease;
        }
        .splash-wrapper.exiting {
          opacity: 0;
        }
        .splash-loading {
          width: min(420px, 88vw);
          animation: fadeUp 0.55s ease 0.3s both;
        }
        .splash-track {
          height: 14px;
          background: rgba(0,0,0,0.35);
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(255,215,110,0.35);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .splash-bar {
          position: relative;
          height: 100%;
          width: 0%;
          border-radius: 999px;
          background: linear-gradient(90deg, #ffd76e, #ffb347);
          box-shadow: 0 0 20px rgba(255,199,90,0.55);
          transition: width 0.85s cubic-bezier(0.22,0.61,0.36,1);
          overflow: hidden;
        }
        .splash-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 20%, transparent 40%);
          transform: translateX(-120%);
          animation: splashShimmer 2.2s linear infinite;
          mix-blend-mode: screen;
        }
        .splash-status {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
          color: #ffe9b8;
          font-size: 0.8rem;
          font-weight: 700;
          text-shadow: 0 1px 6px rgba(0,0,0,0.6);
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
  );
}