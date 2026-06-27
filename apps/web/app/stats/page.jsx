'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';

const RANGES = [
  ['24h', '24h'],
  ['3d', '3d'],
  ['7d', '7d'],
  ['30d', '30d'],
  ['all', 'All time'],
];

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <small>{label}</small>
      <strong>{value ?? '—'}</strong>
    </article>
  );
}

export default function StatsPage() {
  const [range, setRange] = useState('7d');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadStats(nextRange = range) {
    setBusy(true);
    setError('');

    try {
      const data = await apiFetch(`/api/stats?range=${nextRange}`, { auth: true });
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadStats('7d');
  }, []);

  function changeRange(nextRange) {
    setRange(nextRange);
    loadStats(nextRange);
  }

  if (error && !stats) {
    return (
      <section className="simple-page">
        <span className="eyebrow">Statistics</span>
        <h1>Login required</h1>
        <p>{error}</p>
        <div className="hero-actions">
          <Link className="primary-button" href="/login">Login</Link>
          <Link className="secondary-button" href="/register">Register</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="simple-page account-page">
      <div className="account-heading">
        <div>
          <span className="eyebrow">Statistics</span>
          <h1>Render activity</h1>
          <p>Generated output totals, render timing, formats, presets, and account counts.</p>
        </div>
        <div className="category-tabs">
          {RANGES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`tiny-button ${range === id ? 'is-active' : ''}`}
              onClick={() => changeRange(id)}
              disabled={busy}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert error"><pre>{error}</pre></div>}

      <section className="stats-grid">
        <StatCard label="All-time generated" value={stats?.generated?.all_time} />
        <StatCard label="Generated 7d" value={stats?.generated?.last_7d} />
        <StatCard label="Generated 3d" value={stats?.generated?.last_3d} />
        <StatCard label="Generated 24h" value={stats?.generated?.last_24h} />
        <StatCard label="Selected range" value={stats?.generated?.selected} />
        <StatCard label="Average render time" value={stats?.average_render_time_seconds ? `${stats.average_render_time_seconds}s` : '—'} />
        <StatCard label="Users" value={stats?.users?.total} />
        <StatCard label="Saved works" value={stats?.saved_artworks} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>01</span>
          <h2>Most used presets</h2>
        </div>
        <div className="stat-list">
          {(stats?.most_used_presets || []).map(([preset, count]) => (
            <div key={preset}>
              <strong>{preset}</strong>
              <span>{count}</span>
            </div>
          ))}
          {stats?.most_used_presets?.length === 0 && <p className="muted">No renders in this range.</p>}
        </div>
      </section>

      <section className="settings-grid">
        <div className="panel">
          <div className="section-heading">
            <span>02</span>
            <h2>Formats</h2>
          </div>
          <div className="stat-list">
            {(stats?.output_formats || []).map(([format, count]) => (
              <div key={format}>
                <strong>{format.toUpperCase()}</strong>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-heading">
            <span>03</span>
            <h2>Media kinds</h2>
          </div>
          <div className="stat-list">
            {(stats?.media_kinds || []).map(([kind, count]) => (
              <div key={kind}>
                <strong>{kind}</strong>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
