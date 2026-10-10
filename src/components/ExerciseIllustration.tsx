"use client";

import { getExerciseById } from "@/data/exercises";
import { AnatomyExerciseId, isAnatomyExerciseId } from "@/lib/anatomyIllustrations";
import WorkoutIcon from "./WorkoutIcon";

interface Props {
  exerciseId: string;
  size?: number;
  className?: string;
}

interface AnatomyPose {
  head: [number, number];
  torso: string;
  limbs: string[];
  muscles: string[];
  bar?: boolean;
  floor?: boolean;
}

const poses: Record<AnatomyExerciseId, AnatomyPose> = {
  "freestanding-hspu": {
    head: [120, 119],
    torso: "M108 84 Q120 77 132 84 L130 51 Q120 45 110 51 Z",
    limbs: [
      "M110 54 L103 33 L101 12", "M130 54 L137 33 L139 12",
      "M110 85 L91 99 L81 128 L77 151", "M130 85 L149 99 L159 128 L163 151",
    ],
    muscles: ["M113 57 Q120 64 127 57 L126 78 Q120 83 114 78 Z", "M98 34 L103 39", "M137 34 L142 39"],
    floor: true,
  },
  manna: {
    head: [120, 105],
    torso: "M105 91 Q119 83 133 91 L130 123 Q120 130 110 123 Z",
    limbs: [
      "M108 94 L96 111 L84 137 L79 151", "M130 94 L144 111 L156 137 L161 151",
      "M111 120 Q102 99 101 77 Q101 58 111 42", "M119 124 Q124 103 131 83 Q137 64 132 45",
    ],
    muscles: ["M110 96 Q120 89 128 96 L126 116 Q119 121 112 116 Z", "M98 112 L105 116", "M144 112 L136 116"],
    floor: true,
  },
  "tuck-planche": {
    head: [90, 59],
    torso: "M99 69 Q115 63 130 70 L139 91 Q126 99 109 91 Z",
    limbs: [
      "M101 70 L84 80 L77 103 L72 125", "M107 72 L96 91 L91 112 L87 125",
      "M132 75 L151 81 L164 97 L151 109", "M125 91 L145 103 L155 117 L137 119",
    ],
    muscles: ["M106 72 Q117 67 127 73 L132 84 Q120 90 109 85 Z", "M88 81 L94 84", "M148 83 L154 87"],
    floor: true,
  },
  "skin-the-cat": {
    head: [120, 117],
    torso: "M107 79 Q120 71 133 79 L130 109 Q120 116 110 109 Z",
    limbs: [
      "M108 81 L97 60 L88 39 L85 18", "M132 81 L143 60 L152 39 L155 18",
      "M111 107 Q97 94 99 76 Q101 56 114 43", "M129 108 Q145 95 142 77 Q139 55 126 42",
    ],
    muscles: ["M111 82 Q120 76 129 82 L126 103 Q120 107 114 103 Z", "M99 61 L105 65", "M143 61 L137 65"],
    bar: true,
  },
  "tucked-l-sit": {
    head: [120, 40],
    torso: "M106 54 Q120 47 134 54 L132 91 Q120 98 108 91 Z",
    limbs: [
      "M108 58 L93 77 L85 107 L82 137", "M132 58 L147 77 L155 107 L158 137",
      "M111 90 Q98 102 105 115 L119 119", "M129 90 Q142 102 135 115 L121 119",
    ],
    muscles: ["M111 58 Q120 52 129 58 L128 84 Q120 90 112 84 Z", "M94 78 L101 82", "M146 78 L139 82"],
    floor: true,
  },
  "negative-pull-up": {
    head: [120, 53],
    torso: "M107 66 Q120 60 133 66 L132 104 Q120 112 108 104 Z",
    limbs: [
      "M109 69 L96 52 L91 32 L88 14", "M131 69 L144 52 L149 32 L152 14",
      "M111 102 L105 121 L108 139 L106 152", "M129 102 L135 121 L132 139 L134 152",
    ],
    muscles: ["M111 70 Q120 65 129 70 L128 94 Q120 99 112 94 Z", "M97 52 L103 57", "M143 52 L137 57"],
    bar: true,
  },
  "planche-lean": {
    head: [55, 70],
    torso: "M64 74 Q83 67 101 71 L135 81 Q130 95 113 97 L75 88 Z",
    limbs: [
      "M71 78 L53 91 L49 112 L48 132", "M80 82 L66 98 L63 117 L62 132",
      "M126 86 L151 92 L174 98 L195 100", "M116 94 L139 105 L165 111 L188 111",
    ],
    muscles: ["M77 77 Q89 73 101 77 L119 83 Q115 90 108 92 L79 86 Z", "M53 94 L61 97", "M140 94 L147 98"],
    floor: true,
  },
  "tuck-fl-raise": {
    head: [60, 99],
    torso: "M72 82 Q90 75 111 81 L137 90 Q133 103 119 108 L81 101 Z",
    limbs: [
      "M77 84 L63 65 L55 42 L51 17", "M87 82 L77 61 L70 39 L67 17",
      "M132 96 Q150 92 158 105 L146 119", "M119 103 Q137 111 139 125 L125 130",
    ],
    muscles: ["M81 84 Q92 79 104 84 L123 91 Q119 99 111 101 L83 95 Z", "M64 66 L71 69", "M78 62 L84 65"],
    bar: true,
  },
  "90-degree-hold": {
    head: [48, 90],
    torso: "M59 86 Q80 78 101 82 L137 92 Q133 106 117 110 L69 103 Z",
    limbs: [
      "M70 91 L53 104 L47 123 L47 141", "M80 94 L67 111 L63 128 L63 141",
      "M131 97 L153 105 L177 110 L198 112", "M119 107 L142 119 L168 124 L190 124",
    ],
    muscles: ["M72 89 Q84 84 97 87 L122 95 Q118 103 108 106 L74 99 Z", "M54 105 L61 109", "M141 108 L149 112"],
    floor: true,
  },
  "dead-hang": {
    head: [120, 43],
    torso: "M107 57 Q120 50 133 57 L132 100 Q120 108 108 100 Z",
    limbs: [
      "M109 59 L99 41 L94 23 L91 11", "M131 59 L141 41 L146 23 L149 11",
      "M111 99 L106 119 L108 139 L106 154", "M129 99 L134 119 L132 139 L134 154",
    ],
    muscles: ["M111 61 Q120 56 129 61 L128 92 Q120 97 112 92 Z", "M100 42 L106 46", "M140 42 L134 46"],
    bar: true,
  },
};

function AnatomyExercise({ pose, name, size }: { pose: AnatomyPose; name: string; size: number }) {
  const lineProps = {
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      role="img"
      aria-label={`${name} anatomical-style illustration`}
      viewBox="0 0 240 170"
      width={size}
      height={size}
      className="rounded-2xl bg-gray-100"
    >
      <defs>
        <linearGradient id="anatomy-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2c9a6" />
          <stop offset="1" stopColor="#dba37c" />
        </linearGradient>
        <linearGradient id="anatomy-muscle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d87868" />
          <stop offset="1" stopColor="#a94747" />
        </linearGradient>
      </defs>
      {pose.bar && <path d="M42 13 H198" stroke="#5e6873" strokeWidth="7" strokeLinecap="round" />}
      {pose.floor && <path d="M25 153 H215" stroke="#cbd1d7" strokeWidth="3" strokeLinecap="round" />}
      {pose.limbs.map((path, index) => (
        <g key={`limb-${index}`} {...lineProps}>
          <path d={path} stroke="#754f43" strokeWidth="19" />
          <path d={path} stroke="url(#anatomy-skin)" strokeWidth="14" />
          <path d={path} stroke="url(#anatomy-muscle)" strokeWidth="4" strokeDasharray="10 24" opacity=".88" />
        </g>
      ))}
      <path d={pose.torso} fill="url(#anatomy-skin)" stroke="#754f43" strokeWidth="3" strokeLinejoin="round" />
      {pose.muscles.map((path, index) => (
        <path key={`muscle-${index}`} d={path} fill="url(#anatomy-muscle)" opacity=".9" />
      ))}
      <ellipse cx={pose.head[0]} cy={pose.head[1]} rx="10" ry="12" fill="url(#anatomy-skin)" stroke="#754f43" strokeWidth="3" />
      <path d={`M${pose.head[0] - 5} ${pose.head[1] + 3} Q${pose.head[0]} ${pose.head[1] + 6} ${pose.head[0] + 5} ${pose.head[1] + 3}`} fill="none" stroke="#9b6656" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="120" cy="163" r="2.5" fill="#a94747" />
    </svg>
  );
}

export default function ExerciseIllustration({ exerciseId, size = 200, className }: Props) {
  const exercise = getExerciseById(exerciseId);
  const imageUrl = exercise?.imageUrl;
  const s = size;
  const pose = isAnatomyExerciseId(exerciseId) ? poses[exerciseId] : null;

  if (!imageUrl && pose && exercise) {
    return (
      <div className={className}>
        <AnatomyExercise pose={pose} name={exercise.name} size={s} />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`rounded-2xl bg-gray-800/60 flex flex-col items-center justify-center gap-1 p-2 text-center ${className || ""}`} style={{ width: s, height: s }}>
        <WorkoutIcon name="dumbbell" className="h-7 w-7 text-gray-400" />
        <span className="text-[10px] font-semibold leading-tight text-gray-300">{exercise?.name || "Exercise"}</span>
      </div>
    );
  }

  // Hold exercises use the source GIF's initial frame as the visual reference.
  if (exercise?.isHold) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-white ${className || ""}`} style={{ width: s, height: s }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={exercise?.name || "Exercise"}
          width={s}
          height={s}
          className="object-contain w-full h-full"
          loading="lazy"
          style={{ animationPlayState: "paused" }}
        />
        <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">HOLD</div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-white ${className || ""}`} style={{ width: s, height: s }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={exercise?.name || "Exercise"} width={s} height={s} className="object-contain w-full h-full" loading="lazy" />
    </div>
  );
}
