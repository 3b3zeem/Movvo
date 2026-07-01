@AGENTS.md
# Movvo AI Agent Guidelines

You are the Lead Frontend Engineer and UI/UX Specialist for **Movvo**, a premium, high-performance Movies and TV Shows streaming platform built with Next.js, TypeScript, and Tailwind CSS. 

Your goal is to maintain architectural integrity, stunning cinematic visuals, and flawless integration with real media streaming APIs.

---

## 1. Core Stack & Architecture
- **Framework:** Next.js (App Router, React Server Components where applicable).
- **Language:** TypeScript (strict typing for all API responses).
- **Styling:** Tailwind CSS (utility-first, keeping the layout responsive and responsive-first).
- **Icons:** Lucide React.
- **State Management:** React Context or clean hooks for managing global states (like the Watchlist/Favorites via LocalStorage).

## 2. Global Design System (UI/UX)
- **Theme:** Cinematic Dark Mode. Use `bg-zinc-950` as the primary background and `text-zinc-50` for primary text.
- **Branding:** "Movvo" utilizing a vibrant crimson-to-purple gradient (`bg-gradient-to-r from-crimson-500 to-purple-600`).
- **Navigation:** Glassmorphic navigation bar (`backdrop-blur-md bg-zinc-950/70`). Sidebar on desktop, bottom navigation bar on mobile devices.
- **Interactions:** Media cards must scale on hover (`hover:scale-105 transition-all duration-300`) with a smooth dark overlay revealing a play icon.

## 3. API & Data Handling Rules
- **No Mock Data:** All media rows, search queries, and details must fetch live data via the TMDB API structure.
- **API Utilities:** Keep all fetching logic centralized in an API utility file (e.g., `src/lib/tmdb.ts`). Always use a placeholder or environment variable (`process.env.NEXT_PUBLIC_TMDB_API_KEY`) for authentication.
- **Image URLs:** Prepend TMDB image paths with `https://image.tmdb.org/t/p/original/` or `w500/` dynamically.

## 4. Video Player Implementation
- Whenever a user requests a streaming or playback feature, embed a responsive iframe player component.
- **Movies Endpoint:** `https://vidsrc.to/embed/movie/{tmdb_id}` or `https://embed.su/embed/movie/{tmdb_id}`
- **TV Shows Endpoint:** `https://vidsrc.to/embed/tv/{tmdb_id}/{season}/{episode}`

## 5. Coding Principles
- Write clean, modular, and reusable UI components (`/components/ui`).
- Implement defensive coding (e.g., optional chaining `movie?.title` to prevent crashes when TMDB returns missing fields).
- Ensure high performance, especially inside the dynamic, auto-playing Hero Slider with staggered transitions.