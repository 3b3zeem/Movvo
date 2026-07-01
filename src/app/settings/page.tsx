"use client";

import { useApp } from "@/context/AppContext";
import { Key, CheckCircle, AlertCircle, Cpu, ShieldCheck, HelpCircle, HardDrive } from "lucide-react";

export default function SettingsPage() {
  const { apiKey, hasKey } = useApp();

  // Mask the API key for display (e.g. "8fca9***************************")
  const getMaskedKey = (key: string) => {
    if (!key) return "Not Configured";
    if (key.length <= 8) return "*********";
    return `${key.slice(0, 5)}***********************${key.slice(-3)}`;
  };

  return (
    <div className="flex-1 px-6 md:px-8 py-8 max-w-3xl space-y-8 text-left animate-fade-in delay-0">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
          System Settings
          <span className="w-2 h-2 rounded-full bg-rose-500" />
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Platform connection status and configuration metrics</p>
      </div>

      {/* Connection & Configuration Panel */}
      <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/40 pb-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-rose-500" />
              TMDB API Key Integration
            </h2>
            <p className="text-xs text-zinc-400">
              Global environment variable configuration status
            </p>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              hasKey
                ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/15 border-amber-500/20 text-amber-400"
            }`}
          >
            {hasKey ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Missing Key</span>
              </>
            )}
          </div>
        </div>

        {/* Read-Only Status Rows */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-zinc-900/50">
            <span className="text-xs font-semibold text-zinc-500">Configuration Mode</span>
            <span className="text-xs font-bold text-zinc-300 sm:col-span-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              Environment Variable (Vercel Settings)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-zinc-900/50">
            <span className="text-xs font-semibold text-zinc-500">Variable Name</span>
            <span className="text-xs font-mono text-zinc-300 sm:col-span-2 select-all font-bold">
              NEXT_PUBLIC_TMDB_API_KEY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-zinc-900/50">
            <span className="text-xs font-semibold text-zinc-500">Active Token</span>
            <span className="text-xs font-mono text-zinc-400 sm:col-span-2 select-none tracking-wider">
              {getMaskedKey(apiKey)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3">
            <span className="text-xs font-semibold text-zinc-500">Storage Security</span>
            <span className="text-xs text-zinc-400 sm:col-span-2">
              The key is loaded directly from server environment variables. LocalStorage override is disabled to maintain secure browser sessions.
            </span>
          </div>
        </div>
      </div>

      {/* Streaming Servers Status Panel */}
      <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-3">
          <Cpu className="w-4 h-4 text-purple-400" />
          External Player Servers Status
        </h3>

        <div className="space-y-3.5">
          <div className="flex justify-between items-center bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-zinc-200">Server 1 (VidSrc)</p>
              <p className="text-[10px] text-zinc-500">URL: vidsrc.to/embed/...</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
              Operational
            </span>
          </div>

          <div className="flex justify-between items-center bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-zinc-200">Server 2 (VidSrc CC)</p>
              <p className="text-[10px] text-zinc-500">URL: vidsrc.cc/v2/embed/...</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
              Operational
            </span>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-3">
          <HardDrive className="w-4 h-4 text-blue-400" />
          Technical Details
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400">
          <div>
            <span className="block text-zinc-500 font-semibold mb-0.5">Platform Version</span>
            <span className="text-zinc-300 font-medium">v1.0.0 (Production-Ready)</span>
          </div>
          <div>
            <span className="block text-zinc-500 font-semibold mb-0.5">Framework</span>
            <span className="text-zinc-300 font-medium">Next.js 16 (App Router)</span>
          </div>
          <div>
            <span className="block text-zinc-500 font-semibold mb-0.5">Styling Architecture</span>
            <span className="text-zinc-300 font-medium">Tailwind CSS v4 (CSS-first)</span>
          </div>
          <div>
            <span className="block text-zinc-500 font-semibold mb-0.5">API Integration</span>
            <span className="text-zinc-300 font-medium">TMDB API (v3 client-side)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
