# Cinematic frame sequences (Higgsfield integration)

This folder is where Higgsfield-generated clips get plugged into the site.
Nothing here is required for the site to run — `src/components/cinematic/FrameSequence.tsx`
quietly renders nothing for any section whose folder/manifest doesn't exist yet.

## Flow

1. Generate a clip in Higgsfield for one of: `hero`, `basketball`, `swimming`,
   `volleyball`, `outro` (these names must match exactly — they're the
   `SectionId`s wired up in `src/components/cinematic/CinematicLayer.tsx`).
2. Download the mp4.
3. Extract it to a frame sequence:

   ```
   npm run frames -- path/to/clip.mp4 hero
   ```

   Optional flags: `--fps 15` (default), `--width 1600` (default),
   `--quality 3` (ffmpeg mjpeg scale, 2=best..31=worst, default 3).

4. That writes `public/video-frames/hero/frame-0001.jpg ... frame-NNNN.jpg`
   plus `public/video-frames/hero/manifest.json`.
5. Reload the site — `CinematicLayer` picks it up automatically, no code
   changes needed. It's scroll-scrubbed frame-by-frame across that section's
   pinned scroll range, faded in/out in sync with the section's text.

## Notes

- Requires `ffmpeg` on PATH (`winget install ffmpeg` / `brew install ffmpeg` / `apt install ffmpeg`).
- Keep clips 5–10s like the Higgsfield brief specifies — at 15fps that's
  75–150 frames, small enough to preload without stalling the section.
- Re-running the command for the same `<name>` overwrites that folder's frames.
