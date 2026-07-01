"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Search, Bookmark } from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV Shows", href: "/tv", icon: Tv },
  { label: "Search", href: "/search", icon: Search },
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800/40 h-16 flex items-center justify-around px-4 pb-safe">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 ${
              isActive ? "text-rose-500 scale-105" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Icon className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
