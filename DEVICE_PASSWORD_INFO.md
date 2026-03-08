# Device Password Information

## Where is the Password?

The device password is stored in:

```
C:\Users\<YourUsername>\.vortix-config.json
```

Or in your home directory:

```
%USERPROFILE%\.vortix-config.json
```

## View Your Password

**Option 1 - Using Command:**

```bash
type %USERPROFILE%\.vortix-config.json
```

**Option 2 - Using File Explorer:**

1. Press `Win + R`
2. Type: `%USERPROFILE%`
3. Look for `.vortix-config.json`
4. Open with Notepad

## Default Password

If you ran `COMPLETE_FIX.bat`, the default password is:

```
vortix123
```

## Set/Change Password

### Method 1: Using Agent Command

```bash
cd agent
node agent.js login
```

Then enter your desired password when prompted.

### Method 2: Manual Edit

1. Open: `%USERPROFILE%\.vortix-config.json`
2. Edit to:

```json
{ "password": "your-password-here" }
```

3. Save the file
4. Restart the agent

## Check Current Password

Run this command:

```bash
type %USERPROFILE%\.vortix-config.json
```

You'll see something like:

```json
{ "password": "vortix123" }
```

## Using the Password

When you connect to your device in the dashboard:

1. Click on your device in the device list
2. Enter the password from `.vortix-config.json`
3. Click "Unlock"

## Quick Commands

**View password:**

```bash
type %USERPROFILE%\.vortix-config.json
```

**Set new password:**

```bash
cd agent
node agent.js login
```

**Reset to default (vortix123):**

```bash
echo {"password":"vortix123"} > %USERPROFILE%\.vortix-config.json
```

## Important Notes

- The password is stored in plain text in the config file
- Each device has its own password
- You need to remember this password to access the device from the dashboard
- If you forget it, just set a new one using `node agent.js login`

## Default Password Summary

If you used any of the fix scripts, your password is:

```
vortix123
```

Use this in the dashboard when authenticating your device.
