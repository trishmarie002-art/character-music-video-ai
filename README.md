# Character Music Video AI

A lightweight, Vercel-friendly starter for a Freebeat-style character music-video workflow.

## V1 flow

Character image + song + lyrics -> style/length selection -> storyboard -> hosted video generation -> lip sync -> final render.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` before connecting external AI APIs.

## Architecture

- Next.js UI/API routes
- Supabase or similar object storage for character/audio assets
- Hosted video model API rather than local GPU inference
- Lip-sync provider for performance shots
- FFmpeg-capable render worker for final assembly

## Current status

The interface and storyboard generation route are installed. Real video generation is the next integration step.

## Recommended build order

1. Character upload/storage
2. Song upload/storage
3. Scene planner
4. Hosted image-to-video provider
5. Lip sync
6. Render worker
7. Reusable Character Profiles / character bible
8. Credits/payments
