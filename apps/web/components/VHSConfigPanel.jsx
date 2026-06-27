import { OUTPUT_FORMATS, PLATFORM_PRESETS, RESOLUTIONS, TIMESTAMP_POSITIONS } from '../lib/constants';

const EFFECT_CONTROLS = [
  { path: 'effects.noise', label: 'Noise', min: 0, max: 1, step: 0.05 },
  { path: 'effects.scanlines', label: 'Scanlines', min: 0, max: 1, step: 0.05 },
  { path: 'overlay.glitch', label: 'Tracking glitch', min: 0, max: 1, step: 0.05 },
  { path: 'effects.blur', label: 'Soft blur', min: 0, max: 1, step: 0.05 },
  { path: 'effects.saturation', label: 'Color fade', min: 0, max: 2, step: 0.05 },
  { path: 'effects.sharpen', label: 'Sharpness', min: 0, max: 1, step: 0.05 },
];

const OVERLAY_TOGGLES = [
  ['overlay.rec_indicator', 'REC marker'],
  ['overlay.play_label', 'PLAY label'],
  ['overlay.vhs_label', 'VHS label'],
  ['overlay.tape_speed', 'SP marker'],
  ['overlay.counter', 'Running counter'],
  ['overlay.corner_brackets', 'Corner brackets'],
  ['overlay.date_block', 'Date block'],
];

export default function VHSConfigPanel({ config, setConfig, disabled, outputFormats = OUTPUT_FORMATS }) {
  function update(path, value) {
    setConfig((current) => {
      const next = structuredClone(current);
      const keys = path.split('.');
      let target = next;

      for (const key of keys.slice(0, -1)) {
        target = target[key];
      }

      target[keys.at(-1)] = value;
      return next;
    });
  }

  function applyPlatformPreset(preset) {
    setConfig((current) => ({
      ...current,
      output: {
        ...current.output,
        resolution: preset.resolution,
        fps: preset.fps,
      },
    }));
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <span>02</span>
        <h2>Render settings</h2>
      </div>

      <div className="segmented-grid">
        {PLATFORM_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`tiny-button ${config.output.resolution === preset.resolution ? 'is-active' : ''}`}
            disabled={disabled}
            onClick={() => applyPlatformPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="form-grid with-top-gap">
        <label>
          Output format
          <select
            value={config.output.format}
            disabled={disabled}
            onChange={(event) => update('output.format', event.target.value)}
          >
            {outputFormats.map((format) => (
              <option key={format} value={format}>{format.toUpperCase()}</option>
            ))}
          </select>
        </label>

        <label>
          Resolution
          <select
            value={config.output.resolution}
            disabled={disabled}
            onChange={(event) => update('output.resolution', event.target.value)}
          >
            {RESOLUTIONS.map((resolution) => (
              <option key={resolution} value={resolution}>{resolution}</option>
            ))}
          </select>
        </label>

        <label>
          FPS
          <input
            type="number"
            min="1"
            max="120"
            value={config.output.fps}
            disabled={disabled}
            onChange={(event) => update('output.fps', Number(event.target.value))}
          />
        </label>

        <label>
          Quality / CRF
          <input
            type="number"
            min="1"
            max="35"
            value={config.output.crf}
            disabled={disabled}
            onChange={(event) => update('output.crf', Number(event.target.value))}
          />
        </label>
      </div>

      <div className="toggle-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.timestamp.enabled}
            disabled={disabled}
            onChange={(event) => update('timestamp.enabled', event.target.checked)}
          />
          Enable VHS timestamp
        </label>
      </div>

      <div className="form-grid">
        <label>
          Date
          <input
            value={config.timestamp.date}
            disabled={disabled || !config.timestamp.enabled}
            onChange={(event) => update('timestamp.date', event.target.value)}
          />
        </label>

        <label>
          Time
          <input
            value={config.timestamp.time}
            disabled={disabled || !config.timestamp.enabled}
            onChange={(event) => update('timestamp.time', event.target.value)}
          />
        </label>

        <label>
          Custom label
          <input
            placeholder="Optional"
            value={config.timestamp.label}
            disabled={disabled || !config.timestamp.enabled}
            onChange={(event) => update('timestamp.label', event.target.value)}
          />
        </label>

        <label>
          Position
          <select
            value={config.timestamp.position}
            disabled={disabled || !config.timestamp.enabled}
            onChange={(event) => update('timestamp.position', event.target.value)}
          >
            {TIMESTAMP_POSITIONS.map((position) => (
              <option key={position} value={position}>{position.replace('_', ' ')}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="settings-divider" />

      <div className="section-subheading">
        <strong>Effect intensity</strong>
      </div>

      <div className="slider-grid">
        {EFFECT_CONTROLS.map((control) => {
          const [group, key] = control.path.split('.');
          const value = config[group][key];

          return (
            <label key={control.path} className="slider-label">
              <span>
                {control.label}
                <small>{Number(value).toFixed(2)}</small>
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={value}
                disabled={disabled}
                onChange={(event) => update(control.path, Number(event.target.value))}
              />
            </label>
          );
        })}
      </div>

      <div className="settings-divider" />

      <div className="section-subheading">
        <strong>Overlay controls</strong>
      </div>

      <div className="toggle-grid">
        {OVERLAY_TOGGLES.map(([path, label]) => {
          const [, key] = path.split('.');

          return (
            <label key={path} className="checkbox-label compact">
              <input
                type="checkbox"
                checked={config.overlay[key]}
                disabled={disabled}
                onChange={(event) => update(path, event.target.checked)}
              />
              {label}
            </label>
          );
        })}
      </div>
    </section>
  );
}
