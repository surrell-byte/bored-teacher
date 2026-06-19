'use client';
// app/auth/page.tsx — Sign in / sign up (replaces auth.html)

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signIn, signUp, resetPassword, onAuthStateChanged,
  createClassCode, resolveClassCode, setUserClass,
} from '@/lib/firebase';

type Tab = 'login' | 'register';
type Role = 'teacher' | 'student';
type Step = 'form' | 'showCode' | 'needCode';

function AuthPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab]         = useState<Tab>('login');
  const [role, setRole]       = useState<Role>('student');
  const [email, setEmail]     = useState('');
  const [password, setPwd]    = useState('');
  const [name, setName]       = useState('');
  const [classCode, setClassCode] = useState('');
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady]     = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [suppressRedirect, setSuppressRedirect] = useState(false);

  // Post-registration flow state
  const [step, setStep]                   = useState<Step>('form');
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingUid, setPendingUid]       = useState('');
  const [copied, setCopied]               = useState(false);

  // Auth guard — if already signed in, go to hub.
  // Exception: ?needCode=1 means hub.tsx bounced this user here because they have
  // no classId yet — show the recovery screen instead of looping back to /hub.
  useEffect(() => {
    if (localStorage.getItem('guestUser') === 'true') { router.replace('/hub'); return; }
    const needsCode = searchParams.get('needCode') === '1';
    const unsub = onAuthStateChanged((user) => {
      if (user && needsCode) {
        setPendingUid(user.uid);
        setStep('needCode');
        setSuppressRedirect(true);
        setReady(true);
        return;
      }
      if (user && !suppressRedirect) { router.replace('/hub'); return; }
      setReady(true);
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, suppressRedirect, searchParams]);

  useEffect(() => {
    if (searchParams.get('reason') === 'timeout') {
      setInfo('You were signed out after 20 minutes of inactivity.');
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      if (tab === 'login') {
        await signIn(email, password);
        router.replace('/hub');
        return;
      }

      // ── Register ──
      if (!name.trim()) { setError('Please enter your display name.'); setLoading(false); return; }
      if (role === 'student' && !classCode.trim()) {
        setError('Please enter the class code your teacher gave you.');
        setLoading(false);
        return;
      }

      setSuppressRedirect(true);
      const user = await signUp(email, password, name.trim());

      if (role === 'teacher') {
        const code = await createClassCode(user.uid);
        await setUserClass(user.uid, user.uid, 'teacher');
        setGeneratedCode(code);
        setStep('showCode');
        setLoading(false);
        return;
      }

      // role === 'student'
      const teacherUid = await resolveClassCode(classCode);
      if (!teacherUid) {
        setPendingUid(user.uid);
        setStep('needCode');
        setLoading(false);
        return;
      }
      await setUserClass(user.uid, teacherUid, 'student');
      setSuppressRedirect(false);
      router.replace('/hub');
    } catch (err: unknown) {
      setError(friendlyError(err));
      setLoading(false);
    }
  }

  async function handleJoinRetry() {
    setError(''); setLoading(true);
    const teacherUid = await resolveClassCode(classCode);
    if (!teacherUid) {
      setError("Still not finding that code. Double-check with your teacher — it's case-insensitive but every character has to match.");
      setLoading(false);
      return;
    }
    await setUserClass(pendingUid, teacherUid, 'student');
    setLoading(false);
    setSuppressRedirect(false);
    router.replace('/hub');
  }

  function handleCopyCode() {
    navigator.clipboard?.writeText(generatedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleContinueToHub() {
    setSuppressRedirect(false);
    router.replace('/hub');
  }

  async function handleReset() {
    if (!email) { setError('Enter your email address first.'); return; }
    try {
      await resetPassword(email);
      setInfo('✅ Reset email sent — check your inbox.');
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }

  function handleGuest() {
    localStorage.setItem('guestUser', 'true');
    localStorage.removeItem('currentUser');
    router.replace('/hub');
  }

  if (!ready) return null;

  return (
    <div className="auth-page">
      <span className="deco tl" aria-hidden>📚</span>
      <span className="deco tr" aria-hidden>🎮</span>
      <span className="deco bl" aria-hidden>✏️</span>
      <span className="deco br" aria-hidden>🏆</span>

      <div className="auth-card">
        <div className="logo">
          <span className="logo-icon">🎓</span>
          <h1>ESL Game Hub</h1>
          <p>Learn · Play · Level Up</p>
        </div>

        {/* ── Teacher: show their new class code ── */}
        {step === 'showCode' ? (
          <div>
            <div className="auth-info" role="status">✅ Account created! Here's your class code:</div>
            <div className="class-code-display">{generatedCode}</div>
            <p className="guest-note">Share this code with your students — they'll enter it when they register.</p>
            <button className="auth-submit" style={{ marginBottom: 10 }} onClick={handleCopyCode}>
              {copied ? '✅ Copied!' : '📋 Copy Code'}
            </button>
            <button className="guest-btn" onClick={handleContinueToHub}>Continue to Hub →</button>
          </div>

        /* ── Student: signup succeeded but code didn't resolve — retry just the code ── */
        ) : step === 'needCode' ? (
          <div>
            <div className="auth-error" role="alert">
              That class code wasn't recognized. Your account was created — just enter a valid code below to finish joining your class.
            </div>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <div className="field">
              <label htmlFor="retryCode">Class Code</label>
              <input
                id="retryCode" type="text" value={classCode}
                onChange={e => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g. K7X9QM" autoComplete="off" maxLength={6}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <button className="auth-submit" onClick={handleJoinRetry} disabled={loading}>
              {loading ? '⏳ Checking…' : 'Join Class'}
            </button>
          </div>

        ) : (
        <>
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn${tab === 'login' ? ' active' : ''}`}
              onClick={() => { setTab('login'); setError(''); setInfo(''); }}
            >Sign In</button>
            <button
              className={`tab-btn${tab === 'register' ? ' active' : ''}`}
              onClick={() => { setTab('register'); setError(''); setInfo(''); }}
            >Register</button>
          </div>

          {/* Role toggle — register only */}
          {tab === 'register' && (
            <div className="tabs" style={{ marginBottom: '1.1rem' }}>
              <button
                className={`tab-btn${role === 'teacher' ? ' active' : ''}`}
                onClick={() => setRole('teacher')}
              >👨‍🏫 I'm a Teacher</button>
              <button
                className={`tab-btn${role === 'student' ? ' active' : ''}`}
                onClick={() => setRole('student')}
              >🎓 I'm a Student</button>
            </div>
          )}

          {error && <div className="auth-error" role="alert" aria-live="polite">{error}</div>}
          {info  && <div className="auth-info"  role="status" aria-live="polite">{info}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {tab === 'register' && (
              <div className="field">
                <label htmlFor="name">Your Name</label>
                <input id="name" type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Kim" autoComplete="name" required />
              </div>
            )}

            {tab === 'register' && role === 'student' && (
              <div className="field">
                <label htmlFor="classCode">Class Code</label>
                <input
                  id="classCode" type="text" value={classCode}
                  onChange={e => setClassCode(e.target.value.toUpperCase())}
                  placeholder="e.g. K7X9QM" autoComplete="off" maxLength={6} required
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.com" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPwd(e.target.value)}
                  placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} required
                  style={{ paddingRight: '44px' }} />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
                    fontSize: '1rem', padding: '4px', lineHeight: 1,
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? '⏳ Please wait…' : tab === 'login' ? '🔐 Sign In' : '🚀 Create Account'}
            </button>

            {tab === 'login' && (
              <button type="button" className="forgot-btn" onClick={handleReset}>
                Forgot password?
              </button>
            )}
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="guest-btn" onClick={handleGuest}>
            👤 Continue as Guest
          </button>
          <p className="guest-note">
            Guest progress is saved on this device only and won't sync across browsers.
          </p>
        </>
        )}
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          background: var(--bg);
        }
        .deco {
          position: fixed; font-size: 3.8rem; opacity: 0.055;
          pointer-events: none; user-select: none; z-index: 0;
        }
        .deco.tl { top:18px; left:18px; }
        .deco.tr { top:18px; right:18px; transform:scaleX(-1); }
        .deco.bl { bottom:18px; left:18px; }
        .deco.br { bottom:18px; right:18px; }

        .auth-card {
          background: var(--surface-strong);
          border: 1.5px solid var(--border);
          border-radius: 26px;
          padding: 2.25rem 2.5rem;
          width: 100%; max-width: 420px;
          box-shadow: 0 28px 80px rgba(0,0,0,0.5);
          position: relative; z-index: 1;
          animation: cardUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardUp {
          from { opacity:0; transform: translateY(30px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .logo { text-align: center; margin-bottom: 1.7rem; }
        .logo-icon { font-size: 2.9rem; display: block; margin-bottom: .4rem; }
        .logo h1 { font-family: 'Syne',sans-serif; font-size: 2rem; color: var(--text); letter-spacing: .03em; }
        .logo p  { color: var(--teal); font-size: .8rem; font-weight: 700; margin-top: .2rem; letter-spacing: .1em; text-transform: uppercase; }

        .tabs {
          display: flex; background: rgba(0,0,0,.1);
          border: 1px solid var(--border); border-radius: 13px;
          padding: 4px; margin-bottom: 1.5rem; gap: 4px;
        }
        .tab-btn {
          flex: 1; padding: .5rem; border: none; background: transparent;
          color: var(--muted); font-family: 'DM Sans',sans-serif;
          font-size: .87rem; font-weight: 800; border-radius: 10px;
          cursor: pointer; transition: background .18s, color .18s;
        }
        .tab-btn.active {
          background: var(--teal); color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,.18);
        }

        .auth-error {
          background: rgba(233,109,109,.1);
          border: 1px solid rgba(233,109,109,.3);
          color: var(--red); border-radius: 12px;
          padding: 10px 14px; font-size: .85rem; margin-bottom: 14px;
        }
        .auth-info {
          background: rgba(125,187,138,.1);
          border: 1px solid rgba(125,187,138,.3);
          color: var(--green); border-radius: 12px;
          padding: 10px 14px; font-size: .85rem; margin-bottom: 14px;
        }

        .field { margin-bottom: .95rem; }
        .field label {
          display: block; color: var(--text); font-size: .72rem;
          font-weight: 800; margin-bottom: .38rem;
          letter-spacing: .09em; text-transform: uppercase; opacity: .85;
        }
        .field input {
          width: 100%; padding: .66rem .92rem;
          background: var(--surface-soft);
          border: 1.5px solid var(--border); border-radius: 11px;
          color: var(--text); font-family: 'DM Sans',sans-serif;
          font-size: .95rem; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .field input:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(93,189,181,.15);
        }
        .field input::placeholder { color: var(--muted); }

        .auth-submit {
          width: 100%; border: none; padding: 13px;
          border-radius: 12px; cursor: pointer;
          font-family: 'Syne',sans-serif; font-size: .92rem; font-weight: 800;
          background: linear-gradient(135deg, var(--gold), var(--teal));
          color: #fff; margin-top: 4px;
          box-shadow: 0 8px 28px rgba(0,0,0,.2);
          transition: transform .2s, box-shadow .2s;
        }
        .auth-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,.3); }
        .auth-submit:disabled { opacity: .6; cursor: not-allowed; }

        .forgot-btn {
          background: none; border: none; color: var(--muted);
          font-size: .8rem; cursor: pointer; padding: 6px 0; width: 100%;
          margin-top: 8px; transition: color .2s;
        }
        .forgot-btn:hover { color: var(--text); }

        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 18px 0; color: var(--muted); font-size: .78rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        .guest-btn {
          width: 100%; padding: 12px;
          border-radius: 12px; border: 1px solid var(--border);
          background: var(--surface-soft); color: var(--text);
          font-family: 'DM Sans',sans-serif; font-size: .88rem; font-weight: 600;
          cursor: pointer; transition: border-color .2s, transform .2s;
        }
        .guest-btn:hover { border-color: var(--border-bright); transform: translateY(-1px); }

        .guest-note {
          text-align: center; color: var(--muted);
          font-size: .72rem; margin-top: 10px; line-height: 1.5;
        }

        .class-code-display {
          text-align: center;
          font-family: 'Syne', sans-serif;
          font-size: 2.4rem; font-weight: 800;
          letter-spacing: 0.15em;
          color: var(--gold);
          background: var(--surface-soft);
          border: 2px dashed var(--border-bright);
          border-radius: 16px;
          padding: 18px 10px;
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password') return 'Wrong email or password.';
  if (code === 'auth/email-already-in-use') return 'That email is already registered. Try signing in.';
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
  return (err as Error)?.message ?? 'Something went wrong. Please try again.';
}