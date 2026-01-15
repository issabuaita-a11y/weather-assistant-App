# Troubleshooting Google Calendar OAuth

## Common Issues and Solutions

### Issue 1: "Demo Mode" Still Showing

**Symptom**: You see "Demo Mode: No real account required" message on Calendar screen

**Causes:**
1. Environment variable not set correctly
2. App not redeployed after adding env var
3. Client ID value is incorrect

**Solutions:**
1. **Check Vercel Environment Variable:**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Verify `VITE_GOOGLE_CLIENT_ID` exists
   - Check the value (should be your full Client ID, no extra spaces)
   - Make sure all environments are selected (Production, Preview, Development)

2. **Redeploy:**
   - Go to Deployments tab
   - Click ⋯ on latest deployment → Redeploy
   - Wait for deployment to complete
   - Clear browser cache and test again

3. **Verify Client ID Format:**
   - Should look like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - No quotes, no spaces, no line breaks
   - Copy directly from Google Cloud Console

### Issue 2: OAuth Popup Doesn't Appear

**Symptom**: Clicking "Connect Google Calendar" does nothing or shows error

**Causes:**
1. Google Identity Services SDK not loading
2. Missing Authorized JavaScript origins
3. Client ID not being read

**Solutions:**
1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors like:
     - "Failed to load Google Identity Services"
     - "Invalid client_id"
     - "redirect_uri_mismatch"

2. **Verify Google OAuth Settings:**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Under "Authorized JavaScript origins", verify:
     - `http://localhost:3000` (for local testing)
     - `https://your-vercel-app.vercel.app` (your exact Vercel URL)
   - URLs must match EXACTLY (including https://, no trailing slash)

3. **Check Google Identity Services Script:**
   - Open DevTools → Network tab
   - Reload page
   - Look for request to: `accounts.google.com/gsi/client`
   - Should return 200 status

### Issue 3: "redirect_uri_mismatch" Error

**Symptom**: Error message: "Error 400: redirect_uri_mismatch"

**Cause**: Your Vercel URL is not in Google OAuth "Authorized redirect URIs"

**Solution:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", click "+ ADD URI"
4. Add your Vercel URL: `https://your-vercel-app.vercel.app`
5. Also add: `http://localhost:3000` (for local testing)
6. Click "Save"
7. **Wait 5-10 minutes** for changes to propagate
8. Try again

### Issue 4: "Access Blocked" or Consent Screen Error

**Symptom**: Error about app verification or access blocked

**Causes:**
1. OAuth consent screen not configured
2. App in testing mode without test users
3. Google Calendar API not enabled

**Solutions:**
1. **Configure OAuth Consent Screen:**
   - Go to APIs & Services → OAuth consent screen
   - Make sure it's configured (External or Internal)
   - Add required fields (App name, support email, etc.)

2. **Add Test Users (if in Testing mode):**
   - Go to OAuth consent screen
   - Scroll to "Test users"
   - Click "+ ADD USERS"
   - Add your Google account email
   - Save

3. **Enable Google Calendar API:**
   - Go to APIs & Services → Library
   - Search "Google Calendar API"
   - Make sure it's enabled (should show "API enabled")

### Issue 5: Authentication Works But Events Don't Load

**Symptom**: OAuth succeeds but calendar events don't appear

**Causes:**
1. Calendar API not enabled
2. Wrong scope
3. API request failing

**Solutions:**
1. **Check Calendar API:**
   - Verify Google Calendar API is enabled
   - Check API is enabled in your project

2. **Check Browser Console:**
   - Look for errors in Network tab
   - Check if Calendar API requests are failing
   - Verify access token is being sent

3. **Check Scope:**
   - Should be: `https://www.googleapis.com/auth/calendar.readonly`
   - Verify in your code (constants.ts)

## Step-by-Step Verification Checklist

### ✅ Vercel Configuration
- [ ] Environment variable `VITE_GOOGLE_CLIENT_ID` is set
- [ ] Value is correct (full Client ID, no spaces)
- [ ] All environments selected (Production, Preview, Development)
- [ ] App has been redeployed after adding env var
- [ ] Deployment completed successfully

### ✅ Google Cloud Console Configuration
- [ ] Google Calendar API is enabled
- [ ] OAuth consent screen is configured
- [ ] OAuth 2.0 Client ID is created
- [ ] Your Vercel URL is in "Authorized JavaScript origins"
- [ ] Your Vercel URL is in "Authorized redirect URIs"
- [ ] Client ID matches the one in Vercel env var

### ✅ Testing
- [ ] Browser console shows no errors
- [ ] Google Identity Services script loads (check Network tab)
- [ ] "Demo Mode" message is NOT showing
- [ ] OAuth popup appears when clicking "Connect"
- [ ] Can sign in with Google account
- [ ] Can grant calendar permissions
- [ ] Calendar events load after authentication

## Debug Steps

1. **Check if environment variable is being read:**
   - Add temporary console.log in your code
   - Or check in browser DevTools → Application → Environment Variables
   - Should show your Client ID (not the fallback value)

2. **Verify Google OAuth settings:**
   - Double-check URLs match exactly
   - No trailing slashes
   - Include https://
   - Wait 5-10 min after changes

3. **Test locally first:**
   - Create `.env` file with `VITE_GOOGLE_CLIENT_ID=your_client_id`
   - Run `npm run dev`
   - Test on localhost:3000
   - If it works locally, issue is with Vercel deployment

4. **Check deployment logs:**
   - Go to Vercel → Deployments → Latest deployment
   - Check build logs for any errors
   - Verify environment variables are being injected

## Quick Test

To verify your setup is correct, check these in order:

1. **Vercel Environment Variable:**
   ```
   VITE_GOOGLE_CLIENT_ID = 123456789-abc...apps.googleusercontent.com
   ```

2. **Google OAuth Authorized Origins:**
   ```
   https://your-vercel-app.vercel.app
   http://localhost:3000
   ```

3. **Google OAuth Authorized Redirect URIs:**
   ```
   https://your-vercel-app.vercel.app
   http://localhost:3000
   ```

4. **App Redeployed:** ✅ Yes

5. **Browser Console:** No errors

If all check out but still not working, share the specific error message from browser console.
