"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/exercises", label: "Library", icon: "📖" },
  { href: "/workouts", label: "Workouts", icon: "🏋️" },
  { href: "/progress", label: "Progress", icon: "📊" },
];

export default function Navigation() {
  const pathname = usePathname();
  if (pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto px-3 pb-2">
        <div className="glass rounded-2xl flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center py-2 px-4 rounded-xl text-xs transition-all duration-200 ${
                  isActive ? "text-brand-400 bg-brand-500/10 scale-105" : "text-gray-400 hover:text-gray-200"
                }`}>
                <span className="text-lg mb-0.5">{item.icon}</span>
                <span className="font-semibold text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
