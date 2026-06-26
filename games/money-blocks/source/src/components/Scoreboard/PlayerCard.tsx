import React, { useEffect, useRef, useState } from 'react';
import { GOAL } from '../../game/Constants';
import { moneyText } from '../../utils/helpers';
import { easeOutCubic } from '../../utils/easing';

interface PlayerCardProps {
  name: string;
  avatar: string;
  money: number;
  shield: boolean;
  active: boolean;
}

/** Animates a number from one value to another over ~550ms with an ease-out curve. */
function useAnimatedMoney(target: number) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    const start = performance.now();
    const dur = 550;
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setDisplay(from + (to - from) * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(step);
      else prevRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return display;
}

export function PlayerCard({ name, avatar, money, shield, active }: PlayerCardProps) {
  const animated = useAnimatedMoney(money);
  const pct = Math.min(100, (money / GOAL) * 100);

  return (
    <div className={`account-card ${active ? 'active' : ''}`}>
      <div className="account-top">
        <div className="avatar">{avatar}</div>
        <div>
          <div className="account-name">{name}</div>
          <div className="account-tag">Private Account</div>
        </div>
        <div className={`shield-badge ${shield ? 'show' : ''}`}>Guarded</div>
      </div>
      <div className="account-balance">{moneyText(animated)}</div>
      <div className="progress-wrap">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-ticks">
        <span>$0</span><span>$250K</span><span>$500K</span><span>$750K</span><span>$1M</span>
      </div>
    </div>
  );
}
