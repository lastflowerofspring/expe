/**
 * Coach Sloane Rive Character Architecture & Structure Specification
 * Learned and memorized from nothing.riv & nothing-G.riv
 *
 * Artboards:
 *  1. gameplay_coachsloane_expressions (177 KB) - Primary artboard with rich blendable expressions
 *  2. gameplay_coachsloane_light (59 KB) - Optimized artboard for lighter footprint
 *
 * Runtime Flow Architecture:
 *  - Character base posture, natural breathing, eye blinks, and micro-movements are driven by
 *    the background State Machine: `autoIdle`.
 *  - Facial expressions (`happy`, `sad`, etc.), triggers (`greeting`), and mouth shapes (`visemeA-X`)
 *    are 1D/additive linear animations designed to layer on top of `autoIdle` without killing the base rig.
 */

export interface ExpressionMeta {
  name: string;
  category: 'expressions' | 'triggers' | 'visemes' | 'switches';
  label: string;
  description: string;
  phonemeOrEmotion?: string;
  durationApproxMs?: number;
}

export const COACH_SLOANE_SCHEMA = {
  artboards: [
    {
      id: 'gameplay_coachsloane_expressions',
      name: 'Expressions Artboard (Full)',
      file: 'nothing.riv',
      description: 'Contains complete facial expressions, full viseme phonemes, greeting triggers, and autoIdle state machine.',
    },
    {
      id: 'gameplay_coachsloane_light',
      name: 'Lightweight Artboard (Light)',
      file: 'nothing-G.riv',
      description: 'Optimized build containing greeting, idle, viseme phonemes, and autoIdle state machine.',
    },
  ],

  // 1. Expressions (11 total)
  expressions: [
    { name: 'happy', category: 'expressions', label: 'happy', description: 'Warm open smile, lifted cheeks, relaxed upper brows', phonemeOrEmotion: 'Joy / Delight' },
    { name: 'sad', category: 'expressions', label: 'sad', description: 'Down-turned mouth corners, tilted inner eyebrows', phonemeOrEmotion: 'Sorrow / Melancholy' },
    { name: 'angry', category: 'expressions', label: 'angry', description: 'Furrowed brow, tense mouth, focused aggressive gaze', phonemeOrEmotion: 'Frustration / Anger' },
    { name: 'surprised', category: 'expressions', label: 'surprised', description: 'High raised brows, widened eyes, parted lips', phonemeOrEmotion: 'Surprise / Wonder' },
    { name: 'thinking', category: 'expressions', label: 'thinking', description: 'Contemplative sideways/upward glance, pursed lips', phonemeOrEmotion: 'Cognitive deliberation' },
    { name: 'bored', category: 'expressions', label: 'bored', description: 'Heavy half-closed eyelids, neutral flat mouth line', phonemeOrEmotion: 'Apathy / Disinterest' },
    { name: 'unsure', category: 'expressions', label: 'unsure', description: 'Asymmetric quizzical brow raise, skeptical smirk', phonemeOrEmotion: 'Doubt / Skepticism' },
    { name: 'impressed', category: 'expressions', label: 'impressed', description: 'Subtle acknowledging nod, raised brows, appreciative smile', phonemeOrEmotion: 'Respect / Admiration' },
    { name: 'shocked', category: 'expressions', label: 'shocked', description: 'Extreme eye widening, jaw dropped, alert posture', phonemeOrEmotion: 'Disbelief / Shock' },
    { name: 'concerned', category: 'expressions', label: 'concerned', description: 'Drawn together brows, tense lower eyelids, anxious mouth', phonemeOrEmotion: 'Empathy / Worry' },
    { name: 'disappointed', category: 'expressions', label: 'disappointed', description: 'Downward head tilt, slight sigh, crestfallen expression', phonemeOrEmotion: 'Letdown / Regret' },
  ] as ExpressionMeta[],

  // 2. Triggers (2 total)
  triggers: [
    { name: 'greeting', category: 'triggers', label: 'greeting', description: 'Friendly welcoming gesture / head nod / acknowledgement', phonemeOrEmotion: 'Welcoming salutation' },
    { name: 'idle', category: 'triggers', label: 'idle', description: 'Clean transition back to base neutral ready posture', phonemeOrEmotion: 'Neutral reset' },
  ] as ExpressionMeta[],

  // 3. Visemes (9 mouth shapes conforming to speech lipsync phonemes)
  visemes: [
    { name: 'visemeA', category: 'visemes', label: 'visemeA', description: 'Wide open mouth shape for open vowels (AA, AH, AY)', phonemeOrEmotion: 'Open vowel /a/' },
    { name: 'visemeB', category: 'visemes', label: 'visemeB', description: 'Bilabial closed lips shape for consonants (B, M, P)', phonemeOrEmotion: 'Bilabial stop /b, m, p/' },
    { name: 'visemeC', category: 'visemes', label: 'visemeC', description: 'Slightly open teeth-together shape for alveolar/palatal (CH, J, SH, S, Z)', phonemeOrEmotion: 'Sibilants /s, z, sh/' },
    { name: 'visemeD', category: 'visemes', label: 'visemeD', description: 'Tongue between teeth shape for dental fricatives (TH, DH, L)', phonemeOrEmotion: 'Dental /th, l/' },
    { name: 'visemeE', category: 'visemes', label: 'visemeE', description: 'Spreading smiling lips shape for high front vowels (EE, IH, IY)', phonemeOrEmotion: 'Front vowel /e, i/' },
    { name: 'visemeF', category: 'visemes', label: 'visemeF', description: 'Upper teeth resting on lower lip for labiodental (F, V)', phonemeOrEmotion: 'Labiodental /f, v/' },
    { name: 'visemeG', category: 'visemes', label: 'visemeG', description: 'Mid-open throat aperture for velar stops (G, K, NG)', phonemeOrEmotion: 'Velar /g, k/' },
    { name: 'visemeH', category: 'visemes', label: 'visemeH', description: 'Tightly rounded forward pursed lips for round vowels (OW, AO, UW, W)', phonemeOrEmotion: 'Round vowel /o, u, w/' },
    { name: 'visemeX', category: 'visemes', label: 'visemeX', description: 'Rest / neutral closed lips for pauses and silence', phonemeOrEmotion: 'Silence / rest' },
  ] as ExpressionMeta[],

  // 4. Switches (2 state machines)
  switches: [
    { name: 'autoIdle', category: 'switches', label: 'autoIdle', description: 'Core character life-cycle state machine (blinking, breathing, micro-movements). Keep ON for natural flow.', phonemeOrEmotion: 'Ambient Life Cycle' },
    { name: 'lipsync', category: 'switches', label: 'lipsync', description: 'Dedicated State Machine for speech lipsync viseme blending.', phonemeOrEmotion: 'Speech Lipsync Engine' },
  ] as ExpressionMeta[],
};
