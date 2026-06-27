import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <section className="simple-page not-found-page">
      <span className="eyebrow">404 - Tape missing</span>
      <h1>No late-night rental available here.</h1>
      <p>
        This shelf is empty, the tracking is lost, and the remote is probably
        under a cushion somewhere.
      </p>
      <div className="hero-actions">
        <Link className="primary-button" href="/upload">Create a render</Link>
        <Link className="secondary-button" href="/">Back home</Link>
      </div>
    </section>
  );
}
