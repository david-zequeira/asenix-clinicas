# Asenix Cinematic Web System
## Cinematic Media Window / Blurred Environment Effect

> **Purpose:** Document a reusable cinematic web effect inspired by the reference Reel provided for Asenix.
>
> **Important:** The goal is **not** to copy the mountain or boat websites. The goal is to reproduce the **interaction system and visual technique**: a sharp foreground media/content window embedded inside an enlarged, blurred version of the same visual environment, combined with scroll-controlled transformations.

---

# 1. Visual Objective

The target aesthetic is:

- cinematic
- premium
- editorial
- immersive
- minimal but visually complex
- closer to a luxury campaign / digital art direction than a conventional website
- suitable for Asenix's positioning as a premium AI + technology experience studio

The core visual effect can be summarized as:

```text
                 FULLSCREEN EXPERIENCE
┌──────────────────────────────────────────────────────┐
│                                                      │
│        SAME MEDIA / ENVIRONMENT                      │
│        enlarged + blurred + darkened                 │
│                                                      │
│             ┌──────────────────────┐                 │
│             │                      │                 │
│             │   SHARP CONTENT      │                 │
│             │   / VIDEO / UI       │                 │
│             │                      │                 │
│             └──────────────────────┘                 │
│                                                      │
│        SAME MEDIA / ENVIRONMENT                      │
│        enlarged + blurred                            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

The foreground window should feel like it is **emerging from the environment behind it**.

The user should perceive depth even though the base implementation can be 2D.

---

# 2. The Core Technique

The effect is based on **layering the same visual asset in two different treatments**.

## Layer A — Background Environment

The same image/video is rendered as a fullscreen background.

Typical treatment:

- scale: 1.05–1.20
- blur: 15–40px
- opacity: 0.45–0.80
- slight darkening
- slight saturation/contrast adjustment
- optional parallax
- overflow hidden

Conceptually:

```text
background media
    ↓
scale
    ↓
blur
    ↓
darken
    ↓
parallax
```

## Layer B — Foreground Media Window

The same media, or a related media asset, is rendered sharply inside a smaller viewport.

Typical properties:

- no blur
- scale: 1
- high visual contrast
- rounded corners initially
- controlled aspect ratio
- centered or slightly offset
- overflow hidden

Conceptually:

```text
same media
    ↓
sharp viewport
    ↓
foreground content
```

## Layer C — UI / Typography

Additional elements sit above the media:

- oversized typography
- navigation
- small metadata
- CTA
- floating cards
- labels
- decorative lines
- progress indicators

These should move independently from the media to create depth.

---

# 3. Why the Effect Works

The visual trick is not simply "blurred background + card".

The important principle is:

> **Same visual source, different spatial treatment.**

The foreground and background belong to the same visual world.

This creates an illusion of:

- depth
- continuity
- immersion
- scale
- cinematic framing

The user feels as if the interface is a window into the media rather than a card placed over a background.

---

# 4. Scroll Transformation

The most important interaction is that the foreground window should not remain static.

The scroll controls a cinematic timeline.

Initial state:

```text
┌─────────────────────────────────────────────┐
│                                             │
│       blurred environment                   │
│                                             │
│          ┌───────────────────────┐          │
│          │                       │          │
│          │      CONTENT          │          │
│          │                       │          │
│          └───────────────────────┘          │
│                                             │
│       blurred environment                   │
│                                             │
└─────────────────────────────────────────────┘
```

During scroll:

```text
┌─────────────────────────────────────────────┐
│                                             │
│       ┌───────────────────────────────┐     │
│       │                               │     │
│       │           CONTENT             │     │
│       │                               │     │
│       └───────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

Final state:

```text
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                 FULLSCREEN                  │
│                  CONTENT                    │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

The transformation can include:

1. foreground window grows
2. border radius decreases
3. foreground moves toward the viewport
4. background blur decreases
5. background opacity changes
6. background scale changes
7. typography moves/fades
8. UI elements disappear
9. new content enters
10. the window becomes fullscreen

---

# 5. Recommended Technology Stack

## Phase 1 — Core

Use:

- Next.js
- React
- TypeScript
- CSS
- GSAP
- GSAP ScrollTrigger

Optional:

- Lenis for smooth scrolling

This is enough to reproduce the core effect.

## Phase 2 — Advanced

Add:

- Three.js
- React Three Fiber
- OGL
- GLSL shaders

Use WebGL only when the visual requires effects such as:

- image distortion
- liquid transitions
- displacement
- particles
- procedural backgrounds
- shader-based transitions
- 3D objects
- camera movement

Do **not** introduce Three.js just because the website is cinematic.

---

# 6. Recommended Learning Order

Do not learn everything at once.

## Step 1 — CSS

Master:

- `transform`
- `scale`
- `translate`
- `filter`
- `blur`
- `backdrop-filter`
- `clip-path`
- `mask-image`
- `mix-blend-mode`
- `overflow`
- absolute positioning
- CSS variables
- responsive units

## Step 2 — GSAP

Learn:

- `gsap.to`
- `gsap.from`
- `gsap.timeline`
- `ScrollTrigger`
- `scrub`
- `pin`
- `start`
- `end`
- `stagger`
- easing
- callbacks
- `gsap.matchMedia`

## Step 3 — Lenis

Use it for smooth scrolling and integrate it with GSAP.

## Step 4 — Reusable React Components

Build the effect as a component rather than a one-off page.

## Step 5 — Three.js / WebGL

Only after the 2D cinematic system works.

---

# 7. Suggested Component Architecture

Recommended project structure:

```text
src/
├── components/
│   └── cinematic/
│       ├── CinematicStage.tsx
│       ├── CinematicBackground.tsx
│       ├── CinematicWindow.tsx
│       ├── CinematicTypography.tsx
│       ├── CinematicOverlay.tsx
│       ├── CinematicControls.tsx
│       └── useCinematicScroll.ts
│
├── data/
│   └── experiences.ts
│
├── styles/
│   └── cinematic.css
│
└── app/
    └── experience/
        └── page.tsx
```

---

# 8. Component Responsibilities

## CinematicStage

Responsible for:

- viewport
- section height
- pinning
- overall timeline
- scene lifecycle

Example:

```tsx
<CinematicStage
  media="/media/hero.mp4"
  title="ENTER THE EXPERIENCE"
/>
```

## CinematicBackground

Responsible for:

- fullscreen media
- blur
- scale
- opacity
- darkening
- parallax

## CinematicWindow

Responsible for:

- foreground viewport
- media clipping
- border radius
- scale
- position
- fullscreen transformation

## CinematicTypography

Responsible for:

- hero title
- subtitles
- metadata
- entrance/exit animations

## CinematicOverlay

Responsible for:

- floating cards
- decorative elements
- CTA
- progress indicators

---

# 9. Basic DOM Architecture

Recommended structure:

```html
<section class="cinematic-stage">

  <div class="cinematic-background">
    <video />
  </div>

  <div class="cinematic-content">

    <div class="cinematic-window">
      <video />
    </div>

    <div class="cinematic-title">
      <h1>ENTER THE EXPERIENCE</h1>
    </div>

    <div class="cinematic-ui">
      ...
    </div>

  </div>

</section>
```

The important point:

> The background and foreground are independent layers.

---

# 10. Basic CSS Model

Conceptual implementation:

```css
.cinematic-stage {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.cinematic-background {
  position: absolute;
  inset: -8%;
  overflow: hidden;
}

.cinematic-background video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(28px);
  transform: scale(1.08);
}

.cinematic-window {
  position: absolute;
  top: 22%;
  left: 4%;
  width: 92%;
  height: 56%;
  overflow: hidden;
  border-radius: 24px;
}

.cinematic-window video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

This is only the foundation. The final visual should be driven by GSAP.

---

# 11. GSAP Scroll Architecture

The scroll should control one master timeline.

Conceptual example:

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: stage,
    start: "top top",
    end: "+=2500",
    scrub: 1,
    pin: true,
  },
});

tl.to(windowElement, {
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  borderRadius: 0,
  ease: "none",
});

tl.to(backgroundElement, {
  scale: 1,
  opacity: 1,
  filter: "blur(0px)",
  ease: "none",
}, "<");

tl.to(titleElement, {
  opacity: 0,
  y: -100,
}, "<");
```

The actual implementation should use GSAP contexts and proper cleanup inside React.

---

# 12. Parallax Trick

A simple but powerful improvement is to use different movement speeds.

Example:

```text
BACKGROUND
movement = 0.05

FOREGROUND
movement = 0.12

TYPOGRAPHY
movement = 0.20

FLOATING CARD
movement = 0.30
```

The elements therefore appear to exist at different depths.

Example:

```js
gsap.to(background, {
  y: -80,
  scrollTrigger: {
    trigger: stage,
    scrub: true,
  },
});
```

The exact values should be tuned visually.

---

# 13. Advanced Version: Media Position Difference

The background and foreground can use the same video but slightly different positioning.

Example:

```css
.background video {
  object-position: 45% center;
}

.foreground video {
  object-position: 50% center;
}
```

This creates subtle spatial separation.

Do not exaggerate it.

The effect should feel like depth, not misalignment.

---

# 14. Advanced Version: Masking

Once the basic version works, experiment with:

```css
clip-path
mask-image
-webkit-mask-image
```

This can create:

- circular reveals
- diagonal reveals
- soft masks
- irregular cinematic shapes
- image-to-image transitions

For example:

```css
.cinematic-window {
  clip-path: inset(0 round 24px);
}
```

GSAP can animate the geometry.

---

# 15. Advanced Version: WebGL

Introduce WebGL only when CSS is no longer enough.

Possible progression:

```text
CSS
 ↓
GSAP
 ↓
GSAP + video
 ↓
GSAP + masks
 ↓
WebGL texture
 ↓
displacement shader
 ↓
particles
 ↓
3D scene
```

A shader can transform:

```text
normal image
      ↓
displacement
      ↓
distortion
      ↓
liquid transition
      ↓
new image
```

This is where Three.js/OGL becomes valuable.

---

# 16. When to Use Three.js

Use Three.js when you need:

### YES

- real 3D geometry
- camera movement
- 3D lighting
- particles
- shaders
- displacement
- interactive 3D objects
- WebGL transitions

### NO

Do not use Three.js just for:

- blur
- scaling
- parallax
- video backgrounds
- basic scroll animation
- typography animation
- simple masks

CSS + GSAP are generally simpler and more performant for those tasks.

---

# 17. Media Pipeline

For premium results, asset quality matters as much as code.

Recommended pipeline:

```text
CONCEPT
   ↓
AI IMAGE
   ↓
AI VIDEO
   ↓
COLOR / COMPOSITION
   ↓
WEB OPTIMIZATION
   ↓
CINEMATIC COMPONENT
```

Possible tools:

### Images

- Flux
- Midjourney
- ChatGPT image generation

### Video

- Higgsfield
- Veo
- Kling

### 3D

- Blender
- Spline

### Post-production

- After Effects
- Premiere
- DaVinci Resolve

---

# 18. Web Video Optimization

Never blindly ship huge source videos.

Create web-specific versions.

Consider:

- H.264 MP4 fallback
- WebM/AV1 where appropriate
- multiple resolutions
- poster image
- mobile-specific video
- compressed bitrate
- lazy loading when possible
- `playsInline`
- `muted`
- `autoplay`

Example:

```html
<video
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
>
  <source src="/media/hero.webm" type="video/webm" />
  <source src="/media/hero.mp4" type="video/mp4" />
</video>
```

Performance is part of the design.

A cinematic website that feels slow is not a premium experience.

---

# 19. Mobile Strategy

Do not simply scale the desktop animation down.

Create a mobile-specific composition.

Possible approach:

```text
DESKTOP
large cinematic viewport
+
large typography
+
multiple depth layers

MOBILE
smaller media window
+
simplified typography
+
fewer layers
+
shorter animation
```

On mobile, prioritize:

1. visual impact
2. readability
3. performance
4. touch interaction

---

# 20. Performance Rules

### Avoid

- unnecessary WebGL
- huge uncompressed videos
- dozens of simultaneous videos
- excessive blur on massive elements
- constantly running animations
- unnecessary DOM complexity

### Prefer

- transform/opacity animations
- GPU-friendly properties
- compressed media
- lazy loading
- reduced-motion support
- responsive animation complexity
- reusable timelines

Add:

```css
@media (prefers-reduced-motion: reduce) {
  /* provide simplified experience */
}
```

---

# 21. Asenix Design Direction

The goal should NOT be:

> "make everything futuristic."

Avoid overusing:

- neon
- holograms
- excessive glow
- random particles
- cyberpunk visuals
- unnecessary 3D

The desired direction is:

```text
Luxury
+
Cinema
+
Architecture
+
Technology
+
Editorial Design
+
AI
```

Think:

```text
Apple
×
A24
×
Luxury Automotive
×
Architecture Studio
×
Future Technology
```

The technology should disappear behind the experience.

---

# 22. Reusable Asenix Experience API

Eventually the system should allow a new experience to be configured rather than rebuilt.

Example:

```ts
type CinematicExperience = {
  media: string;
  poster?: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;

  background?: {
    blur?: number;
    scale?: number;
    opacity?: number;
    position?: string;
  };

  window?: {
    width?: string;
    height?: string;
    radius?: number;
  };

  animation?: {
    duration?: number;
    parallax?: number;
    fullscreen?: boolean;
  };
};
```

Then:

```tsx
<CinematicExperience config={experience} />
```

This turns the effect into an **Asenix internal productized system**.

---

# 23. Suggested Development Phases

## Phase 1 — Static prototype

Build:

- background video
- foreground video
- blur
- centered window
- typography

No GSAP yet.

### Goal

Reproduce the visual composition.

---

## Phase 2 — Scroll animation

Add:

- ScrollTrigger
- pin
- scrub
- window expansion
- background transformation

### Goal

Reproduce the core Reel interaction.

---

## Phase 3 — Depth

Add:

- parallax
- independent typography movement
- floating UI
- background position differences

### Goal

Make the composition feel three-dimensional without WebGL.

---

## Phase 4 — Cinematic transitions

Add:

- masks
- clip-path
- image transitions
- scene changes
- video transitions

### Goal

Make multiple sections feel like one continuous film.

---

## Phase 5 — WebGL

Add only if required:

- displacement
- particles
- distortion
- 3D
- shaders

### Goal

Create effects impossible or inefficient with CSS.

---

## Phase 6 — Asenix Experience Engine

Extract everything into:

```text
CinematicStage
CinematicWindow
CinematicBackground
CinematicText
CinematicCard
CinematicTransition
CinematicScene
```

Then create a reusable internal library.

---

# 24. Definition of Done

The implementation is successful when:

- [ ] foreground media feels embedded in the environment
- [ ] background and foreground feel like the same visual world
- [ ] scroll controls the cinematic transition
- [ ] foreground can expand to fullscreen
- [ ] background blur changes during the transition
- [ ] typography has independent movement
- [ ] parallax creates depth
- [ ] animation feels continuous rather than like separate sections
- [ ] mobile has a deliberate composition
- [ ] video is optimized
- [ ] reduced-motion behavior exists
- [ ] implementation is reusable
- [ ] WebGL is only used where it adds genuine value

---

# 25. Master Prompt for Other AI Systems

Copy the following prompt into Claude, Cursor, Gemini, ChatGPT, or another coding/design AI.

```text
You are a senior creative developer specializing in cinematic websites,
creative coding, interaction design, GSAP, WebGL and premium digital
experiences.

I am building the Asenix Cinematic Experience System.

REFERENCE EFFECT
The reference uses two separate websites/content experiences
(one mountain-themed and one boat-themed), but I am NOT trying to
copy their content or visual identity.

I specifically want to reproduce the interaction technique:

- fullscreen visual environment
- enlarged blurred version of the media in the background
- sharp foreground media/content window
- same visual source or closely related source in both layers
- cinematic depth
- scroll-controlled transformation
- foreground window expands toward fullscreen
- blur decreases during transition
- border radius changes
- typography moves independently
- parallax creates depth
- UI elements fade/move independently
- transition should feel like a continuous cinematic sequence

CORE STACK

- Next.js
- React
- TypeScript
- CSS
- GSAP
- GSAP ScrollTrigger
- Lenis when appropriate

ADVANCED STACK

- Three.js
- React Three Fiber
- OGL
- GLSL shaders

IMPORTANT:
Do NOT introduce Three.js unless the requested visual effect actually
requires WebGL. First solve the effect with CSS + GSAP.

GOAL

Build a reusable cinematic component system that can later be reused
for different Asenix clients.

Suggested components:

CinematicStage
CinematicBackground
CinematicWindow
CinematicTypography
CinematicOverlay
CinematicCard
CinematicTransition
CinematicScene

The system should be configuration-driven.

Example:

<CinematicExperience
  media="/media/hero.mp4"
  title="ENTER THE EXPERIENCE"
  subtitle="..."
/>

TECHNICAL REQUIREMENTS

1. Use React/Next.js best practices.
2. Use GSAP context and cleanup correctly.
3. Use ScrollTrigger for scroll-controlled animation.
4. Avoid layout thrashing.
5. Prefer transform and opacity animations.
6. Keep media optimized.
7. Support desktop and mobile deliberately.
8. Support prefers-reduced-motion.
9. Avoid unnecessary WebGL.
10. Make the components reusable.
11. Keep animation values configurable.
12. Make the implementation production-ready.

FIRST TASK

Do not immediately write a huge application.

First:

1. Explain the architecture.
2. Explain the layers.
3. Explain the animation timeline.
4. Define the component API.
5. Define the file structure.
6. Explain how the background and foreground media should be synchronized.
7. Explain the performance strategy.
8. Then implement a minimal working prototype.

The prototype should reproduce this sequence:

INITIAL
- blurred fullscreen background
- sharp centered foreground media window
- large typography

SCROLL
- pin section
- foreground window grows
- border radius decreases
- background blur decreases
- background scale changes
- typography moves/fades
- foreground reaches fullscreen

FINAL
- fullscreen media/content
- next scene can enter seamlessly

Do not over-engineer the first version.

The objective is to build the smallest production-quality foundation
that can later evolve into an advanced cinematic system.
```

---

# 26. Strategic Principle

The biggest lesson from the reference is:

> **The effect does not come from using more technology. It comes from controlling composition, depth, timing and transitions extremely well.**

Start with:

```text
CSS
+
Video
+
GSAP
+
ScrollTrigger
```

Then progressively add:

```text
Masks
↓
Parallax
↓
Advanced transitions
↓
WebGL
↓
Shaders
↓
3D
```

Do not start at the bottom of the stack.

The target is not "a website with lots of effects".

The target is:

> **A digital experience where every movement feels intentional.**

---

# 27. Asenix Internal Name

Recommended internal name:

**Asenix Cinematic Experience Engine (ACEE)**

Alternative:

- Asenix Motion System
- Asenix Digital Experience Engine
- Asenix Cinematic Web System
- Asenix Immersive Web Engine

Recommended:

**Asenix Cinematic Experience Engine**

because it can eventually become a reusable internal framework rather than a single effect.
