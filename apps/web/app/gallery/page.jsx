import Link from 'next/link';

export default function GalleryPage() {
  return (
    <section className="simple-page">
      <span className="eyebrow">Saved library</span>
      <h1>Your VHS workbench, once you log in.</h1>
      <p>
        Saved renders live on your account page. This gallery is reserved for
        future public showcases, shared profiles, and curated examples.
      </p>

      <div className="gallery-preview-grid">
        <article className="gallery-preview-card">
          <strong>Private saves</strong>
          <span>Keep completed renders attached to your account.</span>
        </article>
        <article className="gallery-preview-card">
          <strong>Re-downloads</strong>
          <span>Return to older exports without digging through local files.</span>
        </article>
        <article className="gallery-preview-card">
          <strong>Public gallery next</strong>
          <span>Shareable profiles can build on the same saved-work model.</span>
        </article>
      </div>

      <div className="hero-actions">
        <Link className="primary-button" href="/account">Open account</Link>
        <Link className="secondary-button" href="/upload">Create a render</Link>
      </div>
    </section>
  );
}
