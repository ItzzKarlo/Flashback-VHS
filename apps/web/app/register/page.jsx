'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { apiFetch, saveAuthSession } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      saveAuthSession(data);
      router.push('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-shell">
      <form className="panel auth-card" onSubmit={submit}>
        <span className="eyebrow">Start saving</span>
        <h1>Register</h1>
        <p>Create a profile for saved renders, reusable VHS looks, and account-based history.</p>

        {error && <div className="alert error"><pre>{error}</pre></div>}

        <label>
          Username
          <input
            value={form.username}
            disabled={busy}
            onChange={(event) => update('username', event.target.value)}
            minLength="2"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            disabled={busy}
            onChange={(event) => update('email', event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            disabled={busy}
            onChange={(event) => update('password', event.target.value)}
            minLength="8"
            required
          />
        </label>

        <button className="primary-button" disabled={busy}>
          {busy ? 'Creating account...' : 'Create account'}
        </button>

        <small className="muted">
          Already registered? <Link href="/login">Login</Link>
        </small>
      </form>
    </section>
  );
}
