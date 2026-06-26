import Link from 'next/link';

const EXAMPLES = [
  { title: 'REC Camcorder', meta: 'REC dot - SP - live counter', className: 'example-rec' },
  { title: 'PLAY VHS 1985', meta: 'PLAY > - VHS - date block', className: 'example-play' },
  { title: 'Tape Glitch', meta: 'tracking bands - static - scanlines', className: 'example-glitch' },
];

const STEPS = [
  ['Upload', 'Drop in a still image, GIF, or video. Still images stay still; videos stay videos.'],
  ['Style', 'Pick a VHS overlay, tune date, counter, scanlines, tracking, and color fade.'],
  ['Export', 'Preview a frame, render for social formats, download, or save to your profile.'],
];

export default function HomePage() {
  return (
    <>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Analog overlays for modern posts</span>
          <h1>Real camcorder UI for photos, reels, and videos.</h1>
          <p>
            FlashbackVHS adds REC markers, PLAY labels, timestamps, SP badges,
            corner brackets, scanlines, tracking bars, and tape glitches without
            forcing every upload into the same format.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" href="/upload">Start creating</Link>
            <Link className="secondary-button" href="/register">Create account</Link>
          </div>
        </div>

        <div className="landing-preview">
          <div className="landing-osd top-left">REC <span /></div>
          <div className="landing-osd top-right">00:00:04</div>
          <div className="landing-osd bottom-left">SP</div>
          <div className="landing-osd bottom-right">Jun. 26 1998</div>
          <div className="landing-frame frame-a" />
          <div className="landing-frame frame-b" />
          <div className="landing-noise" />
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span>01</span>
          <h2>Example looks</h2>
        </div>
        <div className="example-grid">
          {EXAMPLES.map((example) => (
            <article key={example.title} className={`example-card ${example.className}`}>
              <div className="example-screen">
                <span className="example-rec-dot" />
                <strong>{example.title}</strong>
                <small>{example.meta}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section split-section">
        <div>
          <span className="eyebrow">Creator workflow</span>
          <h2>Built for quick social exports.</h2>
          <p>
            Use platform presets for Instagram posts, reels, stories, YouTube,
            and square drafts. Preview before rendering, compare original versus
            final output, and save your best renders to your account.
          </p>
        </div>
        <div className="step-list">
          {STEPS.map(([title, body], index) => (
            <article key={title} className="step-item">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section docs-band">
        <div>
          <span className="eyebrow">Docs</span>
          <h2>What you can control</h2>
        </div>
        <div className="docs-grid">
          <article>
            <strong>Media handling</strong>
            <p>Images export as images. Videos and GIFs export as motion outputs.</p>
          </article>
          <article>
            <strong>Overlay controls</strong>
            <p>Toggle REC, PLAY, VHS, SP, counter, date block, and corner brackets.</p>
          </article>
          <article>
            <strong>Effect controls</strong>
            <p>Adjust noise, scanlines, glitch strength, blur, saturation, and sharpness.</p>
          </article>
        </div>
      </section>
    </>
  );
}
