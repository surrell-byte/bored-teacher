'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isCreatorUser, onAuthStateChanged } from '@/lib/firebase';

const creatorTools = [
  { href: '/admin/users', icon: '👥', title: 'Users', description: 'Review accounts, roles, activity, and Teacher Pro access.' },
  { href: '/admin/feedback', icon: '💡', title: 'Feedback', description: 'Review suggestions and mark resolved reports.' },
  { href: '/games', icon: '🎮', title: 'Game catalogue', description: 'Preview the learner catalogue and unpublished game states.' },
  { href: '/settings', icon: '⚙️', title: 'Creator profile', description: 'Update your profile, theme, sound, and account settings.' },
];

export default function CreatorViewPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied'>('loading');

  useEffect(() => onAuthStateChanged(user => {
    if (!user) {
      router.replace('/auth');
    } else if (isCreatorUser(user)) {
      setStatus('ready');
    } else {
      setStatus('denied');
    }
  }), [router]);

  if (status === 'loading') return null;
  if (status === 'denied') {
    return <div className="admin-feedback-page"><section className="shell-card admin-feedback-empty"><h1>Creator access required</h1><p>This workspace is reserved for the app creator.</p></section></div>;
  }

  return (
    <div className="admin-feedback-page creator-view-page">
      <header className="admin-feedback-header">
        <div>
          <p className="suggestions-kicker">Control centre</p>
          <h1 className="hub-welcome-title">Creator View</h1>
          <p className="hub-welcome-sub">Manage the people, feedback, and published experience behind Bored Teacher.</p>
        </div>
        <div className="admin-feedback-count"><strong>✦</strong><span>creator account</span></div>
      </header>

      <section className="creator-tools-grid" aria-label="Creator tools">
        {creatorTools.map(tool => (
          <Link key={tool.href} href={tool.href} className="shell-card creator-tool-card">
            <span className="creator-tool-icon" aria-hidden="true">{tool.icon}</span>
            <span className="creator-tool-title">{tool.title}</span>
            <span className="creator-tool-description">{tool.description}</span>
            <span className="creator-tool-action">Open tool <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </section>

      <section className="shell-card creator-note">
        <span className="creator-note-icon" aria-hidden="true">✉️</span>
        <div><h2>Professional email branding</h2><p>Set the sender name and reset-email subject in Firebase Authentication → Email Templates. Use “Bored Teacher” and “Reset your Bored Teacher password” for a polished learner-facing message.</p></div>
      </section>
    </div>
  );
}