# Claude Code Prompt — Fix Video Audio/Visual Timing Alignment

Copy everything below this line into Claude Code:

---

## Context

I have a Remotion v4 video project at `~/Documents/Claude/Projects/Cowork-video-editing project/`. The video is called "3 Types of People You Need in Your Corner" — a 3-minute narrated video with 6 scenes. The problem is that **the visual scene transitions are out of sync with the audio narration**. For example, "The Peer" card appears on screen while the narrator is still talking about "The Believer."

Read the project's `.claude/CLAUDE.md` file first — it has critical rules you MUST follow (especially: never use WebkitBackgroundClip in Remotion, never overlay B-roll on dark backgrounds, always use side-by-side layout).

## What Needs to Happen

### Step 1: Regenerate the audio with correct pronunciation

The TTS audio needs to be regenerated. The current script text is in `scripts/3-types-of-people-script.md`. Use Edge TTS with these settings:
- Voice: `en-US-AndrewMultilingualNeural`
- Rate: `+12%`
- Pitch: `-2Hz`

**CRITICAL pronunciation fix:** My last name is "Magnacca" — pronounced "Mag-na-ka". The TTS will mispronounce it. In the TTS input text (and ONLY in the TTS input text, not the script markdown), spell the URL phonetically as "scott mag-nah-kah dot com" so it sounds right.

**CRITICAL text fix:** The Peer section intro must say: "We made a pact. Neither of us would let the other give up. On my worst days, Mark was the one who said, keep building. And when he hit a wall, I did the same for him." — NOT "when he wanted to quit, I kept going" (that's the OLD text that keeps coming back).

Add Python assertions to verify the old text is NOT present before generating:
```python
assert "I kept going" not in TEXT, "OLD TEXT STILL PRESENT"
assert "he kept going" not in TEXT, "OLD TEXT STILL PRESENT"
assert "We made a pact" in TEXT, "New Peer intro missing"
```

Save the audio to `audio/3-types-of-people.mp3` and also copy it to `remotion-project/public/audio/3-types-of-people.mp3`.

### Step 2: Get exact word-level timestamps from the audio

Install and run OpenAI Whisper (or whisper.cpp or faster-whisper) on the generated audio to get word-level timestamps:

```bash
pip install openai-whisper --break-system-packages
# or: pip install faster-whisper --break-system-packages
```

Run transcription with word-level timestamps. Find the EXACT timestamp (in seconds) where these key phrases START:
- "Number one" (start of Believer)
- "Number two" (start of Peer)
- "Number three" (start of Coach)
- "These three types" (start of Bridge)
- "Your circle is your catalyst" (start of CTA)

Print each timestamp in seconds and the equivalent frame number at 30fps.

### Step 3: Update scene timing constants

Open `remotion-project/src/ThreeTypesVideo.tsx`. Update the SCENE timing constants to match the exact timestamps from Whisper:

```typescript
const SCENE_1_START = 0;
const SCENE_1_END = [frame where "Number one" starts];
const SCENE_2_START = SCENE_1_END;
const SCENE_2_END = [frame where "Number two" starts];
const SCENE_3_START = SCENE_2_END;
const SCENE_3_END = [frame where "Number three" starts];
const SCENE_4_START = SCENE_3_END;
const SCENE_4_END = [frame where "These three types" starts];
const SCENE_5_START = SCENE_4_END;
const SCENE_5_END = [frame where "Your circle is your catalyst" starts];
const SCENE_6_START = SCENE_5_END;
const SCENE_6_END = SCENE_6_START + 150 + [remaining audio frames]; // CTA holds 5s past audio end
```

Also update `remotion-project/remotion/Root.tsx` so `durationInFrames` equals `SCENE_6_END`.

### Step 4: Adjust B-roll timing within scenes

Each archetype scene (Believer, Peer, Coach) has a `brollStartFrame` and `brollDuration` prop. These control when the B-roll video pops up within that scene. Adjust them so:
- B-roll starts about 40-50% into each scene (when the narration has established the archetype and moves to the story/example)
- B-roll duration doesn't exceed the source clip length (mechanic.mp4=14s/420frames, university.mp4=12s/360frames, laptop.mp4=11s/330frames)
- B-roll ends at least 30 frames before the scene ends (to allow fade-out)

### Step 5: Adjust kinetic text timing

Each scene has a `kineticDelay` prop. Set it so the kinetic text appears about 80% through the scene (near the end, as a punctuation/emphasis before transitioning). Calculate: `kineticDelay = Math.floor(sceneDuration * 0.8)`.

### Step 6: Render and verify

Copy the remotion-project to a writable directory (NOT the mounted workspace — Remotion can't unlink browser binaries there):
```bash
cp -r ~/Documents/Claude/Projects/Cowork-video-editing\ project/remotion-project /tmp/video-render/
cp ~/Documents/Claude/Projects/Cowork-video-editing\ project/audio/3-types-of-people.mp3 /tmp/video-render/public/audio/
```

Render:
```bash
cd /tmp/video-render
npx remotion render remotion/index.ts ThreeTypesVideo out/3-types-of-people.mp4 --concurrency=2
```

Extract frames at each scene transition to verify alignment:
```bash
ffmpeg -i out/3-types-of-people.mp4 -vf "select='eq(n\,SCENE_1_END)+eq(n\,SCENE_2_END)+eq(n\,SCENE_3_END)+eq(n\,SCENE_4_END)+eq(n\,SCENE_5_END)'" -vsync vfr out/verify_%04d.png
```

Show me the extracted frames so I can confirm the right card appears at each transition.

Copy the final video back:
```bash
cp out/3-types-of-people.mp4 ~/Documents/Claude/Projects/Cowork-video-editing\ project/output/
```

## Files You'll Need to Modify
- `remotion-project/src/ThreeTypesVideo.tsx` — scene timing constants, B-roll timing, kinetic text timing
- `remotion-project/remotion/Root.tsx` — durationInFrames
- `audio/3-types-of-people.mp3` — regenerated audio

## Files to READ First (critical context)
- `.claude/CLAUDE.md` — project rules and critical mistakes to never repeat
- `scripts/3-types-of-people-script.md` — the narration script
- `remotion-project/src/ThreeTypesVideo.tsx` — current composition code
- `remotion-project/src/components/` — ParticleField, KineticText, GlassmorphismCard, BRollPlayer (don't modify these, they work)

## Rules
- **NEVER** use `WebkitBackgroundClip: 'text'` or `WebkitTextFillColor: 'transparent'` — renders as solid color bars in Remotion
- **NEVER** overlay B-roll on dark backgrounds — use the existing side-by-side card-shift layout
- **NEVER** guess scene timings — use Whisper word timestamps
- Use `--concurrency=2` for Remotion render to avoid memory issues
- The composition components (ParticleField, KineticText, GlassmorphismCard, BRollPlayer) are working correctly — don't modify them
