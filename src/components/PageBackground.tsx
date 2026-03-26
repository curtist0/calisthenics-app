"use client";

interface Props {
  variant: "home" | "exercises" | "workouts" | "progress" | "yoga";
}

const configs = {
  home: {
    gradient: "from-brand-900/20 via-slate-950 to-slate-950",
    accent1: "bg-emerald-500/12",
    accent2: "bg-cyan-500/8",
    circles: ["top-0 -right-20 w-80 h-80 bg-emerald-500/15 blur-3xl", "bottom-40 -left-20 w-72 h-72 bg-cyan-500/10 blur-3xl"],
  },
  exercises: {
    gradient: "from-blue-900/15 via-slate-950 to-purple-900/10",
    accent1: "bg-blue-500/8",
    accent2: "bg-purple-500/6",
    circles: ["top-10 -right-16 w-72 h-72 bg-blue-500/12 blur-3xl", "-bottom-10 -left-10 w-56 h-56 bg-purple-500/8 blur-3xl"],
  },
  workouts: {
    gradient: "from-orange-900/12 via-slate-950 to-red-900/8",
    accent1: "bg-orange-500/8",
    accent2: "bg-red-500/5",
    circles: ["-top-10 left-1/4 w-64 h-64 bg-orange-500/12 blur-3xl", "bottom-20 -right-10 w-56 h-56 bg-red-500/8 blur-3xl"],
  },
  progress: {
    gradient: "from-purple-900/15 via-slate-950 to-pink-900/8",
    accent1: "bg-purple-500/8",
    accent2: "bg-pink-500/6",
    circles: ["top-0 right-10 w-60 h-60 bg-purple-500/12 blur-3xl", "bottom-40 -left-10 w-48 h-48 bg-pink-500/8 blur-3xl"],
  },
  yoga: {
    gradient: "from-teal-900/12 via-slate-950 to-emerald-900/8",
    accent1: "bg-teal-500/8",
    accent2: "bg-emerald-500/6",
    circles: ["top-20 -right-20 w-64 h-64 bg-teal-500/12 blur-3xl", "-bottom-5 -left-10 w-52 h-52 bg-emerald-500/8 blur-3xl"],
  },
};

export default function PageBackground({ variant }: Props) {
  const cfg = configs[variant];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Premium gradient backdrop */}
      <div className={`absolute inset-0 bg-gradient-to-b ${cfg.gradient}`} />
      
      {/* Animated accent circles */}
      {cfg.circles.map((c, i) => (
        <div key={i} className={`absolute rounded-full ${c}`} />
      ))}
      
      {/* Subtle glass grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
