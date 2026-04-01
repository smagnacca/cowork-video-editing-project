# Cowork Video Editing Project — Startup Instructions

When Scott starts a new chat in this folder, greet him with the following prompt exactly:

---

**Welcome back to the Video Pipeline project, Scott. Here's where we left off:**

**What's built and working:**
- Remotion v4 video composition pipeline with multi-scene architecture
- **Reusable Template System** — config-driven video generation from script markdown
- Edge TTS (Microsoft) for voiceover generation (ElevenLabs free tier blocked API access)
- Automated pipeline orchestrator: `python3 scripts/orchestrate.py scripts/my-video.md --render`
- Reusable component library: ParticleField, GlassmorphismCard, KineticText, BRollPlayer, AnimatedBackground
- **New visual effects** (from Persuasion & Conversion Toolkit): LiquidReveal transitions, TypewriterText, MarkerHighlight, NoiseOverlay, DynamicHueShift
- B-roll side-by-side layout with card-shift animation
- Full render pipeline: script → TTS audio → Whisper timestamps → config → Remotion render → MP4
- **Branded Intro/Outro System** — HeyGen avatar recorded once, reused on every video via ffmpeg concat
- **IntroScene, OutroScene, LowerThird** components built and registered in Root.tsx

**Completed videos:**
- "3 Types of People You Need in Your Corner" — FINAL: `output/3-types-of-people-final.mp4` (4:05, with intro/outro)

**Key file locations:**
- Workspace (Cowork): this folder
- **Template system**: `templates/SCRIPT-FORMAT.md` (format docs), `templates/video.config.example.json` (config schema)
- **Orchestrator**: `scripts/orchestrate.py` — runs the full pipeline from a script markdown
- Config-driven composition: `remotion-project/src/TemplateVideo.tsx` (new — reads JSON config)
- Original composition: `remotion-project/src/ThreeTypesVideo.tsx` (hardcoded for reference)
- Reusable components: `remotion-project/src/components/` (ParticleField, KineticText, GlassmorphismCard, BRollPlayer, MeshGradient, SceneTransition, TypewriterText, MarkerHighlight, NoiseOverlay, **LowerThird, IntroScene, OutroScene**)
- **Avatar files**: `remotion-project/public/avatar/intro-avatar.mp4` (728f) + `outro-avatar.mp4` (662f)
- Remotion entry: `remotion-project/remotion/Root.tsx` + `remotion-project/remotion/index.ts`
- Scripts: `scripts/` (orchestrate.py, generate_tts.py, whisper_timestamps.py)
- Audio: `audio/`
- Output: `output/`
- B-roll clips: stored in Remotion `public/broll/` — see `public/broll/CATALOG.md` for inventory
- Visual Effects Catalog: `.claude/skills/visual-effects/SKILL.md`
- Video Pipeline Skill: `.claude/skills/video-pipeline/SKILL.md`
- **B-Roll Auto-Curation Skill**: `.claude/skills/broll-curation/SKILL.md` — automatically find, download, and place B-roll from YouTube

**Scott's video preferences (always apply these):**
- **Video types:** Educational/training, Marketing/sales, Short-form social (60–90s)
- **Visual style:** Cinematic / branded — dark navy bg (#0a0e1a), animated particle backgrounds with glow/pulse, glassmorphism cards, spring animations, kinetic text with textShadow glow
- **Color palette:** bg=#0a0e1a, cyan=#00d4ff, gold=#f5a623, orange=#ff6b35, card-bg=rgba(255,255,255,0.05), text=#ffffff/#a0aec0
- **Voice:** Edge TTS `en-US-AndrewMultilingualNeural` at +12% rate, -2Hz pitch (or ElevenLabs if API access is restored)
- **Workflow:** Scott describes a video → Claude writes the script with scene breakdown → generates voiceover → **auto-curates B-roll from YouTube** → builds/updates Remotion composition → renders final MP4
- **B-roll:** When creating any video, automatically search YouTube for short, clean stock footage clips that support each scene's narration. Download, trim (6s, no audio, h264), and place at Whisper-timed cue points. See `.claude/skills/broll-curation/SKILL.md`

**To create a new video, just describe it.** The full pipeline (including intro/outro splice) runs automatically:
1. Write script in standardized format → run orchestrator → render main content
2. Update `hookText` + `topicTitle` in Root.tsx IntroComposition (2 fields)
3. Render IntroSceneComp + OutroSceneComp → ffmpeg concat all three → `[name]-final.mp4`
4. **ALWAYS deliver the `-final.mp4`** (intro + content + outro), never the raw content-only render

**⭐ FIRST DRAFT EXCELLENCE STANDARD:** Before writing any code for a new video, load and apply the **First Draft Excellence Checklist** in memory (`feedback_first_draft_excellence.md`). Every new video must score "A" on the first render — no defects that were already fixed in a prior video. The checklist covers: sizing, SVG font math, hook rotation, layout collision, CTA completeness, brand audit, render pipeline. This is MANDATORY.

**What would you like to work on today?**
- **Create a new video** (concept → script → voiceover → animated MP4 + branded intro/outro)
- Upgrade the composition templates (new scene types, visual styles)
- Extend the pipeline (captions, music bed, batch rendering, logo overlay)
- Something else

---

## CRITICAL RULES — Mistakes to NEVER Repeat

### 1. NO WebkitBackgroundClip in Remotion
**NEVER** use `WebkitBackgroundClip: 'text'`, `WebkitTextFillColor: 'transparent'`, or CSS gradient-clip text effects. They render as SOLID COLOR BARS in Remotion's headless Chrome. Use solid `color` + `textShadow` glow instead.

### 1b. NO objectFit / objectPosition on OffthreadVideo
**NEVER** use `objectFit: 'cover'`, `objectFit: 'contain'`, or `objectPosition` on `<OffthreadVideo>`. Remotion's headless Chrome renderer ignores these CSS properties — the video renders at its native 1920×1080 size and **overflows the container off-screen** (avatar pushed out of the right edge).
**ALWAYS** use explicit pixel dimensions instead:
```tsx
// ✅ CORRECT — full-resolution, anchored right, clipped by overflow:hidden on parent
<div style={{ position: 'absolute', right: 0, top: 0, width: 960, height: 1080,
              overflow: 'hidden', backgroundColor: colors.bg }}>
  <OffthreadVideo
    src={staticFile(scene.avatarSrc)}
    style={{ position: 'absolute', right: 0, top: 0, width: 1920, height: 1080 }}
  />
</div>

// ❌ WRONG — objectFit ignored, video overflows rightward off-screen
<OffthreadVideo style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
```
This lesson came from the HeyGen avatar integration (2026-03-31): avatar was pushed off the right edge of the 1920px frame in the rendered MP4.

### 2. NO Overlay B-Roll on Dark Backgrounds
**NEVER** use blend modes (screen, multiply), opacity overlays, or ffmpeg compositing for B-roll on dark backgrounds — it's invisible. Use the SIDE-BY-SIDE layout: card shifts left, B-roll plays in a framed player on the right.

### 2b. SVG INTERNAL FONT SIZES — Must Be Scaled to viewBox, NOT Screen Pixels
**NEVER** write an SVG `fontSize` without checking it against the viewBox dimensions first.

**The bug:** `<text fontSize={11}>` inside `viewBox="0 0 1600 500"` = **11 pixels on screen** — completely illegible.

**The formula:**
```
screen_px = (fontSize / viewBoxWidth) × renderedSvgWidth
```
For a 1600-wide viewBox rendered at 1600px → `fontSize=11 → 11px screen` ❌ | `fontSize=42 → 42px screen` ✓

**Minimum rules:**
- Any SVG `fontSize` must yield ≥ 20 screen pixels after the above calculation
- Prominent labels (bridge names, section titles, infographic captions): fontSize must yield ≥ 36px
- Infographic graphic spans: must cover ≥ 20% of viewBox width to be visible (e.g. a bridge in a 1600px SVG must be ≥ 320px wide)

**Quick scan command (run before every render):**
```bash
# Flags any SVG fontSize below 20 — manually verify if the SVG viewBox makes it smaller
grep -n "fontSize={[0-9]\b\|fontSize={1[0-9]}" remotion-project/src/*.tsx
```

This lesson came from the Storyselling v4→v5 bridge fix (2026-04-01): "STORYSELLING" bridge text was `fontSize={11}` in a 1600-wide viewBox, rendering as an 11px line invisible in any video. Also: bridge span was only 96px in 1600px SVG (6% of canvas). Both fixed in v5.

### 3. ALWAYS Verify Script Before TTS — AND Whisper-Verify After
Before generating audio, READ the exact text. After generating, run Whisper on the MP3 and compare against the script. Fix any garbled words before embedding in the render.

**Edge TTS Banned Words (en-US-AndrewMultilingualNeural) — confirmed mispronunciations:**
| Banned | TTS says | Use instead |
|--------|---------|-------------|
| Charts / charts | "shots" | Graphs, Data, Numbers |
| Flawless | "Flownos shaw" | Crisp, Clean, Polished |
| Sharp (before consonants) | "chart" | Polished, Clean, Clear |
| Jargon | "cargo" | (avoid) |
| Buzzwords | garbled | Fluff, Hype, Noise, Nonsense |

Add this to every TTS script's assertion block:
```python
BANNED = ['charts','Charts','flawless','Flawless','jargon','Jargon','buzzwords','Buzzwords']
for w in BANNED: assert w not in TEXT, f"BANNED TTS word: {w}"
```

### 4. Edge TTS for Long Text: Use Python Async API
The `edge-tts` CLI can timeout on long narrations. Use the Python async API: `edge_tts.Communicate(text, voice, rate, pitch).save(path)`.

### 5. Remotion Render in Writable Directory
Remotion installs a browser binary. The Cowork workspace mount (/mnt/) has EPERM restrictions on unlink. Always copy the Remotion project to a writable directory (`/sessions/...`) for rendering.

### 6. Root.tsx durationInFrames Must Match Scene Timings
If SCENE_END constants total more frames than `durationInFrames` in Root.tsx, the video will be cut short. Always verify they match.

### 7. Audio Duration Drives Scene Timings
Calculate scene timings from audio duration (seconds × fps = frames). Don't guess. Use ffprobe to check audio duration before setting scene boundaries.

### 8. Use Silence Detection for Scene Transitions
Run `ffmpeg -i audio.mp3 -af silencedetect=noise=-30dB:d=0.4 -f null -` to find natural pauses. Cross-reference with word-count proportions per section. Snap scene transitions to the silence gaps that fall nearest the proportional estimate.

### 9. TTS Text is a Separate Copy — Always Rewrite Fresh
The Python TTS generation script has its own copy of the narration text. After ANY script edit, rewrite the TTS text completely from the markdown. Add Python `assert` checks to verify key phrases are present and old phrases are absent.

### 10. Visual Effects Skill Available
Reference `.claude/skills/visual-effects/SKILL.md` for the Persuasion & Conversion Toolkit — a catalog of visual effects organized by purpose (Focus, Flow, Trust, Revenue, etc.) with implementation prompts.

### 11. Always Do a Final Polish Pass
Before delivering a video, do a full polish pass:
- Add **pull quotes** (2 per archetype scene) — styled italic quotes with colored accent borders, timed to Whisper cue points
- Add **cinematic film grain** (NoiseOverlay, opacity 0.04) across the entire video
- Add **gold circle markers + green checkmarks** for list/attribute scenes (Bridge-style)
- Add **CTA bouncing arrow** pointing to the URL
- Add **pulsing frames** around hook titles
- Position **kinetic text at top** of screen (not bottom)

### 12. New Video Project Setup
For every new video project:
1. Create a new Cowork Remotion project, select "Blank" template, install Skills
2. Review https://www.remotion.dev/showcase and https://www.remotion.dev/prompts for ideas
3. Cross-reference with existing skills and CLAUDE.md before starting

## Reusable Video Template System

### How to Create a New Video
1. **Write script** in standardized markdown format (see `templates/SCRIPT-FORMAT.md`)
   - YAML frontmatter for voice, colors, phonetic overrides
   - `## SCENE N — TYPE (params)` blocks with `> narration` blockquotes
   - `**[Kinetic: "TEXT" color=cyan]**` for punch text
   - `**[B-roll: filename.mp4]**` for video clips
2. **Run orchestrator**: `python3 scripts/orchestrate.py scripts/my-script.md --render`
   - Parses script → generates TTS → runs Whisper → builds config → renders MP4
3. **Or use Claude**: Just describe the video. Claude writes the script, runs the pipeline.

### Scene Types Available
- **HOOK** — Opening title with particles, kinetic text punch
- **ARCHETYPE** — Titled card + icon + subtitle + B-roll (side-by-side), kinetic text
- **BRIDGE** — Multi-card synthesis scene with kinetic sequence
- **CTA** — Call-to-action with URL display, glow, tagline

### Visual Effects Available (from Persuasion & Conversion Toolkit)
- **LiquidReveal** — Organic blob transition between scenes (`SceneTransition.tsx`)
- **CrossfadeTransition** — Simple opacity fade between scenes
- **TypewriterText** — Character-by-character reveal with cursor (`TypewriterText.tsx`)
- **MarkerHighlight** — Animated neon underline that draws left-to-right (`MarkerHighlight.tsx`)
- **NoiseOverlay** — Cinematic film grain texture (`NoiseOverlay.tsx`)
- **DynamicHueShift** — Subtle background color cycling to prevent visual fatigue
- **ParticleField** — SVG particle network with connections and glow
- **GlassmorphismCard** — Frosted glass container with spring entrance
- **KineticText** — Spring-animated text with glow and shimmer

### Config-Driven Architecture
- `TemplateVideo.tsx` reads a JSON config and renders any video dynamically
- Config defines: scenes (type, timing, colors, B-roll, kinetic text), effects, colors, CTA
- Scene timings are set from Whisper word-level timestamps (not guessed)
- B-roll auto-starts at 45% through archetype scenes, kinetic text at 80%

## Intro/Outro Best Practices

### HeyGen Avatar — Color-Match Technique
- Scott uses HeyGen Creator plan (no transparent export). Set BG to `#0a0e1a` — exact navy match.
- `<OffthreadVideo>` in Remotion plays avatar video; animations layer on top. No alpha channel needed.
- Avatar files live at `remotion-project/public/avatar/`. **Never move or rename these.**

### IntroScene Text Overlays (per-video, 2 fields only)
- `hookText` — 3-6 word ALL CAPS attention hook (e.g. "YOUR EDGE ISN'T WHAT YOU THINK")
- `topicTitle` — full video title (e.g. "3 Types of People You Need in Your Corner")
- `topicSubtitle` — optional subtitle dots (e.g. "Curiosity · Learning · Adaptability")
- These update in `Root.tsx` IntroComposition. Avatar speech is generic — it never changes.

### Render + Concat Pattern
```bash
# Always rsync (not cp -r) to /tmp/ — faster, skips node_modules
rsync -a --exclude='node_modules' --exclude='out' remotion-project/ /tmp/remotion-render/
ln -s "$(pwd)/remotion-project/node_modules" /tmp/remotion-render/node_modules

# Render intro + outro
cd /tmp/remotion-render
npx remotion render remotion/index.ts IntroSceneComp /tmp/intro-rendered.mp4 --concurrency=2
npx remotion render remotion/index.ts OutroSceneComp /tmp/outro-rendered.mp4 --concurrency=2

# Concat
ffmpeg -y -i /tmp/intro-rendered.mp4 -i output/VIDEO.mp4 -i /tmp/outro-rendered.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -c:a aac -crf 18 -preset fast output/VIDEO-final.mp4
```

### No EPERM at /Users/ Path
- EPERM only affects `/mnt/` Cowork workspace mounts. `/Users/scottmagnacca/` is safe for rendering.
- Still use /tmp/ for cleanliness and to keep output/ folder clean during render.

## Project Technical Notes

- Remotion v4 — entry point is positional: `npx remotion render remotion/index.ts [CompId] [output]`
- Audio serving: copy MP3 to `remotion-project/public/audio/`, composition uses `staticFile('audio/' + audioSrc)`
- Multi-scene videos: use Remotion `<Sequence from={X} durationInFrames={Y}>` for each scene
- Particle backgrounds: SVG-based with seeded randomness, glow halos, connection lines, and periodic color pulse
- Kinetic text: spring physics entrance, solid color + textShadow glow, opacity-based shimmer
- B-roll: `<OffthreadVideo>` in BRollPlayer component with styled frame, spring entrance/fade-out
- Card-shift: `shiftProgress` 0→1 over 20 frames when B-roll starts, reverses when it ends; `translateX(-340px)`, `scale(0.85)`
- Use `--concurrency=2` for Remotion render to avoid memory issues in sandbox
- For new videos: use `TemplateVideo.tsx` with a config JSON (preferred) or clone `ThreeTypesVideo.tsx` for custom compositions
- **Orchestrator flags**: `--skip-tts` (reuse audio), `--skip-whisper` (reuse timings), `--preview` (Remotion Studio)
