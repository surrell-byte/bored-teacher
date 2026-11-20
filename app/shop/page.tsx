'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { useGame } from '@/providers/GameProvider';
import { SHOP_ITEMS, UNLOCKABLE_AVATARS } from '@/features/shop/catalog';
import ProfileAvatar, { isImageAvatar } from '@/components/profile/ProfileAvatar';

const AVATAR_ITEMS = SHOP_ITEMS.filter(item => item.type === 'avatar');

export default function ShopPage() {
  const router = useRouter();
  const { state, setState } = useGame();
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('guestUser') === 'true') {
      setReady(true);
      return;
    }
    return onAuthStateChanged(user => {
      if (!user) {
        router.replace('/auth');
        return;
      }
      setReady(true);
    });
  }, [router]);

  function purchase(itemId: string) {
    const item = AVATAR_ITEMS.find(candidate => candidate.id === itemId);
    if (!item || state.ownedItems.includes(item.id) || purchasing) return;
    if (state.coins < item.cost) {
      setFeedback(`You need ${item.cost - state.coins} more coins for ${item.name}.`);
      return;
    }

    setPurchasing(item.id);
    setState({
      coins: state.coins - item.cost,
      ownedItems: [...state.ownedItems, item.id],
    });
    setFeedback(`${item.name} added to your collection.`);
    setPurchasing(null);
  }

  if (!ready) return null;

  return (
    <main className="shop-page">
      <section className="shell-card shop-hero">
        <div>
          <div className="hero-kicker">🛍️ Avatar shop</div>
          <h1 className="hub-welcome-title">Choose your next look</h1>
          <p className="hub-welcome-sub">Spend coins earned from games and daily rewards on profile avatars.</p>
        </div>
        <div className="shop-wallet" aria-label={`${state.coins} coins available`}>
          <span>🪙</span><strong>{state.coins}</strong><span>coins</span>
        </div>
      </section>

      <div className="hub-preview-header">
        <h2 className="hub-section-title">Avatar collection</h2>
        <Link href="/hub" className="pill-btn">← Dashboard</Link>
      </div>
      {feedback && <p role="status" className="shop-feedback">{feedback}</p>}
      <section className="shop-items-grid">
        {AVATAR_ITEMS.map(item => {
          const owned = state.ownedItems.includes(item.id);
          return (
            <article className="shell-card shop-item" key={item.id}>
              <div className="shop-item-image-wrap">
                <ProfileAvatar value={item.value} alt={item.name} className={isImageAvatar(item.value) ? 'shop-item-image' : 'shop-item-emoji'} />
              </div>
              <div className="shop-item-copy">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <button className="pill-btn" type="button" disabled={owned || purchasing !== null} onClick={() => purchase(item.id)}>
                  {owned ? 'Owned' : purchasing === item.id ? 'Buying…' : `🪙 ${item.cost}`}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <div className="hub-preview-header">
        <h2 className="hub-section-title">Earnable avatars</h2>
      </div>
      <section className="shop-items-grid">
        {UNLOCKABLE_AVATARS.map(item => {
          const unlocked = state.unlockedAvatars.includes(item.id);
          const completions = state.games[item.unlock.gameId]?.completions || 0;
          return (
            <article className="shell-card shop-item" key={item.id}>
              <div className="shop-item-image-wrap">
                <ProfileAvatar value={item.value} alt={item.name} className="shop-item-image" />
              </div>
              <div className="shop-item-copy">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>{unlocked ? 'Unlocked — choose it in your profile.' : item.unlock.label}</p>
                <p className="shop-item-unlock-progress">
                  {unlocked ? 'Ready to use' : `Progress: ${Math.min(completions, item.unlock.completions)} / ${item.unlock.completions}`}
                </p>
                <Link className="pill-btn" href={unlocked ? '/profile' : `/games/${item.unlock.gameId}`}>
                  {unlocked ? 'Choose avatar' : 'Play to unlock'}
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
