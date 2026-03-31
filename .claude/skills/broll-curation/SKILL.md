# B-Roll Auto-Curation Skill

## Purpose
Automatically find, download, trim, and place B-roll video clips to support video scenes. When Scott asks for B-roll or when creating a new video, proactively source appropriate clips from YouTube/free stock footage sites.

## When to Activate
- Scott explicitly asks to "find B-roll" or "use B-roll video"
- Creating a new video via the pipeline — auto-curate B-roll for each scene
- Scott provides a script with `**[B-roll: description]**` markers

## Workflow

### 1. Identify B-Roll Needs
For each scene in the video script:
- Read the narration text and identify visual moments that benefit from supporting footage
- Look for action verbs, concrete nouns, and emotional beats (e.g., "bet on you early", "sends a text message", "shows up in the front row")
- Aim for 1-3 B-roll clips per archetype/content scene, 0 for hook/CTA scenes
- Each clip should be 4-6 seconds (120-180 frames at 30fps)

### 2. Search for Clips
**Primary source: YouTube** (use yt-dlp search)
```bash
yt-dlp --flat-playlist -j "ytsearch5:<search terms> stock footage free" 2>&1 | python3 -c "
import sys, json
for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('['): continue
    try:
        d = json.loads(line)
        print(f\"{d.get('id','?')} | {d.get('title','?')} | {d.get('duration',0)}s | https://youtube.com/watch?v={d.get('id','')}\")
    except: pass
"
```

**Search strategy:**
- Use descriptive terms + "stock footage free" or "B-roll free"
- Prefer clips that are: short (under 30s), clean (no captions/watermarks), close-up or mid-shot
- Avoid clips with: text overlays, logos, talking heads, copyrighted music
- If YouTube search fails, try Pexels (may need manual download due to Cloudflare)

### 3. Download and Process
```bash
# Download video-only (no audio)
yt-dlp -f "bestvideo[ext=mp4][height<=1080]" -o "remotion-project/public/broll/<name>-raw.mp4" "<URL>"

# If video-only format unavailable, download best and strip audio
yt-dlp -f "best[ext=mp4][height<=1080]" -o "remotion-project/public/broll/<name>-raw.mp4" "<URL>"

# Trim to target duration, strip audio, re-encode for Remotion compatibility
ffmpeg -y -i "remotion-project/public/broll/<name>-raw.mp4" -ss <start> -t 6 -an -c:v libx264 -pix_fmt yuv420p "remotion-project/public/broll/<name>.mp4"

# Clean up raw file
rm "remotion-project/public/broll/<name>-raw.mp4"

# Verify duration
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "remotion-project/public/broll/<name>.mp4"
```

### 4. Place in Video
- Use Whisper word-level timestamps to find the exact narration cue point
- Calculate local frame within the scene: `(cue_seconds - scene_start_seconds) * fps`
- Add to the scene's `brollClips` array:
  ```typescript
  { src: '<name>.mp4', startFrame: <local_frame>, duration: <frames> }
  ```
- Duration: typically 120 frames (4s) to 180 frames (6s)

### 5. Organize and Tag
Store B-roll in `remotion-project/public/broll/` with descriptive filenames:
- Use kebab-case: `bet-on-you.mp4`, `texting.mp4`, `front-row.mp4`
- Keep a catalog in `remotion-project/public/broll/CATALOG.md` for reuse across videos

## Clip Selection Criteria
| Priority | Criteria |
|----------|----------|
| 1 | Visually relevant to narration context |
| 2 | Clean — no captions, watermarks, or text overlays |
| 3 | Good lighting and composition |
| 4 | Short source (under 30s preferred — easier to find clean segments) |
| 5 | Free/royalty-free (stock footage channels, Creative Commons) |

## B-Roll Layout Rules (from Remotion rendering rules)
- **ALWAYS** use side-by-side layout: card shifts left, B-roll plays in framed player on right
- **NEVER** overlay B-roll on dark backgrounds with blend modes or opacity
- B-roll uses `<OffthreadVideo>` in BRollPlayer component with spring entrance/fade-out
- Card shift: `translateX(-340px)`, `scale(0.85)` over 20 frames when B-roll starts

## Reuse Across Videos
Before downloading new clips, check if existing clips in `remotion-project/public/broll/` can be reused. Maintain the catalog for cross-video asset sharing.
