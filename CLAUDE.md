# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Friendly-Cat (友善黑貓) is an Angular PWA/iOS app that helps users find discounted near-expiry food at Taiwan convenience stores (FamilyMart and 7-11). Features include geolocation-based store search, fuzzy/pinyin name search, product browsing by category, AI chatbot food recommendations, and Firebase-backed user favorites.

Live at: https://friendlycat.alan-cheng.com/

## Commands

```bash
# Dev server (http://localhost:4200/)
npm start          # or: ng serve

# Production build
npm run build      # outputs to dist/

# GitHub Pages build
ng build --configuration=production --base-href /Friendly-Cat/ --output-path=docs --aot

# iOS build
ng build --configuration=production --output-path=dist --aot
npx cap sync ios
npx cap open ios

# Tests (Karma + Jasmine)
npm test

# Python crawler (7-11 product scraper)
pip install -r requirements.txt
python crawer.py
```

## Architecture

**Angular 18 + TypeScript 5.5** with Angular Material 19, Tailwind CSS, and RxJS.

### Key modules and routing

- `src/app/app.module.ts` — Root module; imports Firebase, Material, and feature modules
- `src/app/app-routing.module.ts` — Wildcard route sends everything to `NewSearchComponent`
- `src/app/search-food/search-food.module.ts` — Feature module for search/display components

### Core components

- **`new-search.component.ts`** — Main search UI (~1000 lines). Handles store queries by name/location, combines FamilyMart + 7-11 results, deduplicates, sorts by distance. This is the primary "page" of the app.
- **`display.component.ts`** — Presentational component rendering product categories and items per store
- **`chatbot.component.ts`** — AI chatbot using OpenRouter (DeepSeek V3) via `LlmRequestService`
- **`sider.component.ts`** — Navigation sidebar with favorites list
- **`login-page.component.ts`** — Firebase auth (email + Google OAuth)

### Services (state & data)

- `AuthService` — Firebase authentication, user session
- `FamilyMartRequestService` / `SevenElevenRequestService` — API clients for each store chain
- `StoresDataService` — Shared store data state via RxJS BehaviorSubject
- `LoadingService` — Global loading state via BehaviorSubject
- `GeolocationService` — Browser geolocation wrapper
- `LlmRequestService` — OpenRouter LLM API communication
- `SeoService` — Dynamic meta tag management

### Search features

- **Pinyin matching**: Uses `pinyin-pro` to match Chinese characters by pronunciation (e.g., 辛巴裡 finds 鑫巴黎)
- **Fuzzy search**: `fuse.js` for approximate string matching on store names
- **Geolocation sorting**: `geolib` for distance calculations

### External APIs

- FamilyMart: `https://stamp.family.com.tw/api/maps`
- 7-11: `https://lovefood.openpoint.com.tw/LoveFood/api/`
- Taiwan zipcodes: `https://demeter.5fpro.com/tw/zipcodes.json`

### Data models

- `src/app/search-food/model/family-mart.model.ts` — FamilyMart store/product types
- `src/app/search-food/model/seven-eleven.model.ts` — 7-11 store/product/category types
- `src/app/chatbot/model/llm-res.model.ts` — LLM response types

## CI/CD

- `.github/workflows/autoBuild.yml` — On push to main: builds for GitHub Pages (`docs/`) and Cloudflare Pages (`dist/`), then triggers crawler
- `.github/workflows/sechdulePy.yml` — Scheduled Python crawler for 7-11 product data

## Notes

- The project language is Traditional Chinese (zh-TW) — UI text, comments, and commit messages are in Chinese
- Firebase config is in `src/environments/environment.ts` (project: `friendly-cat-for-you`)
- 7-11 API token is stored in `sessionStorage`
- TypeScript strict mode is enabled
- Budget limits: 5MB initial bundle, 20KB per component style
