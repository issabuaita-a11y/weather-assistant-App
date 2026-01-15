# How to Get Your Google OAuth Client ID

## Step-by-Step Guide

### Step 1: Go to Google Cloud Console
1. Open your browser
2. Go to: **https://console.cloud.google.com/**
3. Sign in with your Google account

### Step 2: Create or Select a Project
1. At the top of the page, click the **project dropdown** (next to "Google Cloud")
2. Either:
   - **Select an existing project**, OR
   - **Click "New Project"** to create one:
     - Enter a project name (e.g., "Weather Assistant")
     - Click "Create"
     - Wait a few seconds for it to be created

### Step 3: Enable Google Calendar API
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. In the search box, type: **"Google Calendar API"**
3. Click on **"Google Calendar API"** from the results
4. Click the **"Enable"** button
5. Wait for it to enable (takes a few seconds)

### Step 4: Create OAuth Credentials
1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. At the top, click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"** from the dropdown

### Step 5: Configure OAuth Consent Screen (First Time Only)
If this is your first time, you'll be asked to configure the OAuth consent screen:

1. Click **"Configure Consent Screen"**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: "Weather Assistant" (or any name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On the "Scopes" page, click **"Save and Continue"** (no need to add scopes)
7. On the "Test users" page, click **"Save and Continue"** (optional)
8. Click **"Back to Dashboard"**

### Step 6: Create OAuth Client ID
1. Go back to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Give it a name: **"Weather Assistant Web Client"**
5. Under **"Authorized JavaScript origins"**, click **"+ ADD URI"** and add:
   - `http://localhost:3000` (for local development)
   - `https://your-app-name.vercel.app` (your Vercel domain - add this after deployment)
6. Under **"Authorized redirect URIs"** (if shown), you can leave it empty for now
7. Click **"Create"**

### Step 7: Copy Your Client ID
1. A popup will appear with your credentials
2. **Copy the "Client ID"** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
3. **IMPORTANT**: Save this somewhere safe! You won't be able to see it again (only the Client Secret is hidden)
4. Click **"OK"**

### Step 8: Add to Vercel
1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Click **"Add New"**
4. Enter:
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Paste your Client ID (the long string you copied)
   - **Environments**: Check all three boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Click **"Save"**

### Step 9: Redeploy
1. Go to **"Deployments"** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for it to finish

## Visual Guide Locations

- **Google Cloud Console**: https://console.cloud.google.com/
- **APIs & Services → Credentials**: Left sidebar menu
- **Create Credentials**: Top button on Credentials page
- **OAuth Client ID**: In the credentials dropdown

## Quick Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **Credentials Page**: https://console.cloud.google.com/apis/credentials
- **API Library**: https://console.cloud.google.com/apis/library

## Troubleshooting

**Can't find "APIs & Services"?**
- Look in the left sidebar (hamburger menu ☰ if collapsed)
- It might be under "More Products"

**Don't see "OAuth client ID" option?**
- Make sure you've enabled the Google Calendar API first
- Make sure you've configured the OAuth consent screen

**Client ID not working?**
- Make sure you copied the entire Client ID (it's long)
- Make sure you added your Vercel domain to "Authorized JavaScript origins"
- Make sure you redeployed after adding the environment variable
