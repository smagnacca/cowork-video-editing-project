import React from 'react';
import { Composition } from 'remotion';
import { ThreeTypesVideo } from '../src/ThreeTypesVideo';
import { TemplateVideo } from '../src/TemplateVideo';

// Default config — loaded from templates/video.config.example.json at build time
// The orchestrator generates a fresh config for each new video and passes it via defaultProps.
const defaultTemplateConfig = {
  title: 'Template Video',
  compositionId: 'TemplateVideo',
  audio: { file: '3-types-of-people.mp3' },
  colors: {
    bg: '#0a0e1a', accent1: '#00d4ff', accent2: '#f5a623', accent3: '#ff6b35',
    textPrimary: '#ffffff', textSecondary: '#a0aec0',
  },
  effects: {
    particles: true, noiseOverlay: true, sceneTransitions: 'liquid' as const,
    hueShift: true, kineticStyle: 'spring-glow' as const,
  },
  ctaUrl: 'scottmagnacca.com',
  ctaTagline: 'Build the skills that make you impossible to ignore',
  scenes: [],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
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

      {/* Config-driven template — the orchestrator overwrites defaultProps with the real config */}
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
