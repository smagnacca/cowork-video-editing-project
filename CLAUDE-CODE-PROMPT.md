# Claude Code Pickup Prompt — Video Edit Pass 2
**Date:** 2026-04-07 | **GitHub:** smagnacca/cowork-video-editing-project

---

## ✅ ALREADY COMPLETED (do NOT redo)

The 3-types-of-people audio has been fully re-synced in a prior Claude Code session:
- `audio/3-types-of-people.mp3` regenerated (Edge TTS, AndrewMultilingualNeural, +12% rate, -2Hz pitch)
- Whisper timestamps verified, all scene constants updated in `ThreeTypesVideo.tsx`
- **`output/3-types-of-people-synced.mp4` rendered and verified (199s, 5970 frames)** — use this as the 3-types content source for the splice. Do NOT re-render ThreeTypesVideo unless the visual fixes below require it.

---

## CONTEXT

8 content fixes remain across both videos. These are **Remotion source edits → re-render → re-splice**. The storyselling video needs a full re-render. The 3-types video may be able to use the existing `3-types-of-people-synced.mp4` if the visual fixes (Fix 1) can be applied as ffmpeg drawtext/overlay without a Remotion re-render — but if any fix requires Remotion source changes, re-render `ThreeTypesVideo` from the updated source.

**Files to produce:**
- `output/3-types-of-people-4.7.26-v2-final.mp4` (replaces `3-types-of-people-4.7.26-final.mp4`)
- `output/storyselling-ai-4.7.26-v2-final.mp4` (replaces `storyselling-ai-4.7.26-final.mp4`)

**Source compositions:**
- `remotion-project/src/ThreeTypesVideo.tsx` → id `ThreeTypesVideo` (5971 frames @ 30fps)
- `remotion-project/src/StorysellingVideo.tsx` → id `StorysellingVideo` (4450 frames @ 30fps)
- `remotion-project/remotion/Root.tsx` → composition registry + `GenericOutroComposition`
- Reusable intro: `assets/New Intro-2026-04-07.mp4` (23.06s)
- Reusable outro: `assets/New Outro-2026-04-07.mp4` (21.48s)
- **3-types content source (already rendered):** `output/3-types-of-people-synced.mp4` (199s)

**Render pattern (always use this — workspace mount has EPERM):**
```bash
rsync -a --exclude='node_modules' --exclude='out' remotion-project/ /tmp/remotion-render/
ln -sf "$(pwd)/remotion-project/node_modules" /tmp/remotion-render/node_modules
cd /tmp/remotion-render
npx remotion render remotion/index.ts [CompId] /tmp/[output].mp4 --concurrency=2
```

**Splice pattern (always use filter_complex, NOT concat demuxer — demuxer causes timestamp drift):**
```bash
ffmpeg -y -i "$INTRO" -i /tmp/content-trim.mp4 -i "$OUTRO" \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k \
  -movflags +faststart output/[video]-4.7.26-v2-final.mp4
```

**Content trim points:**
- 3-types: `ss=0 to=182.5` (no baked-in intro; cut before old scottmagnacca.com CTA at 183s)
- storyselling: `ss=23.5 to=150.0` (skip baked-in HeyGen intro 0–23.5s; cut before old CTA at 152s)

---

## CRITICAL RULES (never break these)

1. **NO WebkitBackgroundClip/text** — renders as solid color bars in headless Chrome. Use `color` + `textShadow` only.
2. **NO objectFit/objectPosition on OffthreadVideo** — use explicit px dimensions instead.
3. **SVG fontSize must scale to viewBox** — `screen_px = (fontSize/viewBoxWidth) × renderedWidth`. Minimum 20px screen.
4. **node --check before every render** — catch syntax errors early.
5. **TTS banned words** — never write: charts, flawless, sharp, jargon, buzzwords (Edge TTS garbles all).
6. **No full file reads** — use Grep + offset/limit Read.

---

## VIDEO 1 — 3 Types of People (`ThreeTypesVideo.tsx`)

### Scene timing reference (frames @ 30fps):
```
SCENE_1_START = 0        (0s)    SceneHook
SCENE_2_START = 487      (16.2s) Believer archetype
SCENE_3_START = 1823     (60.8s) Peer archetype
SCENE_4_START = 3306     (110.2s) Coach archetype
SCENE_5_START = 4498     (149.9s) Bridge/summary scene
SCENE_6_START = 5483     (182.8s) SceneCTA (scottmagnacca.com) — TRIMMED OUT in splice
```

---

### FIX 1 — Black screen t=23–29s in final (dead air after new intro joins composition)

**What's happening:** New intro ends at t=23s in the final video. ThreeTypesVideo composition frame 0 begins immediately. But SceneHook has a very slow fade-in — inspected frames show near-black screen from t=23 to t=29 before any content becomes visible. Audio narration begins at t=23 saying *"In a world that's changing faster than ever..."*

**Required fix — Add 3 timed text overlays to SceneHook:**

Inside `SceneHook`, add three `<AbsoluteFill>` overlay divs above the existing content:

**Overlay A — frames 0–90 (t=0–3s):** Background image/animation. Increase `ParticleField` intensity from existing value to `intensity={1.5}`, add `AnimatedBackground` with higher brightness so the screen is visually alive during the fade. If a B-roll clip of a rocket launch or Earth from space is available in `public/broll/`, use `<OffthreadVideo>` here at 40% opacity. Otherwise the brightened particle field alone satisfies this.

**Overlay B — frames 15–150 (t=0.5–5s):**
```tsx
{frame >= 15 && frame <= 150 && (
  <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
    <p style={{
      fontSize: 48, fontWeight: 600, color: '#ffffff',
      fontFamily: '-apple-system, sans-serif',
      textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase',
      opacity: interpolate(frame, [15, 45, 120, 150], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      textShadow: '0 0 40px rgba(255,255,255,0.25)',
      padding: '0 120px',
    }}>
      In a world that's changing faster than ever
    </p>
  </AbsoluteFill>
)}
```

**Overlay C — frames 120–240 (t=4–8s):**
Two sequential reveals. First phrase fades in then out, second fades in gold:
```tsx
{frame >= 120 && frame <= 270 && (
  <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, zIndex: 10 }}>
    {/* "The most dangerous thing you can do" */}
    <p style={{
      fontSize: 60, fontWeight: 800, color: COLORS.cyan,
      fontFamily: '-apple-system, sans-serif', textAlign: 'center',
      opacity: interpolate(frame, [120, 150, 195, 220], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      textShadow: `0 0 30px ${COLORS.cyan}80`,
      letterSpacing: -1, padding: '0 100px',
    }}>
      The most dangerous thing you can do
    </p>
    {/* "is stay the same" — gold, enters at frame 195 */}
    <p style={{
      fontSize: 76, fontWeight: 900, color: '#f5a623',
      fontFamily: '-apple-system, sans-serif', textAlign: 'center',
      opacity: interpolate(frame, [195, 225], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      transform: `scale(${interpolate(spring({ frame: Math.max(0, frame - 195), fps, config: { damping: 14, stiffness: 100 } }), [0, 1], [0.85, 1])})`,
      textShadow: '0 0 20px #f5a62380, 0 0 60px #f5a62340',
      letterSpacing: -1,
    }}>
      is stay the same.
    </p>
  </AbsoluteFill>
)}
```

**Check:** Verify the existing SceneHook content (title card, hook text) starts appearing no earlier than frame 240 to avoid overlap. If it starts earlier, add `Math.max(0, frame - 240)` delay to its entrance springs.

---

### FIX 2 — Remove "THREE IDEAS. ONE EDGE." from outro (t=3:26 in final)

**Location:** `remotion-project/remotion/Root.tsx` — `GenericOutroComposition`

**Fix:** Change `kineticText: 'THREE IDEAS. ONE EDGE.'` → `kineticText: ''`

This kinetic text was left over from the Invisible Sign video config. Both 3-types and storyselling use this same GenericOutroComposition, so this single change fixes both videos.

Re-render `GenericOutroSceneComp` and use the output for both splices.

---

### FIX 3 — CTA card off-screen + too large (t=3:35 = frame ~215s in final)

**Location:** `remotion-project/src/components/OutroScene.tsx` — the CTA assessment widget

**What's visible:** A "12-Month AI Disruption Risk Assessment: Will Your Job Be Next?" quiz card is shifted left (text clips off-screen) and oversized.

**Fix:** Find the card container element. Apply:
```tsx
// On the outer card container:
style={{
  width: 640,               // reduce from whatever it currently is (likely 800+)
  marginLeft: 'auto',
  marginRight: 'auto',
  // Remove any left: X positioning that pushes it off-center
  // Keep existing border, background, borderRadius styles
}}
```
If using `position: absolute`, replace with `position: 'relative'` inside a centered flex container, OR use:
```tsx
style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%) scale(0.8)', ... }}
```

---

## VIDEO 2 — Storyselling (`StorysellingVideo.tsx`)

### Scene timing (frames @ 30fps from composition start):
```
HOOK_START: 0 → HOOK_END: 890    (0–29.7s)
STORY_START: 890 → STORY_END: 2340  (29.7–78.0s)
APP_START: 2340 → APP_END: 3770  (78.0–125.7s)
CTA_START: 3770 → CTA_END: 4450  (125.7–148.3s) — TRIMMED OUT in splice
```

**Final video timing conversion:** Final video = composition + 23.5s offset (new intro splice)
- `final_t = composition_t + 23.5`
- `composition_frame = (final_t - 23.5) * 30`

---

### FIX 4 — "second" and "month" color: green → gold

**Location:** `StorysellingVideo.tsx` ~line 253

**Current:**
```tsx
<span style={{ color: BRAND.green }}>second</span> ... <span style={{ color: BRAND.green }}>month.</span>
```
`BRAND.green = '#005A3B'` — dark forest green, near-invisible on black background.

**Fix:**
```tsx
<span style={{ color: '#f5a623', textShadow: '0 0 20px #f5a62360' }}>second</span>
... 
<span style={{ color: '#f5a623', textShadow: '0 0 20px #f5a62360' }}>month.</span>
```

---

### FIX 5 — "Your career is on borrowed time" → gold + single pulse

**Location:** `StorysellingVideo.tsx` ~line 306 — the `<p>` below the headline in the "uncomfortable truth" segment.

**Current style:** `color: BRAND.textSecondary` (#b0b0b0 grey), static.

**Fix:**
```tsx
<p style={{
  fontSize: 38, fontWeight: 700,
  color: '#f5a623',
  textShadow: '0 0 20px #f5a62380, 0 0 50px #f5a62340',
  textAlign: 'center',
  fontFamily: '-apple-system, sans-serif',
  marginTop: 28,
  opacity: spring({ frame: Math.max(0, frame - 430), fps, config: { damping: 16, stiffness: 70 } }),
  // Single pulse: scale 1→1.06→1 over 40 frames starting when text appears
  transform: `scale(${1 + (
    frame > 430 && frame < 470
      ? Math.sin(((frame - 430) / 40) * Math.PI) * 0.06
      : 0
  )})`,
}}>
  Your career is on borrowed time.
</p>
```

---

### FIX 6 — Side-by-side left panel replacement at t=44–50 (composition frames ~615–810)

**Context:** The Hook scene has a side-by-side layout segment where the left panel is showing "If your only value is a spreadsheet... Your career is on borrowed time." — this is a REPEAT of content already shown. The narrator says:
- "It already has." (audible at approximately composition frame ~615–660)
- "The real question is..." (approximately frame ~660–750)

**Location:** `StorysellingVideo.tsx` — inside `HookScene`, find the side-by-side segment (look for `showSideBySide` flag or `seg(X, Y)` opacity control for that section).

**Fix — Replace left panel content with two timed text reveals:**

```tsx
{/* LEFT PANEL — Replace existing content with "It already has" + typewriter reveal */}
<div style={{ width: '50%', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', padding: '0 60px' }}>

  {/* "It already has." — fades in at frame ~615 */}
  {frame >= 610 && frame <= 720 && (
    <p style={{
      fontSize: 88, fontWeight: 900, color: '#f5a623',
      textShadow: '0 0 30px #f5a62380, 0 0 80px #f5a62340',
      textAlign: 'center', lineHeight: 1.1,
      opacity: interpolate(frame, [610, 645, 700, 720], [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      transform: `scale(${interpolate(spring({ frame: Math.max(0, frame - 610), fps,
        config: { damping: 14, stiffness: 90 } }), [0, 1], [0.8, 1])})`,
    }}>
      It already has.
    </p>
  )}

  {/* "The real question is..." — typewriter at frame ~720 */}
  {frame >= 720 && (
    <TypewriterText
      text="The real question is..."
      color="#f5a623"
      fontSize={52}
      startFrame={720}
    />
  )}
</div>
```

**Note:** `TypewriterText` component already exists at `remotion-project/src/components/TypewriterText.tsx`. Check its prop interface — adjust `startFrame` prop name if it differs (may be `delay` or `startAt`).

**Important:** Verify exact frames for "It already has" and "The real question is" by checking `scripts/storyselling-whisper.json` word timestamps and converting: `frame = word_timestamp_seconds * 30`.

---

### FIX 7 — Audio garble: "No jargon" → regenerate TTS

**Problem:** `storyselling-ai.mp3` (currently used in render) contains garbled audio around t=57–58s in the audio file. Whisper transcription shows "chits" and "hargonne" where "No fluff" and Edge TTS is garbling something.

**Investigation steps:**
1. Check `scripts/generate_storyselling_tts.py` — find the TEXT variable. It should contain `"No fluff"` not `"No jargon"`.
2. Check `storyselling-ai-fixed.mp3` — this may already be the corrected version (it exists in `audio/`). Its duration is 147.192s vs 147.552s for the original.
3. **If `storyselling-ai-fixed.mp3` is clean:** Update `StorysellingVideo.tsx` line 1351: `audioSrc = 'storyselling-ai-fixed.mp3'`. Also update line 1385 (CTA-only composition). Then **re-verify all SCENE timing constants** still match silence gaps in the fixed audio: `ffmpeg -i audio/storyselling-ai-fixed.mp3 -af "silencedetect=noise=-30dB:d=0.4" -f null - 2>&1 | grep silence`
4. **If neither is clean:** Regenerate: `python3 scripts/generate_storyselling_tts.py`. Verify output with Whisper before using. Update scene constants if timing shifted.

---

### FIX 8 — Add 1-second crossfade transition at t=2:28 in final (~frame 3135 in composition)

**Location:** `StorysellingVideo.tsx` — within Scene 3 (APP scene), around frame 3135 (= 2340 + 795 frames into scene 3).

**Fix:** Find the sub-scene boundary at frame ~3135. Apply crossfade:
```tsx
const TRANSITION_START = 3120;
const TRANSITION_END = 3150;

// On outgoing element: add opacity fade-out
opacity: interpolate(frame, [TRANSITION_START, TRANSITION_END], [1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

// On incoming element: add opacity fade-in
opacity: interpolate(frame, [TRANSITION_START, TRANSITION_END], [0, 1],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
```

---

## RENDER & SPLICE WORKFLOW

### Step 1: Edit source files
Apply all 8 fixes above. Run `node --check remotion-project/src/ThreeTypesVideo.tsx` and `node --check remotion-project/src/StorysellingVideo.tsx` before rendering.

### Step 2: Render content + new outro
```bash
PROJECT_DIR="/path/to/Cowork-video-editing project"
cd "$PROJECT_DIR"
rsync -a --exclude='node_modules' --exclude='out' remotion-project/ /tmp/remotion-render/
ln -sf "$PROJECT_DIR/remotion-project/node_modules" /tmp/remotion-render/node_modules
cd /tmp/remotion-render

# 3-types: only re-render if Fix 1 (black screen overlays) required Remotion source changes.
# If Fix 1 was applied in Remotion source → render fresh:
npx remotion render remotion/index.ts ThreeTypesVideo /tmp/3types-v2.mp4 --concurrency=2
# If Fix 1 was NOT needed (or done via ffmpeg) → reuse the already-verified synced render:
# cp "$PROJECT_DIR/output/3-types-of-people-synced.mp4" /tmp/3types-v2.mp4
npx remotion render remotion/index.ts StorysellingVideo /tmp/story-v2.mp4 --concurrency=2
npx remotion render remotion/index.ts GenericOutroSceneComp /tmp/outro-v2.mp4 --concurrency=2
```

### Step 3: Trim content segments
```bash
ffmpeg -y -i /tmp/3types-v2.mp4 -ss 0 -to 182.5 -c copy /tmp/3types-v2-trim.mp4
ffmpeg -y -i /tmp/story-v2.mp4 -ss 23.5 -to 150.0 -c copy /tmp/story-v2-trim.mp4
```

### Step 4: Splice finals (filter_complex only — NOT concat demuxer)
```bash
INTRO="$PROJECT_DIR/assets/New Intro-2026-04-07.mp4"

ffmpeg -y -i "$INTRO" -i /tmp/3types-v2-trim.mp4 -i /tmp/outro-v2.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k \
  -movflags +faststart "$PROJECT_DIR/output/3-types-of-people-4.7.26-v2-final.mp4"

ffmpeg -y -i "$INTRO" -i /tmp/story-v2-trim.mp4 -i /tmp/outro-v2.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k \
  -movflags +faststart "$PROJECT_DIR/output/storyselling-ai-4.7.26-v2-final.mp4"
```

### Step 5: Verify frames at each fix point
```bash
for t in 25 206 215; do ffmpeg -ss $t -i output/3-types-of-people-4.7.26-v2-final.mp4 -vframes 1 /tmp/v1_verify_t${t}.jpg -y 2>/dev/null; done
for t in 31 41 46 79 148; do ffmpeg -ss $t -i output/storyselling-ai-4.7.26-v2-final.mp4 -vframes 1 /tmp/v2_verify_t${t}.jpg -y 2>/dev/null; done
# View each frame and confirm visually before delivering
```

---

## POST-RENDER CHECKLIST

- [ ] t=23–29 in 3-types: animated content + text visible, NOT black
- [ ] t=3:26 in 3-types outro: NO kinetic text on screen
- [ ] t=3:35 in 3-types outro: CTA card centered and fits on screen
- [ ] t=31 in storyselling: "second" and "month" are gold (#f5a623)
- [ ] t=41 in storyselling: "Your career is on borrowed time" is gold and pulses once
- [ ] t=44–50 in storyselling: "It already has." → typewriter "The real question is..."
- [ ] t=1:18 in storyselling: clean audio, no garbled words
- [ ] t=2:28 in storyselling: smooth 1-second crossfade, not hard cut
- [ ] Both output durations ≈ same as v1 (3-types ~227s, storyselling ~171s)
- [ ] No text clipped at any frame
- [ ] CHANGELOG.md updated

---

## CLEANUP — Files to delete after Scott approves v2 finals

```
output/3-types-of-people-4.7.26-final.mp4
output/storyselling-ai-4.7.26-final.mp4
output/invisible-sign-v1-final.mp4
output/invisible-sign-v2-final.mp4
output/invisible-sign-v3-final.mp4
output/invisible-sign-v5-final.mp4
output/invisible-sign-v6-final.mp4
output/storyselling-ai-final.mp4
output/storyselling-ai-v3-final.mp4
output/storyselling-ai-v7-final.mp4
output/storyselling-ai-v7-final 2.mp4
output/3-types-of-people.mp4
```
**Keep:** `output/invisible-sign-v7-final.mp4`

---

## GITHUB PUSH

```bash
GITHUB_TOKEN=$(cat /sessions/*/mnt/.claude/tokens/.github_token 2>/dev/null | head -1)
git clone "https://${GITHUB_TOKEN}@github.com/smagnacca/cowork-video-editing-project.git" /tmp/video-push
rsync -a --exclude='node_modules' --exclude='output' --exclude='.git' \
  "$PROJECT_DIR/" /tmp/video-push/
cd /tmp/video-push
git add -A
git commit -m "Video edit pass 2 (4.7.26-v2): black screen fix, gold text, audio fix, outro cleanup, transition"
git push origin main
```

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
