# Deployment Guide

This app has two parts:
- **Backend** (Express + TypeScript + MongoDB) → deployed on **Render**
- **Frontend** (React + Vite) → deployed on **Vercel**

---

## Part 1: Set Up MongoDB Atlas (Cloud Database)

Render can't use a database on your laptop, so you need a cloud one.

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free account
2. Click **"Create a deployment"** → choose the free **M0** tier
3. Create a username and password — **write these down**
4. Under **Network Access**, click **"Add IP Address"** → choose **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Under **Database**, click **"Connect"** → **"Drivers"** → copy the connection string:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` in the string with your actual password

---

## Part 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select this repository
4. Fill in the settings:
   - **Name**: anything (e.g. `happy-thoughts-backend`)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
5. Scroll down to **"Environment Variables"** and add:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | your MongoDB Atlas connection string from Part 1 |
   | `JWT_SECRET` | any long random string (e.g. `mysupersecretkey123abc`) |
   | `PORT` | `3000` |
   | `FRONTEND_URL` | *(leave blank for now — fill in after Vercel)* |

6. Click **"Create Web Service"**
7. Wait for it to deploy. Copy your backend URL — it looks like:
   ```
   https://happy-thoughts-backend.onrender.com
   ```

---

## Part 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free, use your GitHub account)
2. Click **"Add New Project"** → import this repository
3. In the configuration screen:
   - **Root Directory**: click **Edit** and type `frontend`
   - **Framework Preset**: Vercel should auto-detect **Vite**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **"Environment Variables"** and add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your Render backend URL from Part 2 (e.g. `https://happy-thoughts-backend.onrender.com`) |

5. Click **"Deploy"**
6. When done, copy your Vercel URL — it looks like:
   ```
   https://happy-thoughts.vercel.app
   ```

### How to find your Vercel URL
- It appears on the success screen after deploying (big **"Visit"** button)
- Or go to **vercel.com/dashboard** → click your project → URL is shown at the top

---

## Part 4: Connect Everything Together

Now go back to Render and add the missing variable:

1. Open your Render service → **"Environment"** tab
2. Add `FRONTEND_URL` = your Vercel URL (e.g. `https://happy-thoughts.vercel.app`)
3. Render will automatically redeploy

---

## Checklist

- [ ] MongoDB Atlas cluster created, IP set to allow all
- [ ] Backend deployed on Render with `MONGO_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`
- [ ] Frontend deployed on Vercel with `VITE_API_URL`
- [ ] Render `FRONTEND_URL` updated with your Vercel URL

---

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds — this is normal on the free plan.
