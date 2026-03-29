# Vortix

🚀 **AI-powered remote OS control system** with natural language command
execution, real-time monitoring, and advanced device management.

## ✨ Features

- 🤖 **AI Command Generation** - Natural language to system commands
- 📊 **Real-time System Monitoring** - CPU, Memory, Disk usage
- 🖥️ **Screen Sharing** - Live desktop streaming
- 📁 **File Transfer** - Upload/download files remotely
- 🔄 **Multi-device Control** - Execute commands across multiple devices
- 🔐 **Secure Authentication** - Password-protected device access
- ⚡ **Auto-start on Boot** - Automatic agent startup
- 📱 **Modern Web Dashboard** - Responsive UI with mobile support

## 🚀 Quick Start

### Installation

```bash
npm install -g vortix
```

### Setup Your Device

1. **Authenticate your device:**

```bash
vortix login
```

2. **Start the agent:**

```bash
vortix start
```

3. **Access the dashboard:** Visit
   [https://vortixai.vercel.app](https://vortixai.vercel.app)

That's it! No backend setup required - everything runs in the cloud.

## 📋 Commands

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `vortix login` | Authenticate and register your device |
| `vortix start` | Start the agent on current machine    |
| `vortix help`  | Show help information                 |

## 🎯 Use Cases

- **Remote Work** - Control your office computer from home
- **Server Management** - Monitor and manage remote servers
- **IT Support** - Help users remotely without screen sharing software
- **Home Automation** - Control your home PC from anywhere
- **Development** - Manage multiple development environments

## 🏗️ Architecture

- **☁️ Cloud Backend** - Hosted WebSocket server (always online)
- **🤖 Local Agent** - Runs on your devices, executes commands
- **🌐 Web Dashboard** - Modern React/Next.js interface
- **🔒 Secure Connection** - End-to-end encrypted communication

## 💡 Example Commands

Try these natural language commands in the dashboard:

```
"open notepad"
"show me system information"
"take a screenshot"
"list files in downloads folder"
"shutdown computer in 5 minutes"
"check disk space"
```

## 🔧 Advanced Features

### Auto-start on Boot

Enable automatic agent startup when your computer boots:

```bash
vortix start --autostart
```

### Screen Sharing

View your desktop in real-time through the web dashboard.

### File Transfer

Upload and download files directly through the web interface.

### Multi-device Control

Execute the same command across multiple connected devices simultaneously.

## 🌐 Dashboard Features

- **Command Center** - Execute commands with AI assistance
- **Device Management** - View and control all connected devices
- **System Monitoring** - Real-time CPU, memory, and disk usage
- **File Browser** - Navigate and transfer files
- **Screen Viewer** - Live desktop streaming
- **Mobile Support** - Full functionality on mobile devices

## 🔒 Security

- Password-protected device authentication
- Secure WebSocket connections (WSS)
- Command approval system for dangerous operations
- No data stored on servers (commands executed locally)

## 📱 Supported Platforms

- ✅ Windows (7, 8, 10, 11)
- ✅ macOS (10.14+)
- ✅ Linux (Ubuntu, CentOS, Debian, etc.)

## 🆘 Troubleshooting

### Agent won't connect?

1. Check your internet connection
2. Ensure firewall allows outbound connections
3. Try restarting the agent: `vortix start`

### Commands not working?

1. Verify device is authenticated and online
2. Check if the command requires admin privileges
3. Try simpler commands first

### Need help?

- Visit our [documentation](https://vortixai.vercel.app/setup)
- Report issues on [GitHub](https://github.com/Vaibhav262610/vortix/issues)
- Contact support: vaibhavrajpoot2626@gmail.com

## 🚀 What's New in v1.2.0

- 🎨 **Redesigned Dashboard** - Modern Command Center interface
- 📱 **Mobile Optimization** - Perfect mobile experience
- ⚡ **Performance Improvements** - Faster real-time updates
- 🔧 **Enhanced UI** - Better navigation and user experience
- 🌐 **Cloud-first Architecture** - No backend setup required

## 📄 License

MIT License - see
[LICENSE](https://github.com/Vaibhav262610/vortix/blob/main/LICENSE) for
details.

---

**Made with ❤️ by [Vaibhav Rajpoot](https://github.com/Vaibhav262610)**
