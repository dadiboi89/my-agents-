# Production Plan: "Chi Vive nel Mare?" 🐠
### From script to published video — AI generation prompts, audio spec, Creatomate assembly, Shorts, QC

> Executes the script in `cocomelon-italiano-analysis-and-script.md`. Target: 5:30 master (1920×1080), 2 Shorts (1080×1920), thumbnail, publish-ready packaging.
> **Generation prompts are in English** (video/image models perform best in English); all **on-screen text and audio are Italian**. On-screen text is never baked into generated frames — it's added as Creatomate text layers so it stays crisp and editable.

---

## 0. Pipeline at a glance

```
1. CHARACTER SHEETS  →  lock one reference image per character (consistency anchor)
2. KEYFRAMES         →  ~32 still images (image gen + character reference)
3. CLIPS             →  image-to-video, 5–10s each, motion prompts only
4. AUDIO             →  music bed (sectioned, 96 BPM) + sung vocals + VO lines + SFX
5. ASSEMBLY          →  Creatomate raw-source JSON: video track + 3 audio tracks + text overlays
6. PACKAGE           →  thumbnail, title/description/tags, made-for-kids + AI disclosure
7. DERIVATIVES       →  2 Shorts cuts; song → 60-min compilation later
```

Consistency strategy: **still keyframes first, then animate** (image-to-video). Text-to-video drifts characters; a locked keyframe per shot keeps Nino looking like Nino across 30+ shots.

---

## 1. Style & character bible

### Master style block — append to EVERY image prompt
> `3D animated cartoon for toddlers, Pixar-style soft rounded shapes, oversized heads with huge friendly eyes, chubby proportions, bright saturated primary colors, soft even lighting with gentle rim light, smooth clay-plastic textures, cheerful G-rated mood, clean uncluttered background, high quality render, 16:9`

### Negative prompt (or "avoid" clause)
> `photorealistic skin, realistic humans, scary, dark shadows, muted colors, text, letters, watermark, logo, extra fingers, deformed hands, adult proportions`

### Characters (generate a character sheet for each FIRST — front, ¾, side + 3 expressions — then reuse the chosen sheet as reference image in every keyframe)

| ID | Reference prompt (+ master style block) |
|---|---|
| **NINO** | `toddler boy about 2 years old, round face, big brown eyes, one lemon-yellow curl of hair on top of his head, yellow t-shirt with a small lemon print, blue shorts, barefoot, joyful open-mouth smile` |
| **GAIA** | `girl 5 years old, warm brown hair in two pigtails with red ribbons, green sundress with white polka dots, big hazel eyes, light freckles, kind big-sister energy` |
| **BISCOTTO** | `small beige cartoon puppy, floppy ears, round black nose, red collar with a tiny bone tag, wagging tail, playful` |
| **MAMMA** | `young mother with a chestnut bob haircut, soft friendly features, coral summer dress, warm gentle smile` |
| **PESCIOLINO** | `small chubby orange cartoon fish, huge happy eyes, coral-pink fins, tiny bubbles around` |
| **GRANCHIETTO** | `small red cartoon crab, big googly eyes, oversized rounded friendly claws, six stubby legs` |
| **DELFINO** | `friendly light-blue cartoon dolphin, permanent smile, smooth glossy skin, cream belly` |
| **POLIPETTO** | `small purple cartoon octopus, eight short stubby arms with lavender suction dots, huge shy sparkling eyes` |

### Fixed palette (hold across episodes — brand)
Sky `#4EC3F7` · Sea `#2AA8E0` · Sand `#FFE29A` · Lemon `#FFD93B` · Coral `#FF6F61` · Leaf `#6BCB77` · Cream `#FFF7E6`

**Consistency rules:** same seed family per character where the tool allows; regenerate any shot where face/outfit drifts (budget 1.5× retries); camera always static or slow push-in — no fast moves for toddler pacing.

---

## 2. Shot list with generation prompts

~32 generated shots + 2 reusable brand assets (logo sting, end card — build once, reuse every episode). Chorus shots repeat by design (authentic to the genre and cheaper). Each clip: generate keyframe → animate with the motion prompt. Durations are edit targets; generate 1–2s longer for trim room.

**Legend:** `[KF]` keyframe prompt (add master style block + character refs) · `[MV]` image-to-video motion prompt · `[AU]` audio at that moment.

### S1 — Cold open (0:00–0:18) · ambience only, no music
- **SH01 · 5s** — [KF] `sunny Italian beach, gentle waves, NINO toddling toward a small tide pool among smooth rocks, BISCOTTO sniffing beside him, wide shot` · [MV] `toddler waddles forward, puppy tail wags, gentle waves lap, camera static` · [AU] waves + seagulls
- **SH02 · 4s** — [KF] `close-up of tide pool, a playful splash of water erupting, NINO leaning back surprised with wide eyes, droplets sparkling` · [MV] `water splashes upward, baby flinches back, eyes widen` · [AU] SPLASH! + Nino: *"Oh! Gaia! Guarda! C'è qualcuno nell'acqua!"*
- **SH03 · 6s** — [KF] `GAIA kneeling beside NINO at the tide pool, both looking directly at camera, GAIA with finger to lips, conspiratorial smile` · [MV] `girl leans toward camera and whispers, boy nods excitedly` · [AU] Gaia: *"Chi vive nel mare? Lo vuoi scoprire con noi?"*
- **SH04 · 3s** — [KF] `NINO and GAIA pointing forward toward the sea together, determined happy faces, BISCOTTO mid-jump` · [MV] `both children point and cheer, puppy jumps` · [AU] Both: *"Andiamo!!"*

### S2 — Logo sting (0:18–0:25) · **BRAND ASSET — build once**
- **SH05 · 7s** — [KF] `cute smiling lemon mascot with sunglasses on cream background, rainbow arc behind` · [MV] `lemon bounces twice, squeezes, a rainbow bursts out, sparkles` · [AU] 5-note jingle + choir: *"Li-mon-ci-no TV!"*

### S3 — Imagination transition (0:25–0:50) · music fades in
- **SH06 · 6s** — [KF] `GAIA tapping her temple with a clever smile, golden sparkles beginning to swirl around her head, beach background` · [MV] `sparkles multiply and orbit, hair sways in breeze` · [AU] Gaia: *"Usiamo la fantasia!"*
- **SH07 · 8s** — [KF] `a small sandcastle magically growing into a glittering golden castle, tide pool glowing like a magical doorway, sparkle vortex` · [MV] `castle rises and grows, pool glows brighter, sparkles spiral into it` · [AU] rising harp gliss
- **SH08 · 8s** — [KF] `underwater cartoon wonderland, colorful coral reef, NINO and GAIA floating gently mid-water, BISCOTTO wearing a tiny snorkel mask, rays of sunlight through turquoise water` · [MV] `children drift downward gently like astronauts, bubbles rise, light rays shimmer` · [AU] magical chime resolve → chorus build

### S4 — CHORUS №1 (0:50–1:10) · **the reusable dance loop**
- **SH09 · 7s** — [KF] `wide shot underwater, NINO and GAIA doing a happy dance side by side above the sandy seabed, BISCOTTO bobbing between them, coral reef behind` · [MV] `children do a simple dance loop: clap, wiggle hips, point up, small jump — repeating in rhythm, bubbles pop upward` · [AU] Chorus: *"Chi vive nel mare? Chi vive nel mar? / Vieni con me, andiamo a guardar!…"*
- **SH10 · 6s** — [KF] `medium shot NINO dancing underwater, clapping chubby hands, huge smile, bubbles around` · [MV] `baby claps to the beat, wiggles, giggles` 
- **SH11 · 7s** — [KF] `medium shot GAIA twirling underwater holding BISCOTTO's front paws, both spinning` · [MV] `girl and puppy spin slowly, dress and ears flow`

### S5 — Verse 1: il pesciolino (1:10–1:45)
- **SH12 · 8s** — [KF] `PESCIOLINO swimming a spiral around delighted NINO, trail of tiny bubbles` · [MV] `fish loops around the baby leaving a bubble trail, baby follows it with his eyes, giggling` · [AU] *"Il pesciolino nuota — splish, splash, splish!"*
- **SH13 · 8s** — [KF] `close-up PESCIOLINO wiggling its coral-pink tail fin fast, cheeky smile` · [MV] `tail wiggles side to side in rhythm, fish winks` · [AU] *"Muove la codina — swish, swish, swish!"*
- **SH14 · 7s** — [KF] `NINO and GAIA doing swimming arm motions imitating the fish, PESCIOLINO cheering them on` · [MV] `children paddle arms in breaststroke rhythm, fish claps fins` · [AU] *"Nuota come lui, dai, prova pure tu!"*
- **SH15 · 5s** — [KF] `GAIA facing camera, arms out inviting, PESCIOLINO beside her head` · [MV] `girl gestures 'you too!' to camera, fish nods` · [AU] music drops → Gaia: *"Sai nuotare come il pesciolino? Muovi le braccia!"* (2s hold for kids to copy)

### S6 — Verse 2: il granchietto (1:45–2:20)
- **SH16 · 8s** — [KF] `GRANCHIETTO tip-toeing sideways across ripple-marked sand, claws raised like maracas` · [MV] `crab side-steps in rhythm left then right, claws click like castanets` · [AU] *"Il granchietto cammina di qua e di là…"*
- **SH17 · 7s** — [KF] `BISCOTTO copying the crab, walking sideways with a silly concentrated face, GRANCHIETTO looking amused` · [MV] `puppy shuffles sideways clumsily, crab nods approvingly, comedic timing` · [AU] *"pizzica-pizzica — clic, clac, clic!"* + boing SFX
- **SH18 · 7s** — [KF] `NINO and GAIA side-stepping in a line with GRANCHIETTO and BISCOTTO, conga-line formation` · [MV] `whole line side-steps left, then right, in sync with the beat` · [AU] verse repeat
- **SH19 · 5s** — [KF] `NINO close to camera doing pinchy-pinchy fingers like little claws, giggling` · [MV] `baby opens and closes finger-pinches at camera, laughs` · [AU] Nino: *"Fai il granchietto! Di qua… di là!"*

### S7 — CHORUS №2 (2:20–2:40) · **REUSE SH09 → SH10 → SH11** + one new:
- **SH20 · 6s** — [KF] `PESCIOLINO and GRANCHIETTO dancing beside the children in the dance line, everyone mid-move` · [MV] `full group does the clap-wiggle-point-jump loop together`

### S8 — ⚡ Pattern interrupt (2:40–3:05) · music stops
- **SH21 · 6s** — [KF] `a strong playful water current sweeping across the reef, PESCIOLINO tumbling head over tail, motion streaks, kids' hair blowing` · [MV] `current whooshes left to right, fish tumbles away helplessly` · [AU] WHOOSH, music cuts
- **SH22 · 7s** — [KF] `PESCIOLINO hiding behind a rock, only eyes peeking out, trembling, single tiny tear, soft blue-hour light` · [MV] `fish trembles, lip quivers, slowly peeks out` · [AU] minor-key twinkle → Nino (soft): *"Oh no! Il pesciolino ha paura!"*
- **SH23 · 8s** — [KF] `group hug: NINO, GAIA, BISCOTTO gently encircling PESCIOLINO, warm golden light bloom, everyone smiling softly` · [MV] `slow warm embrace, fish's expression melts from fear to joy, light blooms` · [AU] Gaia: *"Non ti preoccupare… siamo qui con te!"* → warm chime, music restarts brighter

### S9 — Verse 3: il delfino (3:05–3:40)
- **SH24 · 8s** — [KF] `DELFINO arcing majestically overhead through the water above the amazed children, sparkle trail` · [MV] `dolphin sails overhead in a slow graceful arc, children track it cheering, bubbles trail` · [AU] *"Il delfino salta — su, su, su!"*
- **SH25 · 7s** — [KF] `DELFINO mid-somersault, flipping with a huge grin` · [MV] `dolphin does one full playful flip then dives, splash of bubbles` · [AU] *"Fa una capriola e poi giù, giù, giù!"*
- **SH26 · 7s** — [KF] `NINO and GAIA crouched ready to jump, DELFINO hovering above encouraging them` · [MV] `children crouch then leap upward together with the dolphin, joy` · [AU] Gaia: *"Salta in alto! Uno, due, tre… SALTA!"*

### S10 — Verse 4: il polipetto + counting (3:40–4:20)
- **SH27 · 7s** — [KF] `POLIPETTO peeking shyly from behind coral rocks, two big sparkling eyes visible, one arm waving timidly` · [MV] `octopus slowly emerges, gives a shy little wave, blushes` · [AU] *"Il polipetto ha otto braccia, sai?"*
- **SH28 · 10s** — [KF] `POLIPETTO center frame with all eight arms spread wide like a star, children on both sides pointing at the arms` · [MV] `each arm does a little wave one after another in sequence, 8 beats, children count along pointing` · [AU] *"UNO, DUE, TRE, QUATTRO, CINQUE, SEI, SETTE, OTTO — evviva!"* · **numbers 1–8 appear as Creatomate text pops, NOT in the generation**
- **SH29 · 6s** — [KF] `POLIPETTO doing a happy noodle-arm dance, confetti of tiny bubbles` · [MV] `all eight arms wiggle in celebration, octopus bounces` · [AU] *"evviva!"* + cheer SFX
- **SH30 · 5s** — [KF] `GAIA to camera pointing at POLIPETTO who nods proudly` · [MV] `girl gasps in realization, octopus nods 'it was me!'` · [AU] Gaia: *"Era lui nell'acqua! Ciao, polipetto!"* — **pays off the cold open**

### S11 — FINAL CHORUS recap (4:20–4:50) · **REUSE SH09–SH11** + one new:
- **SH31 · 8s** — [KF] `grand finale wide shot: NINO, GAIA, BISCOTTO, PESCIOLINO, GRANCHIETTO, DELFINO and POLIPETTO all dancing together, bubble confetti everywhere` · [MV] `whole cast does the dance loop, bubble confetti rises, celebratory` · [AU] recap chorus: *"Chi vive nel mare? Ora lo so!…"* — 1s flash-cuts of each animal = **Ken Burns on existing keyframes in Creatomate, no new generation**

### S12 — Calm outro (4:50–5:20) · lullaby, music box
- **SH32 · 8s** — [KF] `sparkle wipe dissolving from underwater back to the real beach at golden sunset, warm orange sky` · [MV] `sparkles dissolve, scene melts to sunset beach, waves gentle` 
- **SH33 · 8s** — [KF] `NINO yawning wrapped in MAMMA's arms, GAIA waving goodbye toward the sea, BISCOTTO asleep curled on the sand, sunset` · [MV] `baby yawns and nestles, girl waves slowly, puppy breathes softly` · [AU] *"Il sole va a dormire, il mare fa shhh…"*
- **SH34 · 8s** — [KF] `wide sunset seascape, sun half-dipped below the horizon with a sleepy smiling face, first stars appearing` · [MV] `sun sinks slowly, stars twinkle in, waves calm to stillness` · [AU] *"…domani torneremo a giocare quaggiù."*

### S13 — End card (5:20–5:30) · **BRAND ASSET — build in Creatomate once**
- **SH35** — Creatomate composition: cream background, lemon mascot (still from SH05 keyframe), subscribe button element, placeholder slot for next-video thumbnail. · [AU] Narrator: *"Ti è piaciuto? Iscriviti a Limoncino TV e canta con noi ogni settimana!"*

**Generation totals:** 33 keyframes + 31 motion clips (SH05/SH35 partly reusable forever; SH09–SH11 reused twice inside this episode).

---

## 3. Audio production

### 3.1 Music bed — one song, sectioned (96 BPM, C major, toddler-singable range C4–A4)

| Section | Time | Length | Feel |
|---|---|---|---|
| INTRO | 0:00 | 18s | no music — waves + seagulls ambience |
| JINGLE | 0:18 | 7s | 5-note logo sting, glockenspiel + choir |
| TRANSITION | 0:25 | 25s | harp gliss build, ukulele enters |
| CHORUS | 0:50 | 20s | full: ukulele, glockenspiel, xylophone, soft kick, handclaps |
| VERSE fish / crab | 1:10 / 1:45 | 35s each | verse groove + per-animal SFX accents |
| CHORUS 2 | 2:20 | 20s | as chorus |
| INTERRUPT | 2:40 | 25s | hard stop → minor-key music box → warm rebuild |
| VERSE dolphin / octopus | 3:05 / 3:40 | 35s + 40s | octopus verse has 8-beat counting break (claps only) |
| FINAL CHORUS | 4:20 | 30s | biggest arrangement + kids' choir doubling |
| LULLABY | 4:50 | 30s | music box + soft strings, 70 BPM feel |
| END CARD | 5:20 | 10s | jingle reprise, gentle |

**Music-gen prompt (Suno-style)** — generate per section or as one song using the tagged lyric sheet from the script doc:
> `Cheerful Italian children's song, ukulele, glockenspiel, xylophone, soft kick drum and handclaps, 96 bpm, C major, warm friendly female lead vocal with occasional child choir response, very simple singable nursery melody, call and response, verses about sea animals with playful onomatopoeia, ends with a gentle music-box lullaby section`

Vocals must articulate clearly — toddler comprehension beats vocal style. If gen vocals slur the Italian, generate instrumental and record vocals separately.

### 3.2 Spoken VO lines (10 lines — cast list in script doc §cold open/verses)
Options: **(a)** real Italian voice actors (one adult voicing Gaia child-register + one toddler-ish Nino, ~€100–200 on Fiverr/VoiceBunny — best quality and safest policy-wise) or **(b)** AI voices (ElevenLabs/vidIQ voiceover, Italian, child-adjacent presets) — **if AI, tick YouTube's altered-content disclosure at upload.**

### 3.3 SFX list
waves loop · seagulls · water splash (big, comedic) · bubble pops (xylophone-ish) · claw clicks (castanets) · boing (Biscotto comedy) · whoosh (current) · sad twinkle · warm chime (hug resolve) · jump slide-whistle (dolphin) · counting pops ×8 · cheer "evviva" (kids' choir) · music box outro

### 3.4 Mix spec
Vocals −6 dB above bed · SFX ducked under VO · master **−14 LUFS integrated, true peak −1 dB** · no sudden loudness spikes (toddler/parent trust).

---

## 4. Assembly — Creatomate (`creatomate-mcp`, already wired in `.mcp.json`)

**Prerequisite:** `CREATOMATE_API_KEY` set in the environment. Assets must be publicly reachable URLs (host generated clips on Dropbox shared links, S3, or any public bucket).

**Asset naming:** `ep01_sh01.mp4 … ep01_sh34.mp4`, `ep01_music.mp3`, `ep01_vocals.mp3`, `ep01_vo_01..10.mp3`, `ep01_sfx_*.mp3`.

### Source JSON skeleton (raw-source render — width/height set inside source)

```json
{
  "output_format": "mp4",
  "width": 1920, "height": 1080, "frame_rate": 30,
  "elements": [
    { "type": "video", "track": 1, "time": 0,    "duration": 5, "source": "https://…/ep01_sh01.mp4" },
    { "type": "video", "track": 1, "time": 5,    "duration": 4, "source": "https://…/ep01_sh02.mp4",
      "animations": [{ "type": "fade", "duration": 0.4, "transition": true }] },

    { "type": "text",  "track": 2, "time": 228, "duration": 1, "text": "1",
      "font_family": "Baloo 2", "font_weight": "800", "font_size": "18 vmin",
      "fill_color": "#FFD93B", "stroke_color": "#FFFFFF", "stroke_width": "1.5 vmin",
      "x": "20%", "y": "30%",
      "animations": [{ "type": "scale", "duration": 0.3, "easing": "bounce-out" }] },

    { "type": "audio", "track": 3, "time": 25,  "source": "https://…/ep01_music.mp3" },
    { "type": "audio", "track": 4, "time": 0,   "source": "https://…/ep01_vo_01.mp3" },
    { "type": "audio", "track": 5, "time": 0,   "duration": 25, "source": "https://…/ep01_sfx_waves.mp3", "volume": "60%" }
  ]
}
```
…repeat the video pattern for SH03–SH34 per the shot-list timecodes, the text pattern for counting numbers 1–8 (SH28, one per beat), and audio elements per the mix spec. Sparkle-wipe transitions between S3/S12 boundaries: `{"type":"wipe"}` animation or a generated overlay clip on track 2 with transparency.

### MCP render flow
1. `render` with the `source` JSON → returns `{ id, status }`
2. Poll `get_render(id)` until `succeeded` → download `url`
3. Karaoke-style lyric subtitles (optional but recommended for co-singing parents): text elements per lyric line, timed to the section table above.

---

## 5. Thumbnail + upload packaging

**Thumbnail generation prompt** (then add badges in Creatomate/Canva — text never baked in):
> `NINO and GAIA huge in the foreground pointing excitedly at a cute purple octopus popping out of sparkling blue water, huge expressive eyes, open-mouth wonder, bright turquoise sea and yellow sand background` + master style block, 16:9
> Overlays: "Italiano" badge top-left · Limoncino logo bottom-left · NO other text (faces do the work at toddler-thumbnail size).

**Upload checklist:**
- Title A: `Chi Vive nel Mare? 🐠 | Limoncino TV – Canzoni per Bambini` (B variant in script doc)
- Description first line + per-animal timestamps (script doc §7) · Tags (script doc §7)
- **Audience: "Yes, made for kids"** · **Altered content: "Yes"** if AI voices/visuals (they are) — this is the compliant path under the Jul 2025 inauthentic-content policy: original characters, human-written lyrics, disclosed AI production
- Add to playlist "Estate con Limoncino! ☀️" · End screen: subscribe + next video · Pin location: none (comments auto-off for made-for-kids)

---

## 6. Shorts cuts (both from existing clips — zero new generation)

| | SHORT 1 — "Conta con il polipetto!" | SHORT 2 — "Salta col delfino!" |
|---|---|---|
| Source shots | SH27 → SH28 → SH29 → SH30 | SH24 → SH25 → SH26 |
| Length | ~40s | ~30s |
| Frame | 1080×1920; re-center subjects (`x_alignment`/crop per clip in a 9:16 Creatomate source) | same |
| Hook overlay (first 1.5s) | `Sai contare fino a 8? 🐙` | `Salta in alto col delfino! 🐬` |
| Captions | Baked karaoke lyrics, Baloo 2 ExtraBold, bottom third | same |
| Outro (last 3s) | Chorus sting + `Video completo sul canale! 🍋` | same |

---

## 7. Cost & time estimate (episode 1)

| Item | Est. |
|---|---|
| Character sheets (8 × ~2 tries) | ~16 image gens |
| Keyframes (33 × 1.5 retry factor) | ~50 image gens |
| Image-to-video (31 clips × 1.3 retry, 5–10s) | ~40 video gens — **the main cost** |
| Music + vocals | 1 song (a few gen attempts) or commission |
| VO | €0 (AI) – €200 (real actors) |
| Creatomate | ~6 min of render output — cents to low $ |
| **Ballpark total** | **~$100–300 in gen credits** depending on tool tier, +VO if human |
| Time | **~3–4 focused days**; episodes 2+ ≈ 1–2 days (reused refs, logo, end card, chorus concept, song structure) |

Connected generators available in this workspace: **Kling** (`klingai` MCP — image gen, image-to-video) and **Higgsfield** (image/video batch + explainer workflows). Both bill their own credits; check balances before batch runs.

---

## 8. QC checklist (before upload)

- [ ] Character consistency: every shot vs. locked reference sheets (hair curl, outfits, colors)
- [ ] No text/letters accidentally baked into any generated frame
- [ ] No cut shorter than 3s; no flashing >3 Hz (photosensitivity safety); camera moves slow
- [ ] Counting numbers land exactly on the 8 beats; lyrics sync within ±150ms
- [ ] Italian reviewed by a native speaker (lyrics scan naturally at 96 BPM)
- [ ] Loudness −14 LUFS, true peak −1 dB, no spikes
- [ ] Emotional beat resolves warmly (fear → comfort ≤ 25s)
- [ ] Made-for-kids flag + AI disclosure set; end screen set; playlist assigned
- [ ] Thumbnail legible at 120px width (faces + octopus read clearly)

---

## 9. Execution order

| Day | Work |
|---|---|
| **1** | Generate + lock 8 character sheets → build SH05 logo sting + SH35 end card (permanent brand assets) → kick off music generation/commission |
| **2** | Generate all 33 keyframes (batch, review against bible, retry drifts) |
| **3** | Animate 31 clips (batch image-to-video) → record/generate VO + SFX → finalize music mix |
| **4** | Upload assets to public host → build Creatomate source JSON → render master → QC → thumbnail → 2 Shorts renders → publish + playlist |

**To kick off production:** set `CREATOMATE_API_KEY`, confirm which generator to spend credits on (Kling vs. Higgsfield), and start with Day 1 — the 8 character sheets are the foundation everything else reuses.
