const PRESET_DETAILS = {
  classic_vhs: {
    looksLike: ['Chunky date stamp', 'Soft tape texture', 'Muted home-video color'],
    bestFor: ['Travel photos', 'Family clips', 'Street shots'],
  },
  rec_camcorder: {
    looksLike: ['Red REC dot', 'Corner brackets', 'Live camcorder counter'],
    bestFor: ['Handheld videos', 'Behind-the-scenes clips', 'Reels intros'],
  },
  play_vhs_1985: {
    looksLike: ['PLAY arrow', 'VHS label', 'Tracking bars and tape glitches'],
    bestFor: ['Music edits', 'Old-TV moments', 'Wide video footage'],
  },
  camera_source_iphone: {
    looksLike: ['CAMERA1 source label', 'Playback counter', 'Soft CRT frame'],
    bestFor: ['Phone videos', 'Sports clips', 'Vertical stories'],
  },
  dirty_camcorder: {
    looksLike: ['Heavy static', 'Dirty REC UI', 'Rough tape interference'],
    bestFor: ['Night footage', 'Horror edits', 'Low-light clips'],
  },
  late_night_tv: {
    looksLike: ['Dim broadcast color', 'PLAY overlay', 'Crushed analog contrast'],
    bestFor: ['TV screenshots', 'Concert clips', 'Moody indoor shots'],
  },
  retro_tape_glitch: {
    looksLike: ['Aggressive tracking', 'White glitch chunks', 'Unstable analog contrast'],
    bestFor: ['Transitions', 'Experimental reels', 'Fast movement'],
  },
  basement_tape_1994: {
    looksLike: ['Muted basement lighting', 'Sleepy blur', 'Grounded timestamp'],
    bestFor: ['Home photos', 'Old rooms', 'Quiet memories'],
  },
  arcade_crt: {
    looksLike: ['Bright cabinet glow', 'Strong scanlines', 'Saturated phosphor color'],
    bestFor: ['Games', 'Neon scenes', 'Colorful graphics'],
  },
  crt_newsroom: {
    looksLike: ['Broadcast monitor texture', 'Crisp contrast', 'Mild tape dirt'],
    bestFor: ['Talking-head videos', 'Clips with text', 'News-style edits'],
  },
  security_monitor: {
    looksLike: ['Cold CCTV monitor', 'Hard contrast', 'Dry surveillance noise'],
    bestFor: ['Doorcam looks', 'Empty spaces', 'Minimal scenes'],
  },
  handycam_night: {
    looksLike: ['Lifted shadows', 'Gritty low-light grain', 'REC frame'],
    bestFor: ['Night photos', 'Indoor videos', 'Party footage'],
  },
  mini_dv_trip: {
    looksLike: ['Clean source labels', 'Soft digital tape', 'Late-2000s camcorder edges'],
    bestFor: ['Travel clips', 'Daylight videos', 'Phone footage'],
  },
  super8_home_movie: {
    looksLike: ['Warm film color', 'Soft grain', 'Gentle blur'],
    bestFor: ['Sunsets', 'Family photos', 'Outdoor memories'],
  },
  polaroid_fade: {
    looksLike: ['Washed instant-photo color', 'Low contrast', 'Faded highlights'],
    bestFor: ['Portraits', 'Still images', 'Soft daylight'],
  },
  cinema_leader: {
    looksLike: ['Projected-film contrast', 'Pronounced grain', 'Subdued reel color'],
    bestFor: ['Landscape clips', 'Short films', 'Dramatic frames'],
  },
  win95_capture: {
    looksLike: ['Retro desktop capture', 'Crunchy monitor lines', 'Pale PC color'],
    bestFor: ['Screenshots', 'UI mockups', 'Tech nostalgia'],
  },
  dos_terminal: {
    looksLike: ['Dark command-line monitor', 'Green low saturation', 'Sharp scanlines'],
    bestFor: ['Text-heavy images', 'Coding clips', 'Cyber edits'],
  },
  web_1_0_screenshot: {
    looksLike: ['Early internet screenshot', 'Monitor sharpness', 'Mild color crush'],
    bestFor: ['Web pages', 'Memes', 'Desktop captures'],
  },
  found_footage_3am: {
    looksLike: ['Dirty REC UI', 'Harsh noise', 'Crushed blacks'],
    bestFor: ['Horror shorts', 'Dark hallways', 'Handheld clips'],
  },
  cursed_tape: {
    looksLike: ['Haunted cassette texture', 'Unstable tracking', 'Ghostly gray color'],
    bestFor: ['Creepy edits', 'Abandoned spaces', 'Mystery posts'],
  },
  motel_tv: {
    looksLike: ['Late-night TV glow', 'Dirty scanlines', 'Dim PLAY overlay'],
    bestFor: ['Room shots', 'Old commercials', 'Lo-fi scenes'],
  },
  datamosh_rainbow: {
    looksLike: ['Color-shifted tape', 'Bright saturation', 'Glitch-heavy tracking'],
    bestFor: ['Music reels', 'Motion clips', 'Bold visuals'],
  },
  acid_public_access: {
    looksLike: ['Public-access TV energy', 'Loud contrast', 'Playful analog grit'],
    bestFor: ['Comedy clips', 'Performances', 'Stylized posts'],
  },
  laserdisc_dream: {
    looksLike: ['Retro-future playback', 'Neon color', 'Soft analog shimmer'],
    bestFor: ['Night city clips', 'Stylized portraits', 'Clean edits'],
  },
};

export default function PresetCard({ preset, selected, onSelect }) {
  const details = preset.details || PRESET_DETAILS[preset.id];

  return (
    <button
      type="button"
      className={`preset-card ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(preset.id)}
    >
      <span className="preset-kicker">{preset.category || (preset.overlay_mode ? 'Retro overlay' : 'Retro preset')}</span>
      <strong>{preset.name}</strong>
      <span>{preset.description}</span>
      {details && (
        <div className="preset-detail-grid">
          <div>
            <small>Looks like</small>
            <ul>
              {details.looksLike.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <small>Best for</small>
            <ul>
              {details.bestFor.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      )}
    </button>
  );
}
