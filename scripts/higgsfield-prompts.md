# Higgsfield clip generation — Club Atlético Echagüe

Five clips on **Cinema Studio Video 3.0** (`cinematic_studio_3_0`), all sharing
the same visual DNA so the site reads as one continuous film.

NOTE: `public/video-frames/` is intentionally empty (only README.md). The
CinematicLayer canvases draw ON TOP of the Three.js scenes (logo monument,
court, pool, volleyball), so anything extracted there covers the 3D world for
most of each section — only put real cinematic clips there, never filler.
Until then the site runs on its 3D scenes alone, which is fully presentable.

## Blocked on credits (as of 2026-07-15)

The Higgsfield account (free plan) has **10 credits**. Verified costs per clip
(16:9, 8 s, silent, genre `drama`):

| Resolution | Credits/clip | All five |
|-----------:|-------------:|---------:|
| 4K         | 192          | 960      |
| **1080p**  | **80**       | **400**  |
| 720p       | 40           | 200      |

**Recommendation: 1080p.** `npm run frames` downscales every frame to 1600 px
wide, so 4K masters add nothing on the site itself — only buy 4K if the mp4s
are also wanted as standalone assets.

## Shared parameters (every clip)

```
model:          cinematic_studio_3_0
aspect_ratio:   16:9
duration:       8
resolution:     1080p          (or 4k for archive masters)
genre:          drama
generate_audio: false
```

Shared style block — append to every prompt so the grade/lighting/camera
grammar match across clips:

> Cinematic sports-documentary grade: deep navy shadows, warm gold accent
> lighting, subtle cyan atmospheric fill, soft volumetric haze, fine dust
> particles suspended in the light, filmic contrast with gentle highlight
> roll-off, shallow depth of field, slow perfectly smooth camera movement,
> seamless loop, no text, no logos, no on-screen graphics.

For **hero** and **outro**, upload `public/img/logo.png` via `media_upload`
and pass it with role `image` as a reference so the crest is the club's real
inverted-triangle "AEC" shield instead of an invented one.

## Prompts

### 1. hero.mp4 — generate this FIRST, it sets the DNA
A slow, perfectly smooth 360-degree orbital camera move around a classic
Argentine sports club crest — an inverted triangular shield — floating
weightless in a dark void. Deep navy background, a single museum-style
spotlight from above tracing subtle gold rim light along the shield's edges,
faint dust and light particles drifting slowly, soft volumetric fog catching
the beam. Dramatic and prestigious, like a trophy in a museum vitrine.
+ shared style block

### 2. basketball.mp4
A basketball player mid-dribble on an indoor court at night, warm amber court
lighting from overhead lamps, shallow depth of field, the ball leaving faint
warm light trails, camera slowly circling at knee height around the player,
dust particles catching the light, dark navy shadows swallowing the empty
stands. + shared style block

### 3. swimming.mp4
Underwater camera gliding slowly down an empty swimming-pool lane, caustic
light patterns rippling across the tiled pool floor, small bubbles rising past
the lens, cool blue-cyan atmosphere, the dark silhouette of a swimmer crossing
the bright surface line above, rays of light shafting down through the water.
+ shared style block

### 4. volleyball.mp4
A volleyball spike frozen at its highest point against a sunset-toned sky, the
ball suspended mid-air above the net, net strings still vibrating, camera
drifting slowly sideways past at net height, warm orange rim light separating
the leaping player's silhouette from a darkening indigo background.
+ shared style block

### 5. outro.mp4
A classic sports club crest resting on dark polished marble, thin wisps of
gold-tinted smoke drifting slowly through a single overhead spotlight beam,
deep navy darkness all around, faint dust particles, the reflective marble
surface catching the gold light — the same museum mood as the opening, closing
the loop. + shared style block

## After downloading each mp4

```
npm run frames -- path/to/hero.mp4 hero
npm run frames -- path/to/basketball.mp4 basketball
npm run frames -- path/to/swimming.mp4 swimming
npm run frames -- path/to/volleyball.mp4 volleyball
npm run frames -- path/to/outro.mp4 outro
```

Reload the site — no code changes needed. Then verify with:

```
node scripts/verify-scroll.mjs
```
