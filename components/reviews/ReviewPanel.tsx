'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { auth, hasPublicReviewIdentity, loadReviews, submitReview, type ReviewItem } from '@/lib/firebase';
import { useGame } from '@/providers/GameProvider';
import ProfileAvatar from '@/components/profile/ProfileAvatar';

function countryFlag(countryCode?: string) {
  const code = countryCode?.trim().toUpperCase();
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(...[...code].map(letter => 127397 + letter.charCodeAt(0)));
}

export default function ReviewPanel({ isCreator = false }: { isCreator?: boolean }) {
  const { state } = useGame();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setReviews((await loadReviews()).slice(0, 4));
  }

  useEffect(() => {
    refresh().catch(error => {
      console.error('Unable to load public reviews.', error);
      setReviews([]);
      setMessage('Reviews are temporarily unavailable.');
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = comment.trim();
    if (!text) {
      setMessage('Add a comment before saving the review.');
      return;
    }
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      setMessage('Sign in with a named profile and selected avatar before submitting a public review.');
      return;
    }
    const userName = state.name.trim() && state.name !== 'Explorer'
      ? state.name.trim()
      : currentUser?.displayName?.trim() ?? '';
    const avatar = state.avatar.trim();
    const reviewer = { userId: currentUser?.uid, userName, avatar };
    if (!hasPublicReviewIdentity(reviewer)) {
      setMessage('Sign in with a named profile and selected avatar before submitting a public review.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await submitReview({
        userId: currentUser.uid,
        userName,
        userEmail: currentUser.email,
        avatar,
        countryCode: 'GB',
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
      <div className="hub-preview-header"><h2 id="hub-reviews-title" className="hub-section-title">💬 What people say</h2></div>
      <div className="hub-review-grid">
        {reviews.length ? reviews.map(review => <article className="hub-review-item" key={review.id || `${review.userName}-${review.comment}`}><div className="hub-review-stars" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 5)))}</div><p>{review.comment}</p><div className="hub-review-author"><ProfileAvatar value={review.avatar ?? ''} size={34} alt="" className="hub-review-avatar" /><span className="hub-review-author-copy"><strong>{review.userName}</strong><small>{review.age ? `${review.age} · ` : 'Age not shared · '}{countryFlag(review.countryCode)}</small></span></div></article>) : <p className="hub-review-empty">{message || 'No verified reviews yet. Be the first to share yours.'}</p>}
      </div>
      {isCreator && <form className="hub-review-form" onSubmit={handleSubmit}><strong>Add a review to the hub</strong><div className="hub-review-form-row"><select value={rating} onChange={event => setRating(Number(event.target.value))} aria-label="Review rating">{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}</select><input value={comment} onChange={event => setComment(event.target.value)} maxLength={500} placeholder="Write a featured review" aria-label="Review comment" /><button className="pill-btn" disabled={saving}>{saving ? 'Saving...' : 'Add review'}</button></div>{message && <small role="status">{message}</small>}</form>}
    </section>
  );
}
