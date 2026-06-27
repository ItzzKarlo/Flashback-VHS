# FlashbackVHS

FlashbackVHS is a web app for turning modern images and videos into realistic retro media exports.

It is built for creators who want more than simple "bad quality" filters. The renderer adds VHS and camcorder-style overlays such as REC markers, PLAY labels, timestamps, tape counters, SP indicators, scanlines, tracking noise, CRT texture, and other retro UI details.

## Features

- Upload images or videos
- Keep images as images and videos as videos
- Render retro/VHS/CRT/camera/film/PC/horror/experimental presets
- Configure timestamp, date, time, output format, resolution, FPS, and quality
- Preview a frame before rendering
- Render progress UI
- Before/after comparison for image renders
- Recently used presets
- Render history with download links
- User accounts and saved artwork flow
- Light and dark mode

## Tech Stack

- Frontend: Next.js / React
- Backend: Python / FastAPI
- Renderer: FFmpeg through Python subprocess
- Storage: local filesystem under `storage/`
- Database-ready backend structure for PostgreSQL deployment

## Project Structure

```txt
apps/
  api/      FastAPI backend
  web/      Next.js frontend
storage/
  uploads/  Uploaded source media
  renders/  Final rendered outputs
  previews/ Preview frames
  temp/     Temporary files
tools/
  ffmpeg/   Bundled local FFmpeg binaries
scripts/    Windows development helpers
deploy/     Deployment-related files
infra/      Infrastructure files
docs/       Project documentation
```

## Requirements

- Node.js
- Python 3.11+
- FFmpeg

This repo includes local Windows FFmpeg binaries:

```txt
tools/ffmpeg/ffmpeg.exe
tools/ffmpeg/ffprobe.exe
```

The backend reads FFmpeg paths from `apps/api/.env`.

## Local Setup

From the project root:

```bat
scripts\check-ffmpeg.bat
scripts\dev.bat
```

The app should then be available at:

```txt
Frontend: http://localhost:3000
Backend:  http://127.0.0.1:8000
Upload:   http://localhost:3000/upload
```

## Manual Development Commands

Frontend:

```bat
cd apps\web
npm install
npm run dev
```

Backend:

```bat
cd apps\api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Environment

Example backend FFmpeg settings:

```env
FFMPEG_PATH=../../tools/ffmpeg/ffmpeg.exe
FFPROBE_PATH=../../tools/ffmpeg/ffprobe.exe
FFMPEG_FONT_FILE=C:/Windows/Fonts/consola.ttf
```

The font file matters because FFmpeg `drawtext` on Windows needs a real font path for timestamp and UI overlays.

## API Routes

```txt
GET  /api/health
GET  /api/health/ffmpeg
GET  /api/presets
POST /api/upload
POST /api/preview
POST /api/render
GET  /api/render/{job_id}
GET  /api/render/{job_id}/download
```

## Generated Files

The app writes user media and generated files into `storage/`. These outputs are intentionally not meant to be committed.

Typical generated folders/files:

```txt
storage/uploads/
storage/renders/
storage/previews/
storage/temp/
apps/web/.next/
node_modules/
__pycache__/
.venv/
```

## Attribution And License

FlashbackVHS is created by Karlo Cavlovic.

You may download, run, study, and modify the project for local or personal use. You may publish forks, derivatives, or commercial versions only if visible attribution to the original project and author is preserved.

Attribution must appear in at least one clear user-facing or project-facing place, such as:

- Website or app footer/header
- README
- About page
- Project documentation
- Source file headers

You may not remove the original author/project credit and present the project as entirely your own.

See [LICENSE](LICENSE) for the full terms.

## Links

- Home Page: [www.karlo-cavlovic.dev](https://www.karlo-cavlovic.dev/)
- FlashbackVHS: [flashback-vhs.karlo-cavlovic.dev](https://flashback-vhs.karlo-cavlovic.dev/)
- Repository: [github.com/ItzzKarlo/Flashback-VHS](https://github.com/ItzzKarlo/Flashback-VHS)
