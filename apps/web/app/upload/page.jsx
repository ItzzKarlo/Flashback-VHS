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
const RECENT_PRESETS_KEY = 'flashbackvhs.recentPresets';
const RECENT_PRESETS_LIMIT = 5;
const ALL_CATEGORIES = 'All';
const CATEGORY_ORDER = [
  '📼 VHS',
  '📺 CRT',
  '📸 Cameras',
  '🎞 Film',
  '🖥 Retro PCs',
  '📼 Horror',
  '🌈 Experimental',
];

function getFileExtension(filename = '') {
  return filename.split('.').pop()?.toLowerCase() || '';
}

const PROGRESS_STEPS = [
  { id: 'upload', label: 'Uploading media' },
  { id: 'prepare', label: 'Preparing output' },
  { id: 'effects', label: 'Applying retro effects' },
  { id: 'encode', label: 'Encoding file' },
  { id: 'done', label: 'Finalizing render' },
];

function buildProgress(activeStep, percent) {
  const activeIndex = PROGRESS_STEPS.findIndex((step) => step.id === activeStep);

  return {
    percent,
    steps: PROGRESS_STEPS.map((step, index) => ({
      ...step,
      state: index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending',
    })),
  };
}

function RenderProgress({ progress }) {
  if (!progress) return null;

  return (
    <section className="panel render-progress-panel" aria-label="Render progress">
      <div className="section-subheading">
        <strong>Render progress</strong>
        <span>{progress.percent}%</span>
      </div>
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="progress-steps">
        {progress.steps.map((step) => (
          <div key={step.id} className={`progress-step is-${step.state}`}>
            <span>{step.state === 'done' ? '✓' : step.state === 'active' ? '•' : ''}</span>
            <strong>{step.label}</strong>
          </div>
        ))}
      </div>
    </section>
  );
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
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
  const [presetStatus, setPresetStatus] = useState('loading');
  const [config, setConfig] = useState(DEFAULT_RENDER_CONFIG);
  const [previewResult, setPreviewResult] = useState(null);
  const [renderProgress, setRenderProgress] = useState(null);
  const [renderHistory, setRenderHistory] = useState([]);
  const [recentPresetIds, setRecentPresetIds] = useState([]);
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

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_PRESETS_KEY);
      if (stored) {
        setRecentPresetIds(JSON.parse(stored));
      }
    } catch {
      setRecentPresetIds([]);
    }
  }, []);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === config.preset),
    [presets, config.preset]
  );
  const categoryOptions = useMemo(() => {
    const categories = new Set(presets.map((preset) => preset.category).filter(Boolean));
    const ordered = CATEGORY_ORDER.filter((category) => categories.has(category));
    const extras = [...categories].filter((category) => !CATEGORY_ORDER.includes(category)).sort();
    return [ALL_CATEGORIES, ...ordered, ...extras];
  }, [presets]);
  const filteredPresets = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) {
      return presets;
    }

    return presets.filter((preset) => preset.category === selectedCategory);
  }, [presets, selectedCategory]);
  const recentPresets = useMemo(
    () => recentPresetIds
      .map((presetId) => presets.find((preset) => preset.id === presetId))
      .filter(Boolean),
    [presets, recentPresetIds]
  );
  const selectedMediaKind = useMemo(() => getFileMediaKind(file), [file]);
  const outputFormats = useMemo(() => formatsForMediaKind(selectedMediaKind), [selectedMediaKind]);

  function rememberPreset(presetId) {
    if (!presetId) return;

    setRecentPresetIds((current) => {
      const next = [presetId, ...current.filter((item) => item !== presetId)].slice(0, RECENT_PRESETS_LIMIT);
      try {
        window.localStorage.setItem(RECENT_PRESETS_KEY, JSON.stringify(next));
      } catch {
        return next;
      }
      return next;
    });
  }

  function choosePreset(presetId) {
    setConfig((current) => ({ ...current, preset: presetId }));
    rememberPreset(presetId);
  }

  function selectCategory(category) {
    const nextPresets = category === ALL_CATEGORIES
      ? presets
      : presets.filter((preset) => preset.category === category);

    setSelectedCategory(category);

    if (nextPresets.length && !nextPresets.some((preset) => preset.id === config.preset)) {
      setConfig((current) => ({ ...current, preset: nextPresets[0].id }));
    }
  }

  function rememberRender(result, uploadData) {
    const item = {
      job_id: result.job_id,
      output_filename: result.output_filename,
      output_format: result.output_format,
      download_url: result.download_url,
      preset: result.preset,
      preset_name: result.preset_name,
      output_resolution: result.output_resolution,
      render_time_seconds: result.render_time_seconds,
      original_url: uploadData.download_url,
      created_at: result.created_at || new Date().toISOString(),
    };

    setRenderHistory((current) => {
      const next = [item, ...current.filter((entry) => entry.job_id !== item.job_id)].slice(0, HISTORY_LIMIT);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        return next;
      }
      return next;
    });
  }

  function clearRenderHistory() {
    setRenderHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      return;
    }
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
    setRenderProgress(null);
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
    setRenderProgress(buildProgress(uploaded ? 'prepare' : 'upload', uploaded ? 24 : 8));
    setStatus('Preparing render...');
    const startedAt = performance.now();
    let progressTimer = null;

    try {
      const uploadData = uploaded || await uploadSelectedFile({ controlBusy: false });
      if (!uploadData) {
        setRenderProgress(null);
        return;
      }

      setRenderProgress(buildProgress('prepare', 32));
      setStatus('Rendering VHS output...');

      const payload = makeRenderPayload(uploadData);
      setRenderProgress(buildProgress('effects', 46));
      progressTimer = window.setInterval(() => {
        setRenderProgress((current) => {
          if (!current) return current;

          const nextPercent = Math.min(90, current.percent + (current.percent < 70 ? 4 : 2));
          return buildProgress(nextPercent >= 74 ? 'encode' : 'effects', nextPercent);
        });
      }, 900);

      const data = await apiFetch('/api/render', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const finishedAt = performance.now();
      const enrichedResult = {
        ...data,
        created_at: data.created_at || new Date().toISOString(),
        original_filename: uploadData.original_filename,
        output_resolution: data.output_resolution || config.output.resolution,
        preset_name: selectedPreset?.name || data.preset,
        render_time_seconds: data.render_duration_seconds || Number(((finishedAt - startedAt) / 1000).toFixed(1)),
      };

      setRenderProgress(buildProgress('done', 100));
      setRenderResult(enrichedResult);
      rememberRender(enrichedResult, uploadData);
      rememberPreset(config.preset);
      setStatus('Render done.');
    } catch (err) {
      setError(err.message);
      setStatus('Render failed.');
    } finally {
      if (progressTimer) {
        window.clearInterval(progressTimer);
      }
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

            {categoryOptions.length > 1 && (
              <div className="category-tabs" aria-label="Preset categories">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`tiny-button ${selectedCategory === category ? 'is-active' : ''}`}
                    onClick={() => selectCategory(category)}
                    disabled={busy}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {recentPresets.length > 0 && (
              <div className="recent-presets">
                <strong>Recently used</strong>
                <div className="recent-preset-list">
                  {recentPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`tiny-button ${preset.id === config.preset ? 'is-active' : ''}`}
                      onClick={() => choosePreset(preset.id)}
                      disabled={busy}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="preset-grid">
              {filteredPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  selected={preset.id === config.preset}
                  onSelect={choosePreset}
                />
              ))}
            </div>
            {filteredPresets.length === 0 && <p className="preset-message">No presets in this category.</p>}
            {selectedPreset && <small className="muted">Selected: {selectedPreset.name}</small>}
          </section>
        </div>

        <div className="stack">
          <VHSConfigPanel config={config} setConfig={setConfig} disabled={busy} outputFormats={outputFormats} />

          <div className="action-row render-actions">
            <button className="secondary-button" onClick={previewFrame} disabled={busy || !file}>
              Preview frame
            </button>
            <button className="primary-button" onClick={renderVHS} disabled={busy || !file}>
              {busy ? 'Working...' : 'Render VHS'}
            </button>
          </div>

          <RenderProgress progress={renderProgress} />

          <RenderPreview
            result={renderResult}
            previewResult={previewResult}
            originalUrl={uploaded?.download_url}
            history={renderHistory}
            onClearHistory={clearRenderHistory}
          />
        </div>
      </div>
    </section>
  );
}
