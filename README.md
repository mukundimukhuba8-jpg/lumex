# LUMEXAI

Expo **React Native** app for iOS / Android, with an optional **web** build for Vercel.

## Mobile (React Native)

```bash
npm install
npx expo start
```

- `a` → Android  
- `i` → iOS  

## Website (Vercel)

This repo is configured for Vercel **static web** export (not a downloadable app file).

1. In Vercel → Project Settings → General:
   - Framework Preset: **Other**
   - Build Command: `npx expo export --platform web` (from `vercel.json`)
   - Output Directory: `dist`
2. Redeploy
3. **Visit** should open the website in the browser

Local web preview:

```bash
npm run build:web
npx serve dist
```

## API server

`server/` is a Node API for licenses/admin. It does **not** run on Vercel static hosting — host it separately (Railway, Render, VPS, etc.) and set `EXPO_PUBLIC_API_URL`.
