# Deploy Meeting Dashboard to Vercel (from GitHub)

You have a **Vite + React** frontend and an **Express** backend (PostgreSQL + n8n webhook). Follow these steps to deploy from a GitHub repo.

---

## 1. Push the project to GitHub

If not already done:

```bash
cd meeting-dashboard-app
git init
git add .
git commit -m "Meeting dashboard app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Use a **dedicated repo** that contains only the dashboard app (or the repo root is `meeting-dashboard-app`) so Vercel can build and run it correctly.

---

## 2. Connect the repo to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New… → Project**.
3. **Import** the GitHub repository that contains `meeting-dashboard-app`.
4. If the repo root is **not** the app folder:
   - Set **Root Directory** to `meeting-dashboard-app` (or the path where `package.json` and `vite.config.js` live).
5. Vercel will usually detect Vite. Ensure:
   - **Build Command:** `npm run build` (runs `vite build`).
   - **Output Directory:** `dist`.
   - **Install Command:** `npm install`.

---

## 3. Backend: two options

The app has an Express server that talks to **PostgreSQL** and an **n8n webhook**. Vercel is built for frontend + serverless APIs, not a long‑running Node server. You can either run the API on Vercel (serverless) or elsewhere.

### Option A – API on Vercel (serverless)

- Add the Vercel API route and config from this repo (see below).
- In Vercel **Project → Settings → Environment Variables**, set:
  - `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`, and `PG_SSL` if your DB needs SSL.
  - `N8N_WEBHOOK_BASE`, `N8N_TRIGGER_PATH` for the n8n trigger (same as in your `.env`).
- Use a **hosted Postgres** that allows connections from the internet (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), [Vercel Postgres](https://vercel.com/storage/postgres), or your own server with a public address).  
- Deploy; the dashboard and `/api/*` will run on the same Vercel URL.

### Option B – API on another host (Railway, Render, Fly.io, etc.)

- Deploy **only the frontend** on Vercel (no `/api` on Vercel).
- Deploy the Express app (e.g. `node server.js` after `vite build`) on Railway, Render, Fly.io, or a VPS.
- In the Vercel build, set an env var like `VITE_API_URL=https://your-api.example.com`.
- In your frontend, call `VITE_API_URL + '/api/dashboard'` (and same for `/api/trigger`, `/api/health`) instead of relative `/api/...`.
- Then you don’t need the Vercel serverless API setup below; only the static build is on Vercel.

---

## 4. (Option A only) Add Vercel serverless API and config

If you chose **Option A**, add these so the same Express API runs as a serverless function on Vercel.

### 4.1 `vercel.json` (project root, i.e. repo root or `meeting-dashboard-app`)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

Adjust if your repo root is not the app folder (e.g. put `vercel.json` in `meeting-dashboard-app` and set Root Directory in Vercel to `meeting-dashboard-app`).

### 4.2 Refactor `server.js` to be usable in Vercel

- Export the Express `app` (e.g. `export default app` or `module.exports = app`) and only call `app.listen(...)` when **not** on Vercel (e.g. `if (!process.env.VERCEL) { app.listen(PORT, ...); }`).
- Ensure all API routes are on `app` and that in production you don’t rely on serving `dist` from Express (Vercel will serve `dist` and the rewrites above send `/api/*` to the function).

### 4.3 `api/index.js` (serverless entry)

- Use a serverless Express adapter (e.g. `serverless-http`) and import your Express app.
- Export the wrapped handler as the default export so Vercel can invoke it for `/api/*`.

Example (pseudo-code):

```js
import serverless from 'serverless-http';
import app from '../server.js';  // or wherever your app is exported
export default serverless(app);
```

After adding these, commit and push; Vercel will redeploy with the API under the same domain.

---

## 5. Deploy

- Click **Deploy** in Vercel. Each push to the connected branch (e.g. `main`) will trigger a new deployment.
- Open the generated URL (e.g. `https://your-project.vercel.app`). The dashboard should load; if you use Option A, `/api/health` and `/api/dashboard` should work on the same domain.

---

## 6. Env vars checklist (Option A)

In Vercel **Project → Settings → Environment Variables** add:

| Variable           | Description                    |
|--------------------|--------------------------------|
| `PG_HOST`          | PostgreSQL host                |
| `PG_PORT`          | PostgreSQL port (e.g. 5432)     |
| `PG_DATABASE`      | Database name                  |
| `PG_USER`          | Database user                  |
| `PG_PASSWORD`      | Database password              |
| `PG_SSL`           | `true` if your DB requires SSL |
| `N8N_WEBHOOK_BASE` | Base URL of n8n webhook        |
| `N8N_TRIGGER_PATH` | Path for trigger (e.g. `/webhook/...`) |

Save and redeploy so the serverless function gets the new variables.

---

## Summary

- **GitHub:** Push the app to a repo; use Root Directory in Vercel if the app lives in a subfolder.
- **Vercel:** Import repo → set build to `npm run build`, output `dist`.
- **Backend:** Either run the API on Vercel (Option A: add `vercel.json`, refactor `server.js`, add `api/index.js`, set env vars) or run it elsewhere and point the frontend at it with `VITE_API_URL` (Option B).

If you tell me whether you prefer Option A (API on Vercel) or Option B (API on another host), I can give you the exact `server.js` changes and a ready-to-paste `api/index.js` and `vercel.json` for your repo layout.
