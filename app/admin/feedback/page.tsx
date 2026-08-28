'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, loadFeedback, onAuthStateChanged } from '@/lib/firebase';

type FeedbackItem = {
  id: string;
  message?: string;
  type?: 'suggestion' | 'grievance';
  page?: string;
  userName?: string;
  createdAt?: { toDate?: () => Date };
};

const CREATOR_EMAIL = 'boredteacherapp@gmail.com';

export default function FeedbackAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied' | 'error'>('loading');
  const [filter, setFilter] = useState<'all' | 'suggestion' | 'grievance'>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async user => {
      if (!user) {
        router.replace('/auth');
        return;
      }
      if (user.email?.toLowerCase() !== CREATOR_EMAIL) {
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

  const visibleItems = filter === 'all' ? items : items.filter(item => item.type === filter);
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
    return <div className="admin-feedback-page"><section className="shell-card admin-feedback-empty"><h1>Could not load feedback</h1><p>Check that your Firestore rules allow the creator account to read the feedback collection.</p></section></div>;
  }

  return (
    <div className="admin-feedback-page">
      <header className="admin-feedback-header">
        <div>
          <p className="suggestions-kicker">Creator workspace</p>
          <h1 className="hub-welcome-title">Suggestions inbox</h1>
          <p className="hub-welcome-sub">Review the ideas and bug reports users have trusted you with.</p>
        </div>
        <div className="admin-feedback-count"><strong>{items.length}</strong><span>messages saved</span></div>
      </header>
      <div className="admin-feedback-filters" role="group" aria-label="Filter feedback">
        {(['all', 'suggestion', 'grievance'] as const).map(option => <button key={option} className={`pill-btn${filter === option ? ' active' : ''}`} onClick={() => setFilter(option)}>{option === 'all' ? 'All messages' : option === 'suggestion' ? 'Suggestions' : 'Problems and bugs'}</button>)}
      </div>
      <section className="admin-feedback-list">
        {visibleItems.length ? visibleItems.map(item => <article className="shell-card admin-feedback-item" key={item.id}>
          <div className="admin-feedback-item-top"><span className={`admin-feedback-type ${item.type === 'grievance' ? 'problem' : ''}`}>{item.type === 'grievance' ? '🐛 Problem or bug' : '💡 Suggestion'}</span><time>{formatDate(item.createdAt)}</time></div>
          <p>{item.message}</p>
          <small>From {item.userName || 'Guest'} · sent from {item.page || 'the app'}</small>
        </article>) : <section className="shell-card admin-feedback-empty"><h2>No messages in this view</h2><p>New feedback will appear here as users send it.</p></section>}
      </section>
    </div>
  );
}