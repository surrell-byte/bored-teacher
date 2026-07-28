'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { useGame } from '@/providers/GameProvider';
import { SHOP_ITEMS } from '@/features/shop/catalog';

export default function ShopPage() {
  const router = useRouter();
  const { state, setState, applyTheme, showToast } = useGame();
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<'all' | 'avatar' | 'theme' | 'effect'>('all');
  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) { setReady(true); return; }
    const unsub = onAuthStateChanged(user => { if (!user) { router.replace('/auth'); return; } setReady(true); });
    return unsub;
  }, [router]);
  const items = useMemo(() => filter === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(item => item.type === filter), [filter]);
  const buy = (id: string) => {
    const item = SHOP_ITEMS.find(candidate => candidate.id === id);
    if (!item || state.ownedItems.includes(id)) return;
    if (state.coins < item.cost) { showToast(`You need ${item.cost - state.coins} more coins for ${item.name}.`); return; }
    setState({ coins: state.coins - item.cost, ownedItems: [...state.ownedItems, item.id] });
    if (item.type === 'theme') applyTheme(item.value);
    if (item.type === 'avatar') setState({ avatar: item.value });
    showToast(`${item.icon} ${item.name} added to your collection!`);
  };
  if (!ready) return null;
  return <div className="shop-page"><section className="shell-card shop-hero"><div><div className="hero-kicker">🛍️ Account Customisation</div><h1 className="hub-welcome-title">Coin Shop</h1><p className="hub-welcome-sub">Spend coins you earn in games on profile avatars, themes, and special extras.</p></div><div className="shop-wallet"><span>🪙</span><div><strong>{state.coins}</strong><small>coins available</small></div></div></section><div className="shop-filter-row" role="group" aria-label="Shop category">{(['all','avatar','theme','effect'] as const).map(type => <button key={type} className={`pill-btn${filter === type ? ' active' : ''}`} onClick={() => setFilter(type)}>{type === 'all' ? 'All items' : `${type[0].toUpperCase()}${type.slice(1)}s`}</button>)}</div><div className="shop-grid">{items.map(item => { const owned = state.ownedItems.includes(item.id); const affordable = state.coins >= item.cost; return <article key={item.id} className="shell-card shop-item"><div className="shop-item-icon">{item.icon}</div><span className="shop-item-type">{item.type}</span><h2>{item.name}</h2><p>{item.description}</p><button className={owned ? 'pill-btn' : 'btn-primary'} disabled={owned || !affordable} onClick={() => buy(item.id)}>{owned ? '✓ Owned' : <>🪙 {item.cost}</>}</button></article>; })}</div><p className="shop-note">Purchased avatars and themes can be managed anytime from your profile menu.</p></div>;
}
