'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { auth, loadReviews, submitReview, type ReviewItem } from '@/lib/firebase';

export default function ReviewPanel({ isCreator = false }: { isCreator?: boolean }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setReviews((await loadReviews()).slice(0, 4));
  }

  useEffect(() => { refresh().catch(() => setReviews([])); }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = comment.trim();
    if (!text) {
      setMessage('Add a comment before saving the review.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await submitReview({
        userId: auth?.currentUser?.uid ?? null,
        userName: auth?.currentUser?.displayName ?? (isCreator ? 'Creator' : 'Guest'),
        userEmail: auth?.currentUser?.email ?? null,
        rating,
        comment: text,
        page: '/hub',
      });
      setComment('');
      setRating(5);
      await refresh();
      setMessage('Review saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The review could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="shell-card hub-reviews-panel" aria-labelledby="hub-reviews-title">
      <div className="hub-preview-header"><h2 id="hub-reviews-title" className="hub-section-title">💬 What people say</h2><span className="hub-review-count">{reviews.length} reviews</span></div>
      <div className="hub-review-grid">
        {reviews.length ? reviews.map(review => <article className="hub-review-item" key={review.id || `${review.userName}-${review.comment}`}><div className="hub-review-stars">{'★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 5)))}</div><p>{review.comment}</p><small>{review.userName || 'Guest'}</small></article>) : <p className="hub-review-empty">Be the first to review Bored Teacher.</p>}
      </div>
      {isCreator && <form className="hub-review-form" onSubmit={handleSubmit}><strong>Add a review to the hub</strong><div className="hub-review-form-row"><select value={rating} onChange={event => setRating(Number(event.target.value))} aria-label="Review rating">{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}</select><input value={comment} onChange={event => setComment(event.target.value)} maxLength={500} placeholder="Write a featured review" aria-label="Review comment" /><button className="pill-btn" disabled={saving}>{saving ? 'Saving...' : 'Add review'}</button></div>{message && <small role="status">{message}</small>}</form>}
    </section>
  );
}
