# Advanced Animation Catalog — Remotion Video Design Reference (2026)

Use this skill when designing new video compositions, upgrading scene templates, or choosing background effects. Each technique includes: what it is, how to implement it in Remotion/React, and the ideal video use case.

Inspired by two world-class references:
- **AKARI by Lusion** (akari.lusion.co) — 2D global illumination, light tracing, ray marching, real-time physics
- **Vanta.js** (vantajs.com) — 13 named Three.js/WebGL animated background effects

---

## SECTION 1 — Lusion / AKARI Visual Techniques

### What AKARI Does (Technical Summary)
AKARI is a 2D real-time global illumination experiment built in WebGL by Lusion Labs. It uses the **Jump Flooding Algorithm (JFA)** to compute a signed distance field (SDF) in real time, then performs **2D ray marching** through that SDF to simulate accurate light propagation, soft shadows, penumbrae, and color bleed. Multiple modes: Zen (calm orb placement), Pong (light-traced game), Mayhem (chaotic multi-light particle explosion).

**Key Lusion Design Principles (apply to all video design):**
- Light from a source should appear to emanate and fall off — not glow uniformly
- Layered depth: foreground elements cast perceived shadows with glow falloff implying a z-axis
- Elements breathe, drift, or pulse as if reacting to the scene even without user interaction
- Achieve comparable results in Remotion using SVG + CSS + spring physics (no WebGL needed)

---

## SECTION 2 — Vanta.js Effect Library (13 Named Effects)

All 13 effects render at 60fps via Three.js/WebGL. Translate these to Remotion as pure React/SVG/CSS equivalents.

| Effect | Visual Description | Remotion Translation |
|--------|--------------------|---------------------|
| **BIRDS** | Boid flocking — triangular birds move in coordinated formations using separation/alignment/cohesion rules | Animate N SVG triangle shapes with Lissajous-path positions; stagger by seed index |
| **WAVES** | Undulating 3D ocean surface — smooth sinusoidal mesh deforms over time | Layered SVG sine-wave `<path>` elements, each offset in phase; `interpolate(frame)` drives amplitude |
| **NET** | Spring-connected node network — nodes drift, edges stretch and relax | Existing `ParticleField.tsx` is a strong match; add spring tension so distant nodes pull back |
| **CELLS** | Voronoi-like organic cell membrane — each polygon cell shimmers and shifts | Static Voronoi SVG + animate each cell's fill-color and border-opacity with staggered sine waves |
| **TOPOLOGY** | Layered topographic contour lines — concentric rings that warp organically | SVG concentric `<ellipse>` chain animated with slow organic warp via `sin(frame/60 + i*0.3)` offsets |
| **FOG** | Dense volumetric fog — soft noise-based clouds drift horizontally | CSS radial-gradient blobs (10–15 divs) with randomized `translate` + `opacity`; blur filter per layer |
| **RINGS** | 3D concentric rings tilted on axis — rotating like a gyroscope | SVG `<ellipse>` rings with varying `ry` to simulate tilt; rotate stroke dashes via `strokeDashoffset` |
| **GLOBE** | Nodes arranged on sphere surface — sphere slowly rotates | Radial grid of SVG dots that scale by `sin(angle)` to simulate depth; slow rotation via CSS transform |
| **TRUNK** | Organic recursive fractal branching from origin | Recursive SVG `<path>` with L-system branching; animate `strokeDashoffset` per branch to grow from root |
| **DOTS** | Grid of dots that ripple like concentric waves from a point | SVG `<circle>` grid; compute distance from pulsing origin, drive scale + opacity with sin falloff |
| **HALO** | Luminous glowing ring with color transitions — celestial halo / lens flare | Radial gradient `<circle>` with animated `r` and `stop-opacity`; secondary halos at 60% scale |
| **CLOUD** | Billowing 3D clouds moving gently | Multiple CSS `blur()` + radial-gradient divs drifting horizontally at different speeds and opacity |
| **CLOUD2** | Defined cloud edges with skybox coloring | Same as CLOUD with harder-edged gradient blobs and sky-to-ground linear-gradient background |

---

## SECTION 3 — Frame-Triggered Storytelling (Scroll → Frame Adaptation)

In Remotion, `frame` is the equivalent of scroll position. Every visual beat triggers at a frame threshold derived from Whisper timestamps.

**Core pattern:**
```tsx
const frame = useCurrentFrame();
const revealProgress = interpolate(
  frame, [sceneStart + 60, sceneStart + 90], [0, 1],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
```

**Universal 5-phase scene structure:**
1. **0–15%:** Hook element enters (title slides in, particle burst)
2. **15–45%:** Primary content reveals (card slides up, text fades in)
3. **45–70%:** Supporting element enters (B-roll, infographic, pull quote)
4. **70–90%:** Kinetic emphasis layer (color pulse, highlight marker, scale bounce)
5. **90–100%:** Exit/transition prep (fade, particle disperse)

Never dump all elements on screen at once. Stagger = storytelling.

---

## SECTION 4 — Parallax Depth Effects

**Speed ratio formula (use these exact ratios):**
- Background: `frame × 0.08` (slowest — "far away")
- Middle: `frame × 0.25`
- Foreground: `frame × 0.5` (fastest — "close")
- UI text: 0 (camera-fixed)

**Depth enhancement stack (apply all together):**
- Atmospheric blur: background layers `filter: blur(1.5px)`, foreground sharp
- Scale-with-depth: background `scale(0.7)`, foreground `scale(1.1)`
- Opacity-with-depth: background `opacity: 0.4`, foreground `opacity: 1.0`
- Color wash: background tinted toward `#0a0e1a`, foreground full saturation

**Remotion implementation:**
```tsx
const frame = useCurrentFrame();
<div style={{ transform: `translateX(${-frame * 0.08}px)` }}>{/* bg particles */}</div>
<div style={{ transform: `translateX(${-frame * 0.25}px)` }}>{/* mid elements */}</div>
<div style={{ transform: `translateX(${-frame * 0.5}px)` }}>{/* foreground */}</div>
```

**Use case:** HOOK scenes (parallax particle depth), BRIDGE scenes (layered infographic cards at different z-depths).

---

## SECTION 5 — Fluid Background Animations

### 5A — Animated Mesh Gradient (Stripe-style)
4–6 large color blob orbs slowly orbiting at different speeds, blending via opacity compositing.

```tsx
const frame = useCurrentFrame();
const blobs = [
  { color: '#00d4ff', cx: 30, cy: 30, r: 400, speed: 0.003, phase: 0 },
  { color: '#f5a623', cx: 70, cy: 60, r: 350, speed: 0.005, phase: 1.2 },
  { color: '#ff6b35', cx: 50, cy: 80, r: 300, speed: 0.004, phase: 2.4 },
];
// Each blob: position driven by sin/cos of (frame * speed + phase)
// Render as position:absolute div with borderRadius:50%, filter:blur(80px), opacity:0.3
```

**Use case:** HOOK backgrounds, CTA scenes. More premium than flat navy — adds depth without distraction.

---

### 5B — Vanta Birds (Lissajous Boids Simplified)
```tsx
// Each bird follows an independent Lissajous path — simulates flocking at 90% visual fidelity
const birdPos = (i: number, frame: number) => ({
  x: 960 + Math.sin(frame * 0.01 * (1 + i * 0.07) + i) * 600,
  y: 540 + Math.cos(frame * 0.008 * (1 + i * 0.05) + i * 2) * 300,
  rotation: Math.atan2(/* velocity y */, /* velocity x */) * 180 / Math.PI,
});
// Render as small SVG triangles rotated to face direction of motion
```

### 5C — Vanta Waves
```tsx
const wavePath = (layerIndex: number, frame: number) => {
  const points: string[] = [];
  const amplitude = 40 + layerIndex * 20;
  const phase = frame * 0.02 + layerIndex * 0.8;
  for (let x = 0; x <= 1920; x += 20) {
    const y = (700 + layerIndex * 60) + Math.sin((x / 200) + phase) * amplitude;
    points.push(`${x},${y}`);
  }
  return `M 0,1080 L 0,${points[0].split(',')[1]} L ${points.join(' L ')} L 1920,1080 Z`;
};
// Render 5 layers with fill: rgba(0,212,255, 0.03 + layerIndex*0.025)
```

### 5D — Vanta Fog
```tsx
// 3 radialGradient SVG circles drifting leftward, wrapping around
// Each: x = (startX - frame * 0.1) % (1920 + blobR * 2)
// Fill: radialGradient from rgba(0,212,255,0.12) → transparent
```

---

## SECTION 6 — Kinetic Typography Styles

### 6A — Word Stagger Reveal (default for all scenes)
```tsx
words.map((word, i) => {
  const p = interpolate(frame - i * 4, [0, 12], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span key={i} style={{
      opacity: p,
      transform: `translateY(${(1-p)*20}px)`,
      display: 'inline-block', marginRight: '12px',
    }}>{word}</span>
  );
})
```

### 6B — Scale Pop (emphasis word)
```tsx
const s = spring({ frame: frame - cueFrame, fps, config: { damping: 8, stiffness: 200, mass: 0.5 } });
<span style={{ transform: `scale(${s})`, display: 'inline-block' }}>{word}</span>
```

### 6C — Kinetic Tracking Expand
```tsx
const tracking = interpolate(frame, [start, start + 20], [0.5, 0.15], { extrapolateRight: 'clamp' });
<span style={{ letterSpacing: `${tracking}em` }}>{text}</span>
```

### 6D — Mask Wipe (left-to-right reveal)
```tsx
const pct = interpolate(frame, [start, start + 30], [0, 100], { extrapolateRight: 'clamp' });
<div style={{ overflow: 'hidden', width: `${pct}%` }}>
  <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
</div>
```

### 6E — Clip Reveal from Below (most premium — use for HOOK titles)
```tsx
<div style={{ overflow: 'hidden', height: lineHeight }}>
  <div style={{ transform: `translateY(${interpolate(frame, [start, start+15], [100, 0], { extrapolateRight: 'clamp' })}%)` }}>
    {text}
  </div>
</div>
// Stack multiple lines, each entering 8 frames after the previous
```

### 6F — Typewriter + Single-Word Pulse (IMPLEMENTED — v3)
```tsx
// Char-by-char reveal at 3-frame stagger, then ONE word pulses gold→white×2
// pulseT = Math.abs(Math.cos(pulseLf * Math.PI / 40)) for 2 cycles
// RGB: rgb(255 - 34*t, 255 - 47*t, 255 - 170*t) → gold(221,208,85)↔white(255,255,255)
```

---

## SECTION 7 — Isometric Animation

**Core CSS for isometric projection:**
```tsx
const isometricStyle = {
  transform: 'rotateX(30deg) rotateZ(-45deg)',
  transformStyle: 'preserve-3d' as const,
};
// Build box with 3 faces: top (normal bg), left (10% darker), right (10% lighter)
// Floating animation: translateY: Math.sin(frame * 0.05 + layerIndex * 0.8) * 8
```

**Use case:** BRIDGE scenes showing tech stacks, platform layers, process flows. "3 levels of your system" type content.

---

## SECTION 8 — Trim-Path / SVG Draw-In Reveal

**The technique:** `stroke-dasharray` = path length (1 giant dash). `stroke-dashoffset` animates from path length → 0. Result: stroke draws itself.

**Remotion native (`@remotion/paths`):**
```tsx
import { evolvePath } from '@remotion/paths';
const progress = interpolate(frame, [start, start + 60], [0, 1], { extrapolateRight: 'clamp' });
const { strokeDasharray, strokeDashoffset } = evolvePath(progress, pathData);
<path d={pathData} stroke={colors.cyan} strokeWidth={3} fill="none"
  strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
```

**Named variants:**
- **Horizontal divider draw-in** — scene opener, replaces static HR
- **Underline reveal** — extends MarkerHighlight.tsx to complex paths
- **Checkmark draw** — micro-interaction for list item completion
- **Connector line** — draws a line between two cards on BRIDGE scene
- **Icon outline reveal** — draw circle/icon outline, then fill appears
- **CTA arrow draw** — arrow draws itself pointing to URL
- **Gold border draw** — SVG `rect` strokeDashoffset 2200→0 over 175f (IMPLEMENTED — v3)

**Use case:** BRIDGE connectors, icon reveals, educational "draw the diagram" moments.

---

## SECTION 9 — Parallax Zoom on B-Roll (Ken Burns Advanced)

**Apply to every B-roll clip — never render B-roll without at least 4% zoom drift.**

```tsx
const brollProgress = interpolate(frame, [brollStart, brollEnd], [0, 1], { extrapolateRight: 'clamp' });
const scale = interpolate(brollProgress, [0, 1], [1.0, 1.08]);
const translateX = interpolate(brollProgress, [0, 1], [0, -20]);
const translateY = interpolate(brollProgress, [0, 1], [0, -10]);

<div style={{ overflow: 'hidden', width: playerW, height: playerH }}>
  <OffthreadVideo src={staticFile(brollSrc)} style={{
    width: playerW, height: playerH,
    transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
    transformOrigin: 'center center',
  }} />
</div>
```

**Direction presets:**
- `zoom-in-top-left`: scale 1.0→1.08, pan (0,0)→(-20,-10) — default
- `zoom-out-center`: scale 1.08→1.0, pan 0 — dramatic pullback
- `drift-right`: scale 1.04 fixed, translateX 0→30px
- `drift-up`: scale 1.04 fixed, translateY 0→(-20px)

---

## SECTION 10 — Whiteboard / Hand-Draw Reveal

**Approach 1 — SVG stroke animation:** Convert text to SVG paths, animate with `evolvePath()` sequentially across each letter path. 3–5 frames/letter = fast draw; 8–12 = deliberate whiteboard.

**Approach 2 — Rough path jitter (hand-drawn feel):**
```tsx
// Add slight jitter to path points to simulate irregular hand stroke
const jitter = (x: number, i: number) => x + Math.sin(i * 17.3) * 1.5;
```

**Approach 3 — Extend MarkerHighlight.tsx** with jagged stroke-width variation.

**Sound pairing:** Dry-erase marker sound effect synced to each draw-in via `<Audio startFrom={}>` greatly amplifies the effect.

---

## SECTION 11 — 2D Global Illumination (Lusion AKARI Style, No WebGL)

**Animated light source that changes glow intensity on nearby cards:**
```tsx
const frame = useCurrentFrame();
const lightX = 960 + Math.sin(frame * 0.02) * 300;
const lightY = 540 + Math.cos(frame * 0.015) * 200;

// For each card: compute distance to light → drive glow intensity
const dist = Math.sqrt((cardX - lightX) ** 2 + (cardY - lightY) ** 2);
const glowIntensity = Math.max(0, 1 - dist / 800);
const cardStyle = {
  boxShadow: `0 0 ${40 * glowIntensity}px ${20 * glowIntensity}px rgba(0,212,255,${0.6 * glowIntensity})`,
  border: `1px solid rgba(0,212,255,${0.3 + 0.5 * glowIntensity})`,
};

// Animated background radial gradient follows the light source
const bgLight = `radial-gradient(ellipse 600px 600px at ${lightX}px ${lightY}px,
  rgba(0,212,255,0.08) 0%, rgba(0,212,255,0.02) 40%, transparent 70%)`;
```

**Use case:** HOOK scenes — orbiting light that illuminates cards as it passes. Makes static layout feel alive.

---

## SECTION 12 — Micro-Interactions (10–30 Frame Polish Details)

| Micro-Interaction | Trigger | Duration | Implementation |
|-------------------|---------|----------|----------------|
| Card pulse on entry | Card appears | 20f | `spring()` scale 0.95 → 1.02 → 1.0 |
| Glow breathe | Continuous | ∞ | `sin(frame * 0.05)` drives boxShadow spread |
| Icon bounce | Key word cue | 15f | `spring()` translateY -12 → 0 |
| Border flash | Scene start | 10f | opacity 0 → 1 → 0.5 |
| Number count-up | Stat reveal | 30f | `Math.round(interpolate(frame, ...))` |
| Checkmark draw | List item | 20f | `evolvePath()` on checkmark SVG path |
| Shake (emphasis) | Contrast moment | 12f | `sin(frame * 1.5) * 4` translateX |
| Color flash | Key moment | 8f | background `#00d4ff20` fades out |
| Particle burst | CTA reveal | 30f | N particles radiate from center with spring velocity |
| Underline ping | Emphasis | 20f | `scaleX` 0 → 1.05 → 1.0 with overshoot |
| Gold border draw | CTA card entry | 175f | SVG rect strokeDashoffset 2200→0 (IMPLEMENTED — v3) |
| Single-word pulse | After typewriter | 80f | `\|cos(pulseLf×π/40)\|` gold↔white (IMPLEMENTED — v3) |

**Easing rule:** 200ms (12f @ 60fps) is the sweet spot for micro-interactions.
- `spring({ damping: 12, stiffness: 180 })` for bouncy
- `spring({ damping: 200, stiffness: 300 })` for snappy/no-bounce

---

## SECTION 13 — Background Recipes (Drop-in Multi-Layer Stacks)

### Recipe 1 — "Deep Space" (HOOK scenes)
- Layer 0: `#0a0e1a` solid base
- Layer 1: 3 Fog blobs at 8% opacity, drifting (Section 5D)
- Layer 2: ParticleField at 15% opacity
- Layer 3: Animated radial gradient light source orbiting (Section 11)
- Layer 4: NoiseOverlay at opacity 0.04

### Recipe 2 — "Neon Wave" (CTA scenes)
- Layer 0: `#0a0e1a` solid base
- Layer 1: 4 sine-wave layers at bottom 30% of frame (Section 5C)
- Layer 2: 2 mesh gradient blobs at 20% opacity (Section 5A)
- Layer 3: NoiseOverlay at opacity 0.03

### Recipe 3 — "Organic Flow" (ARCHETYPE scenes)
- Layer 0: `#0a0e1a` solid base
- Layer 1: Fog layer at 5% opacity (Section 5D)
- Layer 2: RINGS-style contour at center at 10% opacity
- Layer 3: ParticleField at 12% opacity
- Layer 4: NoiseOverlay at opacity 0.04

### Recipe 4 — "Technical Depth" (BRIDGE/infographic scenes)
- Layer 0: Dark navy SVG grid lines at 5% opacity
- Layer 1: Ghost isometric cards in background at 8% opacity (Section 7)
- Layer 2: 20-node particle drift
- Layer 3: NoiseOverlay at opacity 0.035

---

## SECTION 14 — Easing & Timing Reference

| Animation Type | Config | Duration | Notes |
|----------------|--------|----------|-------|
| Scene entrance (card) | `spring({ damping: 14, stiffness: 120 })` | 20–30f | Slight overshoot |
| Kinetic text word | `spring({ damping: 18, stiffness: 200 })` | 12–18f | Snappier than card |
| Scene transition | `interpolate` easeInOut | 20–30f | Never bouncy |
| B-roll entrance | `spring({ damping: 30, stiffness: 100 })` | 25f | No overshoot |
| Particle birth | `spring({ damping: 8, stiffness: 300 })` | 15f | Quick pop |
| Background shift | `interpolate` linear | 60–120f | Imperceptible per-frame change |
| Icon micro-bounce | `spring({ damping: 10, stiffness: 250 })` | 15f | Single bounce |
| CTA pulsing | `sin(frame * 0.05) * 0.04 + 1` | ∞ | Breathe loop |
| Ken Burns zoom | `interpolate` linear | Full B-roll | Imperceptible per-frame |
| Number count-up | `interpolate` easeOut | 45–90f | Decelerates at target |
| SVG draw-in | `interpolate` easeInOut | 30–60f | Mid-path fastest |

**Spring config presets (copy-paste ready):**
```tsx
const SNAP    = { damping: 200, stiffness: 400 }; // no overshoot, UI snaps
const PREMIUM = { damping: 14,  stiffness: 120 }; // slight overshoot, cards
const BOUNCE  = { damping: 8,   stiffness: 200 }; // playful, icons
const SOFT    = { damping: 25,  stiffness: 80  }; // gentle, titles
```

---

## SECTION 15 — Quick Reference: Which Effect For Which Scene?

| Scene Type | Background Recipe | Text Entry Style | Special Effect |
|------------|------------------|-----------------|----------------|
| HOOK | Recipe 1 (Deep Space) | Clip Reveal (6E) + Scale Pop (6B) | Parallax particle depth, orbiting light (Sec 11) |
| ARCHETYPE | Recipe 3 (Organic Flow) | Word Stagger (6A) + Tracking Expand (6C) | Ken Burns on B-roll, dynamic card glow |
| BRIDGE | Recipe 4 (Technical Depth) | Wipe Reveal (6D) | Isometric cards (Sec 7), SVG draw-in connectors (Sec 8) |
| CTA | Recipe 2 (Neon Wave) | Scale Pop (6B) + Typewriter+Pulse (6F) | Gold border draw, particle burst, pulsing rings |
| INTRO | Recipe 1 + extra fog | After avatar enters | Halo glow behind avatar |
| OUTRO | Recipe 2 fading | Word-by-word fade out | QuizCard scale(1.75), waves slow with audio |

---

## Remotion Implementation Rules

1. **No WebGL required** — all techniques use SVG, CSS, and React math only. More reliable in headless Chrome.
2. **Deterministic seeding** — all "random" values must seed from a fixed integer (particle index, not `Math.random()`). Otherwise: flickering.
3. **Performance budget** — keep < 60 SVG elements per layer. Use `useMemo` to pre-compute paths above that.
4. **Frame-rate independence** — use `frame / fps` for time, not raw `frame`. Works at both 30fps and 60fps.
5. **Always clamp** — `extrapolateLeft: 'clamp', extrapolateRight: 'clamp'` on every `interpolate()` call.
6. **Whisper-first** — every animation trigger must map to `whisperSeconds × 30 = frame`. Never estimate.
7. **Layer opacity budget** — background effects max 15% opacity. Midground max 70%. Text always 100%.

---

## Sources
- [AKARI by Lusion](https://akari.lusion.co/) — 2D light tracing / JFA / ray marching
- [Lusion — Award Winning 3D and Interactive Studio](https://lusion.co/)
- [Vanta.js — 3D & WebGL Background Animations](https://www.vantajs.com/)
- [Vanta GitHub — tengbao/vanta](https://github.com/tengbao/vanta)
- [Remotion evolvePath() docs](https://www.remotion.dev/docs/paths/evolve-path)
- [Remotion @remotion/paths](https://www.remotion.dev/docs/paths/)
