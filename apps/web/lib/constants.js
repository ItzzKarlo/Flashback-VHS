export const DEFAULT_RENDER_CONFIG = {
  preset: 'classic_vhs',
  timestamp: {
    enabled: true,
    date: '06/26/1998',
    time: '21:42',
    label: '',
    position: 'bottom_left',
  },
  output: {
    format: 'mp4',
    resolution: '1080x1080',
    fps: 30,
    crf: 20,
  },
  effects: {
    noise: 0.35,
    scanlines: 0.25,
    blur: 0.15,
    contrast: 1.08,
    saturation: 0.82,
    brightness: -0.02,
    sharpen: 0.15,
  },
  overlay: {
    rec_indicator: true,
    play_label: true,
    vhs_label: true,
    tape_speed: true,
    counter: true,
    corner_brackets: true,
    date_block: true,
    glitch: 0.65,
  },
};

export const OUTPUT_FORMATS = ['mp4', 'webm', 'gif', 'jpg', 'png', 'webp'];
export const IMAGE_OUTPUT_FORMATS = ['jpg', 'png', 'webp'];
export const VIDEO_OUTPUT_FORMATS = ['mp4', 'webm', 'gif'];
export const RESOLUTIONS = ['1080x1080', '1080x1920', '1920x1080', '1280x720', '720x720'];
export const TIMESTAMP_POSITIONS = ['bottom_left', 'bottom_right', 'top_left', 'top_right'];
export const PLATFORM_PRESETS = [
  { id: 'instagram_post', label: 'Instagram Post', resolution: '1080x1080', fps: 30 },
  { id: 'reel_story', label: 'Reel / Story', resolution: '1080x1920', fps: 30 },
  { id: 'youtube', label: 'YouTube', resolution: '1920x1080', fps: 30 },
  { id: 'square_small', label: 'Square Draft', resolution: '720x720', fps: 24 },
];
