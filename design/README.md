# Handoff: monte-kim.dev — Blog + Portfolio

## Overview
Personal blog + portfolio site for Tae Hwan "Monte" Kim, a software engineer relocating to the UK (Oct 2026, YMS visa). Doubles as a portfolio piece itself. Goals: free hosting, free DB, a Notion-style block editor with markdown shortcuts, view counts, comments, EN/KO toggle, light/dark theme.

## About the Design Files
`Blog Portfolio.dc.html` is a **design reference created in HTML** — a static hi-fi mock canvas, not production code. Your task is to **build a new Next.js app that recreates these screens**, using the stack specified in `spec.md` (Next.js App Router + Supabase + Tailwind + Tiptap). Do not copy the HTML markup directly; treat it as the visual spec.

## Fidelity
**High-fidelity.** Colors, type, spacing, and copy are final. Recreate pixel-close. All styles in the design file are inline — inspect any element in the file for exact values.

## Screens (ids inside the design file)
- **3a/3b/3c** — Mobile: Home, Post detail (bottom TOC/share bar), Editor (block toolbar docked above keyboard)
- **3d** — Dark mode Home (defines the full dark palette in situ)
- **2a** — Home: centered hero ("Hi, I'm Monte. I build things end to end."), availability line, 3-cell stat strip (480× / −58% / 183), recent Writing list, 2 project preview cards, footer
- **2b** — Projects: 2×2 card grid (Muroom, Fitness platform API, monte-kim.dev, News classifier MLOps) with role badge, stack chips, links
- **2c** — About: narrative, "Now" callout box, Path-so-far timeline (2-col grid: mono year + entry), tool chips, Download CV + Say hi CTAs
- **2d** — Say hi: centered 520px contact form (name/email/message → send), contact links
- **2e** — Writing: search field with ⌘K hint, tag filter chips with counts, post rows (tag+date, title 18px/600, excerpt, views·comments·read-time meta), pagination
- **2f** — Post detail: breadcrumb, tags, 34px title, meta row (date/read/views), prose (16px/1.75), dark code block with filename header, blockquote (2px left border), image placeholder, sticky right TOC with active indicator, comments (input card, threaded replies, author badge)
- **2g** — Editor (admin): top bar (breadcrumb, Draft pill, "Saved 12s ago", Write/Preview segmented toggle, Publish), Add tag / Add cover dashed chips, title, block with hover drag-handle (+ and ⠿), floating selection toolbar (B/i/U/code/link/Text▾), slash menu (H2, bullet, code, image, quote — each with markdown shortcut hint), markdown-hint footer bar
- **2h** — Foundations: palette, type scale, 16-icon set (16-grid, 1.5px stroke, round caps — recreate as inline SVG components), core components, sitemap

## Cover images (new screens 2i / 2j / 3e)
Decisions: **A안** — list/home stay text-only; cover shows on post detail + OG only. Ratio **1200×630 (1.91:1)**, auto center crop, **no crop editor**. Same asset doubles as OG image. Dark mode: image unchanged, 1px #2C2C2A border.
- **2i** — Editor cover states: (1) none = dashed "Add cover" chip only, no reserved space; (2) uploading = zone at final 1.91:1 size (no layout shift), progress bar + "Compressing… 1.4MB → 288KB" mono caption + Cancel; (3) uploaded = hover overlay Replace/Remove pills (rgba(26,26,24,.85) bg) top-right, "1200×630 · center crop" badge bottom-left
- **2j** — Post detail: cover below meta row / above prose, content-column width, aspect-ratio 1200/630, 10px radius, 1px hairline border
- **3e** — Mobile: post detail cover below meta (9px radius, padded, not full-bleed); editor states same as 2i but tap (not hover) reveals Replace/Remove

## Header (all public pages)
60px, hairline bottom border. Left: TK monogram (26px, 1.5px border, 7px radius) + "monte-kim.dev" + nav (Home/Writing/Projects/About, active = ink+500). Right: EN|KO segmented toggle, theme icon button, "Say hi" filled button. Mobile (3a): 54px, hamburger.

## Design Tokens
- Light: bg #FBFBFA · surface #FFFFFF · ink #1A1A18 · body #4A4945 · muted #6F6E69 · placeholder #A3A29C · border #D9D8D3 · hairline #ECEBE7 · subtle #F4F3F0 · selection #DCE6F5
- Dark: bg #191918 · surface #1F1F1E · ink #EDECE8 · body #B5B4AE · muted #8F8E88 · border #2C2C2A (buttons invert: #EDECE8 fill, #191918 text)
- Fonts: Instrument Sans (400–700) UI/prose; JetBrains Mono (400–600) dates, tags, stats, code, kbd
- Type: h1 34–46px/700/−1..−1.6px · h2 20–22px/700/−0.3px · body 16px/1.75 · list title 15.5–18px/600 · meta 11–13px mono
- Radii: cards 10–12px · buttons 7–9px · inputs 8px · chips/pills 100px · tag chips 4px
- Shadows: card 0 2px 16px rgba(26,26,24,0.06) · menus 0 8px 28px rgba(26,26,24,0.14)
- Code block: #1F1F1E bg, 10px radius, mono 13px/1.7 #EDECE8, filename header row

## Interactions & Behavior
- Editor: Tiptap — markdown input rules (##, -, >, ```lang, **bold**), slash menu with search, floating toolbar on selection, block drag handles, debounced 2s autosave, Write/Preview toggle renders the public post component, image upload → Supabase Storage (client-compress <300KB)
- Views: server-side upsert +1 on post load, dedupe by hashed (IP, post, day)
- Comments: name required / email optional, one-level replies, author badge, honeypot + rate limit
- Search: ⌘K opens post search; tag chips filter list
- i18n: next-intl, en default, ko toggle (posts have _en/_ko fields); theme via next-themes class strategy
- Say hi form → Supabase messages table + Resend email notification

## Architecture, Routes & DB Schema
See `spec.md` (routes table, SQL schema, RLS notes, free-tier guardrails: Supabase inactivity ping cron, ISR revalidate 60).

## Assets
No raster assets. All icons are inline SVGs in the design file (screen 2h is the canonical set) — extract into an Icon component library. Fonts from Google Fonts via next/font.

## Files
- `Blog Portfolio.dc.html` — hi-fi design canvas (all screens)
- `spec.md` — stack choice, routes, DB schema, editor requirements, free-tier guardrails
