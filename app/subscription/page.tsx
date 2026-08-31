'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, loadUserState, onAuthStateChanged, setTeacherProAccess } from '@/lib/firebase';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    description: 'A simple way to explore the hub before upgrading.',
    features: ['Core game library', 'Personal progress tracking', 'Basic class leaderboard'],
    action: 'Current Plan',
  },
  {
    name: 'Teacher Pro',
    price: '$10',
    cadence: 'per month',
    description: 'Everything a teacher needs for planning, practice, and repeat classroom use.',
    features: ['Everything in Free', 'Full teaching resource library', 'Premium worksheets and guides', 'Ongoing resource updates'],
    action: 'Choose Teacher Pro',
  },
  {
    name: 'School',
    price: '$300',
    cadence: 'per year · from',
    description: 'A shared plan for schools coordinating multiple teachers and classes.',
    features: ['Everything in Teacher Pro', 'Multiple teacher accounts', 'Shared class reporting', 'Onboarding support'],
    action: 'Contact Russell',
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
  const [hasTeacherPro, setHasTeacherPro] = useState(false);

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    const syncSubscription = async (user?: { uid: string } | null) => {
      const localAccess = localStorage.getItem('teacherProAccess') === 'true';
      if (user) {
        const profile = await loadUserState(user.uid);
        const subscriptionEnabled = Boolean(localAccess || profile?.teacherPro);
        setHasTeacherPro(subscriptionEnabled);
        if (subscriptionEnabled) localStorage.setItem('teacherProAccess', 'true');
      } else {
        setHasTeacherPro(localAccess);
      }
    };

    if (isGuest) {
      setHasTeacherPro(localStorage.getItem('teacherProAccess') === 'true');
      setJoinedAt(new Date().toISOString());
      setReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(async user => {
      if (!user) {
        router.replace('/auth');
        return;
      }
      await syncSubscription(user);
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
          <p className="hub-welcome-sub">Start free, upgrade when your classroom needs more, or ask about a school plan.</p>
        </div>
        <Link href="/hub" className="pill-btn" style={{ textDecoration: 'none' }}>← Back to Dashboard</Link>
      </div>

      <section className="shell-card subscription-current">
        <div>
          <span className="subscription-label">Current plan</span>
          <h2>{hasTeacherPro ? 'Teacher Pro' : 'Free'}</h2>
          <p>{hasTeacherPro ? 'Premium resource access is unlocked for this account.' : 'Active while your account is open.'}</p>
        </div>
        <div className="subscription-details">
          <div><span>Joined</span><strong>{formatDate(joinedAt)}</strong></div>
          <div><span>Active until</span><strong>{hasTeacherPro ? 'Unlimited' : 'Forever'}</strong></div>
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
              {plan.name === 'Teacher Pro' && <div className="subscription-annual-note">Annual option: <strong>$110/year</strong> · save $10 (8.3%)</div>}
              <ul>
                {plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <button
                className="pill-btn"
                disabled={plan.name === 'Free' && !hasTeacherPro}
                onClick={async () => {
                  if (plan.name === 'Teacher Pro') {
                    const user = auth?.currentUser;
                    if (user) {
                      await setTeacherProAccess(user.uid, true);
                      setHasTeacherPro(true);
                    } else {
                      localStorage.setItem('teacherProAccess', 'true');
                    }
                    router.push('/payment?plan=resource-library');
                    return;
                  }
                  if (plan.name === 'School') {
                    const subject = encodeURIComponent('School plan enquiry');
                    const body = encodeURIComponent('Hello Russell, I would like to ask about a School plan.');
                    window.location.href = `mailto:boredteacherapp@gmail.com?subject=${subject}&body=${body}`;
                  }
                }}
              >
                {hasTeacherPro && plan.name === 'Teacher Pro' ? 'Teacher Pro Active' : plan.action}
              </button>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
