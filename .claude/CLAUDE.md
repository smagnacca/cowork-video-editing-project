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

**Completed videos:**
- "3 Types of People You Need in Your Corner" (3:18, 5953 frames, 30fps, 1920x1080)

**Key file locations:**
- Workspace (Cowork): this folder
- **Template system**: `templates/SCRIPT-FORMAT.md` (format docs), `templates/video.config.example.json` (config schema)
- **Orchestrator**: `scripts/orchestrate.py` — runs the full pipeline from a script markdown
- Config-driven composition: `remotion-project/src/TemplateVideo.tsx` (new — reads JSON config)
- Original composition: `remotion-project/src/ThreeTypesVideo.tsx` (hardcoded for reference)
- Reusable components: `remotion-project/src/components/` (ParticleField, KineticText, GlassmorphismCard, BRollPlayer, MeshGradient, SceneTransition, TypewriterText, MarkerHighlight, NoiseOverlay)
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

**To create a new video, just describe it.** The pipeline handles everything:
1. Write a script in the standardized format (see `templates/SCRIPT-FORMAT.md`)
2. Run the orchestrator: `python3 scripts/orchestrate.py scripts/my-video.md --render`
3. Or just tell Claude what video you want — it will write the script, generate audio, set timings, and render.

**What would you like to work on today?**
- Create a new video (concept → script → voiceover → animated MP4)
- Upgrade the composition templates (new scene types, visual styles)
- Extend the pipeline (captions, music bed, batch rendering, logo overlay)
- Something else

---

## CRITICAL RULES — Mistakes to NEVER Repeat

### 1. NO WebkitBackgroundClip in Remotion
**NEVER** use `WebkitBackgroundClip: 'text'`, `WebkitTextFillColor: 'transparent'`, or CSS gradient-clip text effects. They render as SOLID COLOR BARS in Remotion's headless Chrome. Use solid `color` + `textShadow` glow instead.

### 2. NO Overlay B-Roll on Dark Backgrounds
**NEVER** use blend modes (screen, multiply), opacity overlays, or ffmpeg compositing for B-roll on dark backgrounds — it's invisible. Use the SIDE-BY-SIDE layout: card shifts left, B-roll plays in a framed player on the right.

### 3. ALWAYS Verify Script Before TTS
Before generating audio, READ the exact text being sent to TTS and verify corrections are applied. The script markdown and TTS input can diverge — always confirm.

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
