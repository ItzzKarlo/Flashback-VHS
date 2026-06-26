# Render Pipeline

The MVP renderer uses FFmpeg through Python subprocess calls.

Pipeline:

```txt
uploaded file
-> validate extension
-> save under storage/uploads
-> build VHS filter chain
-> run FFmpeg
-> save output under storage/renders
-> return download URL
```

Current filters include:

- scale/pad to target resolution
- contrast/saturation/brightness
- Gaussian blur
- sharpening
- noise/grain
- scanlines via drawgrid
- timestamp via drawtext

Windows drawtext uses:

```env
FFMPEG_FONT_FILE=C:/Windows/Fonts/consola.ttf
```

This avoids common Windows FFmpeg font discovery issues.
