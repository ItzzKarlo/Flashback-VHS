'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';

export default function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadAdmin() {
    setBusy(true);
    setError('');

    try {
      const data = await apiFetch('/api/admin/summary', { auth: true });
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function runCleanup() {
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const data = await apiFetch('/api/admin/cleanup', {
        method: 'POST',
        auth: true,
      });
      setMessage(`Cleanup removed ${data.total_removed} old files.`);
      loadAdmin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadAdmin();
  }, []);

  if (error && !summary) {
    return (
      <section className="simple-page">
        <span className="eyebrow">Admin</span>
        <h1>Admin access required</h1>
        <p>{error}</p>
        <div className="hero-actions">
          <Link className="primary-button" href="/login">Login</Link>
          <Link className="secondary-button" href="/stats">View stats</Link>
        </div>
      </section>
    );
  }

  const stats = summary?.stats;

  return (
    <section className="simple-page account-page">
      <div className="account-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Control room</h1>
          <p>Review users, render volume, and cleanup temporary storage.</p>
        </div>
        <button className="primary-button" onClick={runCleanup} disabled={busy}>
          {busy ? 'Working...' : 'Run cleanup'}
        </button>
      </div>

      {error && <div className="alert error"><pre>{error}</pre></div>}
      {message && <div className="alert status">{message}</div>}

      <section className="stats-grid">
        <article className="stat-card">
          <small>Generated all time</small>
          <strong>{stats?.generated?.all_time ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <small>Generated 7d</small>
          <strong>{stats?.generated?.last_7d ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <small>Users</small>
          <strong>{stats?.users?.total ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <small>Admins</small>
          <strong>{stats?.users?.admins ?? '—'}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>01</span>
          <h2>Users</h2>
        </div>
        <div className="admin-table">
          <div className="admin-table-row is-heading">
            <strong>User</strong>
            <strong>Email</strong>
            <strong>Role</strong>
            <strong>Created</strong>
          </div>
          {(summary?.users || []).map((user) => (
            <div className="admin-table-row" key={user.user_id}>
              <span>{user.username}</span>
              <span>{user.email}</span>
              <span>{user.is_admin ? 'Admin' : 'User'}</span>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
