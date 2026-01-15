# Google Calendar Authentication Setup Guide

## Prerequisites
- ✅ Your app is deployed on Vercel
- ✅ You have your Vercel URL (e.g., `https://your-app.vercel.app`)

## Step 1: Get Your Vercel URL

1. Go to your Vercel dashboard
2. Open your project
3. Copy your **Production URL** (looks like: `https://your-app-name.vercel.app`)
4. **Save this URL** - you'll need it for Google OAuth setup

## Step 2: Create Google OAuth Client ID

### 2.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### 2.2 Create or Select Project
1. Click the project dropdown at the top
2. Either select an existing project or click **"New Project"**
3. Name it (e.g., "Weather Assistant")
4. Click **"Create"**

### 2.3 Enable Google Calendar API
1. Left sidebar → **"APIs & Services"** → **"Library"**
2. Search for: **"Google Calendar API"**
3. Click on it → Click **"Enable"**
4. Wait for it to enable

### 2.4 Configure OAuth Consent Screen (First Time Only)
If you see a prompt to configure consent screen:

1. Click **"Configure Consent Screen"**
2. Select **"External"** → Click **"Create"**
3. Fill required fields:
   - **App name**: "Weather Assistant"
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"** through all steps
5. Click **"Back to Dashboard"**

### 2.5 Create OAuth Client ID
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: **"Weather Assistant Web Client"**

### 2.6 Add Authorized Origins
Under **"Authorized JavaScript origins"**, click **"+ ADD URI"** and add:
- `http://localhost:3000` (for local testing)
- `https://your-vercel-app.vercel.app` (your Vercel production URL)
- `https://your-preview-url.vercel.app` (if you have preview deployments)

### 2.7 Add Redirect URIs
Under **"Authorized redirect URIs"**, click **"+ ADD URI"** and add:
- `http://localhost:3000`
- `https://your-vercel-app.vercel.app`
- `https://your-preview-url.vercel.app`

### 2.8 Create and Copy Client ID
1. Click **"Create"**
2. **IMPORTANT**: Copy the **Client ID** immediately (you won't see it again!)
   - It looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
3. Save it somewhere safe
4. Click **"OK"**

## Step 3: Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **"Settings"** (top navigation)
3. Click **"Environment Variables"** (left sidebar)
4. Click **"Add New"**
5. Enter:
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Paste your Google OAuth Client ID
   - **Environments**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
6. Click **"Save"**

## Step 4: Redeploy

After adding the environment variable:

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **"Redeploy"**
5. Wait for deployment to complete

## Step 5: Test the Integration

1. Visit your Vercel URL
2. Go through the onboarding flow
3. When you reach the **Calendar screen**:
   - You should **NOT** see "Demo Mode" message
   - Click **"Connect Google Calendar"**
   - You should see Google OAuth popup
   - Sign in with your Google account
   - Grant calendar access
   - It should fetch your calendar events

## Troubleshooting

### "Demo Mode" still showing?
- ✅ Verify `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- ✅ Make sure you redeployed after adding the variable
- ✅ Check that the Client ID value is correct (no extra spaces)

### OAuth popup doesn't appear?
- ✅ Check browser console for errors
- ✅ Verify your Vercel domain is in Google OAuth "Authorized JavaScript origins"
- ✅ Make sure Google Identity Services script loads (check Network tab)

### "Error 400: redirect_uri_mismatch"?
- ✅ Verify your Vercel URL is in Google OAuth "Authorized redirect URIs"
- ✅ Make sure the URL matches exactly (including https://)
- ✅ Wait a few minutes after updating Google OAuth settings (can take time to propagate)

### "Access blocked" error?
- ✅ Make sure Google Calendar API is enabled
- ✅ Check OAuth consent screen is configured
- ✅ If app is in testing mode, add your email as a test user

### Calendar events not loading?
- ✅ Check browser console for API errors
- ✅ Verify the access token is being received
- ✅ Check Network tab for Calendar API requests

## Quick Checklist

- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created
- [ ] Vercel URL added to Authorized JavaScript origins
- [ ] Vercel URL added to Authorized redirect URIs
- [ ] Client ID added to Vercel environment variables
- [ ] App redeployed
- [ ] Tested OAuth flow

## Current Implementation

Your app uses:
- **Google Identity Services (GSI)** for OAuth
- **Token-based authentication** (no redirect flow)
- **Calendar API v3** to fetch events
- **Read-only access** to calendar

The code automatically:
- Detects if Client ID is set (exits mock mode)
- Loads Google Identity Services SDK
- Initiates OAuth flow when user clicks "Connect"
- Fetches calendar events after authentication
- Handles errors gracefully
