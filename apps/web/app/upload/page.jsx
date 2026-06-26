'use client';

import { useEffect, useMemo, useState } from 'react';

import PresetCard from '../../components/PresetCard';
import RenderPreview from '../../components/RenderPreview';
import UploadDropzone from '../../components/UploadDropzone';
import VHSConfigPanel from '../../components/VHSConfigPanel';
import { API_URL, apiFetch } from '../../lib/api';
import { DEFAULT_RENDER_CONFIG, IMAGE_OUTPUT_FORMATS, VIDEO_OUTPUT_FORMATS } from '../../lib/constants';

const IMAGE_INPUT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff']);
const IMAGE_INPUT_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff']);
const VIDEO_INPUT_TYPES = new Set(['image/gif', 'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-msvideo']);
const VIDEO_INPUT_EXTENSIONS = new Set(['gif', 'mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi']);
const HISTORY_KEY = 'flashbackvhs.renderHistory';
const HISTORY_LIMIT = 8;

function getFileExtension(filename = '') {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function getFileMediaKind(nextFile) {
  if (!nextFile) return null;

  const extension = getFileExtension(nextFile.name);

  if (IMAGE_INPUT_TYPES.has(nextFile.type) || IMAGE_INPUT_EXTENSIONS.has(extension)) {
    return 'image';
  }

  if (VIDEO_INPUT_TYPES.has(nextFile.type) || VIDEO_INPUT_EXTENSIONS.has(extension) || nextFile.type.startsWith('video/')) {
    return 'video';
  }

  return null;
}

function formatsForMediaKind(mediaKind) {
  return mediaKind === 'image' ? IMAGE_OUTPUT_FORMATS : VIDEO_OUTPUT_FORMATS;
}

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(null);
  const [presets, setPresets] = useState([]);
  const [presetStatus, setPresetStatus] = useState('loading');
  const [config, setConfig] = useState(DEFAULT_RENDER_CONFIG);
  const [previewResult, setPreviewResult] = useState(null);
  const [renderHistory, setRenderHistory] = useState([]);
  const [renderResult, setRenderResult] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadPresets() {
    setPresetStatus('loading');

    try {
      const data = await apiFetch('/api/presets');
      const nextPresets = Array.isArray(data?.presets) ? data.presets : [];

      setPresets(nextPresets);
      setPresetStatus(nextPresets.length ? 'ready' : 'empty');

      if (nextPresets.length) {
        setConfig((current) => {
          const currentExists = nextPresets.some((preset) => preset.id === current.preset);
          return currentExists ? current : { ...current, preset: nextPresets[0].id };
        });
      }
    } catch (err) {
      setPresetStatus('error');
      setError(`Could not load presets from ${API_URL}: ${err.message}`);
    }
  }

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setRenderHistory(JSON.parse(stored));
      }
    } catch {
      setRenderHistory([]);
    }
  }, []);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === config.preset),
    [presets, config.preset]
  );
  const selectedMediaKind = useMemo(() => getFileMediaKind(file), [file]);
  const outputFormats = useMemo(() => formatsForMediaKind(selectedMediaKind), [selectedMediaKind]);

  function rememberRender(result, uploadData) {
    const item = {
      job_id: result.job_id,
      output_filename: result.output_filename,
      output_format: result.output_format,
      download_url: result.download_url,
      preset: result.preset,
      original_url: uploadData.download_url,
      created_at: new Date().toISOString(),
    };

    setRenderHistory((current) => {
      const next = [item, ...current.filter((entry) => entry.job_id !== item.job_id)].slice(0, HISTORY_LIMIT);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Browsers can block local storage; rendering should still succeed.
      }
      return next;
    });
  }

  function makeRenderPayload(uploadData) {
    return {
      input_id: uploadData.file_id,
      preset: config.preset,
      overlay_mode: selectedPreset?.overlay_mode || null,
      overlay: config.overlay,
      effects: config.effects,
      timestamp: {
        ...config.timestamp,
        label: config.timestamp.label || null,
      },
      output: config.output,
    };
  }

  function updateFile(nextFile) {
    const mediaKind = getFileMediaKind(nextFile);
    const allowedFormats = formatsForMediaKind(mediaKind);

    setFile(nextFile);
    setUploaded(null);
    setPreviewResult(null);
    setRenderResult(null);
    setError('');
    setStatus(nextFile ? `Selected ${nextFile.name}` : '');
    setConfig((current) => {
      if (!nextFile || allowedFormats.includes(current.output.format)) {
        return current;
      }

      return {
        ...current,
        output: {
          ...current.output,
          format: allowedFormats[0],
        },
      };
    });
  }

  async function uploadSelectedFile({ controlBusy = true } = {}) {
    if (!file) {
      setError('Choose a file first.');
      return null;
    }

    if (controlBusy) setBusy(true);
    setError('');
    setStatus('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploaded(data);
      setStatus(`Uploaded ${data.original_filename}`);
      return data;
    } catch (err) {
      setError(err.message);
      setStatus('Upload failed.');
      return null;
    } finally {
      if (controlBusy) setBusy(false);
    }
  }

  async function renderVHS() {
    if (!file) {
      setError('Choose a file first.');
      return;
    }

    setBusy(true);
    setError('');
    setRenderResult(null);
    setStatus('Preparing render...');

    try {
      const uploadData = uploaded || await uploadSelectedFile({ controlBusy: false });
      if (!uploadData) return;

      setStatus('Rendering VHS output...');

      const payload = makeRenderPayload(uploadData);

      const data = await apiFetch('/api/render', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setRenderResult(data);
      rememberRender(data, uploadData);
      setStatus('Render done.');
    } catch (err) {
      setError(err.message);
      setStatus('Render failed.');
    } finally {
      setBusy(false);
    }
  }

  async function previewFrame() {
    if (!file) {
      setError('Choose a file first.');
      return;
    }

    setBusy(true);
    setError('');
    setPreviewResult(null);
    setStatus('Preparing preview...');

    try {
      const uploadData = uploaded || await uploadSelectedFile({ controlBusy: false });
      if (!uploadData) return;

      setStatus('Rendering preview frame...');

      const data = await apiFetch('/api/preview', {
        method: 'POST',
        body: JSON.stringify(makeRenderPayload(uploadData)),
      });

      setPreviewResult(data);
      setStatus('Preview ready.');
    } catch (err) {
      setError(err.message);
      setStatus('Preview failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace-shell">
      <div className="page-heading">
        <span className="eyebrow">Create</span>
        <h1>Build your VHS render</h1>
        <p>Upload media, choose a tape preset, configure the overlay, then render.</p>
        <small className="api-debug">Frontend API target: {API_URL}</small>
      </div>

      {error && <div className="alert error"><pre>{error}</pre></div>}
      {status && <div className="alert status">{status}</div>}

      <div className="workspace-grid">
        <div className="stack">
          <section className="panel">
            <div className="section-heading">
              <span>01</span>
              <h2>Upload</h2>
            </div>
            <UploadDropzone
              file={file}
              disabled={busy}
              onFileChange={updateFile}
            />
            <button className="secondary-button full" onClick={() => uploadSelectedFile()} disabled={busy || !file}>
              Upload only
            </button>
          </section>

          <section className="panel">
            <div className="section-heading with-action">
              <div className="section-title-inline">
                <span>03</span>
                <h2>Preset</h2>
              </div>
              <button className="tiny-button" type="button" onClick={loadPresets} disabled={busy || presetStatus === 'loading'}>
                Reload
              </button>
            </div>

            {presetStatus === 'loading' && <p className="preset-message">Loading presets from API...</p>}
            {presetStatus === 'error' && <p className="preset-message error-text">Preset API could not be reached.</p>}
            {presetStatus === 'empty' && <p className="preset-message">No presets returned from API.</p>}

            <div className="preset-grid">
              {presets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  selected={preset.id === config.preset}
                  onSelect={(presetId) => setConfig((current) => ({ ...current, preset: presetId }))}
                />
              ))}
            </div>
            {selectedPreset && <small className="muted">Selected: {selectedPreset.name}</small>}
          </section>
        </div>

        <div className="stack">
          <VHSConfigPanel config={config} setConfig={setConfig} disabled={busy} outputFormats={outputFormats} />

          <div className="action-row">
            <button className="secondary-button" onClick={previewFrame} disabled={busy || !file}>
              Preview frame
            </button>
            <button className="primary-button" onClick={renderVHS} disabled={busy || !file}>
              {busy ? 'Working...' : 'Render VHS'}
            </button>
          </div>

          <RenderPreview
            result={renderResult}
            previewResult={previewResult}
            originalUrl={uploaded?.download_url}
            history={renderHistory}
          />
        </div>
      </div>
    </section>
  );
}
