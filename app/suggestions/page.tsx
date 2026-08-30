'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged, submitFeedback } from '@/lib/firebase';
import { useGame } from '@/providers/GameProvider';

type FeedbackType = 'suggestion' | 'grievance';

export default function SuggestionsPage() {
  const router = useRouter();
  const { state } = useGame();
  const [ready, setReady] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'permission'>('idle');

  useEffect(() => {
    if (localStorage.getItem('guestUser') === 'true') {
      setReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(user => {
      if (!user) {
        router.replace('/auth');
        return;
      }
      setReady(true);
    });
    return unsubscribe;
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      await submitFeedback({
        message,
        type: feedbackType,
        page: '/suggestions',
        userId: auth.currentUser?.uid,
        userName: state.name,
      });
      setMessage('');
      setStatus('sent');
    } catch (error: any) {
      setStatus(error?.code === 'permission-denied' ? 'permission' : 'error');
    }
  }

  if (!ready) return null;

  return (
    <div className="suggestions-page">
      <section className="suggestions-intro">
        <div>
          <p className="suggestions-kicker">💡 Help shape the hub</p>
          <h1 className="hub-welcome-title">Your voice matters here</h1>
          <p className="hub-welcome-sub">Share an idea, report something that is not working, or tell me how Bored Teacher can better support your classroom.</p>
        </div>
        <div className="suggestions-callout">
          <span>✦</span>
          <strong>Your input is invaluable.</strong>
          <small>Every message helps me improve the games and resources.</small>
        </div>
      </section>

      <section className="shell-card suggestions-form-card">
        <div className="suggestions-form-heading">
          <p className="suggestions-kicker">Open channel</p>
          <h2>What should I know?</h2>
          <p>Be as specific as you like. If you are reporting a bug, include what you were doing and what you expected to happen.</p>
        </div>
        <form onSubmit={handleSubmit} className="feedback-form suggestions-form">
          <div className="feedback-type-row" role="group" aria-label="Feedback type">
            <button type="button" className={feedbackType === 'suggestion' ? 'selected' : ''} onClick={() => setFeedbackType('suggestion')}>💡 Suggestion</button>
            <button type="button" className={feedbackType === 'grievance' ? 'selected' : ''} onClick={() => setFeedbackType('grievance')}>🐛 Problem or bug</button>
          </div>
          <label htmlFor="suggestion-message">Your message</label>
          <textarea id="suggestion-message" value={message} onChange={event => { setMessage(event.target.value); setStatus('idle'); }} placeholder="Tell me what you think..." maxLength={2000} required rows={9} />
          <div className="feedback-form-footer">
            <span>{message.length}/2000</span>
            <button className="game-shell-primary-action" type="submit" disabled={status === 'sending' || !message.trim()}>
              {status === 'sending' ? 'Sending...' : 'Send to Russell'}
            </button>
          </div>
          {status === 'sent' && <p className="feedback-status success" role="status">Thank you. Your feedback has been received and saved.</p>}
          {status === 'error' && <p className="feedback-status error" role="alert">That did not send. Please try again.</p>}
          {status === 'permission' && <p className="feedback-status error" role="alert">Feedback storage is not enabled yet. Please ask the app creator to update the Firebase rules.</p>}
        </form>
      </section>
    </div>
  );
}