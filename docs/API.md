# API

Base URL:

```txt
http://127.0.0.1:8000/api
```

## Health

```txt
GET /health
GET /health/ffmpeg
GET /health/storage
```

## Presets

```txt
GET /presets
GET /presets/{preset_id}
```

## Upload

```txt
POST /upload
```

Multipart form field:

```txt
file
```

Returns an uploaded `file_id` used for rendering.

## Render

```txt
POST /render
GET /render/{job_id}
GET /render/{job_id}/download
```

Example payload:

```json
{
  "input_id": "upload_xxx",
  "preset": "classic_vhs",
  "timestamp": {
    "enabled": true,
    "date": "06/26/1998",
    "time": "21:42",
    "label": null,
    "position": "bottom_left"
  },
  "output": {
    "format": "mp4",
    "resolution": "1080x1080",
    "fps": 30,
    "crf": 20
  }
}
```
