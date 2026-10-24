'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  isCreatorUser,
  loadPendingReviewsForCreator,
  onAuthStateChanged,
  setReviewApproval,
  type ReviewItem,
} from '@/lib/firebase';

type PageStatus = 'loading' | 'ready' | 'error';

function formatDate(value: ReviewItem['createdAt']) {
  try {
    if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate().toLocaleString();
    }
    return 'Date unavailable';
  } catch {
    return 'Date unavailable';
  }
}

export default function ReviewsAdminPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [actionError, setActionError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(async user => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (!isCreatorUser(user)) {
      router.replace('/hub');
      return;
    }
    try {
      setReviews(await loadPendingReviewsForCreator());
      setStatus('ready');
    } catch (error) {
      console.error('Unable to load pending reviews.', error);
      setStatus('error');
    }
  }), [router]);

  async function moderate(review: ReviewItem, approvalStatus: 'approved' | 'rejected') {
    if (!review.id) {
      setActionError('This review is missing its record id and cannot be updated.');
      return;
    }
    setUpdatingId(review.id);
    setActionError('');
    try {
      await setReviewApproval(review.id, approvalStatus);
      setReviews(current => current.filter(item => item.id !== review.id));
    } catch (error) {
      console.error(`Unable to ${approvalStatus} review.`, error);
      setActionError(error instanceof Error ? error.message : 'The review could not be updated.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (status === 'loading') return null;

  return (
    <div className="admin-feedback-page">
      <header className="admin-feedback-header">
        <div>
          <p className="suggestions-kicker">Creator workspace</p>
          <h1 className="hub-welcome-title">Review approvals</h1>
          <p className="hub-welcome-sub">New reviews stay private until you approve them for the hub.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/admin" className="pill-btn" style={{ textDecoration: 'none' }}>Creator view</Link>
          <div className="admin-feedback-count"><strong>{reviews.length}</strong><span>pending reviews</span></div>
        </div>
      </header>

      {status === 'error' ? (
        <section className="shell-card admin-feedback-empty">
          <h2>Could not load pending reviews</h2>
          <p>Check that Firestore rules allow the signed-in creator account to read pending review submissions.</p>
        </section>
      ) : actionError ? (
        <section role="alert" className="shell-card admin-feedback-empty"><p>{actionError}</p></section>
      ) : null}

      {status === 'ready' && reviews.length ? (
        <section className="admin-feedback-list" aria-label="Pending reviews">
          {reviews.map(review => (
            <article className="shell-card admin-feedback-item" key={review.id}>
              <div className="admin-feedback-item-top">
                <span className="admin-feedback-type">★ {review.rating} / 5 stars</span>
                <time>{formatDate(review.createdAt)}</time>
              </div>
              <p>{review.comment}</p>
              <div className="admin-feedback-item-bottom">
                <small>From {review.userName || 'Unnamed user'} · {review.page || '/hub'}</small>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="pill-btn"
                    disabled={updatingId === review.id}
                    onClick={() => moderate(review, 'approved')}
                  >
                    {updatingId === review.id ? 'Saving...' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    className="pill-btn"
                    disabled={updatingId === review.id}
                    onClick={() => moderate(review, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : status === 'ready' ? (
        <section className="shell-card admin-feedback-empty">
          <h2>No reviews need approval</h2>
          <p>New review submissions will appear here for your review.</p>
        </section>
      ) : null}
    </div>
  );
}
