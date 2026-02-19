# IST Quote Builder

Take Off & Quote Builder for Insulation Services of Tulsa.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project" → Import this repo
4. Framework Preset: **Vite** (should auto-detect)
5. Click **Deploy**
6. Your app will be live at `your-project.vercel.app`

## Add to Phone Home Screen

Once deployed, open the URL on your phone in Safari/Chrome:
- **iPhone**: Tap Share → "Add to Home Screen"
- **Android**: Tap ⋮ menu → "Add to Home Screen"

It will look and feel like a native app.

## Run Locally

```bash
npm install
npm run dev
```

## Self-Host on Mac Mini

```bash
npm install
npm run build
npx serve dist -l 3000
```

Then access from any device on your network at `http://<mac-mini-ip>:3000`
