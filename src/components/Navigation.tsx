"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/exercises", label: "Exercises", icon: "📖" },
  { href: "/workouts", label: "Workouts", icon: "🏋️" },
  { href: "/progress", label: "Progress", icon: "📊" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 px-4 text-xs transition-colors ${
                isActive
                  ? "text-brand-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
