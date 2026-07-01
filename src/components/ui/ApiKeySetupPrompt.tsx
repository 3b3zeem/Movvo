"use client";

import { Key, ExternalLink, AlertCircle } from "lucide-react";

export default function ApiKeySetupPrompt() {
  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto my-12 text-center bg-zinc-900/50 backdrop-blur-md border border-zinc-800/60 rounded-3xl shadow-2xl relative overflow-hidden animate-scale-in delay-0">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
        <Key className="w-8 h-8 text-white" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-2 justify-center">
        TMDB Connection Required
      </h2>
      
      <p className="text-zinc-400 text-sm mb-6 max-w-sm">
        To activate real-time search, movie categories, and streaming metadata, please set the TMDB API Key as an environment variable in your project configuration.
      </p>

      {/* Code block showing the environment variable setting */}
      <div className="w-full bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl text-left font-mono text-xs text-zinc-300 select-all mb-4 relative">
        <span className="block text-[9px] uppercase tracking-wider text-zinc-600 font-sans font-bold mb-1">
          Add to .env.local or Vercel Environment Variables
        </span>
        NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
      </div>

      <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl text-xs text-left mb-6">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>For security, LocalStorage key editing has been disabled in this production release.</span>
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-800/60 w-full flex items-center justify-between text-xs">
        <a
          href="https://www.themoviedb.org/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors duration-300 font-semibold"
        >
          <span>Get Free API Key</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <span className="text-zinc-500">Configure on your hosting provider</span>
      </div>
    </div>
  );
}
