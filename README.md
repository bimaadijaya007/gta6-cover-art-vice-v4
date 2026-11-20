# Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/bimaadijaya007/gta6-cover-art-vice-v4/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/bimaadijaya007/gta6-cover-art-vice-v4/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover Studio turns your photo and a caption into cover art in the
style of GTA 6's posters — multi-panel layouts, sunset and neon colour
grades, and a big slanted poster title. It runs fully offline in the
browser: vanilla JavaScript + Canvas 2D, no libraries, no network, no
font files.

## What it does

- **Layouts** — Vice Trio (big hero + two stacked vignettes), Duo (two
  panels), Full-bleed (one photo).
- **Photos** — upload up to 3 photos, or reuse one photo in every panel.
  Two sample photos are bundled so the app works in one click. Per-panel
  zoom (slider) and pan (drag the panel on the cover).
- **Caption** — big bold poster title (white, thick black outline, slight
  slant) plus a small tagline, edited live.
- **Colour grades** — Sunset, Neon Nights, Vice Pink, Golden Hour.
- **Export** — PNG at 1080 x 1080, 1080 x 1350, or 1920 x 1080.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static server, e.g.
`python3 -m http.server -d app 8080`.

## Screenshots

`?shot=cover`, `?shot=duo`, `?shot=portrait` render fixed cover scenes
and `?shot=editor` shows the editor with a sample photo loaded; each sets
`window.__shotReady` once painted. See `shots.json` for the four shots.

## Entry

Built for the [gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01)
on make.fun. `main.ts` copies `app/` and `screenshots/` to the output
directory and writes `dossier.json` with the vendored make.fun library.
