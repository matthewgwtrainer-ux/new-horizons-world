# Deploy New Horizons World to Render

## Overview
This guide walks you through deploying the New Horizons World app to Render.com so students can access it from any device, and the AI chat works without CORS errors.

---

## Prerequisites
- GitHub account (you have this)
- Render.com account signed up via GitHub (you have this)
- Kimi API key: `sk-lUGKRBJHjb06BtSDtwt1pCYDr4HjZtue3uagyBfl9Glmzl5Y`

---

## Step 1: Push Code to GitHub

Your repo is: `github.com/matthewgwtrainer-ux/new-horizons-world`

Open a terminal on your computer and run these commands:

```bash
# If you already have the code locally:
cd new-horizons-world
git add .
git commit -m "SQLite migration + Render deployment config"
git push origin main

# If starting fresh:
git clone https://github.com/matthewgwtrainer-ux/new-horizons-world.git
cd new-horizons-world
# (copy all project files here)
git add .
git commit -m "Initial deployment"
git push origin main
```

---

## Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect to your GitHub repo: `matthewgwtrainer-ux/new-horizons-world`
4. Configure:
   - **Name**: `new-horizons-world`
   - **Environment**: `Node`
   - **Region**: Singapore (closest to Hong Kong)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Click **"Advanced"** and add Environment Variable:
   - **Key**: `KIMI_API_KEY`
   - **Value**: `sk-lUGKRBJHjb06BtSDtwt1pCYDr4HjZtue3uagyBfl9Glmzl5Y`

6. Click **"Create Web Service"**

Render will automatically build and deploy. Wait 2-3 minutes.

---

## Step 3: Add Persistent Disk (Important!)

After the service is created:

1. Go to your service dashboard on Render
2. Click **"Disks"** tab
3. Click **"Add Disk"**
4. Configure:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/var/render/data`
   - **Size**: 1 GB
5. Click **"Save"**

This ensures the SQLite database persists between deploys.

---

## Step 4: Update Environment Variables

1. Go to your service's **"Environment"** tab
2. Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_PATH` | `/var/render/data/app.db` |
| `KIMI_API_KEY` | `sk-lUGKRBJHjb06BtSDtwt1pCYDr4HjZtue3uagyBfl9Glmzl5Y` |

3. Click **"Save Changes"** — Render will redeploy automatically.

---

## Step 5: Seed the Database

After the first deploy, you need to seed the database with world data:

1. Go to your service's **"Shell"** tab on Render
2. Run: `npx tsx db/seed.ts`
3. You should see: "Seeding complete!"

Alternatively, the `postinstall` script in package.json will attempt to run `db:push` automatically.

---

## Step 6: Test the Live Site

1. Render will give you a URL like: `https://new-horizons-world.onrender.com`
2. Open it in a browser
3. Test:
   - Landing page loads
   - Click "Join a World" → enter code `NHI2026`
   - Dashboard shows sectors, missions, logs
   - **Talk to Citizens** tab → select a citizen → type a message → AI should respond!
   - Submit a report in Newsroom
   - Teacher panel at `/teacher/NHI2026` with passcode `worldcouncil`

---

## What Works After Deployment

| Feature | Static Preview (Before) | Render Deploy (After) |
|---------|------------------------|----------------------|
| Landing page | ✅ | ✅ |
| Introduction + Read Aloud | ✅ | ✅ |
| Dashboard (sectors, missions) | ✅ | ✅ |
| English Help templates | ✅ | ✅ |
| Report submission | ✅ (localStorage only) | ✅ (database + cross-device) |
| **AI Chat with Citizens** | ❌ CORS error | ✅ Works via backend |
| Cross-device sync | ❌ | ✅ |
| Teacher panel | ✅ | ✅ |

---

## Troubleshooting

**Build fails:**
- Check the Logs tab in Render
- Make sure `npm install` completes without errors
- Common fix: delete `package-lock.json` and `node_modules`, run `npm install` locally, commit the new lock file

**AI Chat not working:**
- Verify `KIMI_API_KEY` is set in Environment variables
- Check logs for "Missing API key" errors
- Ensure the key is valid at https://platform.moonshot.cn

**Database not persisting:**
- Make sure the Disk is mounted at `/var/render/data`
- Verify `DATABASE_PATH` is `/var/render/data/app.db`

**Blank page on load:**
- Check browser console for errors
- Ensure the build output is in `dist/public/`
- The `start` command should be `npm start` which runs `node dist/boot.js`

---

## Free Tier Limits

Render's free tier:
- Spins down after 15 min of inactivity (first request may take 30 seconds to wake up)
- 512 MB RAM
- 1 GB disk (enough for SQLite)
- No custom domain (use the `.onrender.com` URL)

For a classroom ECA, this is sufficient. If you need it always-on, consider Render's Starter plan ($7/month).
