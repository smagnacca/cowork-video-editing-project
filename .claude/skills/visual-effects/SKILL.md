# Visual Effects Skill — The Persuasion & Conversion Toolkit (2026)

Use this skill when designing websites, landing pages, video compositions, presentations, or any digital experience that needs visual effects, animations, or interactive elements. Reference this catalog to choose effects that serve a persuasive purpose — every effect should have a "why" tied to conversion, engagement, or user experience.

---

## Effect Catalog

### Focus Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Ken Burns Zoom** | Directs 100% of user attention to a specific product USP or CTA. | Slow 2s zoom-in on central product, high-end studio lighting, 4k. |
| **"Quiet Mode" UI** | Shows respect for user's mental space; toggles off all animations. | Minimalist toggle switch icon, 'Focus Mode' label, grayscale accent. |

### Flow Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Infinite "Loom"** | Reduces friction; content "weaves" in, making discovery feel addictive. | 2D vector, seamless knitting animation, pastel gradient, transparent. |

### Feedback Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **SVG Path Morph** | Confirms actions (e.g., Cart → Check) with satisfying visual reward. | Icon morph: shopping bag to checkmark, 1s duration, ease-in-out. |

### Life / Particle Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Particle Gravity** | Increases "Time on Page" by making background react to the cursor. | Abstract dust particles, navy theme, attracts to mouse, soft glow. |

### Speed Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Lottie Hero State** | High engagement of video with lightning-fast load time of code. | Lottie JSON, minimalist pulsing success icon, corporate blue, 60fps. |

### Mood Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Dynamic Hue Shift** | Subtly "refreshes" the user's brain to prevent scroll-fatigue. | Slow 20s background shift, deep indigo to emerald, ultra-smooth. |

### Depth Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Z-Axis Parallax** | Creates a premium, immersive "3D" feel of moving "into" the site. | Layered UI, elements enlarge on scroll, frosted glass depth, 4k. |
| **Perspective Fold** | Makes quotes or testimonials feel "physical" and grounded. | Typography on 45-degree fold, realistic shadow, clean paper texture. |

### Texture Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Pattern Video Mask** | Adds movement without the visual clutter of full-screen video. | Geometric circuit mask over city B-roll, high contrast, muted tones. |

### Revenue / Conversion Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Exit-Intent Modal** | Last-chance persuasion; triggers only when user is about to leave. | Glassmorphism pop-up, 'Wait!' headline, bold 10% discount, clean. |
| **Sticky Countdown** | Drives FOMO; creates a physical deadline for sale or event. | High-contrast orange bar, digital timer, sans-serif bold, fixed top. |

### Trust Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Typing Indicator** | Humanizes the brand; simulates a live person ready to help. | Chat bubble, 3 pulsing dots animation, soft shadow, minimalist. |

### Proof / Social Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Localized Toast** | Increases relevance by showing recent activity in user's area. | Small slide-in alert, 'Verified in [City]', map pin icon, soft white. |

### Utility Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Product Hotspots** | Lets users explore details without leaving the main high-res image. | Pulsing cyan rings on product features, reveal text card on hover. |

### Premium Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Metallic Grad-Fill** | Signals luxury and "top-tier" quality through typography. | Bold text 'ELITE', silver-to-platinum gradient fill, light sheen. |

### Emphasis Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Marker Highlight** | Stronger visual "hand-off" to links than standard underline. | Animated thick neon underline, draws left-to-right on link hover. |

### Motion Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Liquid Reveal** | A high-end transition that makes page loads feel like "art." | Organic liquid blob expansion, purple/teal gradient, reveal mask. |

### Adaptive Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Grid Reflow** | Signals technical excellence through perfectly smooth reordering. | 3-column grid tiles sliding into 1-column stack, spring physics. |

### Surprise Effects

| Effect | Purpose | Implementation |
|--------|---------|----------------|
| **Easter Egg Reveal** | Rewards curiosity; builds brand "fans" through hidden interactions. | Hidden logo animation, triggers on 3rd click, playful confetti burst. |

---

## Scott's Preferred Visual Palette (from user preferences)

These effects should be applied using Scott's established design language:

| Element | Value |
|---------|-------|
| Background | #0a0e1a (deep navy) |
| Primary Accent | #00d4ff (cyan) |
| Secondary Accent | #f5a623 (gold) |
| Tertiary Accent | #ff6b35 (orange) |
| Card Style | Glassmorphism (backdrop-blur-md, rgba(255,255,255,0.05), 1px white border at 20% opacity) |
| Particles | SVG-based with connection lines, glow halos, color pulse |
| Text Effects | Solid color + textShadow glow (NEVER WebkitBackgroundClip in Remotion) |
| Animations | Spring physics (Framer Motion or Remotion spring()), staggered entrances |

---

## Additional Effects from Scott's Preferences

These are additional effects specified in Scott's user preferences that complement the catalog above:

| Category | Effect | Implementation |
|----------|--------|----------------|
| Text | **Gradient Shimmer** | Highlight "sheen" across text using Tailwind animate-pulse or custom CSS linear-gradient animation. |
| Text | **Typewriter** | Characters appear one by one with blinking cursor. React component iterating through string array with configurable delay. |
| Movement | **Parallax Scrolling** | Background moves slower than foreground using window.scrollY and CSS transform: translateY. |
| Movement | **Staggered Entrance** | List items animate in sequentially. Framer Motion with staggerChildren transition of 0.1s. |
| Graphics | **Glassmorphism** | backdrop-blur-md, semi-transparent white background, 1px white border at 20% opacity. |
| Graphics | **Lottie Animation** | Vector animations using react-lottie player for complex movement states. |
| Background | **Mesh Gradient** | Moving multi-colored background using CSS radial-gradient with infinite keyframe animation. |
| Background | **Particles/Nodes** | Canvas-based floating dots that connect with lines within 100px proximity. |
| Pop-up/UI | **Spring Modal** | Framer Motion with type: 'spring', stiffness 300, damping 30. |
| Pop-up/UI | **Micro-interaction** | Scale-down on active state for buttons to simulate physical press. |
| Visual | **Reveal on Scroll** | Intersection Observer triggers 'fade-in-up' animation on sections entering viewport. |
| Text | **SVG Path Animation** | Text "handwritten" effect by animating stroke-dashoffset over 2 seconds. |
| Text | **Variable Font Weight Warp** | Animate font-weight 100→900 on hover using Framer Motion and variable fonts. |
| Surface | **Noise/Grain Overlay** | SVG noise filter overlay for cinematic grain texture. |
| Surface | **Neuromorphism** | Soft shadows (inner + outer) for 3D extruded effect. |
| Depth/3D | **Tilt/Glint Effect** | 3D card tilt using onMouseMove to update CSS rotateX/rotateY variables. |
| Depth/3D | **Z-Axis Scroll (Tunnel)** | Items scale 0.5→1.5 and fade based on viewport center proximity. |
| Transitions | **Shared Element Transition** | Framer Motion layoutId for thumbnail→fullscreen morph. |
| Transitions | **Wipe/Mask Reveal** | Circular CSS clip-path expanding from center to reveal content. |
| Interactive | **Magnetic Cursor** | Button follows cursor within 50px radius using spring animation. |
| Interactive | **Sticky Scrolling** | CSS scroll-snap-type: y mandatory for full-height section snapping. |
| High Performance | **Shader/Liquid Distortion** | GLSL shader + Three.js for fluid ripple/melt effect on hover. |

---

## 3D Immersive Background Effects (2026 Addition)

These are premium hero/background effects for landing pages, video openers, and presentation slides. Each is described as an AI generation / design prompt that can be passed to Midjourney, DALL-E, a shader tool, or used as direction for a Three.js/WebGL developer.

### When to use 3D backgrounds
- **Hero sections** of landing pages (above the fold)
- **Video Hook scenes** (first 5–8 seconds, before the speaker/content appears)
- **Presentation title slides** and transition cards
- **Brand identity renders** for social media / thumbnails

### Effect Library

| # | Name | Best For | Prompt / Direction |
|---|------|----------|-------------------|
| 1 | **Neon Geometric Space** | Futuristic tech brands, AI products | Vibrant multicolor 3D geometric shapes floating in deep black space, neon rim-lighting, glossy reflective surfaces, soft volumetric glow, high-contrast palette, smooth gradients, cinematic lighting, ultra-sharp detail, futuristic abstract design |
| 2 | **Rainbow Abstract Objects** | Creative agencies, design portfolios | Abstract 3D spheres, ribbons, and cubes in rainbow neon colors, floating against a pure black background, glowing edges, soft bloom, high-contrast reflections, smooth curvature, immersive depth |
| 3 | **Neon Wave Flow** | Music, events, energy brands | Flowing neon multicolor 3D waves, liquid motion, smooth undulating surface, glowing edges, holographic gradients, vibrant rainbow colors, deep black background, high-contrast lighting, fluid abstract energy |
| 4 | **Psychedelic Holographic Wave** | Bold consumer brands, NFT/Web3 | Psychedelic holographic wave surface, shimmering multicolor reflections, smooth fluid motion, neon glow, black void background, ultra-vibrant palette, dynamic curvature |
| 5 | **Holographic Liquid Metal** | Luxury tech, premium SaaS | Holographic liquid-metal waves in vibrant shifting colors, chrome-like reflections, iridescent highlights, smooth flowing motion, deep black background, high-contrast neon glow, surreal futuristic texture |
| 6 | **Playful Multicolor 3D** | Education, youth brands, SaaS onboarding | Playful multicolor 3D shapes with bold lighting, smooth motion blur, vibrant neon palette, glossy surfaces, floating abstract forms, deep black background, high-contrast composition, energetic modern design |
| 7 | **Dynamic Abstract Scene** | Corporate innovation, keynotes | Dynamic 3D abstract scene with bright saturated colors, soft shadows, glowing accents, smooth curved shapes, black negative space, crisp high-contrast rendering |
| 8 | **WebGL Shader Wave** | Developer tools, technical products | Real-time WebGL shader aesthetic, flowing multicolor wave mesh, neon gradients, emissive glow, black background, smooth vertex displacement, high-contrast lighting, futuristic digital energy |
| 9 | **Rainbow Wireframe Field** | Data visualization, analytics products | Interactive 3D wave field, rainbow spectral colors, glowing wireframe, soft bloom, deep black void, fluid procedural motion, high-definition abstract simulation |
| 10 | **Cinematic Hero Waves** | Video production, marketing agencies | Hero-section concept art of multicolor 3D waves, neon glow, smooth flowing geometry, black background, immersive depth, cinematic lighting, futuristic UI aesthetic |
| 11 | **Modern Landing Background** | General SaaS, startups | Abstract 3D landing page background with vibrant flowing waves, holographic gradients, glowing edges, deep black backdrop, ultra-modern design |

### Implementation Options

**For Remotion video compositions:**
- Render these as SVG animations (ParticleField variant) with sinusoidal wave displacement
- Use `DynamicHueShift` + animated radial gradients for the holographic/wave aesthetic
- Layer `NoiseOverlay` (opacity 0.03–0.05) over any 3D background for cinematic texture
- Recommended: animate vertex-like dots with connecting lines + color pulse cycle

**For web/landing pages:**
- Three.js / React Three Fiber: vertex-displaced plane geometry + ShaderMaterial with neon uniforms
- CSS-only approximation: layered `radial-gradient` + `conic-gradient` + `animation: hue-rotate(360deg)` over 8s
- Spline.design: import any of these as a prompt and export as embed code

**Palette for 3D effects (dark brand variant):**
```
Background: #000000 (pure black void)
Primary glow: multicolor spectrum — rotate hue over time
Rim light: neon cyan, magenta, gold at 60–80% opacity
Bloom: spread-radius 30–80px, opacity 0.3–0.6
```

---

## How to Use This Skill

When designing or building any visual element:

1. **Start with the "Why"** — Pick an effect based on its persuasive purpose, not just aesthetics
2. **Match the palette** — Use Scott's established color system (#0a0e1a bg, cyan/gold/orange accents)
3. **Layer thoughtfully** — Combine a background effect (Mesh Gradient, Particles, 3D Wave) + a content effect (Glassmorphism, Spring Modal) + a text effect (Kinetic Text, Typewriter)
4. **Performance first** — CSS animations > JS animations > Canvas > WebGL. Only escalate when simpler approaches can't achieve the effect
5. **Remotion warning** — When implementing in Remotion video compositions, NEVER use WebkitBackgroundClip, WebkitTextFillColor, or CSS gradient-clip. These render as solid color bars in headless Chrome.
6. **3D backgrounds for openers** — When building a Hook scene, always consider one of the 3D Immersive Background Effects above as the opening 5–8 seconds before transitioning to the main visual layout.
