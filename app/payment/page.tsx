'use client';
// app/payment/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from '@/lib/firebase';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_fZu4gs2kf04M1PNa8O6Na00';

export default function PaymentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) { setReady(true); return; }
    const unsub = onAuthStateChanged(user => {
      if (!user) { router.replace('/auth'); return; }
      setReady(true);
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(14px,3vw,28px) clamp(14px,3vw,24px) 80px' }}>
      <section className="shell-card" style={{ padding: 'clamp(22px, 4vw, 44px)', borderRadius: 28 }}>
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: 10 }}>
          💳 Subscription
        </div>
        <h1 style={{ fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 12 }}>
          Bored Teacher Resources
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.96rem', maxWidth: '58ch', lineHeight: 1.7, marginBottom: 24 }}>
          Monthly subscription fee to access Bored Teacher resources.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 26,
        }}>
          <div className="shell-card" style={{ padding: 18, borderRadius: 16, boxShadow: 'none' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📚</div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Resource Access</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              Unlock the Bored Teacher resource collection through a monthly subscription.
            </div>
          </div>
          <div className="shell-card" style={{ padding: 18, borderRadius: 16, boxShadow: 'none' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🔒</div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Secure Checkout</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              Payment is handled securely through Stripe.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none', width: 'auto', borderRadius: 999, padding: '13px 26px', display: 'inline-flex' }}
          >
            Subscribe with Stripe →
          </a>
          <Link href="/resources" className="pill-btn" style={{ textDecoration: 'none' }}>
            View Resources
          </Link>
        </div>
      </section>
    </div>
  );
}
