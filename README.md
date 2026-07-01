# 🎬 Movvo — Movies & TV Shows Streaming Platform

Movvo is a state-of-the-art, high-performance streaming and media discovery platform built using **Next.js 16 (App Router)** and **Tailwind CSS v4**. It features an elegant glassmorphic dark interface, dynamic slider animations, dual-server high-speed video embeds, and a seamless global search system.

---

## ✨ Features

- **Premium Cinematographic UI**: Designed using custom HSL colors, modern typography, glassmorphism overlays, and fluid CSS-first micro-animations.
- **Dual Streaming Servers**: Built-in player with Server 1 (`vidsrc.to`) and Server 2 (`vidsrc.cc`) for maximum stream availability.
- **Unified Global Search**: A debounced instant search dropdown in the header that routes seamlessly to a dedicated search and filter page.
- **Advanced Discovery filters**: Filter content by type (Movies/TV), genres, and release years using sleek `CustomSelect` dropdowns.
- **Responsive Layout**: Sidebar-driven navigation optimized for mobile, tablet, and desktop viewports.
- **Security-First Integration**: Relies on a single, secure environment variable configuration for TMDB integration, protecting against database tampering.

---

## ⚙️ Environment Configuration

Movvo utilizes the **The Movie Database (TMDB) API** to fetch real-time metadata, posters, casts, and show episodes.

### 1. Local Development (`.env.local`)
Create a file named `.env.local` in the root directory of your project and configure your TMDB API Key:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_v3_api_key
```

> [!NOTE]
> `.env.local` is included in `.gitignore` by default and will not be pushed to version control.

### 2. Production Deployment (Vercel)
You do **not** need to upload any `.env` files to your production hosting provider. Instead, configure it in Vercel's Dashboard:
1. Go to your project settings in **Vercel**.
2. Select **Environment Variables** from the sidebar.
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_TMDB_API_KEY`
   - **Value**: *Your TMDB API Key*
4. Click **Save** and trigger a deployment.

---

## 🚀 Getting Started

First, install the project dependencies:

```bash
npm install
```

Second, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Production Build

To generate an optimized production bundle, run:

```bash
npm run build
```

This compiles all files, runs TypeScript validation checks, and exports optimized static pages. To preview the built production app, run:

```bash
npm run start
```

---

## 🛠️ Tech Stack

- **Core**: Next.js 16 (App Router, Turbopack)
- **State Management**: React Context (`AppContext`)
- **Styling**: Tailwind CSS v4 & Vanilla CSS (custom glassmorphism utility classes)
- **Icons**: Lucide React
- **API Engine**: TMDB API Client (`src/lib/tmdb.ts`)
