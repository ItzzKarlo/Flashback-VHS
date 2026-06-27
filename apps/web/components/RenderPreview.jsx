import { useState } from 'react';

import { apiFetch, apiUrl } from '../lib/api';

const IMAGE_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const VIDEO_FORMATS = new Set(['mp4', 'webm']);

function formatSeconds(value) {
  if (typeof value !== 'number') return 'Unknown';
  return `${value.toFixed(value >= 10 ? 1 : 2)} seconds`;
}

function formatCreated(value) {
  if (!value) return 'Just now';

  const created = new Date(value);
  const diffSeconds = Math.max(0, Math.round((Date.now() - created.getTime()) / 1000));

  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.round(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.round(diffSeconds / 3600)} hours ago`;

  return created.toLocaleString();
}

export default function RenderPreview({ result, previewResult, originalUrl, history = [], onClearHistory }) {
  const [compareMode, setCompareMode] = useState('render');
  const [compareValue, setCompareValue] = useState(50);
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState('');

  if (!result && !previewResult && !history.length) {
    return (
      <section className="panel preview-panel">
        <span className="preview-empty">Render result appears here.</span>
      </section>
    );
  }

  const downloadHref = result?.download_url ? apiUrl(result.download_url) : null;
  const originalHref = originalUrl ? apiUrl(originalUrl) : null;
  const previewHref = previewResult?.preview_url ? apiUrl(previewResult.preview_url) : null;
  const format = result?.output_format?.toLowerCase();
  const showImage = downloadHref && IMAGE_FORMATS.has(format);
  const showVideo = downloadHref && VIDEO_FORMATS.has(format);
  const mediaHref = compareMode === 'original' && originalHref ? originalHref : downloadHref;
  const showImageCompare = showImage && originalHref && result?.media_kind === 'image';
  const renderDetails = result ? [
    { label: 'Preset', value: result.preset_name || result.preset },
    { label: 'Resolution', value: result.output_resolution || 'Unknown' },
    { label: 'Render time', value: formatSeconds(result.render_time_seconds || result.render_duration_seconds) },
    { label: 'Created', value: formatCreated(result.created_at) },
  ] : [];

  async function saveToAccount() {
    if (!result?.job_id) return;

    setSaveStatus('Saving...');
    setSaveError('');

    try {
      await apiFetch('/api/artworks', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          job_id: result.job_id,
          title: result.output_filename,
        }),
      });
      setSaveStatus('Saved to account.');
    } catch (err) {
      setSaveError(err.message);
      setSaveStatus('');
    }
  }

  return (
    <section className="panel preview-panel">
      <div className="section-heading with-action">
        <div className="section-title-inline">
          <span>04</span>
          <h2>Output</h2>
        </div>
        {history.length > 0 && (
          <button type="button" className="tiny-button" onClick={onClearHistory}>
            Clear recent
          </button>
        )}
      </div>

      {previewHref && (
        <div className="render-result preview-frame">
          <img className="render-media" src={previewHref} alt="Preview VHS frame" />
          <strong>Preview frame</strong>
          <small>{previewResult.output_filename}</small>
        </div>
      )}

      {result && (
        <div className="render-result">
          {showImageCompare && (
            <div className="before-after">
              <div className="compare-label-row">
                <span>Original</span>
                <span>VHS</span>
              </div>
              <div className="compare-slider-frame">
                <img className="render-media compare-base" src={originalHref} alt="Original upload" />
                <div className="compare-overlay" style={{ clipPath: `inset(0 ${100 - compareValue}% 0 0)` }}>
                  <img className="render-media" src={downloadHref} alt="Rendered VHS output" />
                </div>
                <span className="compare-handle" style={{ left: `${compareValue}%` }} />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={compareValue}
                onChange={(event) => setCompareValue(Number(event.target.value))}
                aria-label="Before and after comparison"
              />
            </div>
          )}

          {!showImageCompare && originalHref && (
            <div className="compare-row">
              <button
                type="button"
                className={`tiny-button ${compareMode === 'render' ? 'is-active' : ''}`}
                onClick={() => setCompareMode('render')}
              >
                Rendered
              </button>
              <button
                type="button"
                className={`tiny-button ${compareMode === 'original' ? 'is-active' : ''}`}
                onClick={() => setCompareMode('original')}
              >
                Original
              </button>
            </div>
          )}

          {showImage && !showImageCompare && <img className="render-media" src={mediaHref} alt="Rendered VHS output" />}
          {showVideo && compareMode === 'render' && <video className="render-media" src={downloadHref} controls />}
          {showVideo && compareMode === 'original' && originalHref && <video className="render-media" src={originalHref} controls />}

          <strong>{result.output_filename}</strong>
          <div className="render-detail-grid">
            {renderDetails.map((detail) => (
              <div key={detail.label}>
                <small>{detail.label}</small>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
          <small>Job: {result.job_id} - Status: {result.status}</small>

          {downloadHref && (
            <div className="action-row">
              <a className="primary-button" href={downloadHref} download>
                Download render
              </a>
              <button className="secondary-button" type="button" onClick={saveToAccount}>
                Save to account
              </button>
            </div>
          )}

          {saveStatus && <small className="success-text">{saveStatus}</small>}
          {saveError && <small className="error-text">{saveError}</small>}
        </div>
      )}

      {history.length > 0 && (
        <div className="history-list">
          <div className="section-subheading">
            <strong>Recent renders</strong>
          </div>
          {history.map((item) => (
            <a key={item.job_id} className="history-item" href={apiUrl(item.download_url)} download>
              <span>{item.output_filename}</span>
              <small>
                {item.preset_name || item.preset} - {item.output_resolution || item.output_format?.toUpperCase()} - {formatCreated(item.created_at)}
              </small>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
