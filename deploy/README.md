# FlashbackVHS Production Deployment

Target: Raspberry Pi at `192.168.178.180`, Docker, nginx reverse proxy, Cloudflared tunnel.

## Recommended domain

Prefer the subdomain:

```text
https://flashback-vhs.karlo-cavlovic.dev
```

It is simpler for Next.js assets, API URLs, cookies later, and Cloudflare routing.

The path version can work:

```text
https://tools.karlo-cavlovic.dev/flashback-vhs
```

For path hosting, set:

```env
NEXT_PUBLIC_API_URL=https://tools.karlo-cavlovic.dev/flashback-vhs
NEXT_PUBLIC_BASE_PATH=/flashback-vhs
FRONTEND_URL=https://tools.karlo-cavlovic.dev/flashback-vhs
```

## First deploy

1. Copy `.env.production.example` to `.env`.
2. Set a long random `POSTGRES_PASSWORD`.
3. Choose either subdomain or path settings.
4. Build and start:

```bash
docker compose --env-file .env up -d --build
```

5. Point nginx to the matching config in `deploy/nginx/`.
6. Point Cloudflared at nginx on the Pi.

## Important production notes

- The container installs Linux FFmpeg. Do not use the bundled Windows `.exe` files in Docker.
- Uploaded media and rendered files live in the `app_storage` Docker volume.
- User accounts, sessions, and saved works live in Postgres.
- The API creates tables on startup. Move to Alembic migrations once schema changes become frequent.
- Keep Postgres private; only expose nginx/Cloudflared publicly.
