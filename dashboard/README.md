# Vortix dashboard

## Local setup

1. Run `npm install` in this directory.
2. Copy `.env.example` to `.env.local`. Use the publishable and secret keys from the **same Clerk application**. Set `NEXT_PUBLIC_BACKEND_WS` to the WebSocket URL of the backend you will use.
3. Run `npm run dev` and open `http://localhost:3000`.

Sign in at `/auth` or create an account at `/sign-up`. Clerk redirects signed-in users to `/dashboard`. The dashboard sends a short-lived Clerk session token to the backend after opening its WebSocket; the backend must use the matching Clerk secret key. The device password is a separate credential used to unlock a connected device.

For deployment, set the same dashboard variables in your hosting platform and the backend's `CLERK_SECRET_KEY` in the backend service. Restart or redeploy both services after changing environment variables.
