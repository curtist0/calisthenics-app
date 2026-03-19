# CaliTrack — Calisthenics & Yoga Workout Tracker

A modern bodyweight training and flexibility app built with Next.js 14, TypeScript, and Tailwind CSS. Features animated GIFs of real human bodies, progression-based workout plans, and a comprehensive yoga library.

## Features

### Exercise Library (37 exercises + 29 yoga poses)
- **Animated GIFs** of real humans performing every exercise and yoga pose
- **6 categories**: Push, Pull, Legs, Core, Skill, Full-Body
- **Progression chains** linking exercises from easier to harder (e.g., Push-Up → Diamond → Pike → HSPU → Freestanding HSPU)
- **Advanced skills**: Muscle-Up, Planche, Front/Back Lever, Dragon Flag, Human Flag, 90° Hold, Freestanding Handstand, Crow Pose, Elbow Lever, Skin the Cat
- **Weighted exercise support** for pull-ups, dips, squats, etc.

### Yoga & Flexibility (29 poses)
- **Warrior I, II, III**, Dolphin, Forearm Stand, Eagle, Dancer, Crow, Headstand
- **Splits progression**: Forward Fold → Half Splits → Full Splits → Middle Splits
- **4 categories**: Flexibility, Balance, Strength, Relaxation
- Sanskrit names, hold times, target areas, and detailed instructions

### Smart Workout Plans
- Choose between **Calisthenics** or **Flexibility** workout types
- Exercises filtered by your assessed **difficulty level**
- **Progression endpoint labels** (e.g., "Leads to → Full Planche")
- **5 training goals**: Build Muscle, Master Skills, Lose Weight, Endurance, Balanced
- Yoga plans auto-generate toward your selected target poses
- **Warm-ups** per training day, **varied rest day activities** (yoga flows, walks, mobility)
- **Today's workout auto-detect** — instant start based on current day

### Onboarding & Progression
- **Fitness assessment**: Push-ups, pull-ups, squats, plank hold
- **Optional yoga setup**: Flexibility assessment (toe touch, splits, backbend)
- **Per-exercise auto-progression**: Levels advance independently based on performance thresholds
- Yoga locked behind setup — unlockable from the home screen at any time

### During Workouts
- **Animated GIF guide** showing proper form while you train
- **Hold timer** with audio beep + vibration when target time reached
- **Stop & Record** button with live elapsed time for timed exercises
- Timer resets automatically between sets
- Optional **weight input** (kg) for weighted exercises

### Progress Tracking
- **Personal records**: Max reps, max hold time, max weight per exercise
- **Body progress photos** with camera/gallery capture and notes
- Improvement deltas shown on each PR

### Design
- **Glass-morphism UI** with blur/transparency effects
- **Per-tab gradient backgrounds** (green home, blue/purple library, orange/red workouts, purple/pink progress)
- **40 motivational quotes** randomized on each app open
- **Floating glass navigation bar**
- Apple Watch integration banner (future HealthKit support)

## Getting Started

```bash
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser. You'll be guided through the onboarding assessment on first visit.

## Deploy to a Public URL

To get a `.com` or shareable link, deploy to [Vercel](https://vercel.com) (free for Next.js):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Import Project"** and select this repo
4. Click **Deploy** — you'll get a live URL like `calitrack.vercel.app`
5. Optionally, connect a custom domain (e.g., `calitrack.com`) in Vercel's domain settings

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest](https://jestjs.io/) + [Testing Library](https://testing-library.com/)

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx            # Home — stats, active plan, PR feed
│   ├── exercises/          # Library — exercises + yoga tabs
│   ├── workouts/           # Plan library + plan creation + active workout
│   ├── progress/           # Personal records + body progress photos
│   ├── onboarding/         # Initial fitness assessment
│   └── yoga-setup/         # Yoga-only flexibility assessment
├── components/             # Reusable UI components
│   ├── ExerciseIllustration.tsx  # Animated GIF display
│   ├── ExerciseAnimation.tsx     # Workout form guide
│   ├── Timer.tsx                 # Hold timer with audio
│   ├── RestTimer.tsx             # Rest period countdown
│   ├── Navigation.tsx            # Floating glass nav bar
│   └── PageBackground.tsx        # Per-tab gradient backgrounds
├── context/
│   └── WorkoutContext.tsx   # Global state provider
├── data/
│   ├── exercises.ts         # 37 exercises with GIF URLs
│   ├── yoga.ts              # 29 yoga poses with GIF URLs
│   └── quotes.ts            # 40 motivational quotes
└── lib/
    ├── types.ts             # TypeScript interfaces
    ├── storage.ts           # localStorage persistence
    ├── planGenerator.ts     # Workout plan algorithm
    ├── progression.ts       # Auto-leveling system
    └── audio.ts             # Timer beep (Web Audio API)
```

## Data Sources

- **Exercise GIFs**: [omercotkd/exercises-gifs](https://github.com/omercotkd/exercises-gifs) (MIT license)
- All data persisted in `localStorage` — no backend required
