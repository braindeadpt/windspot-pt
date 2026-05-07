# WindSpot - Fix Log

## Problems Found
1. Open-Meteo API timeouts during build (ETIMEDOUT / 400 errors)
2. Spot detail pages crashed build when API failed
3. GitHub Pages basePath not configured
4. Workflow used old peaceiris/actions-gh-pages

## Fixes Applied
- Added robust fetch error handling with 10s timeout
- Added realistic seasonal mock data fallback
- Added try/catch to spot detail page
- Set basePath + assetPrefix for GitHub Pages
- Removed invalid `models` param from API calls
- Updated deploy workflow to modern GitHub Pages actions

## Build Status
✅ 32/32 pages generate successfully
✅ TypeScript passes with no errors
✅ All spots render with realistic mock data when API unavailable

## GitHub Pages Setup
Source: Deploy from branch → gh-pages → / (root)
URL: https://braindeadpt.github.io/windspot-pt/

## Updates Log

### 2026-05-08: Added 16 spots (26 total)
- Expanded spots.ts with 16 new spots covering all Portugal regions
- Norte: Moledo, Esposende, Cabedelo, Póvoa do Varzim
- Centro/Lisboa: Costa Nova, Lagoa de Albufeira, Fonte da Telha
- Algarve: Alvor, Sagres, Faro, Tavira
- Total: 26 spots, 72 static pages

### 2026-05-08: Added Açores, Madeira, Alentejo, Wakeboard (44 total)
- Added 18 new spots: Açores (9), Madeira (7), Alentejo (6), Wakeboard (3)
- Added 'wakeboard' type and 'all' difficulty to types
- Total: 44 spots, 122 static pages
- All TypeScript passing, build successful

### 2026-05-08: Real beach images from Wikimedia Commons
- Downloaded 51 real beach images from Wikimedia Commons (CC-licensed)
- All images are real photos of actual beaches/surf spots
- Optimized with jpegoptim for web use (329MB → 105MB)
- Missing 3 images (Anjos, Castelo de Bode, Monte Verde) - to be added later
