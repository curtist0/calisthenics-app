"use client";

interface Props {
  variant: "home" | "exercises" | "workouts" | "progress";
}

const configs = {
  home: {
    gradient: "from-brand-900/30 via-gray-900 to-gray-900",
    accent1: "bg-brand-500/8",
    accent2: "bg-emerald-500/5",
    circles: ["top-0 -right-20 w-72 h-72 bg-brand-500/10", "bottom-40 -left-20 w-60 h-60 bg-emerald-500/8"],
  },
  exercises: {
    gradient: "from-blue-900/20 via-gray-900 to-purple-900/10",
    accent1: "bg-blue-500/6",
    accent2: "bg-purple-500/5",
    circles: ["top-10 -right-16 w-64 h-64 bg-blue-500/8", "-bottom-10 -left-10 w-48 h-48 bg-purple-500/6"],
  },
  workouts: {
    gradient: "from-orange-900/15 via-gray-900 to-red-900/10",
    accent1: "bg-orange-500/6",
    accent2: "bg-red-500/4",
    circles: ["-top-10 left-1/4 w-56 h-56 bg-orange-500/8", "bottom-20 -right-10 w-44 h-44 bg-red-500/6"],
  },
  progress: {
    gradient: "from-purple-900/20 via-gray-900 to-pink-900/10",
    accent1: "bg-purple-500/6",
    accent2: "bg-pink-500/4",
    circles: ["top-0 right-10 w-52 h-52 bg-purple-500/8", "bottom-40 -left-10 w-40 h-40 bg-pink-500/6"],
  },
};

export default function PageBackground({ variant }: Props) {
  const cfg = configs[variant];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 bg-gradient-to-b ${cfg.gradient}`} />
      {cfg.circles.map((c, i) => (
        <div key={i} className={`absolute rounded-full blur-3xl ${c}`} />
      ))}
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
