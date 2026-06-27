'use client';

import Link from 'next/link';
import { useState } from 'react';

import { apiFetch } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestReset(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const data = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
      if (data.reset_token) setResetToken(data.reset_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const data = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      });
      setMessage(data.message || 'Password reset.');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="panel auth-card">
        <span className="eyebrow">Password reset</span>
        <h1>Recover access</h1>
        <p>Request a reset token, then set a new password.</p>

        {error && <div className="alert error"><pre>{error}</pre></div>}
        {message && <div className="alert status">{message}</div>}

        <form className="account-form" onSubmit={requestReset}>
          <label>
            Account email
            <input
              type="email"
              value={email}
              disabled={busy}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button className="primary-button" disabled={busy}>
            {busy ? 'Working...' : 'Request reset token'}
          </button>
        </form>

        {resetToken && (
          <form className="account-form" onSubmit={resetPassword}>
            <label>
              Reset token
              <input
                value={resetToken}
                disabled={busy}
                onChange={(event) => setResetToken(event.target.value)}
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                minLength="8"
                value={newPassword}
                disabled={busy}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </label>
            <button className="secondary-button" disabled={busy}>Reset password</button>
          </form>
        )}

        <small className="muted">
          Remembered it? <Link href="/login">Login</Link>
        </small>
      </div>
    </section>
  );
}
