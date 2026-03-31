import React from 'react';
import { Composition } from 'remotion';
import { ThreeTypesVideo } from '../src/ThreeTypesVideo';
import { TemplateVideo } from '../src/TemplateVideo';
import { IntroScene } from '../src/components/IntroScene';
import { OutroScene } from '../src/components/OutroScene';

// ─── Shared palette + effects ─────────────────────────────────────────────────
const COLORS = {
  bg: '#0a0e1a', accent1: '#00d4ff', accent2: '#f5a623', accent3: '#ff6b35',
  textPrimary: '#ffffff', textSecondary: '#a0aec0',
};
const EFFECTS = {
  particles: true, noiseOverlay: true, sceneTransitions: 'liquid' as const,
  hueShift: true, kineticStyle: 'spring-glow' as const,
};

// ─── Standalone intro wrapper ─────────────────────────────────────────────────
const IntroComposition: React.FC = () => (
  <IntroScene
    scene={{
      type: 'intro',
      avatarSrc: 'avatar/intro-avatar.mp4',
      hookText: "YOUR EDGE ISN'T WHAT YOU THINK",
      hookColor: 'accent2',
      topicTitle: '3 Types of People You Need in Your Corner',
      topicSubtitle: 'Curiosity · Learning · Adaptability',
      speakerName: 'Scott Magnacca',
      speakerTitle: 'AI & Leadership Strategist',
      accentColor: 'accent1',
      timing: { startFrame: 0, endFrame: 728 },
    }}
    colors={COLORS}
    effects={EFFECTS}
  />
);

// ─── Standalone outro wrapper ─────────────────────────────────────────────────
const OutroComposition: React.FC = () => (
  <OutroScene
    scene={{
      type: 'outro',
      avatarSrc: 'avatar/outro-avatar.mp4',
      ctaHeadline: 'Take the 60-Second Quiz',
      ctaDescription: 'Discover your AI leadership style',
      ctaButtonText: 'START THE QUIZ',
      accentColor: 'accent2',
      kineticText: 'YOUR CIRCLE IS YOUR CATALYST',
      kineticColor: 'accent1',
      speakerName: 'Scott Magnacca',
      timing: { startFrame: 0, endFrame: 662 },
    }}
    colors={COLORS}
    effects={EFFECTS}
    ctaUrl="scottmagnacca.com"
    ctaTagline="Discover your AI leadership edge"
  />
);

// ─── Default config — loaded from templates/video.config.example.json ─────────
const defaultTemplateConfig = {
  title: 'Template Video',
  compositionId: 'TemplateVideo',
  audio: { file: '3-types-of-people.mp3' },
  colors: COLORS,
  effects: EFFECTS,
  ctaUrl: 'scottmagnacca.com',
  ctaTagline: 'Build the skills that make you impossible to ignore',
  scenes: [],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Standalone intro (24.28s = 728 frames) */}
      <Composition
        id="IntroSceneComp"
        component={IntroComposition}
        durationInFrames={728}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Standalone outro (22.06s = 662 frames) */}
      <Composition
        id="OutroSceneComp"
        component={OutroComposition}
        durationInFrames={662}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Original "3 Types" video — hardcoded composition */}
      <Composition
        id="ThreeTypesVideo"
        component={ThreeTypesVideo}
        durationInFrames={5971}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          audioSrc: '3-types-of-people.mp3',
        }}
      />

      {/* Config-driven template — orchestrator overwrites defaultProps with real config */}
      <Composition
        id="TemplateVideo"
        component={TemplateVideo}
        durationInFrames={6000}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          config: defaultTemplateConfig,
        }}
      />
    </>
  );
};
