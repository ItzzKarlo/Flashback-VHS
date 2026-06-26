import { useState } from 'react';

import { apiFetch, apiUrl } from '../lib/api';

const IMAGE_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const VIDEO_FORMATS = new Set(['mp4', 'webm']);

export default function RenderPreview({ result, previewResult, originalUrl, history = [] }) {
  const [compareMode, setCompareMode] = useState('render');
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
      <div className="section-heading">
        <span>04</span>
        <h2>Output</h2>
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
          {originalHref && (
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

          {showImage && <img className="render-media" src={mediaHref} alt="Rendered VHS output" />}
          {showVideo && compareMode === 'render' && <video className="render-media" src={downloadHref} controls />}
          {showVideo && compareMode === 'original' && originalHref && <video className="render-media" src={originalHref} controls />}

          <strong>{result.output_filename}</strong>
          <small>Job: {result.job_id}</small>
          <small>Status: {result.status}</small>

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
              <small>{item.preset} - {item.output_format?.toUpperCase()}</small>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
