'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged, setTeacherProAccess } from '@/lib/firebase';

export default function PaymentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).get('plan')) {
      router.replace('/shop');
      return;
    }
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) {
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

  const handlePayNow = async () => {
    const user = auth?.currentUser;
    if (user) {
      await setTeacherProAccess(user.uid, true);
    } else {
      localStorage.setItem('teacherProAccess', 'true');
    }
  };

  if (!ready) return null;

  return (
    <div className="payment-page">
      <section className="shell-card payment-header">
        <div className="hero-kicker">💳 Teacher Pro</div>
        <h1 className="hub-welcome-title">Complete your subscription</h1>
        <p className="hub-welcome-sub">Choose a secure payment method to unlock the full teaching resource library.</p>
      </section>
      <section className="shell-card shop-payment">
        <div className="payment-option payment-copy">
          <div className="hero-kicker">💳 Secure checkout</div>
          <h2>Pay with Paynow</h2>
          <div className="subscription-prices"><strong>$10 <span>/ month</span></strong><strong>$110 <span>/ year</span></strong><small>Save $10 per year, or 8.3% compared with monthly billing.</small></div>
          <p>Choose your subscription term, then complete payment securely with Paynow.</p>
          <a className="payment-paynow-button" href="https://www.paynow.co.zw/Payment/Link/?q=c2VhcmNoPXJ1c3NlbGxta2FoYW5hbmElNDBnbWFpbC5jb20mYW1vdW50PTcuMDAmcmVmZXJlbmNlPSZsPTE%3d" target="_blank" rel="noreferrer" onClick={handlePayNow}>Pay now with Paynow</a>
        </div>

        <div className="payment-option payment-ecocash-wrap">
          <div className="hero-kicker">💸 EcoCash</div>
          <h2>Pay with EcoCash</h2>
          <a
            className="payment-ecocash-button"
            href="https://ecocash.co.zw/"
            target="_blank"
            rel="noreferrer"
            aria-label="Open the EcoCash payment page"
          >
            <img src="/assets/images/ecocash-logo.png" alt="EcoCash logo" className="payment-ecocash-logo" />
            <span>EcoCash payment page</span>
          </a>
          <p className="payment-ecocash-instructions">Send amount to +263780074825 and send your slip to boredteacherapp@gmail.com</p>
        </div>

        <div className="payment-option payment-qr-wrap">
          <div className="hero-kicker">📱 Thai QR payment</div>
          <h2>Scan the QR code</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="payment-qr" src="/assets/images/thai-payment-qr-code.jpg" alt="Scan to pay with the payment QR code" />
          <span>Thai QR payment option</span>
          <div className="thai-prices"><strong>330 THB <span>/ month</span></strong><strong>3,600 THB <span>/ year</span></strong></div>
          <small className="payment-proof-note">After paying, email a screenshot of your transaction or payment receipt to boredteacherapp@gmail.com.</small>
        </div>
      </section>
    </div>
  );
}
