# Vercel Deployment Guide

This guide will walk you through deploying the Weather Assistant onboarding app to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Google Cloud Console account (for OAuth setup)

## Step 1: Prepare Your Code

### 1.1 Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### 1.2 Test Build Locally

Verify the production build works:

```bash
npm run build
```

This should create a `dist` folder with all production assets.

### 1.3 Test Production Build Locally (Optional)

Preview the production build:

```bash
npm run preview
```

Visit `http://localhost:4173` to verify everything works.

## Step 2: Set Up Google OAuth

### 2.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local testing)
   - `https://your-app-name.vercel.app` (your Vercel domain - you'll add this after deployment)
7. Copy the **Client ID**

### 2.2 Configure Environment Variables

Create a `.env` file in the project root:

```bash
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
```

**Important**: Never commit the `.env` file to Git. It's already in `.gitignore`.

## Step 3: Push to GitHub

### 3.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: Weather Assistant onboarding app"
```

### 3.2 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Don't initialize with README, .gitignore, or license (we already have these)

### 3.3 Push Your Code

```bash
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** > **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration

### 4.2 Configure Build Settings

Vercel should auto-detect these settings from `vercel.json`:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If not auto-detected, manually set:
- **Framework Preset**: Vite
- **Root Directory**: `./` (or leave blank)

### 4.3 Add Environment Variables

1. In the Vercel project settings, go to **Settings** > **Environment Variables**
2. Add the following variable:
   - **Name**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your Google OAuth Client ID
   - **Environment**: Production, Preview, Development (select all)

### 4.4 Update Google OAuth Settings

After deployment, Vercel will provide you with a URL like `https://your-app-name.vercel.app`.

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client ID
3. Add the Vercel domain to **Authorized JavaScript origins**:
   - `https://your-app-name.vercel.app`
4. Save the changes

### 4.5 Deploy

1. Click **Deploy**
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, you'll get a shareable URL

## Step 5: Verify Deployment

### 5.1 Test the App

Visit your Vercel URL and test:

- ✅ All screens load correctly
- ✅ Colors and fonts match the design
- ✅ Animations work smoothly
- ✅ Address search works (Photon API)
- ✅ Location detection works
- ✅ Google Calendar OAuth works (after adding Vercel domain to Google)
- ✅ Notifications permission works
- ✅ Data persists (localStorage)
- ✅ All navigation works

### 5.2 Mobile Testing

Test on mobile devices:

- ✅ Layout adapts correctly
- ✅ Touch interactions work
- ✅ Safe areas respected
- ✅ Viewport scaling correct

## Step 6: Share with Testers

Once everything is working:

1. Share the Vercel URL with your testers
2. Provide them with any necessary context
3. Collect feedback

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 20.x by default)
- Check build logs in Vercel dashboard

### Google OAuth Not Working

- Verify `VITE_GOOGLE_CLIENT_ID` is set in Vercel environment variables
- Ensure Vercel domain is added to Google OAuth authorized origins
- Check browser console for errors

### Styles Not Loading

- Verify Tailwind CSS is building correctly
- Check that `index.css` is imported in `index.tsx`
- Clear browser cache

### API Errors

- Check network tab in browser DevTools
- Verify API endpoints are accessible
- Check CORS settings if needed

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | Yes (for Calendar feature) |
| `GEMINI_API_KEY` | Gemini API key (if used) | No |

## Project Structure

```
weather-assistant-onboarding/
├── components/          # Reusable UI components
├── screens/            # Onboarding screen components
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── index.html          # HTML template
├── index.css           # Tailwind CSS styles
├── types.ts            # TypeScript types
├── constants.ts        # App constants and config
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── vercel.json         # Vercel deployment config
├── package.json        # Dependencies
└── .env.example        # Environment variables template
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

## Support

If you encounter issues:

1. Check the Vercel build logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Ensure Google OAuth is properly configured
