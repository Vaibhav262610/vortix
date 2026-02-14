# ✅ Fixed: Duplicate Device & Unlock Button Issues

## Issues Reported

1. **Duplicate Device**: After entering password, another device was added with
   the password written in front of it
2. **Unlock Button Not Working**: Clicking "Unlock" button did nothing

## Root Causes

### Issue 1: Duplicate Device Creation

**Problem**: The backend was incorrectly parsing the token format.

The token format is: `device-hostname:password`

The code was using:

```javascript
const [deviceToken, password] = token.split(":");
```

This only splits on the FIRST colon. If the password contained a colon, it would
break. More importantly, the deviceId was being set incorrectly.

**Fix**: Changed to properly parse the token:

```javascript
const tokenParts = token.split(":");
const deviceToken = tokenParts[0];
const password = tokenParts.slice(1).join(":"); // Handle passwords with colons
const deviceId = deviceToken; // Use just the device token, not the full token
```

### Issue 2: Unlock Button Not Working

**Problem**: The dashboard wasn't properly handling the AUTH_SUCCESS response.

After successful authentication, the code had:

```javascript
if (data.type === "AUTH_SUCCESS") {
	console.log("Device authenticated:", data.deviceName);
	setAuthDialog(null);
	setAuthPassword("");
	// Refresh device list  <-- Just a comment, no action!
}
```

**Fix**: Added proper device selection after authentication:

```javascript
if (data.type === "AUTH_SUCCESS") {
	console.log("Device authenticated:", data.deviceName);
	setAuthDialog(null);
	setAuthPassword("");
	setSelectedDevice(data.deviceName); // ✅ Select the device
}
```

## Changes Made

### Backend (`backend/server.js`)

- Fixed token parsing to properly extract device token and password
- Now handles passwords that contain colons
- Prevents duplicate device registration

### Dashboard (`dashboard/app/page.tsx`)

- Added `setSelectedDevice(data.deviceName)` after successful authentication
- Now properly selects the device after unlocking

## Testing

1. **Start Agent**:

   ```bash
   vortix login
   # Enter password: test123
   vortix start
   ```

2. **Open Dashboard**:
   - Device appears as "locked"
   - Click on device
   - Enter password: test123
   - Click "Unlock"

3. **Expected Result**:
   - ✅ Dialog closes
   - ✅ Device becomes selected (highlighted in green)
   - ✅ No duplicate device created
   - ✅ Can send commands immediately

## Deployment

- ✅ Backend: Auto-deploying to Render
- ✅ Dashboard: Auto-deploying to Vercel
- ✅ Changes pushed to GitHub

## Wait Time

- **Render**: ~2-3 minutes for backend deployment
- **Vercel**: ~30-60 seconds for dashboard deployment

## Verification

After deployment completes:

1. Refresh the dashboard
2. Stop and restart your agent
3. Try unlocking the device
4. Should work perfectly now!

---

**Fixed**: February 14, 2026 **Status**: Deployed
