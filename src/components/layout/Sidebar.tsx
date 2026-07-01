"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Search, Bookmark, Settings } from "lucide-react";

import Image from "next/image";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV Shows", href: "/tv", icon: Tv },
  { label: "Search & Filter", href: "/search", icon: Search },
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-zinc-950/80 backdrop-blur-md border-r border-zinc-800/40 p-6 flex-shrink-0 justify-between">
      <div className="space-y-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center select-none h-10 w-fit">
          <Image
            src="/logo.svg"
            alt="Movvo Logo"
            width={140}
            height={36}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? "bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-600/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-100"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-zinc-600 space-y-1">
        <p>© 2026 Movvo Platform</p>
        <p>Real-time TMDB Integration</p>
      </div>
    </aside>
  );
}
