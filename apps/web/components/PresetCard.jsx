export default function PresetCard({ preset, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`preset-card ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(preset.id)}
    >
      <span className="preset-kicker">{preset.overlay_mode ? 'VHS overlay' : 'VHS preset'}</span>
      <strong>{preset.name}</strong>
      <span>{preset.description}</span>
    </button>
  );
}
