# Changelog

## 2026-03-31 (v5.1) — CTA Closing Fix
- Replaced spoken name/URL in CTA with: "Visit me at my personal website below to learn how you can master and apply these skills today"
- URL still displayed visually (`scottmagnacca.com`) — only the spoken narration changed
- Regenerated TTS, re-ran Whisper, updated all scene timings and cue points
- Video duration: 3:19, 5971 frames, 30fps, 1920x1080, 41.5 MB

---

## 2026-03-31 (v5) — Comprehensive B-Roll, Visual Polish & Narration Updates

### Narration Changes
- Rewrote Bridge section: "These three types of people all share three common attributes. They are attributes that virtually all successful people have." (removed mis-spoken "separates" line)
- Fixed name pronunciation: `scott mag-na-ka dot com` for correct "Mag-na-ka" delivery
- Regenerated TTS audio and re-ran Whisper for all new word-level timestamps
- Updated all scene timing constants to match new audio

### Comprehensive B-Roll Coverage (9 clips across 4 scenes)
- **Believer scene (3 clips):** horse racing ("bet on you early"), empty room ("front row"), texting close-up ("how's the project going")
- **Peer scene (3 clips):** teamwork hands ("keep building"), conference room ("masterminds"), coding ("building real AI skills")
- **Coach scene (2 clips):** laptop ("give you a mirror"), reading book ("lifelong learners")
- **Bridge scene (1 clip):** walking toward window ("walk through it")
- B-Roll Auto-Curation Skill created (`.claude/skills/broll-curation/SKILL.md`)
- B-Roll Catalog with tags for reuse (`remotion-project/public/broll/CATALOG.md`)

### Bridge Scene — Gold Markers & Checkmarks
- Gold animated border circles each card when its attribute is spoken
- Green checkmarks spring in sequentially above each card: Curiosity → Lifelong Learning → Adaptability
- Timed to Whisper word-level timestamps (158.10s, 159.20s, 160.34s)

### Visual Polish Pass
- **Pull quotes** — Key narration phrases appear as styled italic quotes with colored accent borders (6 quotes across Believer, Peer, Coach scenes)
- **Pulsing gold/white frame** around hook title text
- **Kinetic text moved to top** of screen for better visual hierarchy
- **CTA bouncing arrow** animation pointing to scottmagnacca.com
- **NoiseOverlay** — Cinematic film grain across entire video for premium feel
- **KineticTextSequence** timing aligned to Whisper cue points in Bridge scene

### Infrastructure
- GitHub repo created: `smagnacca/smagnacca-video-editing-project` (private)
- Whisper timestamps saved to `scripts/whisper_timestamps.json` for reuse
- Video duration: 3:18, 5940 frames, 30fps, 1920x1080, 41 MB

---

## 2026-03-30 (v4) — Reusable Video Template System + Audio Sync Fix

### Audio/Timing Sync Fix
- Regenerated TTS audio with Edge TTS (fixed "Magnacca" pronunciation, fixed Peer section text)
- Ran faster-whisper for word-level timestamps at scene boundaries
- Updated all scene timing constants in `ThreeTypesVideo.tsx` to match Whisper data
- Scene timings now driven by actual audio word timestamps, not estimates
- B-roll starts at ~45% into each archetype scene, kinetic text at ~80%
- Rendered and verified: all 6 scene transitions now align with narration
- Video duration: 3:18, 5953 frames, 30fps, 1920x1080

### Reusable Template System (NEW)
- **Standardized Script Format** (`templates/SCRIPT-FORMAT.md`)
  - YAML frontmatter for voice, colors, phonetic overrides
  - Machine-readable scene markers (type, title, color, icon, B-roll, kinetic text)
  - Narration in blockquotes, visual directions in brackets
- **Config-Driven Composition** (`remotion-project/src/TemplateVideo.tsx`)
  - Reads a JSON config and renders any video dynamically
  - Supports scene types: HOOK, ARCHETYPE, BRIDGE, CTA
  - Auto-calculates B-roll timing and kinetic text delays
  - Pluggable visual effects (particles, noise, hue shift, transitions)
- **Video Config Schema** (`templates/video.config.example.json`)
  - Complete example config showing all available options
- **Orchestrator Pipeline** (`scripts/orchestrate.py`)
  - Single command: `python3 scripts/orchestrate.py scripts/my-video.md --render`
  - Chains: parse script → generate TTS → run Whisper → build config → render
  - Flags: `--skip-tts`, `--skip-whisper`, `--preview`, `--name`

### New Visual Effects (from Persuasion & Conversion Toolkit)
- **LiquidReveal** (`SceneTransition.tsx`) — organic blob wipe transition
- **CrossfadeTransition** (`SceneTransition.tsx`) — simple opacity fade
- **TypewriterText** (`TypewriterText.tsx`) — character-by-character with cursor
- **MarkerHighlight** (`MarkerHighlight.tsx`) — animated neon underline
- **NoiseOverlay** (`NoiseOverlay.tsx`) — cinematic film grain
- **DynamicHueShift** (`NoiseOverlay.tsx`) — subtle background color cycling

### Skills & Documentation
- Created video-pipeline skill (`.claude/skills/video-pipeline/SKILL.md`)
- Updated `CLAUDE.md` with template system, component inventory, orchestrator usage
- Updated `Root.tsx` to register `TemplateVideo` composition

---

## 2026-03-30 (v3) — Session Close: Claude Code Prompt + Best Practices

### Workflow Decision
- Scene timing alignment requires Whisper speech-to-text for millisecond-accurate word timestamps — beyond what Cowork's sandbox can reliably do
- Created `CLAUDE-CODE-PROMPT.md` with full step-by-step instructions for Claude Code to fix timing
- Prompt covers: audio regen (with "Mag-na-ka" pronunciation fix), Whisper timing extraction, scene constant updates, B-roll/kinetic text adjustment, render, frame verification

### Best Practices Saved
- **Cowork vs Claude Code routing:** Design/planning/docs in Cowork, coding/rendering/debugging in Claude Code
- **Session compression:** All learnings saved to auto-memory (15 entries) and CLAUDE.md (10 critical rules)
- **Visual Effects Skill:** `.claude/skills/visual-effects/SKILL.md` — 25+ categorized effects with persuasive purpose

### Known Issue
- Scene transitions still misaligned with audio narration — Claude Code prompt ready to fix this via Whisper word timestamps

---

## 2026-03-30 (v2) — Audio Fix, Timing Realignment, Visual Effects Skill

### Audio Fix
- Rewrote Peer intro to completely fresh language: "We made a pact. Neither of us would let the other give up. On my worst days, Mark was the one who said, keep building."
- Added assertion checks in TTS generation script to verify old text is absent and new text is present

### Timing Realignment
- All 6 scene transitions recalculated using silence detection + word-count proportions
- Hook: 0-14s, Believer: 14-65.5s, Peer: 65.5-99s, Coach: 99-122s, Bridge: 122-166s, CTA: 166-199s
- B-roll start/duration adjusted for new scene lengths
- Root.tsx durationInFrames updated to 5970

### New Skill
- Created `.claude/skills/visual-effects/SKILL.md` — The Persuasion & Conversion Toolkit (2026)
- 25+ categorized effects with persuasive purpose and implementation prompts
- Includes Scott's preferred palette and Remotion-safe implementation notes

### New Best Practices Documented
- Rule #8: Use silence detection for scene transitions
- Rule #9: TTS text is a separate copy — always rewrite fresh with assertions
- Rule #10: Visual Effects Skill reference

---

## 2026-03-30 (v1) — "3 Types of People" Video Complete

### Video Delivered
- Final render: `output/3-types-of-people.mp4` (36.8MB, 5780 frames, 3:12 @ 30fps, 1920x1080)
- Audio: Edge TTS `AndrewMultilingualNeural` at +12% rate (191s)

### Components Built
- `ParticleField.tsx` — SVG animated particles with connection lines, glow halos, twinkle, color pulse
- `KineticText.tsx` — Spring-animated text overlays with textShadow glow and opacity shimmer
- `KineticTextSequence` — Staggered multi-word entrance animation
- `GlassmorphismCard.tsx` — Frosted glass card with accent border glow
- `BRollPlayer.tsx` — Framed B-roll video player with spring entrance/fade-out
- `AnimatedBackground` — Moving radial gradients for ambient background motion
- `SceneNumber`, `SceneIcon` — Scene indicator badges

### Scene Structure
1. **Hook** (0:00–0:12) — Title + "CURIOSITY IS YOUR EDGE" kinetic text
2. **The Believer** (0:12–0:55) — Cyan accent, mechanic B-roll, "SHARE YOUR GOALS"
3. **The Peer** (0:55–1:38) — Gold accent, university B-roll, "PROXIMITY IS THE PROGRAM"
4. **The Coach** (1:38–2:22) — Orange accent, laptop B-roll, "FILTER FOR TRUTH"
5. **Bridge** (2:22–2:50) — Three cards (Curiosity/Learning/Adaptability) + word sequence
6. **CTA** (2:50–3:12) — scottmagnacca.com with pulsing glow, holds 5+ seconds

### Bugs Fixed
- **Kinetic text invisible (color bars)**: Removed `WebkitBackgroundClip: 'text'` and `WebkitTextFillColor: 'transparent'` — headless Chrome renders these as solid color bars. Replaced with solid `color` + `textShadow` glow.
- **CTA URL invisible (cyan bar)**: Same WebkitBackgroundClip bug on scottmagnacca.com. Fixed with solid cyan color + glow.
- **B-roll invisible on dark background**: Overlay/blend approaches failed on #0a0e1a background. Implemented side-by-side layout with card-shift animation instead.
- **Script text not corrected in audio**: "when he wanted to quit, I kept going" not updated to "he urged me to keep going". Root cause: TTS text was separate from script markdown. Fixed by regenerating audio from verified script text.
- **Particles too static**: Rewrote with per-particle phase offsets, larger movement amplitudes, twinkle opacity variation, glow halos, and periodic color pulse.
- **Audio too long (3:41)**: Rate was -5%. Fixed with +12% rate → 3:09.
- **Root.tsx duration mismatch**: durationInFrames was 5700 but scenes extended to 5780. Updated to match.
- **ElevenLabs 402 error**: Free tier blocked API. Switched to Edge TTS.
- **Remotion browser EPERM**: Can't unlink in mounted workspace. Render in writable /sessions/ directory.

### Documentation
- Updated `.claude/CLAUDE.md` with critical rules, best practices, and mistake prevention
- Created `VIDEO-TEMPLATE.md` — reusable architecture reference for future videos
- Created `CHANGELOG.md` (this file)
- Added auto-memory entries: Remotion CSS restrictions, B-roll layout, Edge TTS fallback, script verification
