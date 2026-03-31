# Video Pipeline Skill — Automated Video Generation

Use this skill when Scott asks to create a new video, edit a video, or work with the Remotion pipeline. This skill defines the end-to-end workflow for generating cinematic narrated videos from a text description.

---

## Quick Start: Creating a New Video

When Scott describes a new video concept, follow this exact pipeline:

### Step 1: Write the Script
Write a script markdown in the standardized format (`templates/SCRIPT-FORMAT.md`):
- YAML frontmatter with voice settings, colors, phonetic overrides
- Scene blocks with type markers (HOOK, ARCHETYPE, BRIDGE, CTA)
- Narration in `> blockquotes`
- Kinetic text and B-roll directives
- Save to `scripts/<video-name>-script.md`

### Step 2: Generate TTS Audio
Use Edge TTS via the orchestrator or standalone:
```bash
python3 scripts/orchestrate.py scripts/<video-name>-script.md
```
Or manually:
```python
import edge_tts, asyncio
communicate = edge_tts.Communicate(text, "en-US-AndrewMultilingualNeural", rate="+12%", pitch="-2Hz")
asyncio.run(communicate.save("audio/<video-name>.mp3"))
```

### Step 3: Get Timestamps
Run Whisper to find exact frame boundaries at scene marker phrases:
```bash
python3 scripts/whisper_timestamps.py  # or use orchestrator
```

### Step 4: Generate Config & Render
```bash
python3 scripts/orchestrate.py scripts/<video-name>-script.md --render
```

---

## Scene Types Reference

| Type | Purpose | Key Props |
|------|---------|-----------|
| `hook` | Opening — big title, particle field, sets tone | title, titleLine2, subtitle, kineticText |
| `archetype` | Titled card + icon + B-roll + kinetic text | number, title, icon, subtitle, broll, kineticText |
| `bridge` | Multi-card synthesis, ties archetypes together | cards[], kineticSequence[] |
| `cta` | Call-to-action — URL, tagline, glow | ctaUrl, ctaTagline, holdFrames |

## Visual Effects Available

All effects are from the Persuasion & Conversion Toolkit (`.claude/skills/visual-effects/SKILL.md`).

| Effect | Component | Purpose |
|--------|-----------|---------|
| Liquid Reveal | `SceneTransition.tsx` | Organic blob wipe between scenes |
| Crossfade | `SceneTransition.tsx` | Simple opacity fade transition |
| Typewriter | `TypewriterText.tsx` | Character-by-character reveal with cursor |
| Marker Highlight | `MarkerHighlight.tsx` | Animated neon underline on key phrases |
| Noise Overlay | `NoiseOverlay.tsx` | Cinematic film grain texture |
| Dynamic Hue Shift | `NoiseOverlay.tsx` | Subtle background color cycling |
| Particle Field | `ParticleField.tsx` | SVG particle network with glow |
| Glassmorphism Card | `GlassmorphismCard.tsx` | Frosted glass container |
| Kinetic Text | `KineticText.tsx` | Spring-animated text with glow |
| B-Roll Player | `BRollPlayer.tsx` | Side-by-side video with styled frame |

## Config-Driven Composition

`TemplateVideo.tsx` reads a JSON config and renders dynamically. Config structure:
```json
{
  "title": "Video Title",
  "audio": { "file": "name.mp3", "voice": "...", "rate": "+12%", "pitch": "-2Hz" },
  "colors": { "bg": "#0a0e1a", "accent1": "#00d4ff", "accent2": "#f5a623", "accent3": "#ff6b35" },
  "effects": { "particles": true, "noiseOverlay": true, "sceneTransitions": "liquid", "hueShift": true },
  "scenes": [{ "type": "hook", "timing": { "startFrame": 0, "endFrame": 483 }, ... }]
}
```

## Critical Rules (ALWAYS follow)
1. **NO WebkitBackgroundClip** in Remotion — renders as solid color bars
2. **NO overlay B-roll** on dark backgrounds — use side-by-side layout
3. **Always verify TTS text** matches the script before generating
4. **Use Whisper timestamps** for scene boundaries — never guess
5. **Root.tsx durationInFrames** must match total scene frames
6. **B-roll timing**: starts ~45% into scene, ends 30+ frames before scene end
7. **Kinetic text timing**: appears ~80% through the scene

## Scott's Preferences
- **Style**: Cinematic dark — navy bg, cyan/gold/orange accents, glassmorphism, particles
- **Voice**: Edge TTS `en-US-AndrewMultilingualNeural`, +12% rate, -2Hz pitch
- **"Magnacca"**: Phonetically spell as "mag-nah-kah" in TTS text only
- **Video types**: Educational/training, Marketing/sales, Short-form social (60-90s)
