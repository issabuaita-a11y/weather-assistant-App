# Vercel Environment Variables Setup

## Required Environment Variable

Your app needs the Google OAuth Client ID to work properly. Here's how to set it up:

## Step 1: Get Your Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local testing)
   - `https://your-app-name.vercel.app` (your Vercel domain)
7. Copy the **Client ID** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

## Step 2: Add Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** (top navigation)
3. Click on **Environment Variables** (left sidebar)
4. Click **Add New**
5. Enter:
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your Google OAuth Client ID (from Step 1)
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
6. Click **Save**

## Step 3: Redeploy

After adding the environment variable:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeployment

## Step 4: Update Google OAuth Settings

After your app is deployed, get your production URL and add it to Google:

1. In Vercel, go to your project → **Settings** → **Domains**
2. Copy your production domain (e.g., `your-app.vercel.app`)
3. Go back to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. Edit your OAuth 2.0 Client ID
5. Add your Vercel domain to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
6. Save

## Troubleshooting

### If you still get 404:
- Check that the build completed successfully in Vercel
- Verify the Output Directory is set to `dist` (should auto-detect)
- Check build logs for any errors

### If Google OAuth doesn't work:
- Verify `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- Make sure your Vercel domain is added to Google OAuth authorized origins
- Check browser console for OAuth errors

## Note

The app will work without the Google OAuth key for most features, but the Calendar integration won't work. The 404 error is likely a deployment/build issue, not the missing key.
