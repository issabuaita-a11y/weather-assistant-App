<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1NIYGnE6qseeS_bcDh7LPZnzJnmfsBEk_

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (see `.env.example` for template):
   ```bash
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deploy to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

Quick steps:
1. Push your code to GitHub
2. Import project in Vercel
3. Add `VITE_GOOGLE_CLIENT_ID` environment variable
4. Deploy!

## Tech Stack

- React 19 (TypeScript)
- Vite
- Tailwind CSS
- Framer Motion
- lucide-react
- Google Calendar API
- Photon API (geocoding)
