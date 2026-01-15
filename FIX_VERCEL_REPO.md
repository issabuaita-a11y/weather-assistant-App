# How to Fix Wrong Repo Connected to Vercel

## Option 1: Change the Connected Repository (Recommended)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your project (the one with the wrong repo)
3. Click on the project to open it
4. Go to **Settings** (top navigation)
5. Scroll down to **Git** section
6. Click **Disconnect** next to the current repository
7. Click **Connect Git Repository**
8. Select the **correct GitHub repository** (your weather-assistant-onboarding repo)
9. Vercel will automatically redeploy with the correct code

## Option 2: Create a New Project with Correct Repo

If you want to start fresh:

1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import the **correct GitHub repository**
4. Vercel will auto-detect it's a Vite project
5. Click **Deploy**
6. (Optional) Delete the old project with the wrong repo

## Option 3: Delete and Recreate

1. Go to your Vercel project settings
2. Scroll to the bottom
3. Click **Delete Project** (if you don't need the wrong one)
4. Create a new project with the correct repo

## Quick Steps (Recommended)

1. **Vercel Dashboard** → Your Project → **Settings** → **Git**
2. **Disconnect** current repo
3. **Connect** correct repo
4. **Redeploy** automatically happens
