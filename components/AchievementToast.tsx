'use client';
// components/AchievementToast.tsx
// Celebration popup shown when a new achievement is unlocked.
// Uses a pure CSS confetti burst — no external package needed.

import { useEffect, useRef, useState } from 'react';

interface Props {
  icon: string;
  title: string;
  description: string;
  color: string;
  onDone: () => void;
}

// Confetti particle config
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,       // % across the popup
  delay: Math.random() * 0.3,   // s
  dur: 0.7 + Math.random() * 0.5,
  color: ['#f5c842','#5dbdb5','#9b7fd4','#f08060','#7dbb8a','#5b9bd5'][i % 6],
  size: 5 + Math.random() * 5,
  rotate: Math.random() * 360,
}));

export default function AchievementToast({ icon, title, description, color, onDone }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setClosing(true);
      setTimeout(onDone, 380);
    }, 3800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onDone]);

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setClosing(true);
    setTimeout(onDone, 380);
  }

  return (
    <div
      className={`achievement-toast${closing ? ' closing' : ''}`}
      role="status"
      aria-live="polite"
      onClick={dismiss}
      style={{ '--ach-color': color } as React.CSSProperties}
    >
      {/* Confetti particles */}
      <div className="ach-confetti" aria-hidden>
        {PARTICLES.map(p => (
          <span
            key={p.id}
            className="ach-particle"
            style={{
              left: `${p.x}%`,
              background: p.color,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="ach-inner">
        <div className="ach-eyebrow">Achievement Unlocked!</div>
        <div className="ach-icon">{icon}</div>
        <div className="ach-title">{title}</div>
        <div className="ach-desc">{description}</div>
      </div>
    </div>
  );
}