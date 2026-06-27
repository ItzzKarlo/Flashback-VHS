'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiFetch, apiUrl, clearAuthSession, getStoredUser } from '../../lib/api';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [status, setStatus] = useState('Loading account...');
  const [error, setError] = useState('');

  async function loadAccount() {
    setError('');

    try {
      const me = await apiFetch('/api/auth/me', { auth: true });
      const saved = await apiFetch('/api/artworks', { auth: true });
      setUser(me);
      setArtworks(Array.isArray(saved?.artworks) ? saved.artworks : []);
      setStatus('');
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  }

  function logout() {
    clearAuthSession();
    router.push('/login');
  }

  async function removeArtwork(artworkId) {
    setError('');

    try {
      await apiFetch(`/api/artworks/${artworkId}`, {
        method: 'DELETE',
        auth: true,
      });
      setArtworks((current) => current.filter((item) => item.artwork_id !== artworkId));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    loadAccount();
  }, []);

  if (error && !user) {
    return (
      <section className="simple-page">
        <span className="eyebrow">Account</span>
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
          <span className="eyebrow">Profile</span>
          <h1>{user ? user.username : 'Your account'}</h1>
          <p>{user ? user.email : status}</p>
        </div>
        <button className="secondary-button" onClick={logout}>Logout</button>
      </div>

      {error && <div className="alert error"><pre>{error}</pre></div>}
      {status && <div className="alert status">{status}</div>}

      <section className="panel">
        <div className="section-heading with-action">
          <div className="section-title-inline">
            <span>01</span>
            <h2>Saved works</h2>
          </div>
          <Link className="tiny-button" href="/upload">Create new</Link>
        </div>

        {artworks.length === 0 ? (
          <div className="preview-empty">No saved renders yet.</div>
        ) : (
          <div className="saved-grid">
            {artworks.map((artwork) => (
              <article key={artwork.artwork_id} className="saved-card">
                {artwork.thumbnail_url ? (
                  <img src={apiUrl(artwork.thumbnail_url)} alt="" />
                ) : (
                  <div className="saved-card-placeholder">VHS</div>
                )}
                <div>
                  <strong>{artwork.title}</strong>
                  <small>{artwork.preset} - {artwork.output_format.toUpperCase()}</small>
                </div>
                <div className="saved-actions">
                  {artwork.download_url && (
                    <a className="tiny-button" href={apiUrl(artwork.download_url)} download>Download</a>
                  )}
                  <button className="tiny-button" onClick={() => removeArtwork(artwork.artwork_id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
