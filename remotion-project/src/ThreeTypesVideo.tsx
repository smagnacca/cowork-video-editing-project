import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
} from 'remotion';
import { ParticleField } from './components/ParticleField';
import { GlassmorphismCard } from './components/GlassmorphismCard';
import { KineticText, KineticTextSequence } from './components/KineticText';
import { MeshGradient, Spotlight } from './components/MeshGradient';
import { BRollPlayer } from './components/BRollPlayer';
import { NoiseOverlay } from './components/NoiseOverlay';

// ─── Colors (from scottmagnacca.com) ─────────────────────────────
const COLORS = {
  bg: '#0a0e1a',
  cyan: '#00d4ff',
  gold: '#f5a623',
  orange: '#ff6b35',
  textPrimary: '#ffffff',
  textSecondary: '#a0aec0',
};

// ─── Scene Timings (at 30fps) ────────────────────────────────────
// Timestamps from Whisper word-level transcription (regenerated 2026-03-31).
// Audio duration: ~193s (5790 frames). CTA holds 5s (150 frames) past audio end.
const SCENE_1_START = 0;
const SCENE_1_END = 488;       // 16.26s — "Number one" starts (Believer)
const SCENE_2_START = 488;
const SCENE_2_END = 1844;      // 61.48s — "Number two" starts (Peer)
const SCENE_3_START = 1844;
const SCENE_3_END = 3319;      // 110.62s — "Number three" starts (Coach)
const SCENE_4_START = 3319;
const SCENE_4_END = 4517;      // 150.58s — "These three types" starts (Bridge)
const SCENE_5_START = 4517;
const SCENE_5_END = 5511;      // 183.70s — "Your circle is your catalyst" starts (CTA)
const SCENE_6_START = 5511;
const SCENE_6_END = 5940;      // CTA holds 5s past audio end (~193s = 5790 frames)

// ─── Animated Background ─────────────────────────────────────────
const AnimatedBackground: React.FC<{
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
}> = ({ color1 = COLORS.cyan, color2 = '#1a0a2e', color3 = COLORS.bg, speed = 1 }) => {
  const frame = useCurrentFrame();
  const x1 = 25 + Math.sin(frame * 0.006 * speed) * 20;
  const y1 = 35 + Math.cos(frame * 0.005 * speed) * 20;
  const x2 = 75 + Math.sin(frame * 0.008 * speed + 2) * 18;
  const y2 = 65 + Math.cos(frame * 0.007 * speed + 1) * 18;
  const x3 = 50 + Math.sin(frame * 0.004 * speed + 4) * 15;
  const y3 = 50 + Math.cos(frame * 0.009 * speed + 3) * 15;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse 50% 50% at ${x1}% ${y1}%, ${color1}20 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at ${x2}% ${y2}%, ${color2}30 0%, transparent 50%),
          radial-gradient(ellipse 60% 60% at ${x3}% ${y3}%, ${color1}10 0%, transparent 70%),
          linear-gradient(135deg, ${color3} 0%, #050810 50%, ${color3} 100%)
        `,
      }}
    />
  );
};

// ─── Scene Number Badge ──────────────────────────────────────────
const SceneNumber: React.FC<{ number: number; color: string; delay?: number }> = ({ number, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 } });

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 80,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity: entrance,
        transform: `translateX(${interpolate(entrance, [0, 1], [-30, 0])}px)`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 800,
          color,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {number}
      </div>
      <div style={{ height: 2, width: 60, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
};

// ─── Scene Icon ──────────────────────────────────────────────────
const SceneIcon: React.FC<{ type: 'believer' | 'peer' | 'coach'; color: string; delay?: number }> = ({ type, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 80 } });
  const pulse = 1 + Math.sin(frame * 0.05) * 0.03;

  return (
    <div
      style={{
        width: 70,
        height: 70,
        borderRadius: '50%',
        border: `2px solid ${color}60`,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        transform: `scale(${entrance * pulse})`,
        opacity: entrance,
        boxShadow: `0 0 30px ${color}30`,
      }}
    >
      <svg width={36} height={36} viewBox="0 0 40 40">
        {type === 'believer' && (
          <>
            <circle cx={20} cy={12} r={8} fill="none" stroke={color} strokeWidth={2} />
            <path d="M20 22 L20 36 M12 28 L28 28" stroke={color} strokeWidth={2} fill="none" />
          </>
        )}
        {type === 'peer' && (
          <>
            <circle cx={14} cy={14} r={6} fill="none" stroke={color} strokeWidth={2} />
            <circle cx={26} cy={14} r={6} fill="none" stroke={color} strokeWidth={2} />
            <path d="M8 32 Q14 24 20 32 Q26 24 32 32" stroke={color} strokeWidth={2} fill="none" />
          </>
        )}
        {type === 'coach' && (
          <>
            <circle cx={20} cy={20} r={14} fill="none" stroke={color} strokeWidth={2} />
            <path d="M20 8 L20 20 L28 20" stroke={color} strokeWidth={2} fill="none" />
            <circle cx={20} cy={20} r={3} fill={color} />
          </>
        )}
      </svg>
    </div>
  );
};

// ─── Archetype Scene (shared layout with B-roll support) ─────────
// ─── B-roll clip definition ─────────────────────────────────────
interface BRollClip {
  src: string;
  startFrame: number;
  duration: number;
}

const ArchetypeScene: React.FC<{
  number: number;
  title: string;
  titleColor: string;
  subtitle: string;
  iconType: 'believer' | 'peer' | 'coach';
  bgColor1: string;
  bgColor2: string;
  bgColor3: string;
  kineticText: string;
  kineticDelay: number;
  brollSrc: string;
  brollStartFrame: number;
  brollDuration: number;
  /** Optional: multiple B-roll clips at different cue points (overrides single broll props) */
  brollClips?: BRollClip[];
}> = ({
  number, title, titleColor, subtitle, iconType,
  bgColor1, bgColor2, bgColor3,
  kineticText, kineticDelay,
  brollSrc, brollStartFrame, brollDuration,
  brollClips,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntrance = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 18, stiffness: 70 } });
  const subtitleEntrance = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 18, stiffness: 60 } });

  // Resolve clips: use brollClips array if provided, else fall back to single clip
  const clips: BRollClip[] = brollClips || [{ src: brollSrc, startFrame: brollStartFrame, duration: brollDuration }];

  // Check if ANY clip is currently active (for card shift)
  const anyBrollActive = clips.some(clip => {
    const local = frame - clip.startFrame;
    return local >= 0 && local <= clip.duration;
  });

  // Find the currently active clip for shift calculation
  const activeClip = clips.find(clip => {
    const local = frame - clip.startFrame;
    return local >= -20 && local <= clip.duration + 20; // include transition frames
  });

  // Smooth shift animation based on nearest active clip
  const shiftProgress = (() => {
    if (!activeClip) return 0;
    const brollLocalFrame = frame - activeClip.startFrame;
    if (brollLocalFrame < 0) return 0;
    if (brollLocalFrame > activeClip.duration) {
      const returnFrame = brollLocalFrame - activeClip.duration;
      return Math.max(0, 1 - returnFrame / 20);
    }
    return Math.min(1, brollLocalFrame / 20);
  })();

  const cardX = interpolate(shiftProgress, [0, 1], [0, -340]);
  const cardScale = interpolate(shiftProgress, [0, 1], [1, 0.85]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AnimatedBackground color1={bgColor1} color2={bgColor2} color3={bgColor3} speed={0.8} />
      <ParticleField color={titleColor} count={35} seed={number * 10} intensity={0.6} />

      <SceneNumber number={number} color={titleColor} delay={5} />

      {/* Card container - shifts left during B-roll */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${cardX}px) scale(${cardScale})`,
          transition: 'none',
        }}
      >
        <GlassmorphismCard accentColor={titleColor} delay={20} width={700}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SceneIcon type={iconType} color={titleColor} delay={30} />
            <h2
              style={{
                color: COLORS.textPrimary,
                fontSize: 52,
                fontWeight: 800,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                margin: 0,
                textAlign: 'center',
                opacity: titleEntrance,
                letterSpacing: -1,
              }}
            >
              The <span style={{ color: titleColor }}>{title}</span>
            </h2>
            <p
              style={{
                color: COLORS.textSecondary,
                fontSize: 26,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 400,
                textAlign: 'center',
                marginTop: 14,
                opacity: subtitleEntrance,
                lineHeight: 1.5,
                maxWidth: 580,
              }}
            >
              {subtitle}
            </p>
          </div>
        </GlassmorphismCard>
      </AbsoluteFill>

      {/* B-roll video players — one per clip, each at its own cue point */}
      {clips.map((clip, i) => (
        <BRollPlayer
          key={i}
          src={clip.src}
          accentColor={titleColor}
          startFrame={clip.startFrame}
          durationFrames={clip.duration}
        />
      ))}

      {/* Kinetic text */}
      <KineticText text={kineticText} color={titleColor} delay={kineticDelay} duration={180} glow />
    </AbsoluteFill>
  );
};

// ─── Pull Quote ─────────────────────────────────────────────────
/** Animated pull-quote that appears bottom-center with a colored left border accent */
const PullQuote: React.FC<{
  text: string;
  color: string;
  delay: number;
  duration?: number;
}> = ({ text, color, delay, duration = 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - delay;
  if (localFrame < 0 || localFrame > duration) return null;

  const entrance = spring({ frame: Math.max(0, localFrame), fps, config: { damping: 16, stiffness: 80 } });
  const fadeOut = localFrame > duration - 20
    ? interpolate(localFrame, [duration - 20, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <div style={{
      position: 'absolute',
      bottom: 100,
      left: '50%',
      transform: `translateX(-50%) translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
      opacity: entrance * fadeOut,
      zIndex: 15,
    }}>
      <div style={{
        padding: '18px 36px',
        borderLeft: `4px solid ${color}`,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0 12px 12px 0',
        maxWidth: 800,
      }}>
        <p style={{
          color: '#ffffff',
          fontSize: 28,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 600,
          fontStyle: 'italic',
          margin: 0,
          lineHeight: 1.4,
          letterSpacing: 0.5,
        }}>
          "{text}"
        </p>
      </div>
    </div>
  );
};

// ─── Animated Arrow ─────────────────────────────────────────────
const AnimatedArrow: React.FC<{ delay?: number; color?: string }> = ({ delay = 60, color = '#00d4ff' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const entrance = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 70 } });
  const bounce = Math.sin(localFrame * 0.1) * 8;

  return (
    <div style={{
      position: 'absolute',
      top: '38%',
      left: '50%',
      transform: `translateX(-50%) translateY(${bounce}px)`,
      opacity: entrance,
      zIndex: 10,
    }}>
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    </div>
  );
};

// ─── Pulsing Gold Frame ─────────────────────────────────────────
const PulsingFrame: React.FC<{
  delay?: number;
  width?: number;
  height?: number;
}> = ({ delay = 0, width = 1050, height = 260 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  const entrance = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 80 } });
  // Pulse between gold and white
  const pulse = Math.sin(localFrame * 0.08);
  const goldR = 245, goldG = 166, goldB = 35;
  const r = Math.round(goldR + (255 - goldR) * (pulse * 0.5 + 0.5));
  const g = Math.round(goldG + (255 - goldG) * (pulse * 0.5 + 0.5));
  const b = Math.round(goldB + (255 - goldB) * (pulse * 0.5 + 0.5));
  const frameColor = `rgb(${r}, ${g}, ${b})`;
  const glowIntensity = 0.4 + pulse * 0.3;

  if (localFrame < 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: `translate(-50%, -50%) scale(${interpolate(entrance, [0, 1], [0.85, 1])})`,
      width, height,
      border: `4px solid ${frameColor}`,
      borderRadius: 16,
      opacity: entrance,
      boxShadow: `
        0 0 ${20 * glowIntensity}px ${COLORS.gold}60,
        0 0 ${50 * glowIntensity}px ${COLORS.gold}30,
        inset 0 0 ${20 * glowIntensity}px ${COLORS.gold}15
      `,
      pointerEvents: 'none' as const,
      zIndex: 5,
    }} />
  );
};

// ─── Scene 1: Hook ───────────────────────────────────────────────
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleEntrance = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 18, stiffness: 60 } });
  const subtitleEntrance = spring({ frame: Math.max(0, frame - 90), fps, config: { damping: 18, stiffness: 60 } });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AnimatedBackground color1={COLORS.cyan} color2="#1a0a2e" color3={COLORS.bg} speed={0.5} />
      <ParticleField color={COLORS.cyan} count={50} seed={1} intensity={0.8} />

      {/* Pulsing gold/white rectangle frame around title */}
      <PulsingFrame delay={45} width={1050} height={260} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1
          style={{
            color: COLORS.textPrimary,
            fontSize: 78,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 800,
            textAlign: 'center',
            opacity: titleEntrance,
            transform: `translateY(${interpolate(titleEntrance, [0, 1], [40, 0])}px)`,
            letterSpacing: -2,
            lineHeight: 1.15,
            maxWidth: 1200,
            margin: 0,
          }}
        >
          3 Types of People<br />
          <span style={{ color: COLORS.cyan }}>You Need in Your Corner</span>
        </h1>
        <p
          style={{
            color: COLORS.textSecondary,
            fontSize: 32,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400,
            textAlign: 'center',
            opacity: subtitleEntrance,
            transform: `translateY(${interpolate(subtitleEntrance, [0, 1], [20, 0])}px)`,
            marginTop: 24,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Curiosity · Learning · Adaptability
        </p>
      </AbsoluteFill>

      <KineticText text="CURIOSITY IS YOUR EDGE" color={COLORS.gold} delay={240} duration={140} shimmer glow />
    </AbsoluteFill>
  );
};

// ─── Scene 5: Bridge (3 Cards) ──────────────────────────────────
const SceneBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Whisper timestamps for when each attribute is spoken (local frames within Bridge scene)
  const checkmarkTriggers = [226, 259, 293]; // "Curiosity" 158.10s, "Lifelong learning" 159.20s, "Adaptability" 160.34s

  const cards = [
    { title: 'Curiosity', color: COLORS.cyan, subtitle: 'The Believer pushes you to explore.', icon: '🔍' },
    { title: 'Lifelong Learning', color: COLORS.gold, subtitle: 'Your Peer keeps you accountable.', icon: '📚' },
    { title: 'Adaptability', color: COLORS.orange, subtitle: 'The Coach shows the blind spots.', icon: '⚡' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AnimatedBackground color1={COLORS.cyan} color2={COLORS.orange} color3={COLORS.bg} speed={1.2} />
      <ParticleField color={COLORS.cyan} count={60} seed={50} intensity={1.2} />

      <AbsoluteFill
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '0 80px' }}
      >
        {cards.map((card, i) => {
          const cardDelay = 15 + i * 20;
          const entrance = spring({ frame: Math.max(0, frame - cardDelay), fps, config: { damping: 18, stiffness: 70 } });
          const pulse = 1 + Math.sin((frame - cardDelay) * 0.04) * 0.015;
          const glow = interpolate(frame, [300, 500], [0.3, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          // Gold circle marker: appears when attribute is spoken
          const markerTrigger = checkmarkTriggers[i];
          const markerFrame = frame - markerTrigger;
          const markerActive = markerFrame >= 0;
          const markerDraw = markerActive
            ? spring({ frame: Math.max(0, markerFrame), fps, config: { damping: 12, stiffness: 60 } })
            : 0;

          // Green checkmark: springs in ~15 frames after the marker starts
          const checkFrame = frame - (markerTrigger + 15);
          const checkActive = checkFrame >= 0;
          const checkEntrance = checkActive
            ? spring({ frame: Math.max(0, checkFrame), fps, config: { damping: 14, stiffness: 100 } })
            : 0;

          return (
            <div
              key={i}
              style={{
                width: 480,
                padding: '48px 36px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: 20,
                border: markerActive ? `3px solid ${COLORS.gold}` : `1px solid ${card.color}30`,
                boxShadow: markerActive
                  ? `0 8px 32px rgba(0,0,0,0.3), 0 0 ${40 * glow}px ${card.color}20, 0 0 30px ${COLORS.gold}40, 0 0 60px ${COLORS.gold}20`
                  : `0 8px 32px rgba(0,0,0,0.3), 0 0 ${40 * glow}px ${card.color}20`,
                transform: `translateY(${interpolate(entrance, [0, 1], [60, 0])}px) scale(${entrance * pulse})`,
                opacity: entrance,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Gold circle marker — draws around card border */}
              {markerActive && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: 24,
                    border: `3px solid ${COLORS.gold}`,
                    opacity: markerDraw,
                    boxShadow: `0 0 20px ${COLORS.gold}50, 0 0 40px ${COLORS.gold}30`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Green checkmark — appears above card */}
              {checkActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: -50,
                    left: '50%',
                    transform: `translateX(-50%) scale(${checkEntrance})`,
                    opacity: checkEntrance,
                    fontSize: 40,
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px #22c55e80, 0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 20,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 2, background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`, opacity: 0.6 }} />
              <div
                style={{
                  width: 60, height: 60, borderRadius: '50%', border: `2px solid ${card.color}50`, background: `${card.color}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20, boxShadow: `0 0 20px ${card.color}20`,
                }}
              >
                {card.icon}
              </div>
              <h3 style={{ color: card.color, fontSize: 36, fontWeight: 800, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: 0, marginBottom: 12 }}>
                {card.title}
              </h3>
              <p style={{ color: COLORS.textSecondary, fontSize: 22, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', lineHeight: 1.5, margin: 0 }}>
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </AbsoluteFill>

      <KineticTextSequence
        words={[
          { text: 'CURIOSITY', color: COLORS.cyan },
          { text: 'LEARNING', color: COLORS.gold },
          { text: 'ADAPTABILITY', color: COLORS.orange },
        ]}
        delay={226}
        stagger={33}
      />

      {/* B-roll: walking toward light — "you have to walk through it" (182.70s) */}
      <BRollPlayer
        src="walking-light.mp4"
        accentColor={COLORS.cyan}
        startFrame={964}
        durationFrames={150}
      />
    </AbsoluteFill>
  );
};

// ─── Scene 6: CTA ────────────────────────────────────────────────
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const urlEntrance = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 14, stiffness: 60 } });
  const taglineEntrance = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 18, stiffness: 70 } });
  // Glow pulse on URL
  const glowPulse = 0.6 + Math.sin(frame * 0.06) * 0.4;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AnimatedBackground color1={COLORS.cyan} color2="#0a1a3a" color3={COLORS.bg} speed={0.4} />
      <ParticleField color={COLORS.cyan} count={25} seed={60} intensity={0.4} pulseColor="#ffffff" />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p
          style={{
            color: COLORS.textSecondary, fontSize: 32,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400, textAlign: 'center', marginBottom: 40,
            opacity: taglineEntrance,
            transform: `translateY(${interpolate(taglineEntrance, [0, 1], [20, 0])}px)`,
            letterSpacing: 1,
          }}
        >
          Your circle is your catalyst. Choose it wisely.
        </p>
        <div
          style={{
            padding: '32px 64px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
            borderRadius: 16, border: `1px solid ${COLORS.cyan}30`,
            boxShadow: `0 0 ${60 * glowPulse}px ${COLORS.cyan}30, 0 8px 32px rgba(0,0,0,0.3)`,
            opacity: urlEntrance,
            transform: `scale(${interpolate(urlEntrance, [0, 1], [0.9, 1])})`,
            overflow: 'hidden', position: 'relative',
          }}
        >
          <h1
            style={{
              fontSize: 72, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 800, margin: 0, letterSpacing: -1,
              color: COLORS.cyan,
              textShadow: `0 0 20px ${COLORS.cyan}80, 0 0 60px ${COLORS.cyan}40, 0 0 100px ${COLORS.cyan}20`,
            }}
          >
            scottmagnacca.com
          </h1>
        </div>
        <p
          style={{
            color: COLORS.textSecondary, fontSize: 24,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400, textAlign: 'center', marginTop: 32,
            opacity: spring({ frame: Math.max(0, frame - 60), fps, config: { damping: 18, stiffness: 60 } }),
            letterSpacing: 2, textTransform: 'uppercase',
          }}
        >
          Build the skills that make you impossible to ignore
        </p>
      </AbsoluteFill>

      {/* Bouncing arrow pointing to URL */}
      <AnimatedArrow delay={50} color={COLORS.cyan} />
    </AbsoluteFill>
  );
};

// ─── Main Composition ────────────────────────────────────────────
export const ThreeTypesVideo: React.FC<{ audioSrc?: string }> = ({
  audioSrc = '3-types-of-people.mp3',
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Audio src={staticFile('audio/' + audioSrc)} />

      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_END - SCENE_1_START}>
        <SceneHook />
      </Sequence>

      {/* Scene 2: The Believer — multiple B-roll clips at narration cue points */}
      <Sequence from={SCENE_2_START} durationInFrames={SCENE_2_END - SCENE_2_START}>
        <ArchetypeScene
          number={1}
          title="Believer"
          titleColor={COLORS.cyan}
          subtitle={'The person who sees what\'s possible for you…\nbefore you see it yourself.'}
          iconType="believer"
          bgColor1={COLORS.cyan}
          bgColor2="#0a1a3a"
          bgColor3={COLORS.bg}
          kineticText="SHARE YOUR GOALS"
          kineticDelay={1045}
          brollSrc="bet-on-you.mp4"
          brollStartFrame={392}
          brollDuration={120}
          brollClips={[
            { src: 'bet-on-you.mp4', startFrame: 392, duration: 120 },     // "They bet on you early" (29.34s)
            { src: 'front-row.mp4', startFrame: 740, duration: 180 },      // "who shows up in the front row" (40.94s)
            { src: 'texting.mp4', startFrame: 817, duration: 150 },        // "who sends the how's the project going message" (43.50s)
          ]}
        />
        {/* Pull quotes — key phrases featured as italic quotes */}
        <PullQuote text="They bet on you early" color={COLORS.cyan} delay={392} duration={100} />
        <PullQuote text="Your potential only compounds when you do" color={COLORS.cyan} delay={1284} duration={100} />
      </Sequence>

      {/* Scene 3: The Peer — multiple B-roll clips at narration cue points */}
      <Sequence from={SCENE_3_START} durationInFrames={SCENE_3_END - SCENE_3_START}>
        <ArchetypeScene
          number={2}
          title="Peer"
          titleColor={COLORS.gold}
          subtitle={'Proximity is the program.\nYou absorb the standard of the room.'}
          iconType="peer"
          bgColor1={COLORS.gold}
          bgColor2="#2a1a4a"
          bgColor3={COLORS.bg}
          kineticText="PROXIMITY IS THE PROGRAM"
          kineticDelay={799}
          brollSrc="teamwork.mp4"
          brollStartFrame={278}
          brollDuration={150}
          brollClips={[
            { src: 'teamwork.mp4', startFrame: 278, duration: 150 },      // "keep building" (70.74s)
            { src: 'conference.mp4', startFrame: 677, duration: 150 },    // "masterminds, communities" (84.06s)
            { src: 'coding.mp4', startFrame: 1162, duration: 150 },       // "building real AI skills" (100.20s)
          ]}
        />
        <PullQuote text="Proximity is the program" color={COLORS.gold} delay={799} duration={100} />
        <PullQuote text="That gap is widening every single day" color={COLORS.gold} delay={1419} duration={100} />
      </Sequence>

      {/* Scene 4: The Coach — multiple B-roll clips at narration cue points */}
      <Sequence from={SCENE_4_START} durationInFrames={SCENE_4_END - SCENE_4_START}>
        <ArchetypeScene
          number={3}
          title="Coach"
          titleColor={COLORS.orange}
          subtitle={'They won\'t just give you a strategy.\nThey\'ll give you a mirror.'}
          iconType="coach"
          bgColor1={COLORS.orange}
          bgColor2="#1a0a1a"
          bgColor3="#050810"
          kineticText="FILTER FOR TRUTH"
          kineticDelay={319}
          brollSrc="laptop.mp4"
          brollStartFrame={555}
          brollDuration={150}
          brollClips={[
            { src: 'laptop.mp4', startFrame: 555, duration: 150 },        // "give you a mirror" (129.12s)
            { src: 'reading.mp4', startFrame: 1076, duration: 150 },      // "lifelong learners" (146.48s)
          ]}
        />
        <PullQuote text="They'll give you a mirror" color={COLORS.orange} delay={509} duration={100} />
        <PullQuote text="They're endlessly curious — they're lifelong learners" color={COLORS.orange} delay={1028} duration={120} />
      </Sequence>

      <Sequence from={SCENE_5_START} durationInFrames={SCENE_5_END - SCENE_5_START}>
        <SceneBridge />
      </Sequence>

      <Sequence from={SCENE_6_START} durationInFrames={SCENE_6_END - SCENE_6_START}>
        <SceneCTA />
      </Sequence>

      {/* Global film grain overlay for cinematic feel */}
      <NoiseOverlay opacity={0.04} animate />
    </AbsoluteFill>
  );
};
