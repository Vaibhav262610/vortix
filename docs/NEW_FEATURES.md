# Vortix - New Features

## 🎹 Keyboard Shortcuts

Enhance your productivity with keyboard shortcuts:

- **Ctrl+Enter**: Send command instantly (no need to click the button)
- **Ctrl+K**: Open quick commands modal
- **ESC**: Close any open modal (quick commands, screen share, etc.)

### Usage Tips

1. Type your command in the input field
2. Press `Ctrl+Enter` to execute immediately
3. Press `Ctrl+K` anytime to access quick commands
4. Press `ESC` to close modals quickly

---

## 🖥️ Multi-Platform Support

Vortix now supports Windows, macOS, and Linux!

### Supported Platforms

| Platform | Status          | Shell     | Notes             |
| -------- | --------------- | --------- | ----------------- |
| Windows  | ✅ Full Support | cmd.exe   | Original platform |
| macOS    | ✅ Full Support | /bin/bash | New in v1.1.0     |
| Linux    | ✅ Full Support | /bin/bash | New in v1.1.0     |

### Platform Detection

The agent automatically detects your operating system and:

- Uses the appropriate shell (cmd.exe for Windows, bash for Unix)
- Sends platform information to the backend
- AI planner generates platform-specific commands

### Platform-Specific Commands

#### Windows

```bash
dir C:\Users
systeminfo
ipconfig
shutdown /s /t 0
```

#### macOS

```bash
ls -la ~/Desktop
system_profiler SPSoftwareDataType
ifconfig
sudo shutdown -h now
```

#### Linux

```bash
ls -la ~/Desktop
uname -a
ifconfig
sudo shutdown -h now
```

### AI Command Generation

The AI planner now understands your platform and generates appropriate commands:

**Windows Example:**

- User: "create a file on desktop"
- AI: `echo Hello > C:\Users\YourName\Desktop\file.txt`

**macOS/Linux Example:**

- User: "create a file on desktop"
- AI: `echo "Hello" > ~/Desktop/file.txt`

---

## � Auto-Start on System Boot

Configure your agent to start automatically when your computer boots up!

### Features

- **Dashboard Toggle**: Enable/disable with one click
- **CLI Commands**: `vortix enable-autostart` / `vortix disable-autostart`
- **Platform Support**: Windows (Task Scheduler), macOS (LaunchAgent), Linux
  (systemd)
- **Status Indicator**: See if auto-start is enabled in the dashboard
- **Persistent**: Survives system reboots

### How to Use

**From Dashboard**:

1. Select your device
2. Find "Auto-Start on Boot" toggle
3. Click to enable/disable

**From CLI**:

```bash
# Enable
vortix enable-autostart

# Disable
vortix disable-autostart

# Check status
vortix status
```

### Platform-Specific Details

**Windows**: Creates a Task Scheduler entry that runs on user login **macOS**:
Creates a LaunchAgent plist file in ~/Library/LaunchAgents/ **Linux**: Creates a
systemd user service in ~/.config/systemd/user/

### Benefits

- No need to manually start the agent after reboot
- Device is always available for remote control
- Perfect for servers and always-on machines
- Easy to enable/disable as needed

See [AUTO_START.md](./AUTO_START.md) for detailed documentation.

---

## 📺 Real-Time Screen Sharing

View your remote desktop in real-time directly from the dashboard!

### Features

- **Live Streaming**: See your desktop screen updated every second
- **High Quality**: JPEG compression for fast transmission
- **Easy Toggle**: Start/stop with one click
- **Multiple Viewers**: Multiple dashboards can watch the same device

### How to Use

1. **Select a Device**: Click on an online device in the sidebar
2. **Start Screen Share**: Click the "View Screen" button
3. **Watch Live**: Your desktop appears in a modal window
4. **Stop Sharing**: Click "Stop Screen Share" or press ESC

### Technical Details

- **Capture Rate**: 1 frame per second (adjustable)
- **Format**: JPEG (base64 encoded)
- **Transport**: WebSocket for real-time delivery
- **Platform Support**: Windows, macOS, Linux

### Requirements

The agent uses the `screenshot-desktop` npm package which requires:

**Windows**: No additional requirements

**macOS**:

- Screen Recording permission (System Preferences → Security & Privacy → Privacy
  → Screen Recording)

**Linux**:

- X11 or Wayland display server
- `scrot` or `imagemagick` installed

### Performance Notes

- Screen sharing uses bandwidth (approximately 50-200 KB/s depending on screen
  content)
- Multiple viewers share the same capture (no additional load on agent)
- Capture automatically stops when all viewers disconnect

### Privacy & Security

- Screen sharing only works for authenticated devices
- You must enter the device password before viewing
- Screen capture stops automatically when dashboard disconnects
- No recordings are stored - everything is real-time only

---

## 🚀 Installation & Setup

### Update Existing Installation

If you already have Vortix installed:

```bash
# Update the CLI
npm install -g vortix@latest

# Restart your agent
vortix start
```

### Fresh Installation

```bash
# Install CLI
npm install -g vortix

# Set device password
vortix login

# Start agent
vortix start
```

### Install Dependencies (for development)

If you're running the agent from source:

```bash
cd agent
npm install
# This will install screenshot-desktop automatically
```

---

## 📝 Changelog

### v1.2.0 (Current)

**New Features:**

- ✨ Keyboard shortcuts (Ctrl+Enter, Ctrl+K, ESC)
- 🖥️ Multi-platform support (Windows, macOS, Linux)
- 📺 Real-time screen sharing
- 🚀 Auto-start on system boot
- 🤖 Platform-aware AI command generation

**Improvements:**

- Better platform detection
- Improved command execution for Unix systems
- Enhanced dashboard UI with keyboard hints
- Optimized WebSocket communication
- Auto-start management from dashboard and CLI

**Bug Fixes:**

- Fixed shell selection for different platforms
- Improved error handling for screen capture
- Better cleanup on disconnect

---

## 🔧 Troubleshooting

### Screen Sharing Not Working

**Windows:**

- Make sure the agent is running with sufficient permissions
- Check if antivirus is blocking screenshot capture

**macOS:**

- Grant Screen Recording permission to Terminal/iTerm
- System Preferences → Security & Privacy → Privacy → Screen Recording
- Restart the agent after granting permission

**Linux:**

- Install required packages: `sudo apt-get install scrot` or
  `sudo apt-get install imagemagick`
- Make sure X11 is running: `echo $DISPLAY` should show `:0` or similar
- For Wayland, you may need additional configuration

### Platform Not Detected

If the dashboard shows "unknown" platform:

1. Restart the agent
2. Check agent logs for platform information
3. Make sure you're using the latest version

### Commands Not Working on macOS/Linux

- Some commands may require `sudo` (not recommended for remote execution)
- Check command syntax for your specific platform
- Use direct commands instead of AI planning for complex operations

---

## 💡 Tips & Best Practices

1. **Use Keyboard Shortcuts**: Speed up your workflow with Ctrl+Enter and Ctrl+K
2. **Platform-Specific Commands**: Learn the command differences between
   platforms
3. **Screen Sharing**: Use for monitoring, not for sensitive operations
4. **Security**: Always use strong passwords for device authentication
5. **Performance**: Close screen sharing when not needed to save bandwidth

---

## 🤝 Contributing

Found a bug or have a feature request?

- GitHub: https://github.com/Vaibhav262610/vortix
- Email: vaibhavrajpoot2626@gmail.com

---

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ by Vaibhav Rajpoot**
