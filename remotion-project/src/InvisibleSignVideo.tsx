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
  OffthreadVideo,
  Img,
} from 'remotion';
import { ParticleField } from './components/ParticleField';
import { NoiseOverlay } from './components/NoiseOverlay';
import { KineticText } from './components/KineticText';
import { BRollPlayer } from './components/BRollPlayer';
import { TypewriterText } from './components/TypewriterText';

// ═══════════════════════════════════════════════════════════════════════════════
// EVERY CLIENT WEARS AN INVISIBLE SIGN
// Storyselling in the Age of AI — Chapter 2
// ═══════════════════════════════════════════════════════════════════════════════

const BRAND = {
  green: '#005A3B',
  greenLight: '#00804F',
  greenDark: '#003D28',
  white: '#FFFFFF',
  black: '#000000',
  bgDark: '#050505',
  textSecondary: '#b0b0b0',
  cardBg: 'rgba(0, 90, 59, 0.08)',
  cardBorder: 'rgba(0, 90, 59, 0.30)',
  greenGlow: 'rgba(0, 90, 59, 0.5)',
  gold: '#F5A623',
};

// ─── Scene frame boundaries (from Whisper timestamps × 30fps) ────────────────
const SCENE = {
  HOOK_START:    0,
  HOOK_END:      840,    // ~28s — "He read the invisible sign" at f811 + buffer
  S1_START:      840,
  S1_END:        2050,   // ~68s — ends before "Here's the question"
  S2_START:      2050,
  S2_END:        2700,   // ~90s — "What are you most proud of" + identity reveal
  S3_START:      2700,
  S3_END:        3280,   // ~109s — "Silence is truth serum" + technique
  STORY_START:   3280,
  STORY_END:     4100,   // ~136s — Maya story complete
  CTA_START:     4100,
  CTA_END:       4420,   // 147.048s × 30 = 4411 + 9f buffer
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const phaseOpacity = (frame: number, enter: number, exit: number, fade = 18): number => {
  if (frame < enter || frame > exit) return 0;
  return Math.min(Math.min(1, (frame - enter) / fade), Math.min(1, (exit - frame) / fade));
};

const sineGlow = (frame: number, speed = 0.05, min = 0.5, max = 1.0) =>
  min + (max - min) * (0.5 + 0.5 * Math.sin(frame * speed));

// ─── Reusable: Scene background ───────────────────────────────────────────────
const SceneBg: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: BRAND.bgDark }}>
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 20% 50%, ${BRAND.green}08 0%, transparent 60%),
                   radial-gradient(ellipse at 80% 20%, ${BRAND.greenDark}10 0%, transparent 50%),
                   ${BRAND.bgDark}`,
    }} />
    {children}
  </AbsoluteFill>
);

// ─── Reusable: Left/Right split wrapper ──────────────────────────────────────
const SplitLayout: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  shifted?: boolean;  // card shifted left when B-roll active
}> = ({ left, right, shifted = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {/* Left content panel */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 960, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 50px',
        transform: shifted ? 'translateX(-120px) scale(0.96)' : 'none',
        transition: 'transform 0.3s ease',
      }}>
        {left}
      </div>
      {/* Right content panel */}
      <div style={{
        position: 'absolute', right: 0, top: 0, width: 960, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {right}
      </div>
      {/* Separator */}
      <div style={{
        position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
        background: `linear-gradient(180deg, transparent, ${BRAND.green}25 30%, ${BRAND.green}25 70%, transparent)`,
      }} />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (f0–f840)
// ═══════════════════════════════════════════════════════════════════════════════

// Phase 1: "I need to think about it" — animated refusal wall
const RefusalWall: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent = spring({ frame, fps, config: { damping: 20, stiffness: 60 } });
  const phrases = [
    'I need to think about it.',
    'Let me review the numbers.',
    'I need to think about it.',
    'Send me more data.',
    'I need to think about it.',
    'Not the right time.',
    'I need to think about it.',
  ];
  return (
    <div style={{ opacity: opacity * ent, width: 820, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {phrases.map((p, i) => {
        const entI = spring({ frame: Math.max(0, frame - i * 8), fps, config: { damping: 18, stiffness: 80 } });
        const isRefusal = p.includes('think about it');
        return (
          <div key={i} style={{
            opacity: entI * (isRefusal ? 1 : 0.35),
            transform: `translateX(${interpolate(entI, [0, 1], [-30, 0])}px)`,
            fontSize: isRefusal ? 38 : 26,
            fontWeight: isRefusal ? 800 : 400,
            color: isRefusal ? BRAND.white : BRAND.textSecondary,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontStyle: isRefusal ? 'normal' : 'italic',
            letterSpacing: isRefusal ? 0.5 : 0,
            textShadow: isRefusal ? `0 0 30px ${BRAND.green}60` : 'none',
            borderLeft: isRefusal ? `3px solid ${BRAND.green}` : '3px solid transparent',
            paddingLeft: 16,
          }}>
            {p}
          </div>
        );
      })}
      <div style={{
        marginTop: 18,
        fontSize: 20, color: BRAND.textSecondary, fontFamily: 'sans-serif',
        letterSpacing: 3, textTransform: 'uppercase', opacity: 0.6,
      }}>
        Six months. Same answer. Still losing.
      </div>
    </div>
  );
};

// Phase 2: George Lucas pull quote
const LucasQuote: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent = spring({ frame: Math.max(0, frame - 160), fps, config: { damping: 16, stiffness: 65 } });
  const glow = sineGlow(frame, 0.04, 0.7, 1.0);
  return (
    <div style={{
      opacity: opacity * ent,
      transform: `translateY(${interpolate(ent, [0, 1], [24, 0])}px)`,
      maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      {/* Giant quote mark */}
      <div style={{
        fontSize: 140, color: BRAND.green, fontFamily: 'Georgia, serif',
        lineHeight: 0.7, opacity: 0.4, marginBottom: -10,
      }}>"</div>
      <div style={{
        fontSize: 40, fontWeight: 700, color: BRAND.white,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.35, fontStyle: 'italic',
        textShadow: `0 0 40px rgba(255,255,255,0.15)`,
      }}>
        George Lucas sold the Star Wars film rights for $150,000.<br />
        He kept the merchandise rights.
      </div>
      <div style={{
        fontSize: 28, fontWeight: 400, color: BRAND.textSecondary,
        fontFamily: 'sans-serif', fontStyle: 'italic', lineHeight: 1.4,
      }}>
        Nobody thought toys mattered. Lucas did.
      </div>
      <div style={{
        height: 3, width: interpolate(Math.min(1, (frame - 200) / 40), [0, 1], [0, 280]),
        background: `linear-gradient(90deg, ${BRAND.green}, transparent)`,
        marginTop: 4,
      }} />
      <div style={{
        fontSize: 18, color: BRAND.green, letterSpacing: 3, textTransform: 'uppercase',
        fontFamily: 'sans-serif', fontWeight: 700,
        textShadow: `0 0 ${20 * glow}px ${BRAND.green}`,
        opacity: frame > 220 ? 1 : 0,
      }}>
        He read the invisible sign.
      </div>
    </div>
  );
};

// Phase 3: Kinetic headline slam
const InvisibleSignSlam: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ['THE', 'INVISIBLE', 'SIGN'];
  return (
    <div style={{
      opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        fontSize: 22, color: BRAND.textSecondary, letterSpacing: 4,
        textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: 4,
      }}>
        He read
      </div>
      {words.map((word, i) => {
        const wf = Math.max(0, frame - (420 + i * 14));
        const ent = spring({ frame: wf, fps, config: { damping: 10, stiffness: 120 } });
        const glow = wf < 12
          ? interpolate(wf, [0, 5, 12], [2.5, 4.0, 1.0], { extrapolateRight: 'clamp' })
          : 1.0;
        const sizes = [72, 120, 72];
        return (
          <div key={i} style={{
            fontSize: sizes[i], fontWeight: 900, color: i === 1 ? BRAND.green : BRAND.white,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase', letterSpacing: i === 1 ? 6 : 3,
            opacity: ent,
            transform: `scale(${interpolate(ent, [0, 1], [0.4, 1])}) translateY(${interpolate(ent, [0, 1], [30, 0])}px)`,
            textShadow: i === 1
              ? `0 0 ${30 * glow}px ${BRAND.green}, 0 0 ${60 * glow}px ${BRAND.green}70`
              : `0 0 ${20 * glow}px rgba(255,255,255,0.5)`,
          }}>
            {word}
          </div>
        );
      })}
    </div>
  );
};

// Phase 4: Title card
const TitleCard: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent = spring({ frame: Math.max(0, frame - 660), fps, config: { damping: 16, stiffness: 65 } });
  const glow = sineGlow(frame, 0.04, 0.6, 1.0);
  return (
    <div style={{
      opacity: opacity * ent,
      transform: `translateY(${interpolate(ent, [0, 1], [20, 0])}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, maxWidth: 820,
    }}>
      <div style={{
        fontSize: 16, color: BRAND.green, letterSpacing: 4, textTransform: 'uppercase',
        fontFamily: 'sans-serif', fontWeight: 700,
      }}>
        Storyselling in the Age of AI · Chapter 2
      </div>
      <div style={{
        height: 3, width: 120,
        background: `linear-gradient(90deg, ${BRAND.green}, transparent)`,
      }} />
      <div style={{
        fontSize: 72, fontWeight: 900, color: BRAND.white,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.1, letterSpacing: -1,
        textShadow: `0 0 ${40 * glow}px rgba(255,255,255,0.1)`,
      }}>
        Every Client Wears an Invisible Sign
      </div>
      <div style={{
        fontSize: 30, color: BRAND.textSecondary,
        fontFamily: 'sans-serif', fontStyle: 'italic',
      }}>
        Can you read it?
      </div>
    </div>
  );
};

const HookScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame, duration }) => {
  const op1 = phaseOpacity(localFrame, 0, 175, 20);
  const op2 = phaseOpacity(localFrame, 155, 420, 20);
  const op3 = phaseOpacity(localFrame, 400, 665, 20);
  const op4 = phaseOpacity(localFrame, 645, duration, 20);
  const brollActive = localFrame > 160 && localFrame < 660;
  const shiftProgress = spring({
    frame: Math.max(0, brollActive ? localFrame - 160 : -(localFrame - 660)),
    fps: 30,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={22} seed={42} intensity={0.6} />
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        fontSize: 16, color: BRAND.green, letterSpacing: 4, textTransform: 'uppercase',
        fontFamily: 'sans-serif', opacity: 0.6, fontWeight: 600,
      }}>
        The Question That Changed Everything
      </div>

      {/* Left panel */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 960, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 60px',
        transform: brollActive
          ? `translateX(${interpolate(shiftProgress, [0,1], [0, -80])}px) scale(${interpolate(shiftProgress, [0,1], [1, 0.96])})`
          : 'none',
      }}>
        {op1 > 0.01 && <div style={{ position: 'absolute' }}><RefusalWall opacity={op1} /></div>}
        {op2 > 0.01 && <div style={{ position: 'absolute' }}><LucasQuote opacity={op2} /></div>}
        {op3 > 0.01 && <div style={{ position: 'absolute' }}><InvisibleSignSlam opacity={op3} /></div>}
        {op4 > 0.01 && <div style={{ position: 'absolute' }}><TitleCard opacity={op4} /></div>}
      </div>

      {/* Right panel — B-roll for middle phases */}
      {brollActive && (
        <div style={{
          position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)',
          opacity: phaseOpacity(localFrame, 160, 660, 25),
        }}>
          <BRollPlayer
            src="conference.mp4"
            width={720} height={405}
            accentColor={BRAND.green}
            caption="The same pitch. The same answer."
          />
        </div>
      )}

      {/* Vertical separator */}
      <div style={{
        position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
        background: `linear-gradient(180deg, transparent, ${BRAND.green}25 30%, ${BRAND.green}25 70%, transparent)`,
      }} />
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — THE THREE SIGNS (f840–f2050)
// ═══════════════════════════════════════════════════════════════════════════════

// Sign graphic — the "invisible sign" visualization
// viewBox="0 0 780 460" rendered at ~780px wide
// fontSize checks: 42 / 780 × 780 = 42px ✓, 28 → 28px ✓
const SignGraphic: React.FC<{
  label: string; subtext: string; icon: string;
  color: string; startFrame: number; opacity: number;
}> = ({ label, subtext, icon, color, startFrame, opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const ent = spring({ frame: lf, fps, config: { damping: 14, stiffness: 70 } });
  const glow = sineGlow(frame, 0.06, 0.6, 1.0);
  const signSwing = interpolate(lf, [0, 30, 50, 70], [0, -3, 2, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      opacity: opacity * ent,
      transform: `scale(${interpolate(ent, [0, 1], [0.85, 1])}) translateY(${interpolate(ent, [0, 1], [30, 0])}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
    }}>
      {/* Sign chain */}
      <div style={{ display: 'flex', gap: 60 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ width: 3, height: 40, background: `${color}60`, marginBottom: -2 }} />
        ))}
      </div>
      {/* Sign board */}
      <div style={{
        transform: `rotate(${signSwing}deg)`,
        background: `linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.98))`,
        border: `2px solid ${color}`,
        borderRadius: 12,
        padding: '28px 40px',
        width: 680,
        boxShadow: `0 0 ${30 * glow}px ${color}40, 0 0 ${60 * glow}px ${color}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <div style={{ fontSize: 64 }}>{icon}</div>
        <div style={{
          fontSize: 42, fontWeight: 900, color, textTransform: 'uppercase',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: 3, textAlign: 'center',
          textShadow: `0 0 ${20 * glow}px ${color}90`,
        }}>
          {label}
        </div>
        <div style={{
          height: 2, width: 200,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }} />
        <div style={{
          fontSize: 28, fontWeight: 600, color: BRAND.white,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          textAlign: 'center', lineHeight: 1.3, opacity: 0.9,
        }}>
          "{subtext}"
        </div>
      </div>
    </div>
  );
};

const ThreeSignsScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame, duration }) => {
  // Whisper-timed triggers (relative to scene start f840)
  // f1306 "The builder" → local f466
  // f1492 "The protector" → local f652
  // f1668 "The achiever" → local f828
  // f1857 "Most advisors pitch" → local f1017
  const lf = localFrame;

  const opIntro   = phaseOpacity(lf, 0, 480, 20);
  const opBuilder = phaseOpacity(lf, 440, 700, 20);
  const opProt    = phaseOpacity(lf, 650, 900, 20);
  const opAchiev  = phaseOpacity(lf, 860, 1100, 20);
  const opSynth   = phaseOpacity(lf, 1010, duration, 20);

  const brollActive = lf > 650 && lf < 1100;

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={18} seed={7} intensity={0.5} />

      {/* Kinetic label — top */}
      <div style={{
        position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
        fontSize: 16, color: BRAND.green, letterSpacing: 4, textTransform: 'uppercase',
        fontFamily: 'sans-serif', fontWeight: 700, opacity: 0.7,
      }}>
        Secret #1 — Read the Invisible Sign
      </div>

      {/* Left panel */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: brollActive ? 920 : 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: brollActive ? '0 40px' : '0 80px',
      }}>
        {/* Intro: Role Theory explanation */}
        {opIntro > 0.01 && (
          <div style={{
            position: 'absolute',
            opacity: opIntro, maxWidth: 900,
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{
              fontSize: 52, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              lineHeight: 1.2,
            }}>
              Every person walks into the room{' '}
              <span style={{ color: BRAND.green }}>already playing a role.</span>
            </div>
            <div style={{
              fontSize: 30, color: BRAND.textSecondary, fontFamily: 'sans-serif',
              lineHeight: 1.5, maxWidth: 800,
            }}>
              Role theory: they've been rehearsing it for years.<br />
              Your client is wearing a sign that tells you exactly what they need to say yes.
            </div>
            <div style={{ display: 'flex', gap: 30, marginTop: 10 }}>
              {['SAFE', 'VALUED', 'READY'].map((w, i) => {
                const wf = Math.max(0, lf - (60 + i * 20));
                const entW = spring({ frame: wf, fps: 30, config: { damping: 14, stiffness: 90 } });
                return (
                  <div key={i} style={{
                    padding: '12px 28px',
                    border: `1px solid ${BRAND.green}60`,
                    borderRadius: 8,
                    background: BRAND.cardBg,
                    fontSize: 26, fontWeight: 800, color: BRAND.green,
                    fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase',
                    opacity: entW,
                    transform: `translateY(${interpolate(entW, [0, 1], [16, 0])}px)`,
                    textShadow: `0 0 20px ${BRAND.green}60`,
                  }}>
                    {w}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Builder sign */}
        {opBuilder > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <SignGraphic
              label="The Builder" subtext="Help me grow this"
              icon="🏗️" color={BRAND.green} startFrame={440} opacity={opBuilder}
            />
          </div>
        )}

        {/* Protector sign */}
        {opProt > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <SignGraphic
              label="The Protector" subtext="Don't let me lose what I built"
              icon="🛡️" color={BRAND.white} startFrame={650} opacity={opProt}
            />
          </div>
        )}

        {/* Achiever sign */}
        {opAchiev > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <SignGraphic
              label="The Achiever" subtext="Recognize what I accomplished"
              icon="🏆" color={BRAND.gold} startFrame={860} opacity={opAchiev}
            />
          </div>
        )}

        {/* Synthesis: "Most advisors pitch the same..." */}
        {opSynth > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opSynth,
            display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900,
          }}>
            <div style={{
              fontSize: 52, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              lineHeight: 1.2,
            }}>
              Most advisors pitch the{' '}
              <span style={{
                color: BRAND.green,
                textDecoration: 'line-through',
                textDecorationColor: `${BRAND.green}80`,
              }}>same product</span>
              {' '}to all three.
            </div>
            <div style={{
              fontSize: 40, fontWeight: 700, color: BRAND.textSecondary,
              fontFamily: 'sans-serif', fontStyle: 'italic',
            }}>
              That's why they keep hearing:
            </div>
            <div style={{
              fontSize: 52, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              borderLeft: `4px solid ${BRAND.green}`,
              paddingLeft: 24,
              fontStyle: 'italic',
            }}>
              "I need to think about it."
            </div>
          </div>
        )}
      </div>

      {/* Right B-roll panel */}
      {brollActive && (
        <div style={{
          position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)',
          opacity: phaseOpacity(lf, 650, 1100, 25),
        }}>
          <BRollPlayer
            src="teamwork.mp4"
            width={720} height={405}
            accentColor={BRAND.green}
            caption="Every client is already telling you who they are"
          />
        </div>
      )}

      {brollActive && (
        <div style={{
          position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
          background: `linear-gradient(180deg, transparent, ${BRAND.green}25 30%, ${BRAND.green}25 70%, transparent)`,
        }} />
      )}
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — THE MAGIC QUESTION (f2050–f2700)
// ═══════════════════════════════════════════════════════════════════════════════

const MagicQuestionScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame, duration }) => {
  const lf = localFrame;
  // f2100 "invisible sign" → local f50
  // f2124 "What are you most proud of?" → local f74
  // f2302 "They're handing you their identity" → local f252
  // f2349 "A builder tells you what they created" → local f299

  const opSetup    = phaseOpacity(lf, 0, 90, 20);
  const opQuestion = phaseOpacity(lf, 70, 380, 20);
  const opIdentity = phaseOpacity(lf, 360, duration, 20);

  const brollActive = lf > 360;

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={20} seed={13} intensity={0.55} />

      <div style={{
        position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
        fontSize: 16, color: BRAND.green, letterSpacing: 4, textTransform: 'uppercase',
        fontFamily: 'sans-serif', fontWeight: 700, opacity: 0.7,
      }}>
        Secret #2 — The Magic Question
      </div>

      {/* Left panel */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: brollActive ? 920 : 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 60px',
        transform: brollActive ? 'translateX(-60px) scale(0.97)' : 'none',
      }}>

        {/* Setup */}
        {opSetup > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opSetup,
            display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 860,
          }}>
            <div style={{
              fontSize: 44, fontWeight: 800, color: BRAND.white,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              lineHeight: 1.25,
            }}>
              Here's the question that unlocks{' '}
              <span style={{ color: BRAND.green }}>every invisible sign.</span>
            </div>
          </div>
        )}

        {/* THE BIG QUESTION — word by word spring build */}
        {opQuestion > 0.01 && (() => {
          const words = ['WHAT', 'ARE', 'YOU', 'MOST', 'PROUD', 'OF?'];
          return (
            <div style={{
              position: 'absolute', opacity: opQuestion,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', justifyContent: 'center', maxWidth: 820 }}>
                {words.map((word, i) => {
                  const wf = Math.max(0, lf - (80 + i * 12));
                  const ent = spring({ frame: wf, fps: 30, config: { damping: 10, stiffness: 115 } });
                  const glow = wf < 14
                    ? interpolate(wf, [0, 5, 14], [2.5, 4.0, 1.0], { extrapolateRight: 'clamp' })
                    : 1.0;
                  const isProud = word === 'PROUD';
                  return (
                    <span key={i} style={{
                      fontSize: isProud ? 110 : 96,
                      fontWeight: 900,
                      color: isProud ? BRAND.green : BRAND.white,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      textTransform: 'uppercase', letterSpacing: 2,
                      opacity: ent,
                      transform: `scale(${interpolate(ent, [0, 1], [0.4, 1])}) translateY(${interpolate(ent, [0, 1], [28, 0])}px)`,
                      display: 'inline-block',
                      textShadow: isProud
                        ? `0 0 ${30 * glow}px ${BRAND.green}, 0 0 ${60 * glow}px ${BRAND.green}70`
                        : `0 0 ${20 * glow}px rgba(255,255,255,0.4)`,
                    }}>
                      {word}
                    </span>
                  );
                })}
              </div>
              <div style={{
                fontSize: 26, color: BRAND.textSecondary, fontFamily: 'sans-serif',
                letterSpacing: 3, textTransform: 'uppercase', marginTop: 8,
                opacity: lf > 170 ? phaseOpacity(lf, 170, 380, 18) : 0,
              }}>
                Four words. That's it.
              </div>
            </div>
          );
        })()}

        {/* Identity reveal */}
        {opIdentity > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opIdentity,
            display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 880,
          }}>
            <div style={{
              fontSize: 38, fontWeight: 800, color: BRAND.white,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              lineHeight: 1.3,
            }}>
              They're not giving you data.{' '}
              <span style={{ color: BRAND.green }}>They're handing you their identity.</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
              {[
                { type: 'Builder', says: 'tells you what they created.', color: BRAND.green, icon: '🏗️', frame: 380 },
                { type: 'Protector', says: 'tells you what they preserved.', color: BRAND.white, icon: '🛡️', frame: 420 },
                { type: 'Achiever', says: 'tells you a milestone that proves something.', color: BRAND.gold, icon: '🏆', frame: 460 },
              ].map((item, i) => {
                const ef = Math.max(0, lf - item.frame);
                const ent = spring({ frame: ef, fps: 30, config: { damping: 14, stiffness: 80 } });
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 22px',
                    background: BRAND.cardBg,
                    border: `1px solid ${item.color}30`,
                    borderRadius: 10,
                    opacity: ent,
                    transform: `translateX(${interpolate(ent, [0, 1], [-30, 0])}px)`,
                  }}>
                    <span style={{ fontSize: 36 }}>{item.icon}</span>
                    <div>
                      <span style={{ fontSize: 28, fontWeight: 800, color: item.color, fontFamily: 'sans-serif' }}>
                        A {item.type}{' '}
                      </span>
                      <span style={{ fontSize: 28, color: BRAND.white, fontFamily: 'sans-serif' }}>
                        {item.says}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              fontSize: 26, color: BRAND.textSecondary, fontFamily: 'sans-serif',
              fontStyle: 'italic', marginTop: 6,
              borderLeft: `3px solid ${BRAND.green}`,
              paddingLeft: 16,
              opacity: lf > 500 ? phaseOpacity(lf, 500, duration, 18) : 0,
            }}>
              Listen for the first thing they say. That's the real answer.
            </div>
          </div>
        )}
      </div>

      {/* Right B-roll */}
      {brollActive && (
        <div style={{
          position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)',
          opacity: phaseOpacity(lf, 360, duration, 25),
        }}>
          <BRollPlayer
            src="reading.mp4"
            width={720} height={405}
            accentColor={BRAND.green}
            caption="Their first answer is the real answer"
          />
        </div>
      )}

      {brollActive && (
        <div style={{
          position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
          background: `linear-gradient(180deg, transparent, ${BRAND.green}25 30%, ${BRAND.green}25 70%, transparent)`,
        }} />
      )}
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — SILENCE IS TRUTH SERUM (f2700–f3280)
// ═══════════════════════════════════════════════════════════════════════════════

const SilenceScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame, duration }) => {
  const lf = localFrame;
  // f2711 "Silence" → local f11
  // f2766 "After you ask" → local f66
  // f3027 "Here's the technique" → local f327

  const opSlam      = phaseOpacity(lf, 0, 200, 20);
  const opContext   = phaseOpacity(lf, 190, 400, 20);
  const opTechnique = phaseOpacity(lf, 380, duration, 20);

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={16} seed={55} intensity={0.4} />

      <div style={{
        position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
        fontSize: 16, color: BRAND.green, letterSpacing: 4, textTransform: 'uppercase',
        fontFamily: 'sans-serif', fontWeight: 700, opacity: 0.7,
      }}>
        Secret #3 — The Silence Technique
      </div>

      {/* Full width — no B-roll split for silence scene — max visual impact */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 120px 0',
      }}>

        {/* SLAM: SILENCE IS TRUTH SERUM */}
        {opSlam > 0.01 && (() => {
          const words = [
            { text: 'SILENCE', size: 144, color: BRAND.white },
            { text: 'IS', size: 72, color: BRAND.textSecondary },
            { text: 'TRUTH', size: 144, color: BRAND.green },
            { text: 'SERUM.', size: 72, color: BRAND.white },
          ];
          return (
            <div style={{
              position: 'absolute', opacity: opSlam,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              {words.map((w, i) => {
                const wf = Math.max(0, lf - i * 10);
                const ent = spring({ frame: wf, fps: 30, config: { damping: 11, stiffness: 100 } });
                const glow = wf < 15
                  ? interpolate(wf, [0, 5, 15], [2.0, 3.5, 1.0], { extrapolateRight: 'clamp' })
                  : 1.0;
                return (
                  <div key={i} style={{
                    fontSize: w.size, fontWeight: 900, color: w.color,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    letterSpacing: w.size > 100 ? 6 : 8,
                    textTransform: 'uppercase', lineHeight: 1.05,
                    opacity: ent,
                    transform: `scale(${interpolate(ent, [0, 1], [0.5, 1])})`,
                    textShadow: w.color === BRAND.green
                      ? `0 0 ${40 * glow}px ${BRAND.green}, 0 0 ${80 * glow}px ${BRAND.green}60`
                      : `0 0 ${20 * glow}px rgba(255,255,255,0.3)`,
                  }}>
                    {w.text}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Context: what most advisors do wrong */}
        {opContext > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opContext,
            display: 'flex', gap: 60, alignItems: 'stretch', maxWidth: 1500,
          }}>
            {/* Wrong way */}
            <div style={{
              flex: 1, padding: '40px 50px',
              background: 'rgba(255,50,50,0.05)',
              border: '2px solid rgba(255,80,80,0.25)',
              borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{ fontSize: 52, textAlign: 'center' }}>❌</div>
              <div style={{
                fontSize: 36, fontWeight: 900, color: '#ff6b6b',
                fontFamily: 'sans-serif', textAlign: 'center', letterSpacing: 1,
              }}>
                Most Advisors
              </div>
              <div style={{
                fontSize: 26, color: BRAND.white, fontFamily: 'sans-serif',
                textAlign: 'center', lineHeight: 1.4,
              }}>
                Fill the silence with more data. More slides. More information.
              </div>
              <div style={{
                fontSize: 22, color: '#ff6b6b', fontFamily: 'sans-serif',
                textAlign: 'center', fontStyle: 'italic',
              }}>
                That's the mistake.
              </div>
            </div>
            {/* Right way */}
            <div style={{
              flex: 1, padding: '40px 50px',
              background: BRAND.cardBg,
              border: `2px solid ${BRAND.green}40`,
              borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{ fontSize: 52, textAlign: 'center' }}>✅</div>
              <div style={{
                fontSize: 36, fontWeight: 900, color: BRAND.green,
                fontFamily: 'sans-serif', textAlign: 'center', letterSpacing: 1,
              }}>
                Truth Serum
              </div>
              <div style={{
                fontSize: 26, color: BRAND.white, fontFamily: 'sans-serif',
                textAlign: 'center', lineHeight: 1.4,
              }}>
                Ask the question. Then stop. The words they search for are the ones that matter.
              </div>
              <div style={{
                fontSize: 22, color: BRAND.green, fontFamily: 'sans-serif',
                textAlign: 'center', fontStyle: 'italic',
              }}>
                Let them reach for the words.
              </div>
            </div>
          </div>
        )}

        {/* The Technique — 4 steps */}
        {opTechnique > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opTechnique,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 1200,
          }}>
            <div style={{
              fontSize: 48, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif',
            }}>
              The <span style={{ color: BRAND.green }}>4-Step</span> Technique
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { num: '1', text: 'Ask the question', sub: '"What are you most proud of?"', icon: '🎯' },
                { num: '2', text: 'Count to ten', sub: 'Silently. Don\'t speak.', icon: '🔢' },
                { num: '3', text: 'Let them reach', sub: 'The searched-for words are the real answer.', icon: '🤫' },
                { num: '4', text: 'Mirror it back', sub: 'Build your entire pitch around what they said.', icon: '🪞' },
              ].map((step, i) => {
                const sf = Math.max(0, lf - (380 + i * 18));
                const entS = spring({ frame: sf, fps: 30, config: { damping: 14, stiffness: 80 } });
                return (
                  <div key={i} style={{
                    flex: 1, padding: '28px 24px',
                    background: BRAND.cardBg,
                    border: `1px solid ${BRAND.green}35`,
                    borderRadius: 14,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    opacity: entS,
                    transform: `translateY(${interpolate(entS, [0, 1], [30, 0])}px)`,
                    boxShadow: `0 0 ${20 * sineGlow(lf + i * 20, 0.05, 0.5, 1.0)}px ${BRAND.green}20`,
                  }}>
                    <div style={{ fontSize: 46 }}>{step.icon}</div>
                    <div style={{
                      fontSize: 52, fontWeight: 900, color: BRAND.green,
                      fontFamily: 'sans-serif',
                    }}>
                      {step.num}
                    </div>
                    <div style={{
                      fontSize: 24, fontWeight: 800, color: BRAND.white,
                      fontFamily: 'sans-serif', textAlign: 'center',
                    }}>
                      {step.text}
                    </div>
                    <div style={{
                      fontSize: 18, color: BRAND.textSecondary,
                      fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.4,
                      fontStyle: 'italic',
                    }}>
                      {step.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — MAYA'S STORY (f3280–f4100)
// ═══════════════════════════════════════════════════════════════════════════════

const MayaScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame, duration }) => {
  const lf = localFrame;
  // f3302 Maya → local f22
  // f3621 "He said" → local f341
  // f3697 "A protector" → local f417
  // f3806 "His kids would never have to worry" → local f526
  // f3949 "She won the account" → local f669
  // f4077 "Every client you will ever meet" → local f797

  const opSetup    = phaseOpacity(lf, 0, 360, 20);
  const opQuote    = phaseOpacity(lf, 330, 550, 20);
  const opProtect  = phaseOpacity(lf, 520, 700, 20);
  const opWin      = phaseOpacity(lf, 670, duration, 20);

  const brollWin = lf > 670;

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={20} seed={88} intensity={0.55} />

      <div style={{
        position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
        fontSize: 16, color: BRAND.green, letterSpacing: 4, textTransform: 'uppercase',
        fontFamily: 'sans-serif', fontWeight: 700, opacity: 0.7,
      }}>
        The Story — Maya vs. Wall Street
      </div>

      {/* Left panel */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: brollWin ? 920 : 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: brollWin ? '0 40px' : '0 80px',
      }}>

        {/* Setup */}
        {opSetup > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opSetup,
            display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 960,
          }}>
            <div style={{
              fontSize: 26, color: BRAND.textSecondary, letterSpacing: 2,
              fontFamily: 'sans-serif', textTransform: 'uppercase',
            }}>
              A junior advisor vs. three Wall Street firms
            </div>
            <div style={{
              fontSize: 60, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              lineHeight: 1.15,
            }}>
              <span style={{ color: BRAND.green }}>Maya</span> was competing for a
            </div>
            <div style={{
              fontSize: 120, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              lineHeight: 0.95, letterSpacing: -3,
              textShadow: `0 0 60px rgba(255,255,255,0.15)`,
            }}>
              $30M
            </div>
            <div style={{
              fontSize: 36, color: BRAND.textSecondary, fontFamily: 'sans-serif',
            }}>
              account. No biggest name. No longest track record.
            </div>
            <div style={{
              fontSize: 30, color: BRAND.green, fontFamily: 'sans-serif',
              fontStyle: 'italic', marginTop: 8,
              borderLeft: `3px solid ${BRAND.green}`,
              paddingLeft: 20,
            }}>
              She asked what he was most proud of.
            </div>
          </div>
        )}

        {/* The quote */}
        {opQuote > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opQuote,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 960,
          }}>
            <div style={{
              fontSize: 130, color: BRAND.green, fontFamily: 'Georgia, serif',
              lineHeight: 0.7, opacity: 0.3,
            }}>"</div>
            <div style={{
              fontSize: 62, fontWeight: 800, color: BRAND.white,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textAlign: 'center', lineHeight: 1.25, fontStyle: 'italic',
              textShadow: `0 0 40px rgba(255,255,255,0.1)`,
            }}>
              That my kids never had to worry.
            </div>
            <div style={{
              fontSize: 28, color: BRAND.textSecondary, fontFamily: 'sans-serif',
              fontStyle: 'italic', opacity: 0.8,
            }}>
              — the client's answer
            </div>
          </div>
        )}

        {/* Protector reveal */}
        {opProtect > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opProtect,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          }}>
            {(() => {
              const wf = Math.max(0, lf - 520);
              const ent = spring({ frame: wf, fps: 30, config: { damping: 9, stiffness: 110 } });
              const glow = wf < 18
                ? interpolate(wf, [0, 6, 18], [3.0, 4.5, 1.0], { extrapolateRight: 'clamp' })
                : 1.0;
              return (
                <>
                  <div style={{
                    fontSize: 160, fontWeight: 900, color: BRAND.white,
                    fontFamily: '-apple-system, sans-serif',
                    letterSpacing: 8,
                    opacity: ent, transform: `scale(${interpolate(ent, [0, 1], [0.5, 1])})`,
                    textShadow: `0 0 ${40 * glow}px rgba(255,255,255,0.5)`,
                  }}>
                    A
                  </div>
                  <div style={{
                    fontSize: 110, fontWeight: 900, color: BRAND.green,
                    fontFamily: '-apple-system, sans-serif',
                    letterSpacing: 6, textTransform: 'uppercase',
                    opacity: ent, transform: `scale(${interpolate(ent, [0, 1], [0.5, 1])})`,
                    textShadow: `0 0 ${50 * glow}px ${BRAND.green}, 0 0 ${100 * glow}px ${BRAND.green}60`,
                  }}>
                    PROTECTOR.
                  </div>
                  <div style={{
                    fontSize: 32, color: BRAND.textSecondary, fontFamily: 'sans-serif',
                    fontStyle: 'italic', opacity: ent * 0.8,
                    marginTop: 8,
                  }}>
                    Her entire proposal centered on one idea.
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Win */}
        {opWin > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opWin,
            display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 880,
          }}>
            <div style={{
              fontSize: 48, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif', lineHeight: 1.2,
            }}>
              "That his kids would never have to worry."
            </div>
            <div style={{
              fontSize: 30, color: BRAND.textSecondary, fontFamily: 'sans-serif',
              fontStyle: 'italic',
            }}>
              Not returns. Not numbers. Just that.
            </div>
            <div style={{
              height: 3, width: '100%',
              background: `linear-gradient(90deg, ${BRAND.green}, transparent)`,
              margin: '8px 0',
            }} />
            {(() => {
              const wf = Math.max(0, lf - 700);
              const ent = spring({ frame: wf, fps: 30, config: { damping: 14, stiffness: 80 } });
              return (
                <div style={{
                  opacity: ent,
                  transform: `translateY(${interpolate(ent, [0, 1], [20, 0])}px)`,
                  display: 'flex', alignItems: 'center', gap: 20,
                  padding: '20px 30px',
                  background: `linear-gradient(135deg, ${BRAND.green}15, transparent)`,
                  border: `2px solid ${BRAND.green}50`,
                  borderRadius: 12,
                  boxShadow: `0 0 ${30 * sineGlow(lf, 0.04, 0.5, 1.0)}px ${BRAND.green}30`,
                }}>
                  <span style={{ fontSize: 52 }}>🏆</span>
                  <div>
                    <div style={{
                      fontSize: 44, fontWeight: 900, color: BRAND.green,
                      fontFamily: '-apple-system, sans-serif',
                    }}>
                      She won the account.
                    </div>
                    <div style={{
                      fontSize: 24, color: BRAND.textSecondary, fontFamily: 'sans-serif',
                      fontStyle: 'italic',
                    }}>
                      The Wall Street firms never knew what sign he was wearing.
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* B-roll for win phase */}
      {brollWin && (
        <div style={{
          position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)',
          opacity: phaseOpacity(lf, 670, duration, 25),
        }}>
          <BRollPlayer
            src="walking-light.mp4"
            width={720} height={405}
            accentColor={BRAND.green}
            caption="She won by reading the invisible sign"
          />
        </div>
      )}

      {brollWin && (
        <div style={{
          position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
          background: `linear-gradient(180deg, transparent, ${BRAND.green}25 30%, ${BRAND.green}25 70%, transparent)`,
        }} />
      )}
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — CTA (f4100–f4420)
// ═══════════════════════════════════════════════════════════════════════════════

const CTAScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame, duration }) => {
  const lf = localFrame;
  const { fps } = useVideoConfig();
  const ent = spring({ frame: lf, fps, config: { damping: 16, stiffness: 60 } });
  const glow = sineGlow(lf, 0.05, 0.6, 1.1);
  const ringPulse = (offset: number) => 0.5 + 0.5 * Math.sin(lf * 0.08 + offset);
  const bounceY = Math.sin(lf * 0.12) * 10;
  const globalFade = lf > duration - 20
    ? interpolate(lf, [duration - 20, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDark, opacity: globalFade }}>
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 50%, ${BRAND.green}12 0%, transparent 65%), ${BRAND.bgDark}`,
      }} />
      <ParticleField color={BRAND.green} count={24} seed={33} intensity={0.7} />

      {/* Concentric pulsing rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: 500 + i * 180,
          height: 500 + i * 180,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: `1px solid ${BRAND.green}`,
          opacity: ringPulse(i * 1.2) * 0.22,
          scale: String(0.9 + ringPulse(i * 1.5) * 0.15),
        }} />
      ))}

      {/* Main content */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 80,
        opacity: ent,
        transform: `translateY(${interpolate(ent, [0, 1], [30, 0])}px)`,
      }}>

        {/* Left: headline + CTA */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860,
        }}>
          <div style={{
            fontSize: 20, color: BRAND.green, letterSpacing: 4,
            textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 700,
          }}>
            Every Client is Already Telling You
          </div>
          <div style={{
            fontSize: 68, fontWeight: 900, color: BRAND.white,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            lineHeight: 1.1,
            color: `hsl(${interpolate(Math.sin(lf * 0.04), [-1, 1], [145, 165])}, 70%, ${interpolate(Math.sin(lf * 0.03 + 1), [-1, 1], [75, 95])}%)`,
          }}>
            Are You Listening For It?
          </div>
          <div style={{
            fontSize: 30, color: BRAND.textSecondary, fontFamily: 'sans-serif',
            lineHeight: 1.4,
          }}>
            Take the 60-second quiz and discover which signals you're already catching — and which ones you're missing.
          </div>

          {/* CTA box with glow */}
          <div style={{
            background: BRAND.green,
            borderRadius: 12,
            padding: '22px 48px',
            textAlign: 'center',
            fontSize: 32, fontWeight: 900, color: BRAND.black,
            fontFamily: '-apple-system, sans-serif', letterSpacing: 2,
            boxShadow: `0 0 ${30 * glow}px ${BRAND.green}80, 0 0 ${60 * glow}px ${BRAND.green}40`,
            cursor: 'pointer',
          }}>
            TAKE THE FREE QUIZ →
          </div>

          {/* Bouncing arrow + URL */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            marginTop: -4,
          }}>
            <div style={{
              fontSize: 36, transform: `translateY(${bounceY}px)`,
              color: BRAND.green,
            }}>↑</div>
            <TypewriterText
              text="scottmagnacca.com"
              delay={60}
              speed={3}
              color={BRAND.textSecondary}
              fontSize={28}
              glowColor={BRAND.green}
              fontWeight={400}
              cursor={false}
            />
          </div>
        </div>

        {/* Right: QR code */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            padding: 20, background: BRAND.black,
            border: `3px solid ${BRAND.green}`,
            borderRadius: 16,
            boxShadow: `0 0 ${40 * glow}px ${BRAND.green}50, 0 0 ${80 * glow}px ${BRAND.green}25`,
          }}>
            <Img
              src={staticFile('qr-scottmagnacca.png')}
              style={{ width: 260, height: 260, display: 'block', borderRadius: 8 }}
            />
          </div>
          <div style={{
            fontSize: 20, color: BRAND.green, letterSpacing: 2,
            fontFamily: 'sans-serif', textTransform: 'uppercase',
            textShadow: `0 0 15px ${BRAND.green}80`,
          }}>
            Scan to start
          </div>
        </div>
      </div>

      {/* Lower third — speaker credentials */}
      <div style={{
        position: 'absolute', bottom: 60, left: 80,
        display: 'flex', alignItems: 'center', gap: 20,
        opacity: lf > 30 ? phaseOpacity(lf, 30, duration, 18) : 0,
      }}>
        <div style={{
          width: 4, height: 56,
          background: `linear-gradient(180deg, ${BRAND.green}, transparent)`,
        }} />
        <div>
          <div style={{
            fontSize: 28, fontWeight: 800, color: BRAND.white, fontFamily: 'sans-serif',
          }}>
            Scott Magnacca
          </div>
          <div style={{
            fontSize: 18, color: BRAND.green, fontFamily: 'sans-serif',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            AI &amp; Storyselling Strategist · SalesForLife.ai
          </div>
        </div>
      </div>

      {/* URL solid bar at very bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 52, background: BRAND.green,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: lf > 15 ? 1 : lf / 15,
      }}>
        <div style={{
          fontSize: 24, fontWeight: 800, color: BRAND.black,
          fontFamily: '-apple-system, sans-serif', letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          scottmagnacca.com · 60-Second AI Risk Quiz · Free
        </div>
      </div>

      <NoiseOverlay opacity={0.04} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════

export const InvisibleSignVideo: React.FC<{ audioSrc?: string }> = ({
  audioSrc = 'audio/invisible-sign.mp3',
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Audio src={staticFile(audioSrc)} />
      <Sequence from={SCENE.HOOK_START} durationInFrames={SCENE.HOOK_END - SCENE.HOOK_START}>
        <HookScene localFrame={frame - SCENE.HOOK_START} duration={SCENE.HOOK_END - SCENE.HOOK_START} />
      </Sequence>
      <Sequence from={SCENE.S1_START} durationInFrames={SCENE.S1_END - SCENE.S1_START}>
        <ThreeSignsScene localFrame={frame - SCENE.S1_START} duration={SCENE.S1_END - SCENE.S1_START} />
      </Sequence>
      <Sequence from={SCENE.S2_START} durationInFrames={SCENE.S2_END - SCENE.S2_START}>
        <MagicQuestionScene localFrame={frame - SCENE.S2_START} duration={SCENE.S2_END - SCENE.S2_START} />
      </Sequence>
      <Sequence from={SCENE.S3_START} durationInFrames={SCENE.S3_END - SCENE.S3_START}>
        <SilenceScene localFrame={frame - SCENE.S3_START} duration={SCENE.S3_END - SCENE.S3_START} />
      </Sequence>
      <Sequence from={SCENE.STORY_START} durationInFrames={SCENE.STORY_END - SCENE.STORY_START}>
        <MayaScene localFrame={frame - SCENE.STORY_START} duration={SCENE.STORY_END - SCENE.STORY_START} />
      </Sequence>
      <Sequence from={SCENE.CTA_START} durationInFrames={SCENE.CTA_END - SCENE.CTA_START}>
        <CTAScene localFrame={frame - SCENE.CTA_START} duration={SCENE.CTA_END - SCENE.CTA_START} />
      </Sequence>
    </AbsoluteFill>
  );
};
