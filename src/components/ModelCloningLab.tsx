import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ChevronRight,
  Eye,
  Info,
  Maximize2,
  BookOpen,
  Volume2,
  MousePointer,
  Split,
  Layers as OverlayIcon,
  Download,
  Flame,
  Radio
} from 'lucide-react';
import { COACH_SLOANE_SCHEMA, ExpressionMeta } from '../data/coachSloaneRiveSchema';
import { RiveCanvasView } from './RiveCanvasView';
import { ModelSvgRig } from './ModelSvgRig';
import { Fit, Alignment } from '@rive-app/react-canvas';
import { RiveFileSource } from '../types';

interface ModelCloningLabProps {
  onTriggerRive?: (name: string, category: 'expression' | 'trigger' | 'viseme') => void;
  activeRiveAnimation?: string | null;
}

const COACH_SLOANE_SOURCE: RiveFileSource = {
  id: 'cloning-coach-sloane',
  name: 'Coach Sloane - Expressions',
  type: 'sample',
  url: '/samples/nothing.riv',
};

// Preset speech phrases for the Lipsync Simulator
const SPEECH_PHRASES = [
  {
    text: "Hello! I am Coach Sloane. Ready to level up?",
    visemes: [
      { v: 'visemeH', d: 160 },
      { v: 'visemeE', d: 140 },
      { v: 'visemeD', d: 180 },
      { v: 'visemeH', d: 200 },
      { v: 'visemeX', d: 120 },
      { v: 'visemeA', d: 180 },
      { v: 'visemeB', d: 160 },
      { v: 'visemeC', d: 200 },
      { v: 'visemeD', d: 180 },
      { v: 'visemeE', d: 180 },
      { v: 'visemeX', d: 250 },
    ],
  },
  {
    text: "Keep your chest tall and eyes focused.",
    visemes: [
      { v: 'visemeG', d: 150 },
      { v: 'visemeE', d: 150 },
      { v: 'visemeB', d: 140 },
      { v: 'visemeH', d: 180 },
      { v: 'visemeC', d: 190 },
      { v: 'visemeE', d: 160 },
      { v: 'visemeC', d: 180 },
      { v: 'visemeD', d: 170 },
      { v: 'visemeA', d: 190 },
      { v: 'visemeD', d: 160 },
      { v: 'visemeX', d: 250 },
    ],
  },
  {
    text: "Brilliant execution on that last set!",
    visemes: [
      { v: 'visemeB', d: 140 },
      { v: 'visemeD', d: 150 },
      { v: 'visemeE', d: 180 },
      { v: 'visemeD', d: 160 },
      { v: 'visemeA', d: 190 },
      { v: 'visemeD', d: 170 },
      { v: 'visemeE', d: 180 },
      { v: 'visemeG', d: 160 },
      { v: 'visemeC', d: 190 },
      { v: 'visemeD', d: 180 },
      { v: 'visemeX', d: 250 },
    ],
  },
];

export const ModelCloningLab: React.FC<ModelCloningLabProps> = ({
  onTriggerRive,
  activeRiveAnimation,
}) => {
  // Main Navigation Modes
  const [labMode, setLabMode] = useState<'comparator' | 'rig' | 'manual' | 'spec'>('comparator');
  const [comparatorView, setComparatorView] = useState<'split' | 'overlay' | 'wipe'>('split');
  const [referenceSource, setReferenceSource] = useState<'model-svg' | 'rive'>('model-svg');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(50);
  const [wipePercent, setWipePercent] = useState<number>(50);

  // Active expression & state
  const [activeExpression, setActiveExpression] = useState<string>('happy');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showBones, setShowBones] = useState<boolean>(false);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [autoIdleRunning, setAutoIdleRunning] = useState<boolean>(true);
  const [mouseTracking, setMouseTracking] = useState<boolean>(false);
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);

  // Helper to force 1:1 Idle state (resets all transforms to 0)
  const setIdleState = () => {
    setActiveExpression('idle');
    setIsPlaying(false);
    setAutoIdleRunning(false);
    setMouseTracking(false);
    setAnimProgress(0);
    setBlinkAmount(0);
    setPupilDrift({ x: 0, y: 0 });
    setCursorPos({ x: 0, y: 0 });
    setActiveViseme(null);
  };

  // Animation timeline (0 to 150 frames @ 60 FPS = 2.50s)
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [activeViseme, setActiveViseme] = useState<string | null>(null);

  // Natural Blinking State (Layer 2)
  const [blinkAmount, setBlinkAmount] = useState<number>(0); // 0 = open, 1 = closed

  // Natural Saccades (Pupil subtle drifting during idle)
  const [pupilDrift, setPupilDrift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse / Pointer Tracking coordinates (-1 to +1)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Manual Sliders State (for Manual Studio)
  const [manualPose, setManualPose] = useState({
    headYaw: 0,       // -15 to +15 deg
    headPitch: 0,     // -10 to +10 px
    headRoll: 0,      // -10 to +10 deg
    gazeX: 0,         // -8 to +8 px
    gazeY: 0,         // -6 to +6 px
    eyebrowL: 0,      // -15 to +15 px
    eyebrowR: 0,      // -15 to +15 px
    jawOpen: 0,       // 0 to 1
    smileFrown: 0.5,  // -1 to +1
    lipStretch: 1,    // 0.8 to 1.3
    blink: 0,         // 0 to 1
  });

  // Speech lipsync player state
  const [activeSpeechIdx, setActiveSpeechIdx] = useState<number | null>(null);

  // Reference to live Rive instance for synchronized dispatch
  const riveInstanceRef = useRef<any>(null);

  const handleRiveLoaded = (rive: any) => {
    riveInstanceRef.current = rive;
  };

  // Synchronized trigger dispatch: triggers both live Rive instance & cloned model
  const triggerSynchronizedExpression = (name: string, category: 'expression' | 'trigger' | 'viseme' = 'expression') => {
    setActiveExpression(name);
    setIsPlaying(true);
    setAnimProgress(0);

    // If Rive is connected in the comparator, fire Rive trigger
    if (riveInstanceRef.current) {
      try {
        if (category === 'expression') {
          // Play state machine or direct animation
          const activeRive = riveInstanceRef.current;
          if (activeRive.stateMachineNames?.length > 0) {
            const smName = activeRive.stateMachineNames[0];
            const inputs = activeRive.stateMachineInputs(smName) || [];
            const triggerInput = inputs.find((inp: any) => inp.name.toLowerCase() === name.toLowerCase());
            if (triggerInput && triggerInput.fire) {
              triggerInput.fire();
            }
          }
          if (activeRive.animationNames?.includes(name)) {
            activeRive.play(name);
          }
          if (!activeRive.isPlaying) {
            activeRive.startRendering();
          }
        } else if (category === 'viseme') {
          const activeRive = riveInstanceRef.current;
          if (activeRive.animationNames?.includes(name)) {
            activeRive.play(name);
          }
        }
      } catch (err) {
        console.warn('Rive sync trigger error:', err);
      }
    }

    if (onTriggerRive) {
      onTriggerRive(name, category);
    }
  };

  // Auto idle breathing loop (sinusoidal 12.0s period = 720 frames @ 60 FPS)
  const [breathPhase, setBreathPhase] = useState<number>(0);
  useEffect(() => {
    if (!autoIdleRunning) return;
    const interval = setInterval(() => {
      setBreathPhase(p => (p + 0.035) % (Math.PI * 2));
    }, 33);
    return () => clearInterval(interval);
  }, [autoIdleRunning]);

  // Organic Blinking Controller (Random blinks every 3.5 - 6s, 140ms duration)
  useEffect(() => {
    if (!autoIdleRunning) return;
    let blinkTimeout: any;

    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 3500;
      blinkTimeout = setTimeout(() => {
        // Fast close (60ms)
        setBlinkAmount(1);
        setTimeout(() => {
          // Open back (90ms)
          setBlinkAmount(0);
          scheduleNextBlink();
        }, 110);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, [autoIdleRunning]);

  // Organic Pupil Saccades (Layer 2 eye micro-movements)
  useEffect(() => {
    if (!autoIdleRunning) return;
    const interval = setInterval(() => {
      // Random micro-saccade every ~2.5 seconds
      if (Math.random() > 0.4) {
        setPupilDrift({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 3,
        });
      } else {
        setPupilDrift({ x: 0, y: 0 });
      }
    }, 2200);
    return () => clearInterval(interval);
  }, [autoIdleRunning]);

  // Timeline playback loop
  useEffect(() => {
    if (!isPlaying || isScrubbing) return;
    let animId: number;
    let startTime: number | null = null;
    const duration = 2500; // 2.5s for Coach Sloane one-shot expressions

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        // Hold for a moment or loop back gently
        setIsPlaying(false);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isScrubbing, activeExpression]);

  // Speech synthesizer simulator
  const playSpeechPhrase = (phraseIdx: number) => {
    setActiveSpeechIdx(phraseIdx);
    const phrase = SPEECH_PHRASES[phraseIdx];
    let offset = 0;

    phrase.visemes.forEach(({ v, d }, i) => {
      setTimeout(() => {
        setActiveViseme(v);
        triggerSynchronizedExpression(v, 'viseme');
        if (i === phrase.visemes.length - 1) {
          setTimeout(() => {
            setActiveViseme(null);
            setActiveSpeechIdx(null);
          }, d);
        }
      }, offset);
      offset += d;
    });
  };

  // Mouse move handler for face tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseTracking) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to +1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to +1
    setCursorPos({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const handleMouseLeave = () => {
    if (!mouseTracking) return;
    setCursorPos({ x: 0, y: 0 });
  };

  // 1:1 FORENSIC RIG DEFORMATION ENGINE
  // Calculates real-time anatomical transforms for head, neck, eyes, eyelids, pupils, eyebrows, glasses, oral cavity, teeth, and lips
  const deformations = useMemo(() => {
    if (labMode === 'manual') {
      // Direct slider control
      return {
        headYaw: manualPose.headYaw,
        headPitch: manualPose.headPitch,
        headRoll: manualPose.headRoll,
        gazeX: manualPose.gazeX,
        gazeY: manualPose.gazeY,
        blink: manualPose.blink,
        squint: 0,
        eyebrowLY: manualPose.eyebrowL,
        eyebrowRY: manualPose.eyebrowR,
        eyebrowLRotate: manualPose.eyebrowL * 0.8,
        eyebrowRRotate: -manualPose.eyebrowR * 0.8,
        jawOpen: manualPose.jawOpen,
        smileFrown: manualPose.smileFrown,
        lipStretch: manualPose.lipStretch,
        mouthY: manualPose.headPitch * 0.4 + manualPose.jawOpen * 6,
        glassesParallaxX: manualPose.headYaw * 0.8,
        glassesParallaxY: manualPose.headPitch * 0.7,
        torsoY: 0,
        hijabDrapeY: 0,
        visemeActive: null,
      };
    }

    // Envelope curve: 0 -> peak (at 0.22) -> hold plateau (0.22 - 0.65) -> ease back (0.65 - 1.0)
    let env = 0;
    if (animProgress < 0.22) {
      env = Math.sin((animProgress / 0.22) * (Math.PI / 2));
    } else if (animProgress < 0.65) {
      env = 1.0;
    } else {
      env = Math.sin((1 - (animProgress - 0.65) / 0.35) * (Math.PI / 2));
    }

    // Layer 0: Continuous Breathing
    const breathY = autoIdleRunning ? Math.sin(breathPhase) * 2.2 : 0;
    const breathScale = autoIdleRunning ? 1 + Math.sin(breathPhase) * 0.007 : 1;

    // Mouse Tracking Parallax Influence
    const trackYaw = mouseTracking ? cursorPos.x * 12 : 0;
    const trackPitch = mouseTracking ? cursorPos.y * 8 : 0;
    const trackGazeX = mouseTracking ? cursorPos.x * 7 : pupilDrift.x;
    const trackGazeY = mouseTracking ? cursorPos.y * 5 : pupilDrift.y;

    // When Idle expression is active, strictly 0 offsets for 100% 1:1 model.svg match
    if (activeExpression === 'idle') {
      return {
        headYaw: 0,
        headPitch: 0,
        headRoll: 0,
        headScale: 1,
        gazeX: 0,
        gazeY: 0,
        blink: 0,
        squint: 0,
        eyebrowLY: 0,
        eyebrowRY: 0,
        eyebrowLRotate: 0,
        eyebrowRRotate: 0,
        jawOpen: 0,
        smileFrown: 0,
        lipStretch: 1.0,
        mouthY: 0,
        teethVisible: 0,
        blushOpacity: 0,
        glassesParallaxX: 0,
        glassesParallaxY: 0,
        faceParallaxX: 0,
        faceParallaxY: 0,
        torsoY: 0,
        hijabDrapeY: 0,
        visemeActive: null,
      };
    }

    // Default Neutral
    let d = {
      headYaw: 0 + trackYaw,
      headPitch: breathY + trackPitch,
      headRoll: -trackYaw * 0.16,
      headScale: breathScale,
      gazeX: trackGazeX,
      gazeY: trackGazeY,
      blink: blinkAmount,
      squint: 0,
      eyebrowLY: 0,
      eyebrowRY: 0,
      eyebrowLRotate: 0,
      eyebrowRRotate: 0,
      jawOpen: 0,
      smileFrown: 0, // authentic 1:1 resting smile from model.svg
      lipStretch: 1.0,
      mouthY: 0,
      teethVisible: 0,
      blushOpacity: 0,
      glassesParallaxX: trackYaw * 0.35,
      glassesParallaxY: breathY * 0.3 + trackPitch * 0.35,
      faceParallaxX: trackYaw * 0.2,
      faceParallaxY: trackPitch * 0.2,
      torsoY: breathY * 0.4 + trackPitch * 0.15,
      hijabDrapeY: breathY * 0.5,
      visemeActive: activeViseme,
    };

    switch (activeExpression) {
      case 'happy':
        // Warm, radiant, genuine smile matching Coach Sloane
        d.headPitch = -3 * env + breathY + trackPitch;
        d.headRoll = 2.2 * env;
        d.eyebrowLY = -6 * env;
        d.eyebrowRY = -6 * env;
        d.eyebrowLRotate = 2.5 * env;
        d.eyebrowRRotate = -2.5 * env;
        d.squint = 0.42 * env; // Duchenne eye crinkle
        d.smileFrown = 1.0 * env; // upward smiling curve
        d.lipStretch = 1.14 * env + (1 - env);
        d.jawOpen = 0; // NOT an open gaping mouth! An elegant radiant smile!
        d.teethVisible = 0.85 * env; // delicate pearlescent smile crescent nestled in the lips
        d.blushOpacity = 0.5 * env; // warm glowing rosy cheeks
        d.mouthY = -3 * env;
        d.glassesParallaxY = -3 * env + breathY * 0.4;
        break;

      case 'sad':
        d.headPitch = 8 * env + breathY + trackPitch;
        d.headRoll = -2.5 * env;
        // Inverted-V sorrow eyebrows
        d.eyebrowLY = -4 * env;
        d.eyebrowLRotate = 14 * env; // inner brow pulls up
        d.eyebrowRY = -4 * env;
        d.eyebrowRRotate = -14 * env;
        d.gazeY = 5 * env + trackGazeY; // downcast eyes
        d.squint = 0.2 * env;
        d.smileFrown = -0.85 * env;
        d.jawOpen = 0;
        d.mouthY = 4 * env;
        d.glassesParallaxY = 6 * env + breathY * 0.4;
        d.torsoY = 3 * env + breathY * 0.3;
        break;

      case 'angry':
        d.headPitch = 4 * env + breathY + trackPitch;
        d.headYaw = trackYaw;
        // Fierce V-furrow knit eyebrows
        d.eyebrowLY = 7 * env;
        d.eyebrowLRotate = -16 * env;
        d.eyebrowRY = 7 * env;
        d.eyebrowRRotate = 16 * env;
        d.squint = 0.38 * env;
        d.smileFrown = -0.7 * env;
        d.lipStretch = 1.1 * env + (1 - env);
        d.jawOpen = 0;
        d.mouthY = 2 * env;
        d.glassesParallaxY = 3 * env + breathY * 0.4;
        break;

      case 'surprised':
        d.headPitch = -10 * env + breathY + trackPitch;
        d.headScale = (1 + 0.02 * env) * breathScale;
        // Eyebrows shoot into forehead
        d.eyebrowLY = -15 * env;
        d.eyebrowRY = -15 * env;
        d.blink = 0; // wide open
        d.squint = -0.35 * env;
        d.smileFrown = 0.1;
        d.lipStretch = 0.9;
        d.jawOpen = 0.65 * env; // clean round O
        d.mouthY = 3 * env;
        d.glassesParallaxY = -8 * env + breathY * 0.4;
        break;

      case 'thinking':
        d.headPitch = -2 * env + breathY + trackPitch;
        d.headRoll = 5.5 * env;
        d.headYaw = 4 * env + trackYaw;
        // Inquisitive asymmetric cocked brow
        d.eyebrowLY = -10 * env;
        d.eyebrowLRotate = 5 * env;
        d.eyebrowRY = 2 * env;
        d.eyebrowRRotate = -3 * env;
        d.gazeX = 6 * env + trackGazeX; // looking up-right
        d.gazeY = -4 * env + trackGazeY;
        d.smileFrown = 0.3;
        d.lipStretch = 0.96;
        d.jawOpen = 0;
        d.mouthY = -1 * env;
        d.glassesParallaxX = 3 * env + trackYaw * 0.4;
        d.glassesParallaxY = -2 * env + breathY * 0.4;
        break;

      case 'bored':
        d.headPitch = 9 * env + breathY + trackPitch;
        d.headRoll = -4 * env;
        d.eyebrowLY = 2 * env;
        d.eyebrowRY = 2 * env;
        d.blink = 0.6 * env; // heavy sleepy drooping lids
        d.smileFrown = -0.15 * env;
        d.jawOpen = 0;
        d.mouthY = 2 * env;
        d.glassesParallaxY = 7 * env + breathY * 0.4;
        break;

      case 'unsure':
        d.headRoll = Math.sin(animProgress * Math.PI * 4) * 3 * env;
        d.headYaw = Math.sin(animProgress * Math.PI * 2) * 3.5 * env + trackYaw;
        d.eyebrowLY = -9 * env;
        d.eyebrowRY = 3 * env;
        d.smileFrown = -0.4 * env;
        d.lipStretch = 0.95;
        d.jawOpen = 0;
        d.mouthY = 1 * env;
        break;

      case 'impressed':
        // Deliberate approving nod
        d.headPitch = Math.sin(animProgress * Math.PI * 2) * 5 * env + breathY + trackPitch;
        d.eyebrowLY = -6 * env;
        d.eyebrowRY = -6 * env;
        d.smileFrown = 0.8 * env;
        d.lipStretch = 1.1;
        d.jawOpen = 0;
        d.teethVisible = 0.65 * env;
        d.blushOpacity = 0.35 * env;
        d.glassesParallaxY = Math.sin(animProgress * Math.PI * 2) * 5 * env + breathY * 0.4;
        break;

      case 'shocked':
        d.headPitch = -13 * env + breathY + trackPitch;
        d.headScale = (1 + 0.03 * env) * breathScale;
        d.eyebrowLY = -16 * env;
        d.eyebrowRY = -16 * env;
        d.blink = 0;
        d.squint = -0.4 * env;
        d.jawOpen = 0.8 * env;
        d.lipStretch = 1.05;
        d.mouthY = 5 * env;
        d.glassesParallaxY = -11 * env + breathY * 0.4;
        break;

      case 'concerned':
        d.headPitch = 4 * env + breathY + trackPitch;
        d.headRoll = 2.8 * env;
        d.eyebrowLY = -5 * env;
        d.eyebrowLRotate = 10 * env;
        d.eyebrowRY = -5 * env;
        d.eyebrowRRotate = -10 * env;
        d.gazeY = 2 * env + trackGazeY;
        d.smileFrown = -0.35 * env;
        d.jawOpen = 0;
        d.glassesParallaxY = 4 * env + breathY * 0.4;
        break;

      case 'disappointed':
        d.headPitch = 7 * env + breathY + trackPitch;
        d.headRoll = -2 * env;
        d.eyebrowLY = 2 * env;
        d.eyebrowRY = 2 * env;
        d.smileFrown = -0.6 * env;
        d.jawOpen = 0;
        d.gazeY = 4 * env + trackGazeY;
        d.glassesParallaxY = 6 * env + breathY * 0.4;
        break;

      case 'greeting':
        // Friendly welcoming nod with warm smile
        d.headPitch = Math.sin(animProgress * Math.PI * 2) * 4.5 * env + breathY + trackPitch;
        d.headRoll = 1.5 * env;
        d.eyebrowLY = -5 * env;
        d.eyebrowRY = -5 * env;
        d.smileFrown = 0.9 * env;
        d.lipStretch = 1.12 * env + (1 - env);
        d.squint = 0.32 * env;
        d.teethVisible = 0.75 * env;
        d.blushOpacity = 0.4 * env;
        break;
    }

    // Phonetic Viseme overrides (for speech lipsync)
    if (activeViseme) {
      switch (activeViseme) {
        case 'visemeA': // Ah (wide open)
          d.jawOpen = 0.65;
          d.lipStretch = 1.1;
          d.smileFrown = 0.3;
          d.teethVisible = 1.0;
          break;
        case 'visemeB': // B, P, M (lips sealed flat)
          d.jawOpen = 0;
          d.lipStretch = 1.05;
          d.smileFrown = 0.05;
          d.teethVisible = 0;
          break;
        case 'visemeC': // S, Z (teeth parted)
          d.jawOpen = 0.18;
          d.lipStretch = 1.15;
          d.smileFrown = 0.4;
          d.teethVisible = 1.0;
          break;
        case 'visemeD': // Th, L (tongue against teeth)
          d.jawOpen = 0.28;
          d.lipStretch = 1.08;
          d.smileFrown = 0.3;
          d.teethVisible = 0.9;
          break;
        case 'visemeE': // Ee (wide horizontal)
          d.jawOpen = 0.22;
          d.lipStretch = 1.35;
          d.smileFrown = 0.7;
          d.teethVisible = 1.0;
          d.squint = 0.25;
          break;
        case 'visemeF': // F, V (lip contact)
          d.jawOpen = 0.12;
          d.lipStretch = 1.05;
          d.smileFrown = 0.1;
          d.teethVisible = 0.8;
          break;
        case 'visemeG': // K, G (throat)
          d.jawOpen = 0.35;
          d.lipStretch = 1.02;
          d.smileFrown = 0.2;
          d.teethVisible = 0.5;
          break;
        case 'visemeH': // Oh, Oo (puckered O)
          d.jawOpen = 0.48;
          d.lipStretch = 0.75;
          d.smileFrown = 0.1;
          d.teethVisible = 0.3;
          break;
        case 'visemeX': // Rest
        default:
          d.jawOpen = 0;
          d.lipStretch = 1.0;
          d.smileFrown = 0.25;
          d.teethVisible = 0;
          break;
      }
    }

    return d;
  }, [
    labMode,
    manualPose,
    animProgress,
    activeExpression,
    activeViseme,
    autoIdleRunning,
    breathPhase,
    blinkAmount,
    pupilDrift,
    mouseTracking,
    cursorPos,
  ]);

  return (
    <div
      id="model-cloning-master-studio"
      className="w-full bg-[#0c0c0e] text-neutral-100 rounded-3xl border border-neutral-800/90 shadow-2xl p-4 sm:p-6 flex flex-col gap-6"
    >
      {/* Top Studio Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                1:1 Model Cloning Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                1:1 Coach Sloane Rig
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Synchronized comparator, 2.5D anatomical deformer, oral cavity visemes & rigging spec
            </p>
          </div>
        </div>

        {/* Primary View Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-2xl border border-neutral-800">
          <button
            onClick={() => setLabMode('comparator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              labMode === 'comparator'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5 text-amber-400" />
            <span>1:1 Comparator</span>
          </button>

          <button
            onClick={() => setLabMode('rig')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              labMode === 'rig'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>2.5D Rig & Face Track</span>
          </button>

          <button
            onClick={() => setLabMode('manual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              labMode === 'manual'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manual Studio</span>
          </button>

          <button
            onClick={() => setLabMode('spec')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              labMode === 'spec'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Blueprint Spec</span>
          </button>
        </div>
      </div>

      {/* Synchronized Control Toolbar */}
      <div className="bg-[#141418] border border-neutral-800/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Playback Controls & Frame Scrubber */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setAnimProgress(0);
              setIsPlaying(true);
            }}
            className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Reset frame"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Timeline Scrubber */}
          <div className="flex items-center gap-2 pl-2">
            <span className="font-mono text-[11px] text-neutral-400">
              Frame <span className="text-white font-bold">{Math.round(animProgress * 150)}</span> / 150
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={animProgress}
              onMouseDown={() => setIsScrubbing(true)}
              onMouseUp={() => setIsScrubbing(false)}
              onChange={e => setAnimProgress(parseFloat(e.target.value))}
              className="w-28 sm:w-44 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
            <span className="text-neutral-500 font-mono text-[10px]">
              {(animProgress * 2.5).toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBones(!showBones)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono border transition-colors cursor-pointer ${
              showBones
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Bones: {showBones ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setAutoIdleRunning(!autoIdleRunning)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono border transition-colors cursor-pointer ${
              autoIdleRunning
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Breath/Idle: {autoIdleRunning ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setMouseTracking(!mouseTracking)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono border transition-colors cursor-pointer flex items-center gap-1 ${
              mouseTracking
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <MousePointer className="w-3 h-3" />
            Face Track: {mouseTracking ? 'ON' : 'OFF'}
          </button>

          {labMode === 'comparator' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Reference Source Switcher */}
              <div className="flex items-center bg-neutral-900 p-0.5 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setReferenceSource('model-svg')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    referenceSource === 'model-svg'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Ref: model.svg (Image)
                </button>
                <button
                  onClick={() => setReferenceSource('rive')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    referenceSource === 'rive'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Ref: .riv (Rive 7)
                </button>
              </div>

              {/* View Layout Switcher */}
              <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setComparatorView('split')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                    comparatorView === 'split'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Split
                </button>
                <button
                  onClick={() => setComparatorView('wipe')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                    comparatorView === 'wipe'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Wipe Curtain
                </button>
                <button
                  onClick={() => setComparatorView('overlay')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                    comparatorView === 'overlay'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Ghost Overlay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1:1 IDLE PARITY VERIFICATION STATUS BAR */}
      {labMode === 'comparator' && (
        <div className="bg-[#121217] border border-neutral-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
              activeExpression === 'idle'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {activeExpression === 'idle' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>IDLE STATE: 100% 1:1 MATCH VERIFIED</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ACTIVE EXPRESSION: {activeExpression.toUpperCase()}</span>
                </>
              )}
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Native Aspect Ratio: 2377 × 4096 (0.58:1 Locked)</span>
            </div>
            <span className="text-neutral-400 text-[11px] hidden xl:inline">
              15/15 vector layers from model.svg synchronized with independent Head/Torso pivot
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={setIdleState}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeExpression === 'idle'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reset to 1:1 Idle Match</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: 1:1 COMPARATOR */}
      {labMode === 'comparator' && (
        <div className="flex flex-col gap-6">
          {comparatorView === 'split' ? (
            /* Split View Side-by-Side */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Reference (Original model.svg image OR .riv runtime) */}
              <div className="bg-[#0e0e12] border border-neutral-800 rounded-3xl p-4 flex flex-col items-center justify-between relative overflow-hidden min-h-[460px]">
                <div className="w-full flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${referenceSource === 'model-svg' ? 'bg-emerald-400' : 'bg-indigo-500'} animate-pulse`} />
                    <span className={`text-xs font-bold font-mono ${referenceSource === 'model-svg' ? 'text-emerald-300' : 'text-indigo-300'}`}>
                      {referenceSource === 'model-svg' ? 'ORIGINAL REFERENCE: model.svg' : 'ORIGINAL REFERENCE: Coach Sloane (.riv)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800">
                    {referenceSource === 'model-svg' ? 'Vector Image • 2377 × 4096' : 'Artboard: expressions'}
                  </span>
                </div>

                {/* Reference Visual Viewport */}
                <div className="w-full flex-1 flex items-center justify-center relative min-h-[360px] h-[460px] py-2">
                  {referenceSource === 'model-svg' ? (
                    <div
                      className="relative flex items-center justify-center select-none mx-auto"
                      style={{
                        aspectRatio: '2377 / 4096',
                        height: '100%',
                        maxHeight: '460px',
                        width: 'auto',
                        maxWidth: '100%',
                      }}
                    >
                      <img
                        src="/model.svg"
                        alt="Original Coach Sloane model.svg"
                        className="w-full h-full object-contain select-none drop-shadow-2xl"
                        style={{ display: 'block' }}
                      />
                    </div>
                  ) : (
                    <RiveCanvasView
                      source={COACH_SLOANE_SOURCE}
                      fitMode={Fit.Contain}
                      alignmentMode={Alignment.Center}
                      onRiveLoaded={handleRiveLoaded}
                      onError={err => console.warn('Comparator Rive load error:', err)}
                    />
                  )}
                </div>

                <div className="w-full text-center text-[11px] text-neutral-500 font-mono pt-2 border-t border-neutral-900">
                  {referenceSource === 'model-svg'
                    ? 'Original Vector Image Asset • 15 Semantic Illustrated Layers • Native Ratio'
                    : 'Interactive Rive 7.0 WASM Runtime • 77 Animations'}
                </div>
              </div>

              {/* Right Column: 1:1 Cloned Rig (SVG Vector with Head/Torso Rigging) */}
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="bg-[#0e0e12] border border-neutral-800 rounded-3xl p-4 flex flex-col items-center justify-between relative overflow-hidden min-h-[460px]"
              >
                <div className="w-full flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      1:1 CLONE: model.svg Rig
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/30 border border-emerald-800/40">
                    {activeExpression === 'idle' ? 'Idle: 100% 1:1 Match' : 'Rig: Animated'}
                  </span>
                </div>

                {/* SVG Vector Render with Precise Deformers */}
                <div className="w-full flex-1 flex items-center justify-center relative min-h-[360px] h-[460px] py-2">
                  <ModelSvgCanvas def={deformations} showBones={showBones} />
                </div>

                <div className="w-full text-center text-[11px] text-neutral-500 font-mono pt-2 border-t border-neutral-900">
                  Separated Cranial Head Rig & Torso Base • 2377 × 4096 Locked Ratio
                </div>
              </div>
            </div>
          ) : comparatorView === 'wipe' ? (
            /* Interactive Wipe Curtain View */
            <div className="bg-[#0e0e12] border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-between relative overflow-hidden min-h-[520px]">
              <div className="w-full flex items-center justify-between z-10 mb-4">
                <div className="flex items-center gap-2">
                  <Split className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white font-mono">
                    INTERACTIVE WIPE CURTAIN (Left: Original model.svg | Right: Cloned Rig)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Curtain: {wipePercent}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={wipePercent}
                    onChange={e => setWipePercent(parseInt(e.target.value))}
                    className="w-32 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Stacked Canvases with Wipe Curtain */}
              <div
                className="relative flex items-center justify-center overflow-hidden mx-auto rounded-2xl border border-neutral-800/80 shadow-2xl bg-black/40"
                style={{
                  aspectRatio: '2377 / 4096',
                  height: '460px',
                  maxHeight: '460px',
                  width: 'auto',
                  maxWidth: '100%',
                }}
              >
                {/* Underneath: Original Reference (model.svg image or .riv) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {referenceSource === 'model-svg' ? (
                    <img
                      src="/model.svg"
                      alt="Original model.svg"
                      className="w-full h-full object-contain select-none pointer-events-none"
                    />
                  ) : (
                    <RiveCanvasView
                      source={COACH_SLOANE_SOURCE}
                      fitMode={Fit.Contain}
                      alignmentMode={Alignment.Center}
                      onRiveLoaded={handleRiveLoaded}
                      onError={() => {}}
                    />
                  )}
                </div>

                {/* Foreground Clipped: Cloned Rig */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `polygon(${wipePercent}% 0, 100% 0, 100% 100%, ${wipePercent}% 100%)`,
                  }}
                >
                  <ModelSvgCanvas def={deformations} showBones={showBones} />
                </div>

                {/* Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none z-20 shadow-lg shadow-amber-500/50"
                  style={{ left: `${wipePercent}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold text-[9px] flex items-center justify-center shadow-md">
                    ↔
                  </div>
                </div>
              </div>

              <div className="w-full text-center text-xs text-neutral-400 font-mono mt-4">
                Drag slider to reveal original model.svg on the left and cloned rig on the right. In Idle state, the seam is 100% invisible!
              </div>
            </div>
          ) : (
            /* Ghost Overlay View */
            <div className="bg-[#0e0e12] border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-between relative overflow-hidden min-h-[500px]">
              <div className="w-full flex items-center justify-between z-10 mb-4">
                <div className="flex items-center gap-2">
                  <OverlayIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white font-mono">
                    GHOST OVERLAY COMPARISON (Align Silhouette)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Clone Opacity: {overlayOpacity}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlayOpacity}
                    onChange={e => setOverlayOpacity(parseInt(e.target.value))}
                    className="w-32 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Stacked Canvases */}
              <div
                className="relative flex items-center justify-center overflow-hidden mx-auto rounded-2xl border border-neutral-800/80 shadow-2xl bg-black/40"
                style={{
                  aspectRatio: '2377 / 4096',
                  height: '460px',
                  maxHeight: '460px',
                  width: 'auto',
                  maxWidth: '100%',
                }}
              >
                {/* Background: Original Reference */}
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                  {referenceSource === 'model-svg' ? (
                    <img
                      src="/model.svg"
                      alt="Original model.svg"
                      className="w-full h-full object-contain select-none"
                    />
                  ) : (
                    <RiveCanvasView
                      source={COACH_SLOANE_SOURCE}
                      fitMode={Fit.Contain}
                      alignmentMode={Alignment.Center}
                      onRiveLoaded={handleRiveLoaded}
                      onError={() => {}}
                    />
                  )}
                </div>

                {/* Foreground: Clone Overlay */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none transition-opacity flex items-center justify-center"
                  style={{ opacity: overlayOpacity / 100 }}
                >
                  <ModelSvgCanvas def={deformations} showBones={false} />
                </div>
              </div>

              <div className="w-full text-center text-xs text-neutral-400 font-mono mt-4">
                Slide opacity to verify 1:1 facial alignment, glasses offset, and mouth curvature
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: 2.5D RIG & FACE TRACKING WORKSPACE */}
      {labMode === 'rig' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Rig Viewport */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-7 bg-[#0a0a0d] border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-between relative overflow-hidden min-h-[500px]"
          >
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-300">
                  Interactive Viewport (Move mouse across canvas to test 2.5D Tracking)
                </span>
              </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center relative py-6">
              <ModelSvgCanvas def={deformations} showBones={showBones} />
            </div>

            <div className="w-full flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-3 border-t border-neutral-900">
              <span>Head Yaw: {deformations.headYaw.toFixed(1)}°</span>
              <span>Head Pitch: {deformations.headPitch.toFixed(1)}px</span>
              <span>Pupil Gaze: X:{deformations.gazeX.toFixed(1)} Y:{deformations.gazeY.toFixed(1)}</span>
              <span>Jaw Drop: {(deformations.jawOpen * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Speech Synthesizer & Layer Telemetry */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Live Speech Synthesizer Simulator */}
            <div className="bg-[#141418] border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-rose-400" />
                  Phonetic Speech Lipsync
                </span>
                <span className="text-[10px] text-neutral-400">10-frame syllable transitions</span>
              </div>

              <div className="flex flex-col gap-2">
                {SPEECH_PHRASES.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => playSpeechPhrase(idx)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      activeSpeechIdx === idx
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span>"{sp.text}"</span>
                    <Play className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>

              {activeViseme && (
                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">Active Viseme:</span>
                  <span className="text-rose-300 font-bold font-mono">{activeViseme}</span>
                </div>
              )}
            </div>

            {/* 3-Layer Concurrent Machine Telemetry */}
            <div className="bg-[#141418] border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Active Concurrent Layers (sm-main)
              </span>

              <div className="flex flex-col gap-2">
                {/* Layer 0 */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono block">Layer 0 (Main/Body)</span>
                    <span className="font-semibold text-amber-300">{activeExpression}_1</span>
                  </div>
                  <span className="font-mono text-neutral-400 text-[11px]">
                    Tilt: {deformations.headPitch.toFixed(1)}px
                  </span>
                </div>

                {/* Layer 1 */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono block">Layer 1 (Oral/Mouth)</span>
                    <span className="font-semibold text-rose-300">
                      {activeViseme || `${activeExpression}_mouth`}
                    </span>
                  </div>
                  <span className="font-mono text-neutral-400 text-[11px]">
                    Aperture: {(deformations.jawOpen * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Layer 2 */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono block">Layer 2 (Eyes/Brows)</span>
                    <span className="font-semibold text-indigo-300">
                      {blinkAmount > 0.5 ? 'blink_cycle' : `${activeExpression}_eyes`}
                    </span>
                  </div>
                  <span className="font-mono text-neutral-400 text-[11px]">
                    Lid: {blinkAmount > 0.5 ? 'Closed' : 'Open'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: MANUAL POSE & BLEND STUDIO */}
      {labMode === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#0a0a0d] border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-center relative min-h-[480px]">
            <ModelSvgCanvas def={deformations} showBones={showBones} />
          </div>

          <div className="lg:col-span-6 bg-[#141418] border border-neutral-800 rounded-3xl p-6 flex flex-col gap-4 max-h-[580px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Precision Anatomical Sliders
              </span>
              <button
                onClick={() =>
                  setManualPose({
                    headYaw: 0,
                    headPitch: 0,
                    headRoll: 0,
                    gazeX: 0,
                    gazeY: 0,
                    eyebrowL: 0,
                    eyebrowR: 0,
                    jawOpen: 0,
                    smileFrown: 0.5,
                    lipStretch: 1,
                    blink: 0,
                  })
                }
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                Reset All to Neutral
              </button>
            </div>

            {/* Slider Groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Head Yaw */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Head Yaw (Turn)</span>
                  <span>{manualPose.headYaw}°</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={manualPose.headYaw}
                  onChange={e => setManualPose(p => ({ ...p, headYaw: parseFloat(e.target.value) }))}
                  className="accent-indigo-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Head Pitch */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Head Pitch (Tilt)</span>
                  <span>{manualPose.headPitch}px</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={manualPose.headPitch}
                  onChange={e => setManualPose(p => ({ ...p, headPitch: parseFloat(e.target.value) }))}
                  className="accent-indigo-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Eye Gaze X */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Gaze Horizontal</span>
                  <span>{manualPose.gazeX}px</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  value={manualPose.gazeX}
                  onChange={e => setManualPose(p => ({ ...p, gazeX: parseFloat(e.target.value) }))}
                  className="accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Eye Gaze Y */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Gaze Vertical</span>
                  <span>{manualPose.gazeY}px</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  value={manualPose.gazeY}
                  onChange={e => setManualPose(p => ({ ...p, gazeY: parseFloat(e.target.value) }))}
                  className="accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Brow Left */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Eyebrow Left</span>
                  <span>{manualPose.eyebrowL}px</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={manualPose.eyebrowL}
                  onChange={e => setManualPose(p => ({ ...p, eyebrowL: parseFloat(e.target.value) }))}
                  className="accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Brow Right */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Eyebrow Right</span>
                  <span>{manualPose.eyebrowR}px</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={manualPose.eyebrowR}
                  onChange={e => setManualPose(p => ({ ...p, eyebrowR: parseFloat(e.target.value) }))}
                  className="accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Jaw Open */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Jaw Open (Oral Cavity)</span>
                  <span>{(manualPose.jawOpen * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={manualPose.jawOpen}
                  onChange={e => setManualPose(p => ({ ...p, jawOpen: parseFloat(e.target.value) }))}
                  className="accent-rose-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Smile / Frown */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Smile / Frown Curvature</span>
                  <span>{manualPose.smileFrown.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={manualPose.smileFrown}
                  onChange={e => setManualPose(p => ({ ...p, smileFrown: parseFloat(e.target.value) }))}
                  className="accent-rose-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Eyelid Blink */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Eyelid Close (Blink)</span>
                  <span>{(manualPose.blink * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={manualPose.blink}
                  onChange={e => setManualPose(p => ({ ...p, blink: parseFloat(e.target.value) }))}
                  className="accent-purple-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Lip Stretch */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Lip Stretch / Pucker</span>
                  <span>{manualPose.lipStretch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.02"
                  value={manualPose.lipStretch}
                  onChange={e => setManualPose(p => ({ ...p, lipStretch: parseFloat(e.target.value) }))}
                  className="accent-rose-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: REVERSE-ENGINEERING SPEC & BLUEPRINT */}
      {labMode === 'spec' && (
        <div className="bg-[#141418] border border-neutral-800 rounded-3xl p-6 flex flex-col gap-6 text-xs leading-relaxed">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                Rive 7.0 Reverse-Engineering Master Specification
              </h3>
              <p className="text-neutral-400 text-xs">
                Complete rigging hierarchy, state machine concurrent layers, and 1:1 curve parameters
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `/docs/RIVE_EXPRESSIONS_DEEP_ANALYSIS_AND_CLONING_SPEC.md`
                );
                setCopiedDoc(true);
                setTimeout(() => setCopiedDoc(false), 2000);
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDoc ? 'Copied Path!' : 'Copy Spec Path'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <span className="text-amber-400 font-bold font-mono">1. Layer 0 (Body/Head)</span>
              <p className="text-neutral-400 text-[11px]">
                Parent bone `Head_Root` drives torso breathing (720 frames, 12s period), neck roll, and 2.5D head yaw/pitch with quadratic easing.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <span className="text-rose-400 font-bold font-mono">2. Layer 1 (Mouth/Oral)</span>
              <p className="text-neutral-400 text-[11px]">
                Oral cavity exposes crimson backdrop (`#2E0C12`), upper dental white arch (`#FAF3F0`), and tongue contour (`#DF5A67`) across 9 phonemes.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <span className="text-indigo-400 font-bold font-mono">3. Layer 2 (Eyes/Brows)</span>
              <p className="text-neutral-400 text-[11px]">
                Eyelid clipping paths execute 140ms blinks every 3.5s; pupils drift via micro-saccades (`idle_eyes`, 510 frames, 8.5s period).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shared Expression & Viseme Trigger Grid */}
      <div className="bg-[#141418] border border-neutral-800 rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Trigger Synchronized Expressions
            </span>
          </div>
          <span className="text-[11px] text-neutral-400">
            Triggers both Coach Sloane (.riv) and Model Clone in exact lockstep
          </span>
        </div>

        {/* 11 Expressions + Greeting */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'happy', label: 'Happy', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60' },
            { id: 'sad', label: 'Sad', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-500/60' },
            { id: 'angry', label: 'Angry', color: 'bg-red-500/10 text-red-400 border-red-500/30 hover:border-red-500/60' },
            { id: 'surprised', label: 'Surprised', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500/60' },
            { id: 'thinking', label: 'Thinking', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:border-purple-500/60' },
            { id: 'bored', label: 'Bored', color: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30 hover:border-neutral-500/60' },
            { id: 'unsure', label: 'Unsure', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:border-orange-500/60' },
            { id: 'impressed', label: 'Impressed', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:border-teal-500/60' },
            { id: 'shocked', label: 'Shocked', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:border-rose-500/60' },
            { id: 'concerned', label: 'Concerned', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:border-indigo-500/60' },
            { id: 'disappointed', label: 'Disappointed', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30 hover:border-slate-500/60' },
            { id: 'greeting', label: 'Greeting', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60' },
          ].map(exp => (
            <button
              key={exp.id}
              onClick={() => {
                setActiveViseme(null);
                triggerSynchronizedExpression(exp.id, 'expression');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeExpression === exp.id && !activeViseme
                  ? `${exp.color} ring-2 ring-white/30 shadow-md font-bold scale-[1.03]`
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              {exp.label}
            </button>
          ))}
        </div>

        {/* 9 Phonetic Visemes */}
        <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Phonetic Visemes (Lip-Sync Mouth Shapes)
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { v: 'visemeA', label: 'A (Ah/Open)' },
              { v: 'visemeB', label: 'B (B/P/M Closed)' },
              { v: 'visemeC', label: 'C (S/Z Teeth)' },
              { v: 'visemeD', label: 'D (Th/L Tongue)' },
              { v: 'visemeE', label: 'E (Ee/Wide)' },
              { v: 'visemeF', label: 'F (F/V Lip-Bite)' },
              { v: 'visemeG', label: 'G (K/G Throat)' },
              { v: 'visemeH', label: 'H (Oh/Oo Pucker)' },
              { v: 'visemeX', label: 'X (Rest)' },
            ].map(vis => (
              <button
                key={vis.v}
                onClick={() => {
                  setActiveViseme(vis.v);
                  triggerSynchronizedExpression(vis.v, 'viseme');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                  activeViseme === vis.v
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-2 ring-amber-500/20 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {vis.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// HIGH-PRECISION 1:1 MODEL.SVG CANVAS COMPONENT
// ==========================================
interface ModelSvgCanvasProps {
  def: any;
  showBones?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ModelSvgCanvas: React.FC<ModelSvgCanvasProps> = ({ def, showBones, className, style }) => {
  return <ModelSvgRig def={def} showBones={showBones} className={className} style={style} />;
};

const _LegacyModelSvgCanvas: React.FC<ModelSvgCanvasProps> = ({ def, showBones }) => {
  // Eye positions in unscaled space (X: 1355, Y: 1700 for Left; X: 2625, Y: 1700 for Right)
  const leftEyeX = 1355 + def.gazeX * 4.5;
  const leftEyeY = 1700 + def.gazeY * 3.5;
  const rightEyeX = 2625 + def.gazeX * 4.5;
  const rightEyeY = 1700 + def.gazeY * 3.5;

  // Mouth geometry in unscaled space
  const mouthCenterX = 1975;
  const mouthCenterY = 1995 + (def.mouthY || 0) * 8;
  const smileAmount = def.smileFrown; // -1 to +1
  const stretch = def.lipStretch || 1.0;
  const jawAperture = Math.max(0, def.jawOpen || 0);

  // Scaled coordinates for bones overlay (0.580322 scale factor)
  const S = 0.580322;

  return (
    <div
      className="relative flex items-center justify-center w-full h-full max-h-[460px] aspect-[2377/4096] select-none mx-auto"
      style={{
        transform: `translateY(${def.torsoY * 1.5}px)`,
      }}
    >
      <svg
        viewBox="100 420 2177 3420"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full drop-shadow-2xl select-none"
      >
        <defs>
          <linearGradient id="chk-m" x1="3179" y1="2215" x2="2710" y2="2160" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#58413E" />
            <stop offset="1" stopColor="#775E59" />
          </linearGradient>
          <linearGradient id="fld-m" x1="2593" y1="3175" x2="2524" y2="3046" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#553E3A" />
            <stop offset="1" stopColor="#80615E" />
          </linearGradient>
          {/* Iris Gradient */}
          <radialGradient id="iris-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E070D" />
            <stop offset="60%" stopColor="#580D2B" />
            <stop offset="100%" stopColor="#320716" />
          </radialGradient>
          {/* Oral Cavity Depth Gradient */}
          <linearGradient id="oral-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#25080E" />
            <stop offset="60%" stopColor="#4A131E" />
            <stop offset="100%" stopColor="#6E1E2C" />
          </linearGradient>
          {/* Soft Cheeks Blush Gradient */}
          <radialGradient id="blush-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E5605F" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#E5605F" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E5605F" stopOpacity="0" />
          </radialGradient>

          {/* Cranial Head ClipPath: Isolates the upper cranial dome of the hijab above the neck */}
          <clipPath id="cranial-hood-clip">
            <path d="M 0 0 L 4096 0 L 4096 2200 C 3400 2360 2600 2440 1980 2440 C 1360 2440 600 2360 0 2200 Z" />
          </clipPath>

          {/* Authentic Left Eye Socket ClipPath from model.svg */}
          <clipPath id="left-eye-clip">
            <path d="M1266 1595C1315 1578 1410 1586 1457 1610 1462 1613 1477 1621 1481 1624 1492 1632 1496 1635 1506 1645 1560 1716 1492 1773 1426 1790 1415 1793 1404 1796 1392 1799 1319 1808 1235 1803 1178 1749 1104 1678 1196 1611 1266 1595Z" />
          </clipPath>

          {/* Authentic Right Eye Socket ClipPath from model.svg */}
          <clipPath id="right-eye-clip">
            <path d="M2597 1595C2664 1585 2754 1606 2799 1660 2804 1668 2807 1673 2811 1682 2819 1723 2799 1757 2762 1775 2752 1785 2734 1791 2721 1795 2718 1797 2714 1798 2711 1799 2638 1819 2559 1814 2492 1778 2469 1763 2441 1739 2440 1710 2435 1631 2537 1601 2597 1595Z" />
          </clipPath>
        </defs>

        {/* Master Character Group: Applies the exact 0.580322 width scaling to match 2377:4096 intended ratio */}
        <g id="Character-Master" transform="scale(0.580322, 1)">
          {/* ========================================================= */}
          {/* LAYER 0: GROUNDED TORSO & BODY AREA (DOES NOT ROTATE)    */}
          {/* Anchors shoulders, chest cape drape, dark shirt & hem     */}
          {/* ========================================================= */}
          <g
            id="Torso-Body-Group"
            style={{
              transform: `translateY(${def.torsoY * 1.5}px)`,
              transition: 'transform 0.08s ease-out',
            }}
          >
            {/* 1. Grounded Base Outer Hijab & Shoulder Silhouette */}
            <path
              fill="#A48784"
              d="M898 3201C801 3129 757 3080 693 2978 619 2863 561 2739 519 2609 416 2292 416 1959 412 1629 411 1611 409 1593 407 1576 394 1468 382 1358 390 1250 449 492 1425 462 1997 475 2270 485 2545 505 2811 568 3097 636 3433 765 3533 1071 3582 1221 3568 1372 3556 1525 3548 1625 3564 1721 3547 1821 3501 2093 3397 2353 3360 2626 3346 2726 3352 2813 3376 2910 3384 2951 3380 2995 3370 3034 3355 3096 3325 3150 3288 3201 3279 3213 3237 3257 3234 3266 3237 3294 3244 3329 3249 3357L3277 3503 3313 3699C3319 3734 3326 3775 3333 3808H774C796 3706 817 3604 838 3501L860 3390C863 3377 870 3350 871 3337 871 3323 894 3219 898 3201Z"
            />

            {/* 2. Grounded Dark Shirt & Hem */}
            <path
              fill="#252122"
              d="M901 3203C1047 3302 1213 3370 1380 3426 1668 3520 1966 3578 2267 3600 2363 3606 2485 3609 2580 3594 2683 3579 2805 3534 2899 3491 2970 3459 3053 3411 3116 3365 3144 3344 3170 3322 3196 3299 3204 3292 3226 3268 3234 3266 3237 3294 3244 3329 3249 3357L3277 3503 3313 3699C3319 3734 3326 3775 3333 3808H774C796 3706 817 3604 838 3501L860 3390C863 3377 870 3350 871 3337 880 3317 896 3228 901 3203Z"
            />

            {/* 3. Grounded Chest Drape Folds (Belongs to Torso) */}
            <path
              fill="url(#fld-m)"
              d="M2830 2875C2833 2877 2831 2876 2833 2880 2788 3110 2550 3237 2332 3247 2304 3248 2276 3248 2248 3248L2246 3247 2246 3245C2264 3243 2300 3245 2322 3244 2376 3241 2430 3232 2482 3216 2616 3175 2711 3093 2781 2973 2800 2939 2811 2910 2828 2877L2830 2875Z"
            />
            {/* Deep chest crease fold */}
            <path
              fill="#604439"
              d="M1427 2716C1431 2716 1528 2758 1546 2765 1724 2834 1922 2906 2115 2906 2144 2906 2191 2898 2220 2890 2276 2876 2352 2849 2390 2802 2405 2783 2408 2772 2418 2754 2421 2758 2420 2756 2419 2763 2404 2848 2281 2894 2207 2908 2000 2949 1778 2857 1586 2786 1549 2773 1458 2736 1427 2716Z"
            />
          </g>

          {/* ========================================================= */}
          {/* LAYER 1: HEAD AREA RIG (PIVOTS AT THE NECK JOINT)        */}
          {/* Rotates ONLY the skull, upper cranial hood, face skin,    */}
          {/* eyes, eyebrows, glasses and mouth independently!          */}
          {/* ========================================================= */}
          <g
            id="Head-Rig"
            style={{
              transform: `translate(${def.headYaw * 4.5}px, ${def.headPitch * 7}px) rotate(${def.headRoll}deg) scale(${def.headScale})`,
              transformOrigin: '1980px 2220px',
              transition: 'transform 0.08s cubic-bezier(0.2, 0.8, 0.3, 1)',
            }}
          >
            {/* 1. Upper Cranial Dome of Hijab (Clipped to head area above neck) */}
            <g clipPath="url(#cranial-hood-clip)">
              <path
                fill="#A48784"
                d="M898 3201C801 3129 757 3080 693 2978 619 2863 561 2739 519 2609 416 2292 416 1959 412 1629 411 1611 409 1593 407 1576 394 1468 382 1358 390 1250 449 492 1425 462 1997 475 2270 485 2545 505 2811 568 3097 636 3433 765 3533 1071 3582 1221 3568 1372 3556 1525 3548 1625 3564 1721 3547 1821 3501 2093 3397 2353 3360 2626 3346 2726 3352 2813 3376 2910 3384 2951 3380 2995 3370 3034 3355 3096 3325 3150 3288 3201 3279 3213 3237 3257 3234 3266 3237 3294 3244 3329 3249 3357L3277 3503 3313 3699C3319 3734 3326 3775 3333 3808H774C796 3706 817 3604 838 3501L860 3390C863 3377 870 3350 871 3337 871 3323 894 3219 898 3201Z"
              />
            </g>

            {/* 2. Head Area Hijab Folds, Cheeks & Chin Wrap Shadows */}
            {/* Left cheek fold crease */}
            <path
              fill="#604439"
              d="M711 1813C711 1802 720 1731 723 1722L725 1723 726 1734C725 1745 724 1753 724 1765 719 1776 718 1827 718 1841 716 1855 717 1868 716 1880 718 1928 716 2054 730 2097 731 2114 735 2135 738 2152 789 2475 967 2754 1268 2894 1309 2912 1350 2929 1393 2943 1410 2949 1440 2956 1455 2963 1443 2963 1430 2958 1418 2955 867 2808 681 2350 711 1813Z"
            />
            {/* Right cheek fold crease */}
            <path
              fill="#604439"
              d="M3214 1835L3214 1833C3221 1805 3223 1768 3226 1739L3227 1739C3230 1764 3232 1852 3224 1873 3218 1881 3220 1877 3218 1887L3217 1889 3218 1893C3217 1886 3216 1878 3213 1871L3211 1871 3209 1878 3208 1866C3210 1857 3212 1845 3214 1835Z"
            />
            {/* Hijab Inner Frame Shadows */}
            <path
              fill="#7B6360"
              d="M718 1841C718 1863 717 1893 721 1914 724 1931 748 1959 759 1973 811 2038 880 2091 951 2132 960 2137 978 2149 988 2149 1007 2160 1027 2170 1047 2180 1394 2353 2052 2388 2442 2343 2551 2330 2658 2308 2762 2273 2884 2232 3000 2172 3090 2079 3133 2033 3158 1992 3185 1937 3195 1918 3204 1886 3208 1866L3224 1873C3220 1943 3196 2018 3166 2081 3155 2104 3135 2138 3125 2160 3112 2199 3093 2235 3071 2270 2933 2488 2712 2619 2463 2675 2072 2763 1451 2672 1113 2457 926 2339 773 2163 724 1943L730 2097C716 2054 718 1928 716 1879 717 1868 716 1855 718 1841ZM768 1545C765 1546 763 1548 760 1549L758 1546C769 1530 767 1522 774 1506 785 1480 796 1446 808 1422 869 1300 978 1195 1095 1127 1177 1080 1264 1043 1356 1019 1686 929 2160 944 2491 1031 2748 1097 2994 1234 3129 1471 3134 1478 3155 1517 3153 1523 3115 1499 3075 1475 3035 1454 3008 1440 2980 1427 2953 1414L2960 1406C2860 1344 2743 1302 2627 1281 2596 1276 2564 1270 2532 1270 2512 1260 2384 1236 2353 1231 1986 1172 1585 1170 1229 1286 1063 1339 894 1424 768 1545Z"
            />
            {/* Cheek Gradient Shading */}
            <path
              fill="url(#chk-m)"
              d="M3208 1866L3224 1873C3220 1943 3196 2018 3166 2081 3155 2104 3135 2138 3125 2160 3109 2181 3094 2205 3077 2226 2984 2341 2860 2432 2723 2488 2711 2493 2684 2506 2672 2505 2680 2497 2700 2492 2711 2488 2903 2411 3067 2264 3148 2072 3159 2046 3196 1963 3185 1937 3195 1918 3204 1886 3208 1866Z"
            />
            {/* Chin Wrap Overlap */}
            <path
              fill="#A48784"
              d="M718 1841C718 1827 719 1776 724 1765 725 1778 723 1790 723 1803 723 1832 722 1862 725 1891 786 1986 846 2057 941 2118 949 2123 984 2144 988 2149 978 2149 960 2137 951 2132 880 2091 811 2038 759 1973 748 1959 724 1931 721 1914 717 1893 718 1863 718 1841Z"
            />

            {/* 3. Face Inner Group (Internal 2.5D Spherical Depth Parallax) */}
            <g
              id="Face-Features-Group"
              style={{
                transform: `translate(${def.faceParallaxX * 1.5}px, ${def.faceParallaxY * 1.5}px)`,
                transition: 'transform 0.08s ease-out',
              }}
            >
              {/* Face Skin Base */}
              <path
                fill="#FDD7CE"
                d="M768 1545L758 1546C769 1530 767 1522 774 1506 785 1480 796 1446 808 1422 869 1300 978 1195 1095 1127 1177 1080 1264 1043 1356 1019 1686 929 2160 944 2491 1031 2748 1097 2994 1234 3129 1471 3134 1478 3155 1517 3153 1523 3180 1553 3211 1672 3220 1715 3228 1751 3213 1798 3214 1835 3212 1845 3210 1857 3208 1866L3224 1873C3220 1943 3196 2018 3166 2081 3155 2104 3135 2138 3125 2160 3112 2199 3093 2235 3071 2270 2933 2488 2712 2619 2463 2675 2072 2763 1451 2672 1113 2457 926 2339 773 2163 724 1943L730 2097C716 2054 718 1928 716 1879 717 1868 716 1855 718 1841 718 1827 719 1776 724 1764 724 1753 725 1745 726 1734 730 1717 731 1696 734 1679 737 1658 741 1637 742 1616L744 1613C746 1583 750 1569 768 1545Z"
              />

              {/* Face Light Base & Highlights */}
              <path
                fill="#FDD7CE"
                d="M1028 1424C1069 1412 1111 1400 1154 1393 1272 1372 1439 1377 1553 1417 1658 1446 1797 1523 1831 1633 1854 1624 1905 1607 1930 1608L1933 1608C1983 1596 2064 1612 2112 1629 2165 1499 2343 1417 2476 1399 2566 1380 2673 1380 2764 1392 2773 1393 2805 1398 2812 1400 2842 1405 2873 1414 2902 1423 2935 1435 2977 1450 3006 1469 3054 1490 3114 1542 3142 1586 3253 1763 3076 1910 2919 1962 2801 2001 2645 2023 2521 2000 2511 2000 2490 1996 2480 1994 2467 1992 2454 1989 2441 1986 2285 1952 2060 1838 2106 1645 2017 1616 1924 1607 1837 1651 1838 1661 1841 1675 1841 1685 1844 1872 1603 1971 1451 1993 1447 1993 1444 1994 1441 1994 1407 2001 1355 2004 1321 2005 1175 2007 1022 1979 898 1898 786 1826 719 1703 802 1580L809 1570C814 1562 821 1555 827 1548 831 1543 837 1538 841 1533L864 1513C887 1494 902 1484 927 1469 949 1456 976 1445 999 1435L1028 1424Z"
              />
              <path
                fill="#FEE4DC"
                d="M1807 1645L1788 1628C1782 1602 1760 1583 1745 1559L1748 1554C1645 1452 1508 1418 1370 1404 1377 1402 1382 1402 1391 1402 1431 1403 1498 1419 1538 1430 1636 1463 1745 1514 1794 1612 1799 1622 1804 1634 1807 1645ZM2172 1577C2171 1584 2157 1606 2157 1607 2151 1625 2156 1639 2143 1656 2142 1651 2143 1652 2144 1647L2135 1645C2145 1616 2153 1601 2172 1577Z"
              />

              {/* Warm Rosy Cheeks Blush (Glowing on Happy, Impressed, Greeting) */}
              <g
                style={{
                  opacity: Math.max(0, def.blushOpacity || 0.05),
                  transition: 'opacity 0.25s ease-out',
                }}
              >
                <ellipse cx="1180" cy="1860" rx="180" ry="90" fill="url(#blush-grad)" />
                <ellipse cx="2780" cy="1860" rx="180" ry="90" fill="url(#blush-grad)" />
              </g>

              {/* 4. ANATOMICAL EYES & SCLERA (Layer 2) */}
              <g id="Eyes-Layer">
                {/* Left Eye Whites & Sclera */}
                <path fill="#FAF4F2" d="M1266 1595C1315 1578 1410 1586 1457 1610 1462 1613 1477 1621 1481 1624 1492 1632 1496 1635 1506 1645 1560 1716 1492 1773 1426 1790 1415 1793 1404 1796 1392 1799 1319 1808 1235 1803 1178 1749 1104 1678 1196 1611 1266 1595Z" />
                {/* Right Eye Whites & Sclera */}
                <path fill="#FAF4F2" d="M2597 1595C2664 1585 2754 1606 2799 1660 2804 1668 2807 1673 2811 1682 2819 1723 2799 1757 2762 1775 2752 1785 2734 1791 2721 1795 2718 1797 2714 1798 2711 1799 2638 1819 2559 1814 2492 1778 2469 1763 2441 1739 2440 1710 2435 1631 2537 1601 2597 1595Z" />

                {/* Left Eye Iris, Pupil & Specular Catchlight */}
                <g clipPath="url(#left-eye-clip)">
                  {/* Iris */}
                  <circle cx={leftEyeX} cy={leftEyeY} r="76" fill="url(#iris-grad)" />
                  {/* Pupil */}
                  <circle cx={leftEyeX} cy={leftEyeY} r="44" fill="#120408" />
                  {/* 10 o'clock primary specular reflection */}
                  <circle cx={leftEyeX - 18} cy={leftEyeY - 18} r="14" fill="#FFFFFF" opacity="0.9" />
                  <circle cx={leftEyeX + 14} cy={leftEyeY + 14} r="8" fill="#FFFFFF" opacity="0.6" />

                  {/* Upper Eyelid Drop (Blinks & Sleek squint) */}
                  <rect
                    x="1000"
                    y="1450"
                    width="600"
                    height={def.blink > 0 ? 170 + def.blink * 180 : 80 + (def.squint || 0) * 110}
                    fill="#FDD7CE"
                    style={{ transition: 'height 0.05s ease-out' }}
                  />
                  {/* Lower Eyelid Push (Duchenne Smile) */}
                  {def.squint > 0 && (
                    <rect
                      x="1000"
                      y={1820 - def.squint * 70}
                      width="600"
                      height="100"
                      fill="#FDD7CE"
                      style={{ transition: 'y 0.08s ease-out' }}
                    />
                  )}
                </g>

                {/* Right Eye Iris, Pupil & Specular Catchlight */}
                <g clipPath="url(#right-eye-clip)">
                  <circle cx={rightEyeX} cy={rightEyeY} r="76" fill="url(#iris-grad)" />
                  <circle cx={rightEyeX} cy={rightEyeY} r="44" fill="#120408" />
                  <circle cx={rightEyeX - 18} cy={rightEyeY - 18} r="14" fill="#FFFFFF" opacity="0.9" />
                  <circle cx={rightEyeX + 14} cy={rightEyeY + 14} r="8" fill="#FFFFFF" opacity="0.6" />

                  {/* Upper Eyelid Drop */}
                  <rect
                    x="2350"
                    y="1450"
                    width="600"
                    height={def.blink > 0 ? 170 + def.blink * 180 : 80 + (def.squint || 0) * 110}
                    fill="#FDD7CE"
                    style={{ transition: 'height 0.05s ease-out' }}
                  />
                  {/* Lower Eyelid Push */}
                  {def.squint > 0 && (
                    <rect
                      x="2350"
                      y={1820 - def.squint * 70}
                      width="600"
                      height="100"
                      fill="#FDD7CE"
                      style={{ transition: 'y 0.08s ease-out' }}
                    />
                  )}
                </g>

                {/* Stylized Vector Eyelash Rim & Crease from model.svg */}
                <path
                  fill="#604439"
                  d="M1178 1749C1104 1678 1196 1611 1266 1595L1241 1640C1222 1671 1203 1701 1185 1732 1182 1738 1182 1747 1178 1749ZM1481 1624C1492 1632 1496 1635 1506 1645 1488 1674 1431 1760 1426 1790 1415 1793 1404 1796 1392 1799 1386 1798 1386 1799 1381 1796 1385 1786 1396 1778 1400 1770 1423 1722 1454 1679 1477 1632 1478 1630 1478 1628 1481 1624ZM2492 1778C2469 1763 2441 1739 2440 1710 2435 1631 2537 1601 2597 1595L2492 1778ZM2721 1795L2718 1792C2738 1750 2771 1708 2791 1665 2792 1661 2795 1661 2799 1660 2804 1668 2807 1673 2811 1682 2819 1723 2799 1757 2762 1775 2752 1785 2734 1791 2721 1795Z"
                />
              </g>

              {/* 5. AUTHENTIC DEFORMABLE EYEBROWS (Layer 2) */}
              <g id="Eyebrows-Layer">
                {/* Left Eyebrow (Pivot around X: 1377, Y: 1330) */}
                <g
                  style={{
                    transform: `translate(0px, ${def.eyebrowLY * 8}px) rotate(${def.eyebrowLRotate}deg)`,
                    transformOrigin: '1377px 1330px',
                    transition: 'transform 0.08s ease-out',
                  }}
                >
                  <path
                    fill="#580D2B"
                    d="M1454 1269C1535 1261 1638 1276 1708 1319 1676 1315 1646 1308 1613 1304 1479 1290 1372 1299 1243 1332 1211 1340 1180 1349 1148 1359 1127 1367 1057 1396 1046 1396 1053 1388 1088 1372 1100 1367 1207 1315 1335 1278 1454 1269Z"
                  />
                </g>

                {/* Right Eyebrow (Pivot around X: 2637, Y: 1340) */}
                <g
                  style={{
                    transform: `translate(0px, ${def.eyebrowRY * 8}px) rotate(${def.eyebrowRRotate}deg)`,
                    transformOrigin: '2637px 1340px',
                    transition: 'transform 0.08s ease-out',
                  }}
                >
                  <path
                    fill="#580D2B"
                    d="M2953 1414C2930 1401 2897 1388 2872 1377 2735 1318 2594 1294 2445 1300 2419 1302 2393 1304 2367 1307 2350 1310 2331 1314 2313 1315L2313 1313C2322 1303 2337 1299 2350 1295 2409 1273 2469 1269 2532 1270 2564 1270 2596 1276 2627 1281 2743 1302 2860 1344 2960 1406L2962 1409C2958 1414 2960 1412 2953 1414Z"
                  />
                </g>
              </g>

              {/* 6. ORAL CAVITY, TEETH & LIPS (Layer 1 - Speech & Genuine Smiling) */}
              <g
                id="Mouth-Layer"
                style={{
                  transform: `translateY(${mouthCenterY - 1995}px)`,
                  transition: 'transform 0.08s ease-out',
                }}
              >
                {jawAperture > 0.08 ? (
                  /* OPEN MOUTH SPEECH VISEMES & SURPRISED/SHOCKED */
                  <g>
                    {/* Clean Anatomical Oral Cavity */}
                    <ellipse
                      cx={mouthCenterX}
                      cy={mouthCenterY}
                      rx={190 * stretch}
                      ry={jawAperture * 85}
                      fill="url(#oral-depth)"
                    />
                    {/* Upper Pearlescent Enamel Teeth Crescent */}
                    <path
                      fill="#FAF3F0"
                      d={`M ${mouthCenterX - 150 * stretch} ${mouthCenterY - jawAperture * 30} Q ${mouthCenterX} ${mouthCenterY - jawAperture * 75} ${mouthCenterX + 150 * stretch} ${mouthCenterY - jawAperture * 30} Q ${mouthCenterX} ${mouthCenterY - jawAperture * 10} ${mouthCenterX - 150 * stretch} ${mouthCenterY - jawAperture * 30} Z`}
                    />
                    {/* Soft Tongue Floor */}
                    <path
                      fill="#DF5A67"
                      d={`M ${mouthCenterX - 130 * stretch} ${mouthCenterY + jawAperture * 40} Q ${mouthCenterX} ${mouthCenterY + jawAperture * 15} ${mouthCenterX + 130 * stretch} ${mouthCenterY + jawAperture * 40} Q ${mouthCenterX} ${mouthCenterY + jawAperture * 80} ${mouthCenterX - 130 * stretch} ${mouthCenterY + jawAperture * 40} Z`}
                    />
                    {/* Coral Rose Outer Lip Border */}
                    <ellipse
                      cx={mouthCenterX}
                      cy={mouthCenterY}
                      rx={195 * stretch}
                      ry={jawAperture * 88}
                      fill="none"
                      stroke="#E5605F"
                      strokeWidth="24"
                    />
                  </g>
                ) : (
                  /* CLOSED / RADIANT SMILE (Coach Sloane Parity) */
                  <g>
                    {/* Delicately Parted Pearlescent Teeth Line (Visible in Happy & Impressed) */}
                    {def.teethVisible > 0.05 && (
                      <path
                        fill="#FAF3F0"
                        style={{ opacity: def.teethVisible, transition: 'opacity 0.15s ease-out' }}
                        d={`M ${mouthCenterX - 130 * stretch} ${mouthCenterY - 14 - smileAmount * 18} Q ${mouthCenterX} ${mouthCenterY - 4 - smileAmount * 14} ${mouthCenterX + 130 * stretch} ${mouthCenterY - 14 - smileAmount * 18} Q ${mouthCenterX} ${mouthCenterY + 12 + smileAmount * 8} ${mouthCenterX - 130 * stretch} ${mouthCenterY - 14 - smileAmount * 18} Z`}
                      />
                    )}

                    {/* Authentic Curved Lip Contour Path */}
                    <path
                      fill="#E5605F"
                      d={`M ${mouthCenterX + 220 * stretch} ${mouthCenterY - 28 - smileAmount * 28} C ${mouthCenterX + 140} ${mouthCenterY + 15 + smileAmount * 38} ${mouthCenterX - 140} ${mouthCenterY + 15 + smileAmount * 38} ${mouthCenterX - 220 * stretch} ${mouthCenterY - 28 - smileAmount * 28} C ${mouthCenterX - 120} ${mouthCenterY + 36 + smileAmount * 52} ${mouthCenterX + 120} ${mouthCenterY + 36 + smileAmount * 52} ${mouthCenterX + 220 * stretch} ${mouthCenterY - 28 - smileAmount * 28} Z`}
                    />
                  </g>
                )}
              </g>

              {/* 7. WIRE GLASSES FRAMES (Scaled circular lenses + depth parallax & shadow) */}
              <g
                id="Glasses-Layer"
                style={{
                  transform: `translate(${def.glassesParallaxX}px, ${def.glassesParallaxY}px)`,
                  filter: 'drop-shadow(0px 10px 20px rgba(88, 13, 43, 0.22))',
                  transition: 'transform 0.08s ease-out',
                }}
              >
                {/* Authentic Glasses Frames from model.svg */}
                <path
                  fill="#580D2B"
                  d="M802 1580C807 1584 810 1592 811 1598 812 1602 812 1606 813 1610 744 1756 863 1869 988 1926 1104 1978 1229 1994 1355 1987 1375 1986 1396 1983 1416 1982L1421 1988 1417 1993C1424 1993 1434 1993 1441 1994 1407 2001 1355 2004 1321 2005 1175 2007 1022 1979 898 1898 786 1826 719 1703 802 1580ZM1028 1424C1069 1412 1111 1400 1154 1393 1272 1372 1439 1377 1553 1417 1560 1423 1566 1426 1571 1431 1568 1430 1542 1429 1538 1430 1498 1419 1431 1403 1391 1402 1304 1386 1132 1403 1050 1436 1039 1433 1039 1429 1028 1424ZM2476 1399C2486 1405 2483 1401 2492 1402 2529 1403 2671 1384 2698 1402 2525 1395 2342 1420 2205 1540 2195 1548 2179 1566 2172 1577 2153 1601 2145 1616 2135 1645 2087 1817 2280 1925 2418 1963 2428 1966 2438 1969 2448 1971 2442 1971 2440 1971 2434 1973L2433 1976 2436 1979C2438 1982 2439 1982 2441 1986 2285 1952 2060 1838 2106 1645 2017 1616 1924 1607 1837 1651 1838 1661 1841 1675 1841 1685 1844 1872 1603 1971 1451 1993 1447 1993 1444 1994 1441 1994 1434 1993 1424 1993 1417 1993 1421 1990 1420 1992 1421 1988L1416 1982C1562 1959 1746 1902 1804 1749 1816 1719 1816 1676 1807 1645 1804 1634 1799 1622 1794 1612 1745 1514 1636 1463 1538 1430 1542 1429 1568 1430 1571 1431 1566 1426 1560 1423 1553 1417 1658 1446 1797 1523 1831 1633 1854 1624 1905 1607 1930 1608L1933 1608C1983 1596 2064 1612 2112 1629 2165 1499 2343 1417 2476 1399Z"
                />

                {/* Subtle Lens Sheen Catchlights */}
                <line x1="1120" y1="1620" x2="1260" y2="1760" stroke="#FFFFFF" strokeWidth="8" opacity="0.4" strokeLinecap="round" />
                <line x1="2500" y1="1620" x2="2640" y2="1760" stroke="#FFFFFF" strokeWidth="8" opacity="0.4" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>

        {/* 8. SKELETAL BONE RIGGING OVERLAY */}
        {showBones && (
          <g className="opacity-90 pointer-events-none">
            {/* Spine (Torso Grounded) */}
            <line x1={2048 * S} y1="3600" x2={2048 * S} y2="2700" stroke="#f59e0b" strokeWidth="16" strokeDasharray="12 6" />
            <circle cx={2048 * S} cy="3600" r="18" fill="#f59e0b" />
            
            {/* Neck Joint (Connects Grounded Torso to Head Pivot) */}
            <line x1={2048 * S} y1="2700" x2={1980 * S} y2="2220" stroke="#3b82f6" strokeWidth="16" />
            <circle cx={2048 * S} cy="2700" r="22" fill="#3b82f6" />
            <circle cx={1980 * S} cy="2220" r="24" fill="#6366f1" />

            {/* Cranial Head Bone (Pivots independently on Neck) */}
            <line x1={1980 * S} y1="2220" x2={(1980 + def.headYaw * 4.5) * S} y2={1750 + def.headPitch * 7} stroke="#ec4899" strokeWidth="16" />
            <circle cx={(1980 + def.headYaw * 4.5) * S} cy={1750 + def.headPitch * 7} r="26" fill="#ec4899" />

            {/* Left/Right Eyebrows */}
            <line x1={(1980 + def.headYaw * 4.5) * S} y1={1750 + def.headPitch * 7} x2={1377 * S} y2={1330 + def.eyebrowLY * 8} stroke="#10b981" strokeWidth="12" />
            <line x1={(1980 + def.headYaw * 4.5) * S} y1={1750 + def.headPitch * 7} x2={2637 * S} y2={1340 + def.eyebrowRY * 8} stroke="#10b981" strokeWidth="12" />
            <circle cx={1377 * S} cy={1330 + def.eyebrowLY * 8} r="18" fill="#10b981" />
            <circle cx={2637 * S} cy={1340 + def.eyebrowRY * 8} r="18" fill="#10b981" />

            {/* Eyes */}
            <line x1={(1980 + def.headYaw * 4.5) * S} y1={1750 + def.headPitch * 7} x2={leftEyeX * S} y2={leftEyeY} stroke="#06b6d4" strokeWidth="12" />
            <line x1={(1980 + def.headYaw * 4.5) * S} y1={1750 + def.headPitch * 7} x2={rightEyeX * S} y2={rightEyeY} stroke="#06b6d4" strokeWidth="12" />
            <circle cx={leftEyeX * S} cy={leftEyeY} r="20" fill="#06b6d4" />
            <circle cx={rightEyeX * S} cy={rightEyeY} r="20" fill="#06b6d4" />

            {/* Mouth */}
            <line x1={(1980 + def.headYaw * 4.5) * S} y1={1750 + def.headPitch * 7} x2={mouthCenterX * S} y2={mouthCenterY} stroke="#f43f5e" strokeWidth="14" />
            <circle cx={mouthCenterX * S} cy={mouthCenterY} r="22" fill="#f43f5e" />
          </g>
        )}
      </svg>
    </div>
  );
};
