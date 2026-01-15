# Fresh Start Checklist for Vercel Deployment

## ✅ Pre-Deployment Checklist

### 1. Code is Ready
- ✅ All files committed to git
- ✅ Build works locally (`npm run build`)
- ✅ Code is pushed to GitHub: `https://github.com/issabuaita-a11y/weather-assistant-App`

### 2. GitHub Repository
- ✅ Repository exists: `issabuaita-a11y/weather-assistant-App`
- ✅ All code is pushed to `main` branch
- ✅ Verify at: https://github.com/issabuaita-a11y/weather-assistant-App

## 🚀 Vercel Deployment Steps

### Step 1: Create New Vercel Project
1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **"issabuaita-a11y/weather-assistant-App"**
4. Click **"Import"**

### Step 2: Configure Project (Auto-Detected)
Vercel should auto-detect:
- **Framework Preset**: Vite ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

**If not auto-detected, manually set:**
- Framework: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

### Step 3: Environment Variables (Optional for now)
You can add this later, but if you have your Google OAuth Client ID ready:
1. Click **"Environment Variables"** section
2. Add:
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your Google OAuth Client ID
   - **Environments**: Production, Preview, Development (all three)
3. Click **"Add"**

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (1-2 minutes)
3. You'll get a URL like: `https://weather-assistant-app-xxx.vercel.app`

### Step 5: Test the Deployment
1. Visit your Vercel URL
2. Test all screens:
   - ✅ Welcome screen loads
   - ✅ Address search works
   - ✅ Location permission works
   - ✅ Calendar screen (will be in demo mode without OAuth key)
   - ✅ Notifications permission
   - ✅ Features selection
   - ✅ Completion screen

### Step 6: Update Google OAuth (After Deployment)
Once you have your Vercel URL:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `https://your-vercel-app.vercel.app`
4. Add to **Authorized redirect URIs**:
   - `https://your-vercel-app.vercel.app`
5. Save

### Step 7: Add Environment Variable (If not done in Step 3)
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add `VITE_GOOGLE_CLIENT_ID` with your Client ID
3. **Redeploy** (go to Deployments → ⋯ → Redeploy)

## 📋 Quick Reference

- **GitHub Repo**: https://github.com/issabuaita-a11y/weather-assistant-App
- **Vercel New Project**: https://vercel.com/new
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials

## 🐛 Troubleshooting

**Build fails?**
- Check build logs in Vercel
- Verify `npm run build` works locally
- Check Node.js version (Vercel uses Node 20.x)

**404 Error?**
- Verify Output Directory is set to `dist`
- Check that build completed successfully
- Verify `vercel.json` is in the repo

**OAuth not working?**
- Verify environment variable is set in Vercel
- Check that Vercel domain is added to Google OAuth settings
- Redeploy after adding environment variable

## ✅ Success Criteria

Your deployment is successful when:
- ✅ App loads at Vercel URL
- ✅ All screens work
- ✅ No console errors
- ✅ Animations work smoothly
- ✅ All features function (except Calendar without OAuth key)
