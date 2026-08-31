'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, isCreatorUser, loadFeedback, onAuthStateChanged, resolveFeedback } from '@/lib/firebase';

type FeedbackItem = {
  id: string;
  message?: string;
  type?: 'suggestion' | 'grievance';
  page?: string;
  userName?: string;
  createdAt?: { toDate?: () => Date };
  resolved?: boolean;
};

export default function FeedbackAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied' | 'error'>('loading');
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async user => {
      if (!user) {
        router.replace('/auth');
        return;
      }
      if (!isCreatorUser(user)) {
        setStatus('denied');
        return;
      }
      try {
        setItems((await loadFeedback()) as FeedbackItem[]);
        setStatus('ready');
      } catch (_) {
        setStatus('error');
      }
    });
    return unsubscribe;
  }, [router]);

  const visibleItems = items.filter(item => filter === 'all' || filter === 'open' ? !item.resolved || filter === 'all' : item.resolved);
  const formatDate = (value: FeedbackItem['createdAt']) => {
    try {
      return value?.toDate?.().toLocaleString() ?? 'Date unavailable';
    } catch (_) {
      return 'Date unavailable';
    }
  };

  if (status === 'loading') return null;
  if (status === 'denied') {
    return <div className="admin-feedback-page"><section className="shell-card admin-feedback-empty"><h1>Creator access required</h1><p>This page is reserved for the app creator.</p></section></div>;
  }
  if (status === 'error') {
    return <div className="admin-feedback-page"><section className="shell-card admin-feedback-empty"><h1>Could not load feedback</h1><p>Check that your Firestore rules allow the signed-in creator account to read the feedback collection.</p></section></div>;
  }

  return (
    <div className="admin-feedback-page">
      <header className="admin-feedback-header">
        <div>
          <p className="suggestions-kicker">Creator workspace</p>
          <h1 className="hub-welcome-title">Suggestions inbox</h1>
          <p className="hub-welcome-sub">Review the ideas and bug reports users have trusted you with.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/admin/users" className="pill-btn" style={{ textDecoration: 'none' }}>View users</Link>
          <div className="admin-feedback-count"><strong>{items.length}</strong><span>messages saved</span></div>
        </div>
      </header>
      <div className="admin-feedback-filters" role="group" aria-label="Filter feedback">
        {(['open', 'resolved', 'all'] as const).map(option => <button key={option} className={`pill-btn${filter === option ? ' active' : ''}`} onClick={() => setFilter(option)}>{option === 'open' ? 'Needs review' : option === 'resolved' ? 'Resolved' : 'All messages'}</button>)}
      </div>
      <section className="admin-feedback-list">
        {visibleItems.length ? visibleItems.map(item => <article className={`shell-card admin-feedback-item${item.resolved ? ' resolved' : ''}`} key={item.id}>
          <div className="admin-feedback-item-top"><span className={`admin-feedback-type ${item.type === 'grievance' ? 'problem' : ''}`}>{item.resolved ? '✓ Resolved' : item.type === 'grievance' ? '🐛 Problem or bug' : '💡 Suggestion'}</span><time>{formatDate(item.createdAt)}</time></div>
          <p>{item.message}</p>
          <div className="admin-feedback-item-bottom"><small>From {item.userName || 'Guest'} · sent from {item.page || 'the app'}</small>{!item.resolved && <button className="pill-btn" onClick={async () => { await resolveFeedback(item.id); setItems(current => current.map(message => message.id === item.id ? { ...message, resolved: true } : message)); }}>Mark resolved</button>}</div>
        </article>) : <section className="shell-card admin-feedback-empty"><h2>No messages in this view</h2><p>New feedback will appear here as users send it.</p></section>}
      </section>
    </div>
  );
}