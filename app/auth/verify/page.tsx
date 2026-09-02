'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, loadUserState, onAuthStateChanged, saveUserState } from '@/lib/firebase';
import { getAvatarGiftOptions } from '@/lib/email-verification';

const giftOptions = getAvatarGiftOptions();

export default function EmailVerificationPage() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string>('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('Player');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [giftMode, setGiftMode] = useState(false);
  const [selectedGift, setSelectedGift] = useState<string>('');
  const [giftClaiming, setGiftClaiming] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace('/auth');
        return;
      }

      setUserUid(user.uid);
      setEmail(user.email || '');
      setDisplayName(user.displayName || 'Player');
      const profile = await loadUserState(user.uid);
      if (profile?.emailVerified) {
        if (profile.welcomeGiftClaimed) {
          router.replace('/hub');
          return;
        }
        setGiftMode(true);
      }
      setChecking(false);
    });

    return unsub;
  }, [router]);

  async function sendVerificationCode() {
    if (!userUid || !email) return;
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', uid: userUid, email, displayName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Could not send the verification code.');
      setInfo('A new verification code was sent to your email. Check spam or junk mail if you do not see it.');
    } catch (err) {
      setError((err as Error).message || 'Unable to send the code right now.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!userUid || !code.trim()) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', uid: userUid, code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Verification failed.');

      setInfo('Email verified successfully!');
      if (json.needsGiftSelection) {
        setGiftMode(true);
      } else {
        router.replace('/hub');
      }
    } catch (err) {
      setError((err as Error).message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function claimGift() {
    if (!selectedGift || !userUid) return;
    setGiftClaiming(true);
    setError('');
    setInfo('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim-gift', uid: userUid, giftId: selectedGift }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Unable to claim your gift.');

      await saveUserState(userUid, { avatar: json.avatar, welcomeGiftClaimed: true, welcomeGiftId: selectedGift });
      if (auth?.currentUser) {
        auth.currentUser.reload().catch(() => undefined);
      }
      router.replace('/hub');
    } catch (err) {
      setError((err as Error).message || 'Something went wrong with your gift.');
    } finally {
      setGiftClaiming(false);
    }
  }

  if (checking) return null;

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-icon">✉️</div>
        <h1>{giftMode ? 'Choose your starter avatar' : 'Verify your email address'}</h1>
        <p>
          {giftMode
            ? 'Welcome! Pick one of the three starter avatars below. You can pay for the others later in the shop.'
            : 'A 6-digit verification code has been sent to your email. Please type it in to continue.'}
        </p>

        {error && <div className="verify-error">{error}</div>}
        {info && <div className="verify-info">{info}</div>}

        {!giftMode && (
          <>
            <label className="verify-label">Email</label>
            <div className="verify-email">{email || 'Checking your account…'}</div>

            <label className="verify-label" htmlFor="verifyCode">Verification code</label>
            <input
              id="verifyCode"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              className="verify-input"
            />

            <button className="verify-btn" onClick={verifyCode} disabled={loading || !code.trim()}>
              {loading ? 'Checking…' : 'Continue'}
            </button>

            <button className="verify-subtle" onClick={sendVerificationCode} disabled={loading}>
              {loading ? 'Sending…' : 'Resend code'}
            </button>
          </>
        )}

        {giftMode && (
          <div className="gift-grid">
            {giftOptions.map((gift) => (
              <button
                key={gift.id}
                type="button"
                className={`gift-option ${selectedGift === gift.id ? 'selected' : ''}`}
                onClick={() => setSelectedGift(gift.id)}
              >
                <span className="gift-emoji">{gift.emoji}</span>
                <strong>{gift.name}</strong>
              </button>
            ))}
            <button className="verify-btn" onClick={claimGift} disabled={giftClaiming || !selectedGift}>
              {giftClaiming ? 'Claiming…' : 'Choose avatar'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: linear-gradient(180deg, rgba(18,25,41,0.96), rgba(19,22,30,0.96));
        }
        .verify-card {
          width: min(100%, 520px);
          background: var(--surface-strong);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 28px 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.4);
        }
        .verify-icon { font-size: 3rem; text-align: center; margin-bottom: 10px; }
        h1 { margin: 0 0 12px; font-size: clamp(1.75rem, 2vw, 2.4rem); text-align: center; }
        p { color: var(--muted); text-align: center; margin-bottom: 18px; }
        .verify-label { display: block; font-size: 0.72rem; letter-spacing: 0.11em; text-transform: uppercase; margin-bottom: 8px; margin-top: 12px; }
        .verify-email {
          padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border);
          background: var(--surface-soft); color: var(--text); font-weight: 600; margin-bottom: 14px;
        }
        .verify-input {
          width: 100%; padding: 14px 12px; border-radius: 12px; border: 1px solid var(--border);
          background: var(--surface-soft); color: var(--text); font-size: 1.6rem; letter-spacing: 0.26em; text-align: center;
        }
        .verify-btn {
          width: 100%; margin-top: 18px; border: 0; border-radius: 12px; padding: 14px 16px; font-weight: 800; cursor: pointer;
          background: linear-gradient(135deg, var(--gold), var(--teal)); color: white;
        }
        .verify-subtle {
          width: 100%; margin-top: 10px; border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; cursor: pointer;
          background: transparent; color: var(--muted);
        }
        .verify-error {
          margin-bottom: 12px; background: rgba(233,109,109,.12); border: 1px solid rgba(233,109,109,.28); color: var(--red);
          border-radius: 12px; padding: 10px 12px;
        }
        .verify-info {
          margin-bottom: 12px; background: rgba(125,187,138,.12); border: 1px solid rgba(125,187,138,.28); color: var(--green);
          border-radius: 12px; padding: 10px 12px;
        }
        .gift-grid { display: grid; gap: 16px; }
        .gift-option {
          width: 100%; border: 1px solid var(--border); border-radius: 16px; background: var(--surface-soft); padding: 18px 16px;
          color: var(--text); display: flex; align-items: center; gap: 16px; cursor: pointer; text-align: left;
        }
        .gift-option.selected { border-color: var(--teal); box-shadow: 0 0 0 2px rgba(93,189,181,0.2); }
        .gift-emoji { font-size: 2.5rem; }
      `}</style>
    </div>
  );
}
