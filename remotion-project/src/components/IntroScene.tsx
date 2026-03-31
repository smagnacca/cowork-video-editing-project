import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  OffthreadVideo,
  staticFile,
} from 'remotion';
import { ParticleField } from './ParticleField';
import { NoiseOverlay } from './NoiseOverlay';
import { LiquidReveal, CrossfadeTransition } from './SceneTransition';

// ─── Local types ──────────────────────────────────────────────────────────────
interface VideoColors {
  bg: string; accent1: string; accent2: string; accent3: string;
  textPrimary: string; textSecondary: string;
}
interface EffectsConfig {
  particles: boolean; noiseOverlay: boolean;
  sceneTransitions: 'liquid' | 'crossfade' | 'none';
  hueShift: boolean; kineticStyle: 'spring-glow' | 'typewriter' | 'marker-highlight';
}
interface SceneConfig {
  type: string; accentColor: string;
  hookText?: string; hookColor?: string; topicTitle?: string; topicSubtitle?: string;
  speakerName?: string; speakerTitle?: string;
  kineticText?: string; kineticColor?: string; avatarSrc?: string;
  timing: { startFrame: number; endFrame: number };
}

// ─── Color resolver ───────────────────────────────────────────────────────────
const rc = (ref: string | undefined, colors: VideoColors, fallback: string): string => {
  if (!ref) return fallback;
  const m: Record<string, string> = {
    accent1: colors.accent1, accent2: colors.accent2, accent3: colors.accent3,
    bg: colors.bg, textPrimary: colors.textPrimary, textSecondary: colors.textSecondary,
  };
  return m[ref] || ref;
};

// ─── Phase opacity helper (smooth crossfades) ─────────────────────────────────
const phaseOpacity = (frame: number, enter: number, exit: number, fade = 18): number => {
  if (frame < enter || frame > exit) return 0;
  const inFade  = Math.min(1, (frame - enter) / fade);
  const outFade = Math.min(1, (exit - frame) / fade);
  return Math.min(inFade, outFade);
};

// ─── Word-by-word sparkle text build ─────────────────────────────────────────
const SparkleWords: React.FC<{
  words: string[]; color: string; fontSize?: number;
  startFrame: number; stagger?: number;
}> = ({ words, color, fontSize = 54, startFrame, stagger = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '12px 16px',
      justifyContent: 'center', maxWidth: 720,
    }}>
      {words.map((word, i) => {
        const wf = Math.max(0, frame - (startFrame + i * stagger));
        const ent = spring({ frame: wf, fps, config: { damping: 12, stiffness: 110 } });
        // Sparkle: intensity peaks briefly right as word appears then settles
        const sparkle = wf < 10
          ? interpolate(wf, [0, 4, 10], [1.5, 3.0, 1.0], { extrapolateRight: 'clamp' })
          : 1.0;
        return (
          <span key={i} style={{
            fontSize,
            fontWeight: 900,
            color,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: 2,
            opacity: ent,
            transform: `scale(${interpolate(ent, [0, 1], [0.6, 1])})`,
            display: 'inline-block',
            textShadow: `0 0 ${20 * sparkle}px ${color}90, 0 0 ${40 * sparkle}px ${color}50, 0 0 ${70 * sparkle}px ${color}25`,
          }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ─── Exponential learning curve SVG ──────────────────────────────────────────
const LearningCurve: React.FC<{
  startFrame: number; duration: number; accentColor: string; orange: string;
}> = ({ startFrame, duration, accentColor, orange }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = Math.min(1, lf / Math.max(1, duration));
  const fadeIn = spring({ frame: lf, fps, config: { damping: 16, stiffness: 60 } });

  // Curve path length (empirically ~420 for this bezier)
  const pathLength = 420;
  const dashOffset = pathLength * (1 - progress);
  const showLabel = progress > 0.88;
  const showDot = progress > 0.78;

  return (
    <div style={{ opacity: fadeIn, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        fontSize: 14, color: '#a0aec0', letterSpacing: 3, textTransform: 'uppercase',
        fontFamily: '-apple-system, sans-serif', marginBottom: 8, fontWeight: 600,
      }}>
        The Learning Curve
      </div>
      <svg viewBox="0 0 440 300" width="460" height="280">
        {/* Axes */}
        <line x1="30" y1="20" x2="30" y2="270" stroke="#ffffff20" strokeWidth="1.5" />
        <line x1="30" y1="270" x2="420" y2="270" stroke="#ffffff20" strokeWidth="1.5" />
        {/* Axis labels */}
        <text x="225" y="295" fill="#a0aec060" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Time</text>
        <text x="10" y="145" fill="#a0aec060" fontSize="10" textAnchor="middle" fontFamily="sans-serif" transform="rotate(-90 10 145)">Mastery</text>

        {/* Traditional path — flat, slow, dashed orange */}
        <path d="M 30 250 C 120 248, 250 235, 415 215"
          fill="none" stroke={orange} strokeWidth="2"
          strokeDasharray="7 4" opacity={0.55}
        />
        <text x="230" y="232" fill={orange} fontSize="11" textAnchor="middle"
          fontFamily="sans-serif" opacity={0.75}>Traditional: 25 years</text>

        {/* Exponential curve — animated, cyan */}
        <path
          d="M 30 268 C 180 265, 330 210, 415 22"
          fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={pathLength} strokeDashoffset={dashOffset}
          style={{ filter: `drop-shadow(0 0 6px ${accentColor}90)` }}
        />

        {/* Endpoint dot */}
        {showDot && (
          <circle cx="415" cy="22" r={interpolate(progress, [0.78, 1], [0, 7], { extrapolateRight: 'clamp' })}
            fill={accentColor} style={{ filter: `drop-shadow(0 0 12px ${accentColor})` }} />
        )}

        {/* Compressed label */}
        {showLabel && (
          <g opacity={interpolate(progress, [0.88, 1], [0, 1], { extrapolateRight: 'clamp' })}>
            <line x1="415" y1="22" x2="355" y2="55" stroke={accentColor} strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
            <text x="348" y="52" fill={accentColor} fontSize="12" textAnchor="end"
              fontFamily="sans-serif" fontWeight="700">Compressed</text>
          </g>
        )}

        {/* Start/end markers */}
        <text x="30" y="287" fill="#a0aec050" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Start</text>
        <text x="415" y="287" fill="#a0aec050" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Now</text>
      </svg>
    </div>
  );
};

// ─── Phase 1: Credential card ─────────────────────────────────────────────────
const CredentialCard: React.FC<{ opacity: number; colors: VideoColors; accentColor: string }> = ({ opacity, colors, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent = spring({ frame: Math.max(0, frame), fps, config: { damping: 16, stiffness: 70 } });
  const glow = 0.5 + Math.sin(frame * 0.05) * 0.3;

  return (
    <div style={{
      opacity: opacity * ent,
      transform: `translateY(${interpolate(ent, [0, 1], [20, 0])}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    }}>
      {/* Logo ring */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        border: `2px solid ${accentColor}60`, background: `${accentColor}10`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 ${30 * glow}px ${accentColor}40`,
        fontSize: 32,
      }}>
        🧠
      </div>
      <div style={{
        fontSize: 26, fontWeight: 700, color: colors.textPrimary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'center', letterSpacing: -0.5,
      }}>
        Scott Magnacca
      </div>
      <div style={{
        height: 2, width: 120,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity: 0.7,
      }} />
      <div style={{
        fontSize: 18, fontWeight: 400, color: colors.textSecondary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase',
      }}>
        Co-Founder
      </div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: accentColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'center',
        textShadow: `0 0 15px ${accentColor}60`,
      }}>
        Salesforlife.ai
      </div>
    </div>
  );
};

// ─── Phase 2: 25 Years flash text ────────────────────────────────────────────
const YearsFlash: React.FC<{ opacity: number; colors: VideoColors }> = ({ opacity, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // "25 YEARS" slams in first, then "IN FINANCIAL SERVICES" fades below
  const numEnt = spring({ frame: Math.max(0, frame - 125), fps, config: { damping: 10, stiffness: 120 } });
  const labelEnt = spring({ frame: Math.max(0, frame - 162), fps, config: { damping: 14, stiffness: 80 } });

  return (
    <div style={{ opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* "25" — large, punchy */}
      <div style={{
        fontSize: 160, fontWeight: 900, color: '#ffffff', lineHeight: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        opacity: numEnt,
        transform: `scale(${interpolate(numEnt, [0, 1], [0.5, 1])})`,
        textShadow: `0 0 30px #ffffff80, 0 0 60px #ffffff40`,
        letterSpacing: -8,
      }}>
        25
      </div>
      {/* "YEARS" */}
      <div style={{
        fontSize: 44, fontWeight: 800, color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        letterSpacing: 12, textTransform: 'uppercase',
        opacity: numEnt,
        transform: `translateY(${interpolate(numEnt, [0, 1], [20, 0])}px)`,
      }}>
        YEARS
      </div>
      {/* Accent line */}
      <div style={{
        height: 2, width: interpolate(labelEnt, [0, 1], [0, 280]),
        background: `linear-gradient(90deg, transparent, ${colors.accent2}, transparent)`,
        opacity: labelEnt,
      }} />
      {/* "IN FINANCIAL SERVICES" */}
      <div style={{
        fontSize: 22, fontWeight: 600, color: colors.textSecondary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        letterSpacing: 4, textTransform: 'uppercase',
        opacity: labelEnt,
        transform: `translateY(${interpolate(labelEnt, [0, 1], [15, 0])}px)`,
      }}>
        in Financial Services
      </div>
    </div>
  );
};

// ─── Phase 4: Gold sparkle words for "change the way..." ─────────────────────
const ChangeWords: React.FC<{ opacity: number; accentColor: string }> = ({ opacity, accentColor }) => {
  // Whisper timestamps relative to when Scott says "change" (f535) and subsequent words
  // Stagger each word group in at its whisper-timed frame
  const lines = [
    { words: ['CHANGE THE WAY'], startFrame: 535 },
    { words: ['YOU WORK,'], startFrame: 557 },
    { words: ['LEAD'], startFrame: 571 },
    { words: ['& GROW'], startFrame: 606 },
    { words: ['IN THE NEXT', '12 MONTHS'], startFrame: 627 },
  ];

  return (
    <div style={{
      opacity,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 8, maxWidth: 780,
    }}>
      <div style={{
        fontSize: 14, color: '#a0aec0', letterSpacing: 3, textTransform: 'uppercase',
        fontFamily: 'sans-serif', marginBottom: 4, opacity: 0.7,
      }}>
        The potential to
      </div>
      {lines.map((line, li) => (
        <SparkleWords
          key={li}
          words={line.words}
          color={accentColor}
          fontSize={li === 0 ? 50 : li === 3 || li === 4 ? 40 : 52}
          startFrame={line.startFrame}
          stagger={6}
        />
      ))}
    </div>
  );
};

// ─── Phase 5: Hook + Topic reveal ────────────────────────────────────────────
const TopicReveal: React.FC<{
  opacity: number; hookText: string; topicTitle: string;
  topicSubtitle?: string; hookColor: string; accentColor: string; colors: VideoColors;
}> = ({ opacity, hookText, topicTitle, topicSubtitle, hookColor, accentColor, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent1 = spring({ frame: Math.max(0, frame - 691), fps, config: { damping: 14, stiffness: 80 } });
  const ent2 = spring({ frame: Math.max(0, frame - 706), fps, config: { damping: 16, stiffness: 70 } });
  const ent3 = spring({ frame: Math.max(0, frame - 716), fps, config: { damping: 16, stiffness: 70 } });

  return (
    <div style={{
      opacity, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 14,
    }}>
      <div style={{
        fontSize: 36, fontWeight: 900, color: hookColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center',
        opacity: ent1, transform: `scale(${interpolate(ent1, [0, 1], [0.8, 1])})`,
        textShadow: `0 0 20px ${hookColor}80, 0 0 40px ${hookColor}40`,
      }}>
        {hookText}
      </div>
      <div style={{
        height: 2, width: 200,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity: ent2,
      }} />
      <div style={{
        fontSize: 26, fontWeight: 700, color: colors.textPrimary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'center', maxWidth: 680, lineHeight: 1.3,
        opacity: ent2, transform: `translateY(${interpolate(ent2, [0, 1], [20, 0])}px)`,
      }}>
        {topicTitle}
      </div>
      {topicSubtitle && (
        <div style={{
          fontSize: 16, fontWeight: 400, color: colors.textSecondary,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center',
          opacity: ent3,
        }}>
          {topicSubtitle}
        </div>
      )}
    </div>
  );
};

// ─── IntroScene ───────────────────────────────────────────────────────────────
export const IntroScene: React.FC<{
  scene: SceneConfig; colors: VideoColors; effects: EffectsConfig;
}> = ({ scene, colors, effects }) => {
  const frame = useCurrentFrame();
  const sceneDuration = scene.timing.endFrame - scene.timing.startFrame;
  const accentColor = rc(scene.accentColor, colors, colors.accent1);
  const hookColor   = rc(scene.hookColor, colors, colors.accent2);
  const hookText    = scene.hookText ?? "YOUR EDGE ISN'T WHAT YOU THINK";
  const topicTitle  = scene.topicTitle ?? '';
  const topicSubtitle = scene.topicSubtitle;

  // ── Phase opacities (Whisper-timed) ──────────────────────────────────────
  const op1 = phaseOpacity(frame, 0, 135, 20);         // Credential: 0–f135
  const op2 = phaseOpacity(frame, 125, 370, 18);       // 25 Years: f125–f370
  const op3 = phaseOpacity(frame, 362, 486, 18);       // Curve: f362–f486
  const op4 = phaseOpacity(frame, 476, 700, 18);       // Sparkle: f476–f700
  const op5 = phaseOpacity(frame, 691, sceneDuration, 18); // Topic: f691–end

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>

      {/* ── Background ──────────────────────────────────────────────────────── */}
      <AbsoluteFill style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, #050810 50%, ${colors.bg} 100%)`,
      }} />

      {/* ── Particles ───────────────────────────────────────────────────────── */}
      {effects.particles && (
        <ParticleField color={accentColor} count={25} seed={99} intensity={0.5} />
      )}

      {/* ── Avatar — RIGHT HALF ─────────────────────────────────────────────── */}
      {/* CRITICAL: Never use objectFit/objectPosition on OffthreadVideo — Remotion's headless
          renderer ignores CSS objectFit, causing the full 1920×1080 video to overflow the
          container rightward. Always use explicit px dimensions instead. */}
      {scene.avatarSrc && (
        <div style={{
          position: 'absolute', right: 0, top: 0, width: 960, height: 1080,
          overflow: 'hidden', backgroundColor: colors.bg,
        }}>
          {/* Render at full 1920×1080, anchored right — overflow:hidden clips to right 960px */}
          <OffthreadVideo
            src={staticFile(scene.avatarSrc)}
            style={{ position: 'absolute', right: 0, top: 0, width: 1920, height: 1080 }}
          />
          {/* Feather left edge so avatar blends into left panel */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 120, height: 1080,
            background: `linear-gradient(90deg, ${colors.bg}, transparent)`,
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* ── Left panel — phased content ──────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 960, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 60px',
      }}>
        {/* Phase 1: Credential card */}
        {op1 > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <CredentialCard opacity={op1} colors={colors} accentColor={accentColor} />
          </div>
        )}

        {/* Phase 2: 25 Years */}
        {op2 > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <YearsFlash opacity={op2} colors={colors} />
          </div>
        )}

        {/* Phase 3: Learning Curve */}
        {op3 > 0.01 && (
          <div style={{ position: 'absolute', opacity: op3 }}>
            <LearningCurve
              startFrame={362} duration={80}
              accentColor={accentColor} orange={colors.accent3}
            />
          </div>
        )}

        {/* Phase 4: Sparkle words */}
        {op4 > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <ChangeWords opacity={op4} accentColor={colors.accent2} />
          </div>
        )}

        {/* Phase 5: Topic reveal */}
        {op5 > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <TopicReveal
              opacity={op5} hookText={hookText} topicTitle={topicTitle}
              topicSubtitle={topicSubtitle} hookColor={hookColor}
              accentColor={accentColor} colors={colors}
            />
          </div>
        )}
      </div>

      {/* ── Vertical separator ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
        background: `linear-gradient(180deg, transparent 0%, ${accentColor}30 30%, ${accentColor}30 70%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Noise overlay ────────────────────────────────────────────────────── */}
      {effects.noiseOverlay && <NoiseOverlay opacity={0.04} />}

      {/* ── Scene transition ─────────────────────────────────────────────────── */}
      {effects.sceneTransitions === 'liquid' && (
        <LiquidReveal triggerFrame={sceneDuration - 15} duration={15} color={colors.bg} />
      )}
      {effects.sceneTransitions === 'crossfade' && (
        <CrossfadeTransition triggerFrame={sceneDuration - 12} duration={12} />
      )}
    </AbsoluteFill>
  );
};
