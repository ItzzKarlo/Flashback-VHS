'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { apiFetch, saveAuthSession } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const data = await apiFetch('/api/auth/login', {
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
        <span className="eyebrow">Account</span>
        <h1>Login</h1>
        <p>Access saved VHS renders, re-download exports, and keep your favorite looks close.</p>

        {error && <div className="alert error"><pre>{error}</pre></div>}

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
            required
          />
        </label>

        <button className="primary-button" disabled={busy}>
          {busy ? 'Logging in...' : 'Login'}
        </button>

        <small className="muted">
          New here? <Link href="/register">Create an account</Link>
        </small>
      </form>
    </section>
  );
}
