# Auto-Start on System Boot

## 🚀 Overview

The Auto-Start feature allows the Vortix agent to start automatically when your
computer boots up. This ensures your device is always available for remote
control without manual intervention.

## ✨ Features

- **One-Click Enable**: Toggle auto-start from the dashboard
- **Platform Support**: Works on Windows, macOS, and Linux
- **Persistent**: Survives system reboots
- **Easy Disable**: Turn off anytime from dashboard or CLI
- **Status Indicator**: See if auto-start is enabled at a glance

---

## 🎯 How to Enable

### Method 1: From Dashboard (Recommended)

1. Open the Vortix dashboard
2. Select your device from the sidebar
3. Scroll down to "Auto-Start on Boot"
4. Click the toggle switch to enable
5. Done! The agent will start automatically on next boot

### Method 2: From CLI

```bash
vortix enable-autostart
```

---

## 🛑 How to Disable

### From Dashboard

1. Select your device
2. Find "Auto-Start on Boot"
3. Click the toggle to disable

### From CLI

```bash
vortix disable-autostart
```

---

## 📊 Check Status

### From Dashboard

- Look at the "Auto-Start on Boot" section
- Shows "Enabled" or "Disabled"

### From CLI

```bash
vortix status
```

Output:

```
=== Vortix Agent Status ===
Platform: win32 (Windows)
Device: YOUR-PC-NAME
Password Set: ✅ Yes
Auto-start: ✅ Enabled
===========================
```

---

## 🔧 Platform-Specific Implementation

### Windows

**Method**: Task Scheduler

**What it does**:

- Creates a scheduled task named "VortixAgent"
- Runs on user login
- Uses a VBScript to run silently (no console window)
- Runs with highest privileges

**Files Created**:

- `%USERPROFILE%\vortix-agent.vbs` - Silent launcher script
- Task Scheduler entry: "VortixAgent"

**Manual Management**:

```cmd
# View task
schtasks /query /tn "VortixAgent"

# Delete task
schtasks /delete /tn "VortixAgent" /f
```

---

### macOS

**Method**: LaunchAgent

**What it does**:

- Creates a LaunchAgent plist file
- Runs on user login
- Automatically restarts if crashes
- Logs to ~/Library/Logs/

**Files Created**:

- `~/Library/LaunchAgents/com.vortix.agent.plist`

**Manual Management**:

```bash
# Load agent
launchctl load ~/Library/LaunchAgents/com.vortix.agent.plist

# Unload agent
launchctl unload ~/Library/LaunchAgents/com.vortix.agent.plist

# View logs
tail -f ~/Library/Logs/vortix-agent.log
```

---

### Linux

**Method**: systemd user service

**What it does**:

- Creates a systemd user service
- Runs on user login
- Automatically restarts if crashes
- Managed by systemd

**Files Created**:

- `~/.config/systemd/user/vortix-agent.service`

**Manual Management**:

```bash
# Enable service
systemctl --user enable vortix-agent.service

# Disable service
systemctl --user disable vortix-agent.service

# Start service
systemctl --user start vortix-agent.service

# Stop service
systemctl --user stop vortix-agent.service

# View status
systemctl --user status vortix-agent.service

# View logs
journalctl --user -u vortix-agent.service -f
```

---

## 🔒 Security Considerations

### What Auto-Start Does

- ✅ Starts the agent on user login
- ✅ Uses your saved password from `vortix login`
- ✅ Connects to the backend automatically
- ✅ Makes your device available for remote control

### What Auto-Start Does NOT Do

- ❌ Does not bypass system login
- ❌ Does not run before user logs in
- ❌ Does not grant additional permissions
- ❌ Does not expose your password

### Best Practices

1. **Use Strong Passwords**: Your device password protects remote access
2. **Physical Security**: Auto-start means anyone who logs into your account can
   be remotely controlled
3. **Disable When Not Needed**: Turn off auto-start if you don't need 24/7
   access
4. **Monitor Logs**: Check dashboard logs regularly for suspicious activity

---

## 🐛 Troubleshooting

### Auto-Start Not Working

**Windows**:

```cmd
# Check if task exists
schtasks /query /tn "VortixAgent"

# Try running as administrator
# Right-click Command Prompt → Run as Administrator
vortix enable-autostart
```

**macOS**:

```bash
# Check if plist exists
ls -la ~/Library/LaunchAgents/com.vortix.agent.plist

# Check if loaded
launchctl list | grep vortix

# Reload
launchctl unload ~/Library/LaunchAgents/com.vortix.agent.plist
launchctl load ~/Library/LaunchAgents/com.vortix.agent.plist
```

**Linux**:

```bash
# Check if service exists
systemctl --user list-unit-files | grep vortix

# Check status
systemctl --user status vortix-agent.service

# Reload systemd
systemctl --user daemon-reload
systemctl --user enable vortix-agent.service
```

---

### Agent Starts But Doesn't Connect

**Check**:

1. Internet connection
2. Backend is running (https://vortix.onrender.com)
3. Password is set: `vortix status`
4. Firewall isn't blocking WebSocket connections

**Solution**:

```bash
# Re-login to save password
vortix login

# Disable and re-enable auto-start
vortix disable-autostart
vortix enable-autostart
```

---

### Toggle in Dashboard Not Working

**Symptoms**:

- Toggle doesn't change state
- No response when clicking

**Solutions**:

1. Make sure device is online
2. Make sure you're authenticated (entered password)
3. Check browser console for errors (F12)
4. Refresh the dashboard
5. Try using CLI instead: `vortix enable-autostart`

---

### Permission Errors

**Windows**:

```
Error: Failed to create scheduled task. Try running as administrator.
```

**Solution**: Run Command Prompt as Administrator

**macOS**:

```
Error: Operation not permitted
```

**Solution**: Grant Terminal/iTerm Full Disk Access in System Preferences

**Linux**:

```
Error: Failed to enable service
```

**Solution**: Make sure systemd is running: `systemctl --user status`

---

## 📱 Use Cases

### Home Server

- Enable auto-start on your home server
- Access it remotely anytime
- No need to manually start the agent

### Work Computer

- Enable auto-start on work PC
- Control it from home
- Disable when on vacation

### Development Machine

- Enable auto-start on dev machine
- Deploy code remotely
- Run builds from anywhere

### Media Center

- Enable auto-start on media PC
- Control playback remotely
- Manage downloads

---

## 🎓 Advanced Usage

### Delayed Start (Windows)

Edit the VBScript to add a delay:

```vbscript
' Wait 30 seconds before starting
WScript.Sleep 30000

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node path\to\agent.js start", 0, False
```

### Custom Logging (macOS)

Edit the plist file to change log location:

```xml
<key>StandardOutPath</key>
<string>/path/to/custom/log.txt</string>
```

### Resource Limits (Linux)

Edit the service file to add resource limits:

```ini
[Service]
MemoryLimit=512M
CPUQuota=50%
```

---

## 🔄 Updating Vortix

When you update Vortix:

```bash
npm install -g vortix@latest
```

**Auto-start will continue to work!**

The scheduled task/service points to the global npm installation, which gets
updated automatically.

**If auto-start stops working after update**:

```bash
vortix disable-autostart
vortix enable-autostart
```

---

## 🗑️ Complete Removal

To completely remove Vortix and auto-start:

```bash
# Disable auto-start
vortix disable-autostart

# Uninstall CLI
npm uninstall -g vortix

# Remove config file
# Windows: del %USERPROFILE%\.vortix-config.json
# macOS/Linux: rm ~/.vortix-config.json
```

---

## 📊 Performance Impact

### Resource Usage

- **CPU**: < 1% when idle
- **Memory**: ~30-50 MB
- **Network**: Minimal (heartbeat every 5 seconds)
- **Disk**: None (no logging to disk by default)

### Startup Time

- **Windows**: ~2-3 seconds after login
- **macOS**: ~1-2 seconds after login
- **Linux**: ~1-2 seconds after login

### Battery Impact (Laptops)

- Negligible when idle
- Slightly higher when executing commands
- Screen sharing increases battery usage

---

## 🎯 Best Practices

### DO:

- ✅ Enable auto-start on devices you need 24/7 access to
- ✅ Use strong passwords
- ✅ Monitor dashboard logs regularly
- ✅ Disable when traveling or on vacation
- ✅ Test after enabling to make sure it works

### DON'T:

- ❌ Enable on public/shared computers
- ❌ Use weak passwords
- ❌ Leave auto-start enabled on devices you don't need remote access to
- ❌ Forget to disable when selling/giving away computer
- ❌ Run multiple agents on same device

---

## 💬 FAQ

**Q: Does auto-start work before I log in?** A: No, it starts after user login.
This is by design for security.

**Q: Can I auto-start on multiple user accounts?** A: Yes, run
`vortix enable-autostart` on each account.

**Q: Does it work with Fast User Switching?** A: Yes, each user session runs its
own agent.

**Q: What if my computer sleeps?** A: The agent reconnects automatically when
computer wakes up.

**Q: Can I run multiple agents on one computer?** A: Not recommended. Use one
agent per device.

**Q: Does it work with VPN?** A: Yes, as long as WebSocket connections are
allowed.

---

## 📚 Related Documentation

- **New Features**: `docs/NEW_FEATURES.md`
- **Quick Start**: `docs/QUICK_START.md`
- **Deployment**: `docs/DEPLOYMENT.md`

---

## 🆘 Support

Need help?

- GitHub: https://github.com/Vaibhav262610/vortix
- Email: vaibhavrajpoot2626@gmail.com

---

**Happy Auto-Starting!** 🚀✨
