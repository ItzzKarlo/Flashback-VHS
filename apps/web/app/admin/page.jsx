'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';

export default function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');
  const [maintenanceForm, setMaintenanceForm] = useState({
    enabled: false,
    message: 'FlashbackVHS is briefly offline for maintenance.',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadAdmin() {
    setBusy(true);
    setError('');

    try {
      const data = await apiFetch('/api/admin/summary', { auth: true });
      setSummary(data);
      if (data.maintenance) setMaintenanceForm(data.maintenance);
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

  async function saveMaintenance(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const data = await apiFetch('/api/admin/maintenance', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(maintenanceForm),
      });
      setMaintenanceForm(data);
      setMessage(data.enabled ? 'Maintenance mode is on.' : 'Maintenance mode is off.');
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

      <section className="panel">
        <form className="account-form" onSubmit={saveMaintenance}>
          <div className="section-heading with-action">
            <div className="section-title-inline">
              <span>01</span>
              <h2>Maintenance mode</h2>
            </div>
            <label className="checkbox-label compact">
              <input
                type="checkbox"
                checked={maintenanceForm.enabled}
                onChange={(event) => setMaintenanceForm((current) => ({ ...current, enabled: event.target.checked }))}
              />
              Enabled
            </label>
          </div>
          <label>
            Message
            <input
              value={maintenanceForm.message}
              onChange={(event) => setMaintenanceForm((current) => ({ ...current, message: event.target.value }))}
              maxLength="240"
            />
          </label>
          <button className="secondary-button" disabled={busy}>Save maintenance state</button>
        </form>
      </section>

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
          <span>02</span>
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
