'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, onAuthStateChanged } from '@/lib/firebase';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    description: 'Core games and learning activities for every classroom.',
    features: ['Access to the game library', 'Progress tracking', 'Class leaderboard'],
  },
  {
    name: 'Resource Library',
    price: 'Paid',
    cadence: 'monthly or yearly',
    description: 'Unlock the full teaching resource library alongside the game hub.',
    features: ['Everything in Free', 'Premium teaching resources', 'Ongoing resource updates'],
  },
];

function formatDate(value: string | undefined) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value));
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [joinedAt, setJoinedAt] = useState<string | undefined>();

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) {
      setJoinedAt(new Date().toISOString());
      setReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(user => {
      if (!user) {
        router.replace('/auth');
        return;
      }
      setJoinedAt(user.metadata.creationTime);
      setReady(true);
    });
    return unsubscribe;
  }, [router]);

  if (!ready) return null;

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <div>
          <div className="hero-kicker">💳 Account Billing</div>
          <h1 className="hub-welcome-title">Manage Subscription</h1>
          <p className="hub-welcome-sub">Review your plan and choose the access that fits your classroom.</p>
        </div>
        <Link href="/hub" className="pill-btn" style={{ textDecoration: 'none' }}>← Back to Dashboard</Link>
      </div>

      <section className="shell-card subscription-current">
        <div>
          <span className="subscription-label">Current plan</span>
          <h2>Free</h2>
          <p>Active while your account is open.</p>
        </div>
        <div className="subscription-details">
          <div><span>Joined</span><strong>{formatDate(joinedAt)}</strong></div>
          <div><span>Active until</span><strong>Forever</strong></div>
        </div>
      </section>

      <section>
        <h2 className="hub-section-title">Available Plans</h2>
        <div className="subscription-plans">
          {PLANS.map(plan => (
            <article key={plan.name} className={`shell-card subscription-plan${plan.name === 'Free' ? ' selected' : ''}`}>
              <div className="subscription-plan-top">
                <div>
                  <span className="subscription-label">{plan.name}</span>
                  <h3>{plan.price}</h3>
                </div>
                <span className="subscription-cadence">{plan.cadence}</span>
              </div>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <button className="pill-btn" disabled={plan.name === 'Free'}>
                {plan.name === 'Free' ? 'Current Plan' : 'Choose Plan'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
