# FlashbackVHS

FlashbackVHS is a local web app for turning images/videos into retro VHS-style exports.

Current MVP stack:

- Frontend: Next.js / React
- Backend: FastAPI / Python
- Renderer: FFmpeg
- Storage: local filesystem under `storage/`

## Run locally

```bat
cd /d M:\_Development\_Projects\FlashbackVHS
scripts\check-ffmpeg.bat
scripts\dev.bat
```

Frontend:

```txt
http://localhost:3000
```

Backend:

```txt
http://127.0.0.1:8000/api/health
```

Upload page:

```txt
http://localhost:3000/upload
```

## Current MVP flow

1. Upload image/video
2. Choose VHS preset
3. Configure timestamp/date/time/output
4. Render with FFmpeg
5. Preview/download result

## Local FFmpeg

FFmpeg is bundled in:

```txt
tools/ffmpeg/ffmpeg.exe
tools/ffmpeg/ffprobe.exe
```

The backend points to those files through `apps/api/.env`.

## Generated folders

These are intentionally not committed or shipped:

- `.venv/`
- `node_modules/`
- `.next/`
- `__pycache__/`
- uploaded/rendered user media
