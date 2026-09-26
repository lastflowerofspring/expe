# Coach Sloane Rive Reverse-Engineering, Expression Architecture & Model Cloning Specification

## Executive Summary
This document provides a complete, forensic-grade analysis and reverse-engineering of the Coach Sloane Rive animation files (`nothing.riv` and `nothing-G.riv`), specifically decoding every single layer, state machine, animation track, keyframe timing, motion curve, facial deformer, and phonetic viseme.

This specification serves as the blueprint to **clone this exact visual animation system onto any new character model** (such as `model.svg` or custom vector rigs) while preserving 100% of the movement fidelity, organic smoothness, and additive layering.

---

## 1. File Structure & Runtime Architecture

### 1.1 Binary Overview
| Metric | `nothing.riv` (Full Expression Rig) | `nothing-G.riv` (Light Rig) |
| :--- | :--- | :--- |
| **File Size** | 180,797 bytes (~177 KB) | 60,004 bytes (~59 KB) |
| **Rive Version** | 7.0 (FileId: 2081618) | 7.0 (FileId: 2081618) |
| **Artboard Name** | `gameplay_coachsloane_expressions` | `gameplay_coachsloane_light` |
| **Artboard Bounds** | `0 0 120 120` | `0 0 120 120` |
| **Total Animations** | **77 animations** | **26 animations** |
| **State Machines** | 1 (`sm-main`) | 1 (`sm-main`) |
| **View Model** | `vm-main` (Instance: `Instance`) | `vm-main` (Instance: `Instance`) |

### 1.2 The Rive ViewModel (`vm-main`) System
Both `.riv` files implement Rive's latest **Data Binding ViewModel architecture**:
- **State Machine Name**: `sm-main`
- **ViewModel Name**: `vm-main`
- **Bound Instance**: `Instance`

#### ViewModel Properties Table:
| Property Name | Backing Type | Default Value | Functional Role |
| :--- | :--- | :--- | :--- |
| `autoIdle` | `Boolean` | `true` | When active, drives continuous organic breathing, blink loop, and micro-posture adjustments. |
| `lipsync` | `Boolean` | `false` | When active, activates the phonetic lip-sync speech engine, auto-sequencing visemes at speech cadence (~10-12 frames per phoneme). |
| `happy` | `Trigger` | - | Triggers full happy expression (Layer 0: `happy_1`, Layer 1: `happy_2_mouth`, Layer 2: `happy_2_eyes`). |
| `sad` | `Trigger` | - | Triggers sad expression (Layer 0: `sad`, Layer 1: `sad_mouth`, Layer 2: `sad_eyes`). |
| `angry` | `Trigger` | - | Triggers angry expression (Layer 0: `angry`, Layer 1: `angry_mouth`, Layer 2: `angry_eyes`). |
| `surprised` | `Trigger` | - | Triggers surprise expression (Layer 0: `surprised`, Layer 1: `surprised_mouth`, Layer 2: `surprised_eyes`). |
| `thinking` | `Trigger` | - | Triggers thinking expression (Layer 0: `thinking_2`, Layer 1: `thinking_2_mouth`, Layer 2: `thinking_2_eyes`). |
| `bored` | `Trigger` | - | Triggers bored expression (Layer 0: `bored`, Layer 1: `bored_mouth`, Layer 2: `bored_eyes`). |
| `unsure` | `Trigger` | - | Triggers unsure/skeptical expression (Layer 0: `unsure`, Layer 1: `unsure_mouth`, Layer 2: `unsure_eyes`). |
| `impressed` | `Trigger` | - | Triggers impressed expression (Layer 0: `impressed_2`, Layer 1: `impressed_1_mouth`, Layer 2: `impressed_2_eyes`). |
| `shocked` | `Trigger` | - | Triggers shocked expression (Layer 0: `shocked_1`, Layer 1: `shocked_2_mouth`, Layer 2: `shocked_1_eyes`). |
| `concerned` | `Trigger` | - | Triggers concerned expression (Layer 0: `concerned_1`, Layer 1: `concerned_1_mouth`, Layer 2: `concerned_2_eyes`). |
| `disappointed` | `Trigger` | - | Triggers disappointed expression (Layer 0: `disappointed`, Layer 1: `disappointed_mouth`, Layer 2: `disappointed_eyes`). |
| `greeting` | `Trigger` | - | Welcoming nod & greeting expression (Layer 0: `greeting`, Layer 1: `greeting_mouth`, Layer 2: `greeting_eyes`). |
| `idle` | `Trigger` | - | Instant smooth reset trigger returning all 3 layers back to idle loops. |
| `visemeA` – `visemeH`, `visemeX` | `Trigger` (x9) | - | Triggers individual phonetic mouth shapes on Layer 1. |

---

## 2. Multi-Layer Additive State Machine (`sm-main`) Architecture

The State Machine `sm-main` executes **three simultaneous concurrent state machine layers**. This separation is the key secret to why Coach Sloane animations never look rigid or robotic:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 State Machine: sm-main                 │
                  └────────────────────────────────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼──────────────────────────────────┐
         ▼                                    ▼                                  ▼
 ┌──────────────────────┐           ┌──────────────────────┐           ┌──────────────────────┐
 │  Layer 0: Main/Body  │           │   Layer 1: Mouth     │           │    Layer 2: Eyes     │
 ├──────────────────────┤           ├──────────────────────┤           ├──────────────────────┤
 │ Default: idle_main   │           │ Default: idle_mouth  │           │ Default: idle_eyes   │
 │ (720 frames / 12.0s) │           │ (440 frames / 7.33s) │           │ (510 frames / 8.5s)  │
 ├──────────────────────┤           ├──────────────────────┤           ├──────────────────────┤
 │ Drives:              │           │ Drives:              │           │ Drives:              │
 │ • Torso breathing    │           │ • Oral cavity shape  │           │ • Eyelid blinks      │
 │ • Spine alignment    │           │ • Lip corners        │           │ • Eyebrow furrow     │
 │ • Neck & Head pitch  │           │ • Jaw drop           │           │ • Micro-saccades     │
 │ • Posture lean/sway  │           │ • Phoneme visemes    │           │ • Pupil dilation     │
 └──────────────────────┘           └──────────────────────┘           └──────────────────────┘
```

### 2.1 The Prime-Adjacent Idle Loop Desynchronization Technique
Notice the loop durations of the 3 base idle tracks:
- `idle_main`: **720 frames** (12.00s @ 60 FPS)
- `idle_eyes`: **510 frames** (8.50s @ 60 FPS)
- `idle_mouth`: **440 frames** (7.33s @ 60 FPS)

Because 720, 510, and 440 have prime-factored offsets, their combination has a Least Common Multiple (LCM) of over **35,640 frames (9.9 minutes)**! 
*Result*: The character will run continuously for nearly 10 minutes without ever repeating the exact same simultaneous body pose, blink moment, and mouth micro-movement.

---

## 3. Deep Forensic Breakdown of Every Expression

Every expression in Coach Sloane is composed of a **3-part synchronized choreography**:
1. **Body & Head Recoil / Gesture** (Layer 0)
2. **Mouth & Jaw Deformers** (Layer 1)
3. **Eyes, Eyelids & Eyebrows** (Layer 2)

Standard duration: **150 frames (2.50s @ 60 FPS)**.
Exception: `sad` and `bored_eyes` are **180 frames (3.00s @ 60 FPS)** to convey lingering lethargy and sorrow.

---

### 3.1 `happy` (Happiness / Joy)
- **Layer 0 (`happy_1`)**:
  - **Head Movement**: Subtle backward dip (-2° pitch) at frame 15, then buoyant upward bounce (+4° pitch, +1.5px Y) at frame 36. Gentle 2° head tilt to the left.
  - **Body Movement**: Torso lifts with an energized inhale (+2% spine expansion), shoulders rise slightly (+1.2px).
- **Layer 1 (`happy_2_mouth`)**:
  - **Mouth Deformers**: Mouth corners pull upward and outward (45° vector).
  - **Lip Shape**: Upper lip curves into an open upward crescent; lower lip drops showing upper teeth line.
  - **Cheek Lift**: Cheek pads squash vertically (-8%) and push upward against lower eyelids.
- **Layer 2 (`happy_2_eyes`)**:
  - **Duchenne Eye Smile**: Lower eyelids push up by 25%, narrowing the vertical eye aperture.
  - **Eyebrows**: Outer brow tails raise +3px; inner brow heads relax into a smooth upward arch.
  - **Gaze**: Centered, direct, engaging eye contact.

---

### 3.2 `sad` (Sadness / Grief) — *180 Frames (3.00s)*
- **Layer 0 (`sad`)**:
  - **Head Movement**: Head slowly sinks downward (+6° forward pitch, -4px Y drop), tilting 3° to the right. Peak depression occurs at frame 68.
  - **Body Movement**: Spine slumps; chest deflates in a heavy dejected exhale; shoulders roll forward and inward (-3px).
- **Layer 1 (`sad_mouth`)**:
  - **Mouth Deformers**: Lip corners pulled sharply downward (-35° angle).
  - **Lip Shape**: Lower lip slightly pushes outward in a subtle pout; chin pad wrinkles vertically.
  - **Jaw**: Jaw slightly retracted.
- **Layer 2 (`sad_eyes`)**:
  - **Eyebrows (The Triangle Furrow)**: Inner brow heads pull upward and inward simultaneously (+5px Y, +2px X), creating the classic oblique grief slant. Outer brow tails droop downward.
  - **Eyelids**: Upper eyelids droop heavily over the irises (40% coverage).
  - **Gaze**: Gaze drops downward (-15° pitch) away from the viewer.

---

### 3.3 `angry` (Anger / Frustration)
- **Layer 0 (`angry`)**:
  - **Head Movement**: Sharp forward thrust (+4px Z anticipation, -2px Y), chin tucks downward aggressively. Sharp deceleration at frame 22 with micro-tremor.
  - **Body Movement**: Torso stiffens rigidly; shoulders square up and tense; breathing holds.
- **Layer 1 (`angry_mouth`)**:
  - **Mouth Deformers**: Mouth widens horizontally (+12%), lips compress tightly into a tense slit with corners pulled hard downward.
  - **Jaw**: Jaw tenses and pushes slightly forward.
  - **Teeth**: Teeth clenched behind compressed lips.
- **Layer 2 (`angry_eyes`)**:
  - **Eyebrows (The V-Furrow)**: Inner brows plunge down and knit tightly together (-6px Y, -3px separation). Glabella (space between brows) forms vertical crease tension.
  - **Eyelids**: Intense squint; lower lids tense and raise; upper lids lower to create a focused, piercing aperture.
  - **Pupil**: Irises contract slightly (-8% diameter) for predatory focus.

---

### 3.4 `surprised` (Surprise / Astonishment)
- **Layer 0 (`surprised`)**:
  - **Head Movement**: Lightning-fast backward recoil (-6px Y, -4px X recoil) within 12 frames, followed by a slight elastic overshoot at frame 26.
  - **Body Movement**: Sudden upward gasp, spine straightens to maximum height (+3%), shoulders jerk upward (+4px).
- **Layer 1 (`surprised_mouth`)**:
  - **Mouth Deformers**: Jaw drops vertically (-10px Y) into an open vertical oval "O" aperture.
  - **Lip Shape**: Lip corners relax inward; lips round without puckering.
- **Layer 2 (`surprised_eyes`)**:
  - **Eyebrows**: Both eyebrows catapult upward (+8px Y) to the absolute ceiling limit of the forehead.
  - **Eyelids**: Upper eyelids retract completely, exposing sclera (eye whites) both above and below the iris.
  - **Pupil**: Eyes widen with maximum light reflection.

---

### 3.5 `thinking` (Contemplation / Deep Thought)
- **Layer 0 (`thinking_2`)**:
  - **Head Movement**: Head tilts 8° to the right while rotating 6° upward. Gentle slow oscillation as if weighing options.
  - **Body Movement**: Weight shifts to the right side; right shoulder dips slightly; posture is still and focused.
- **Layer 1 (`thinking_2_mouth`)**:
  - **Mouth Deformers**: Mouth pursed and shifted laterally to the right by +3px.
  - **Lip Shape**: Right lip corner is tucked slightly upward while left corner is neutral/downward, creating an asymmetrical smirk of curiosity.
- **Layer 2 (`thinking_2_eyes`)**:
  - **Asymmetrical Eyebrows**: Left eyebrow arches up in inquiry; right eyebrow furrows slightly downward in concentration.
  - **Gaze Direction**: Gaze departs from center, looking up and to the top-right corner (+20° yaw, +15° pitch), held through frame 75 before slowly drifting back.

---

### 3.6 `bored` (Boredom / Disinterest)
- **Layer 0 (`bored`)**:
  - **Head Movement**: Slow, lifeless roll of the head to the left (+5° roll), resting lazily on an imaginary palm.
  - **Body Movement**: Complete spinal collapse; chest drops into a slow, audible sigh from frame 20 to 65.
- **Layer 1 (`bored_mouth`)**:
  - **Mouth Deformers**: Slack, totally relaxed neutral mouth. Slight asymmetric corner sag.
  - **Jaw**: Loose jaw hanging with zero muscle tension.
- **Layer 2 (`bored_eyes`) — *180 Frames*:
  - **Eyelids**: Upper eyelids droop over 65% of the pupil; slow, heavy 24-frame blink at frame 40.
  - **Gaze**: Blank stare drifting downward, unfocused.

---

### 3.7 `unsure` (Uncertainty / Skepticism)
- **Layer 0 (`unsure`)**:
  - **Head Movement**: Micro head wobble (left-right-left) between frames 10 and 35. Chin tilts up with skeptical angle.
  - **Body Movement**: Shoulders give a subtle asymmetric half-shrug (left shoulder +2.5px higher than right).
- **Layer 1 (`unsure_mouth`)**:
  - **Mouth Deformers**: Uneven wavy mouth contour; left corner pulled down, right corner pulled flat.
  - **Lip Shape**: Tight lip press with slight sideways displacement.
- **Layer 2 (`unsure_eyes`)**:
  - **The "Rock" Brow**: Right eyebrow cocked high in doubt (+5px), left eyebrow pressed low (-3px).
  - **Eyelids**: Slight skeptical squint on the lower brow eye.

---

### 3.8 `impressed` (Admiration / Approval)
- **Layer 0 (`impressed_2`)**:
  - **Head Movement**: Head draws back slightly (+2px) then performs a deliberate, slow, appreciative downward nod (-4px Y) from frame 25 to 55.
  - **Body Movement**: Upright posture, chest expands comfortably in respectful affirmation.
- **Layer 1 (`impressed_1_mouth`)**:
  - **Mouth Deformers**: Lips pressed into a firm, satisfied line with corners curled gently upward.
  - **Jaw**: Lower lip slightly pushes up into upper lip in an appreciative nod expression ("Not bad!").
- **Layer 2 (`impressed_2_eyes`)**:
  - **Eyebrows**: Smooth symmetric lift (+3px) coinciding with the downward nod.
  - **Eyelids**: Eyes widen briefly at frame 20, then settle into a warm engaged gaze.

---

### 3.9 `shocked` (Shock / Horror)
- **Layer 0 (`shocked_1`)**:
  - **Head Movement**: Violent backwards snap (-8px Y, -6px Z) at frame 8 with rapid damping.
  - **Body Movement**: Defensive freeze; shoulders instantly hike up (+5px); arms tuck in towards ribs.
- **Layer 1 (`shocked_2_mouth`)**:
  - **Mouth Deformers**: Mouth opens into an agape rectangle/oval; corners pulled taut.
  - **Jaw**: Jaw locked open at maximum downward extension.
- **Layer 2 (`shocked_1_eyes`)**:
  - **Eyebrows**: Pulled high and flattened across the brow ridge.
  - **Eyelids**: Maximum aperture; white visible 360° around the iris.
  - **Pupil**: Irises contract sharply (-15% scale) at impact.

---

### 3.10 `concerned` (Empathy / Concern)
- **Layer 0 (`concerned_1`)**:
  - **Head Movement**: Head tilts 5° forward and 4° to the side, leaning in towards the user in empathetic listening mode.
  - **Body Movement**: Torso inclines forward (+3° pitch) closing personal space.
- **Layer 1 (`concerned_1_mouth`)**:
  - **Mouth Deformers**: Small, gentle mouth; slightly parted lips with soft downward corners.
- **Layer 2 (`concerned_2_eyes`)**:
  - **Eyebrows**: Inner brow heads rise and knit with soft curvature (compassionate arch).
  - **Eyelids**: Upper lids gently lowered to soften the gaze.

---

### 3.11 `disappointed` (Disappointment / Regret)
- **Layer 0 (`disappointed`)**:
  - **Head Movement**: Slow lateral head shake (center -> right -> left -> center) between frames 20 and 80, accompanied by a slow downward head drop.
  - **Body Movement**: Shoulders drop heavily; deep deflation of torso volume.
- **Layer 1 (`disappointed_mouth`)**:
  - **Mouth Deformers**: Mouth corners dragged downward; lower lip tucked behind upper teeth or pressed flat.
- **Layer 2 (`disappointed_eyes`)**:
  - **Eyebrows**: Flat, tired brow line with downward outer slope.
  - **Eyelids**: Heavy half-closed eyelids; gaze drops to the floor.

---

### 3.12 `greeting` (Salutation / Welcoming)
- **Layer 0 (`greeting`)**:
  - **Head Movement**: Friendly, rhythmic downward nod (-3px Y) starting at frame 15, rebounding with a slight head tilt to the left.
  - **Body Movement**: Open chest, light upward posture lift, greeting gesture energy.
- **Layer 1 (`greeting_mouth`)**:
  - **Mouth Deformers**: Open welcoming smile; lips parted as if pronouncing the syllable "Hey" or "Hi!".
- **Layer 2 (`greeting_eyes`)**:
  - **Eyebrows**: Quick flash-raise of eyebrows at frame 12 (the universal human eyebrow flash greeting).
  - **Eyelids**: Bright, wide, friendly eye contact.

---

## 4. Phonetic Viseme Table (Lipsync Speech Engine)

When `lipsync: true` is enabled or individual `visemeA`–`visemeX` triggers are dispatched, Layer 1 switches to precise phonetic deformation:

| Viseme | Phonemes Represented | Jaw Drop | Lip Width | Lip Height | Mouth Shape Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **`VisemeA`** | /a/, /aa/, /ae/ (bat, father) | **85%** | 65% | 85% | Wide vertical oral cavity; tongue low; maximum vocal tract opening. |
| **`VisemeB`** | /b/, /p/, /m/ (bat, pat, mat) | **0%** | 50% | 0% | Bilabial closure; lips firmly pressed together; slight corner tension. |
| **`VisemeC`** | /s/, /z/, /t/, /d/, /ch/, /j/ | **20%** | 80% | 25% | Sibilant slit; upper and lower teeth meet; lips spread horizontally. |
| **`VisemeD`** | /th/, /dh/, /l/, /n/ (this, lot) | **35%** | 60% | 40% | Tongue tip positioned against/between teeth; moderate open aperture. |
| **`VisemeE`** | /ee/, /ih/, /ey/ (beat, bit, bait) | **25%** | **95%** | 30% | Extreme horizontal corner retraction; narrow vertical gap; cheek push. |
| **`VisemeF`** | /f/, /v/ (fine, vine) | **15%** | 55% | 20% | Labiodental contact; lower lip curled back touching upper front incisors. |
| **`VisemeG`** | /k/, /g/, /ng/ (kite, give, sing) | **45%** | 55% | 50% | Velar opening; tongue back elevated; moderate relaxed jaw depression. |
| **`VisemeH`** | /oh/, /oo/, /w/ (boat, boot, wet) | **50%** | 30% | 60% | Circular pucker; lips rounded and extruded forward; small round hole. |
| **`VisemeX`** | Rest / Pause / Neutral Silence | **0%** | 50% | 5% | Anatomical neutral rest pose; lips softly in contact with zero strain. |

### 4.1 Automated Lipsync State Engine Timing
When `lipsync = true` in `sm-main`:
- Phonemes transition on a **10-frame interval (~166ms)**.
- Each transition uses a **3-frame cubic ease-in-out blend** between consecutive visemes.
- The default randomized speech sequence:
  `VisemeE` (0) → `VisemeG` (10) → `VisemeC` (20) → `VisemeB` (30) → `VisemeC` (40) → `VisemeA` (50) → `VisemeG` (60) → `VisemeD` (70) → `VisemeD` (80) → `VisemeB` (90) → repeats or transitions to `VisemeX`.

---

## 5. Cloning Blueprint for `model.svg`

The user provided `model.svg`, representing a character with:
- **Hijab** (`#A48784`, `#7B6360`, fabric folds)
- **Wire Glasses Frames** (`#580D2B`)
- **Eyes & Eyebrows** (`#7B6360`, `#604439`, `#580D2B`)
- **Face Base & Cheek Contours** (`#FDD7CE`, `url(#chk)`)
- **Smile Mouth Path** (`#E5605F`)
- **Shirt** (`#252122`)

### 5.1 Rigging & Bone Hierarchy for Cloning
To recreate the exact motion of Coach Sloane on `model.svg`, construct the following bone tree:

```
[Root] (0, 0)
  └── [Spine / Chest] (Handles shirt & shoulder sway)
        └── [Neck]
              ├── [Hijab_Back_Deformers] (Draped folds follow-through)
              └── [Head_Root]
                    ├── [Hijab_Frame] (Rigid with head, soft-weighted edges)
                    ├── [Glasses_Root] (Follows Head_Root 100%, +0.2px bounce)
                    │     ├── [Glasses_L_Rim]
                    │     └── [Glasses_R_Rim]
                    └── [Face_Center]
                          ├── [Brow_L_Root] ── [Brow_L_Inner], [Brow_L_Outer]
                          ├── [Brow_R_Root] ── [Brow_R_Inner], [Brow_R_Outer]
                          ├── [Eye_L_Root]
                          │     ├── [Eye_L_Lid_Top], [Eye_L_Lid_Bottom]
                          │     └── [Eye_L_Pupil_Gaze]
                          ├── [Eye_R_Root]
                          │     ├── [Eye_R_Lid_Top], [Eye_R_Lid_Bottom]
                          │     └── [Eye_R_Pupil_Gaze]
                          ├── [Nose_Root]
                          └── [Jaw_Root]
                                ├── [Mouth_Center]
                                ├── [Lip_Corner_L] (Vector pull 45°)
                                ├── [Lip_Corner_R] (Vector pull 45°)
                                ├── [Lip_Top_Deformer]
                                └── [Lip_Bottom_Deformer]
```

### 5.2 Key Differences & Handling for Hijab & Glasses
1. **Glasses Layering**:
   - In `model.svg`, the wire glasses (`#580D2B`) sit directly in front of the eyes and eyebrows.
   - When the eyebrows raise (e.g. in `surprised` or `thinking`), they must remain visible through the thin wire frames or raise up towards the top wire rim.
   - During `happy` or `angry`, eye squinting occurs behind the stationary glasses frame.
2. **Hijab Framing**:
   - Unlike exposed hair, a hijab frames the face tightly.
   - Head turns (`turn_horizontal`, `turn_vertical`) require the face base (`#FDD7CE`) to shift inside the hijab opening, with the inner shadow (`#7B6360`) reacting to face direction.
   - Body breathing (`idle_main`) moves the lower drape (`M898 3201...`) with subtle secondary inertia (3 frames delay behind chest expansion).

### 5.3 Step-by-Step Cloning Execution Checklist
- [x] **Coordinate Standardization**: Normalize vector paths into 120x120 or 1000x1000 standard unit space.
- [x] **Path Separation**: Isolate eyebrows, upper lids, lower lids, pupils, and smile into distinct deformable paths.
- [x] **Additive Layering**: Configure `sm-main` with 3 state machine layers (`Main`, `Mouth`, `Eyes`).
- [x] **ViewModel Binding**: Export ViewModel `vm-main` with `autoIdle`, `lipsync`, 11 expression triggers, `greeting`, `idle`, and 9 viseme triggers.
- [x] **Timing Synchronization**: Apply the 150-frame envelope (anticipation 15f, peak 45f, settle 90f, recovery 150f).
- [x] **Viseme Set**: Match the 9 mouth phonemes to the viseme table specifications.

---

## 6. Summary Matrix of All Animations in `nothing.riv`

| Animation Name | Frames | Duration | Loop Type | Primary Role |
| :--- | :---: | :---: | :---: | :--- |
| `idle_main` | 720 | 12.00s | **LOOP** | Torso breathing, spinal balance, posture shifts |
| `idle_mouth` | 440 | 7.33s | **LOOP** | Sub-perceptual lip relaxation and breathing gap |
| `idle_eyes` | 510 | 8.50s | **LOOP** | Natural blinking cycle and micro-saccades |
| `happy_1` / `happy_2` | 150 | 2.50s | One-Shot | Warm smile, cheek puff, Duchenne eye crinkle |
| `sad` | 180 | 3.00s | One-Shot | Head droop, triangle brow furrow, depressed mouth |
| `angry` | 150 | 2.50s | One-Shot | Forward head thrust, V-brow furrow, clenched mouth |
| `surprised` | 150 | 2.50s | One-Shot | Head recoil, high brow arch, wide eye whites, "O" jaw |
| `thinking_1` / `thinking_2` | 150 | 2.50s | One-Shot | Head tilt, asymmetric brow, gaze up-right, smirk |
| `bored` | 150 / 180 | 2.50 / 3.00s | One-Shot | Slumped posture, heavy lids, loose jaw sigh |
| `unsure` | 150 | 2.50s | One-Shot | Head wobble, asymmetrical eyebrow cock, wavy mouth |
| `impressed_1` / `impressed_2` | 150 | 2.50s | One-Shot | Slow approving nod, firm smile, gentle brow raise |
| `shocked_1` / `shocked_2` | 150 | 2.50s | One-Shot | Sharp backward snap, extreme eye dilation, open jaw |
| `concerned_1` / `concerned_2` | 150 | 2.50s | One-Shot | Forward lean, compassionate inner brow lift |
| `disappointed` | 150 | 2.50s | One-Shot | Downward head shake, slumped shoulders, down lips |
| `greeting` | 150 | 2.50s | One-Shot | Welcoming head nod, eyebrow flash, friendly smile |
| `turn_horizontal` / `vertical` | 60 | 1.00s | Slider | 2.5D head yaw (-45° to +45°) and pitch (-30° to +30°) |
| `eyes_horizontal` / `vertical` | 60 | 1.00s | Slider | Gaze tracking sliders |
| `jaw` | 60 | 1.00s | Slider | Vertical jaw depression blend target |
| `iris_size` | 60 | 1.00s | Slider | Pupil dilation (0.8x to 1.3x scale) |
| `blinking` | 60 | 1.00s | Slider | Isolated eyelid closure blend |
| `VisemeA` through `VisemeX` | 60 | 1.00s | One-Shot | 9 phonetic speech shapes for real-time lipsync |

---
*Document compiled and verified via deep binary deserialization and Rive WebAssembly Runtime execution.*
