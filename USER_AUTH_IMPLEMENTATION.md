# User Authentication Implementation Plan

## Problem

Currently, all users see all devices. Anyone can control any device. No user
separation.

## Solution

Implement user-based authentication so each user only sees and controls their
own devices.

## Changes Made So Far

### 1. Backend (backend/server.js)

- Added user management system with Map storage
- Added session token generation
- Added password hashing (SHA-256)
- Modified WebSocket connection to require session for dashboards
- Modified device registration to include owner (username)
- Updated broadcastDevices() to only send user's own devices
- Added LOGIN and REGISTER message handlers
- Token format changed to: `username:device-hostname`

### 2. Agent (agent/agent.js)

- Added config file storage (~/.vortix-config.json)
- Added `vortix login` command to set username
- Modified token to include username: `username:device-hostname`
- Agent now requires login before starting

### 3. Dashboard

- Created `/auth` page for login/register
- Need to add authentication check to main dashboard
- Need to pass session token in WebSocket connection

## What Still Needs to Be Done

### 1. Update Dashboard Main Page

File: `dashboard/app/page.tsx`

Add at the top:

```tsx
useEffect(() => {
	const session = localStorage.getItem("vortix_session");
	if (!session) {
		router.push("/auth");
		return;
	}
}, []);
```

Update WebSocket connection:

```tsx
const session = localStorage.getItem("vortix_session");
const ws = new WebSocket(`${backendWS}?type=dashboard&session=${session}`);
```

### 2. Update Setup Guide

File: `dashboard/app/setup/page.tsx`

Update Step 1 to mention login:

```
1. Install Vortix CLI
2. Login with your username: vortix login
3. Start the agent: vortix start
```

### 3. Add Logout Button

Add to dashboard header:

```tsx
<button
	onClick={() => {
		localStorage.removeItem("vortix_session");
		localStorage.removeItem("vortix_username");
		router.push("/auth");
	}}>
	Logout
</button>
```

### 4. Update CLI Package

Copy updated agent.js to cli_vortix/agent/

### 5. Backend Persistence (Optional - Future)

Currently users are stored in memory (Map). When server restarts, all users are
lost.

For production, add database:

- MongoDB
- PostgreSQL
- SQLite
- Or use a service like Supabase

## How It Works After Implementation

### User Registration Flow:

1. User visits dashboard → redirected to /auth
2. User creates account (username + password)
3. Backend creates user, generates session token
4. Dashboard stores session in localStorage
5. User redirected to main dashboard

### Agent Connection Flow:

1. User runs `vortix login` on their PC
2. Enters their username
3. Username saved to ~/.vortix-config.json
4. User runs `vortix start`
5. Agent connects with token: `username:device-hostname`
6. Backend verifies user exists
7. Device registered under that user
8. Only that user's dashboards see the device

### Dashboard View:

- User A logs in → sees only their devices
- User B logs in → sees only their devices
- Complete isolation between users

## Security Notes

### Current Implementation:

- Passwords hashed with SHA-256
- Session tokens are random 32-byte hex strings
- Sessions stored in memory (lost on restart)
- No HTTPS enforcement (should use HTTPS in production)

### Improvements Needed:

- Use bcrypt instead of SHA-256 for passwords
- Add session expiration
- Add rate limiting for login attempts
- Store sessions in database
- Add CSRF protection
- Use HTTPS only

## Testing Steps

1. Deploy updated backend to Render
2. Deploy updated dashboard to Vercel
3. Update CLI package with new agent code
4. Test flow:
   - Create account on dashboard
   - Run `vortix login` with same username
   - Run `vortix start`
   - Verify device appears in dashboard
   - Create second account
   - Verify second user doesn't see first user's devices

## Migration for Existing Users

Since this is a breaking change:

1. All existing agents will fail to connect (no username in token)
2. Users need to:
   - Create account on dashboard
   - Run `vortix login` with their username
   - Restart agent with `vortix start`

Add migration notice to setup guide!
