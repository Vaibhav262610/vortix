# Vortix Quick Fixes & Immediate Improvements

**Priority:** Immediate  
**Estimated Time:** 2-3 hours total

---

## 🔧 Critical Fixes (Do Now)

### 1. Fix WebSocket URL in Dashboard Environment

**Issue:** `.env.local` uses `https://` instead of `wss://`  
**Impact:** May cause connection issues  
**Time:** 2 minutes

**Current:**

```env
NEXT_PUBLIC_BACKEND_WS=https://vortix.onrender.com
```

**Fix:**

```env
NEXT_PUBLIC_BACKEND_WS=wss://vortix.onrender.com
```

**Action:**

```bash
# Update dashboard/.env.local
NEXT_PUBLIC_BACKEND_WS=wss://vortix.onrender.com
BACKEND_URL=wss://vortix.onrender.com
```

---

### 2. Remove Unused Backend Dependencies

**Issue:** `openai` and `uuid` packages are installed but not used  
**Impact:** Unnecessary bloat, potential security vulnerabilities  
**Time:** 5 minutes

**Action:**

```bash
cd backend
npm uninstall openai uuid
npm install
```

**Verify:**

```bash
npm list --depth=0
# Should only show: axios, ws
```

---

### 3. Add .env.example Files

**Issue:** Missing example environment files  
**Impact:** New developers don't know what variables to set  
**Time:** 10 minutes

**Create `backend/.env.example`:**

```env
# Backend Configuration
PORT=8080
NODE_ENV=production

# AI Configuration (Optional)
GROQ_API_KEY=your_groq_api_key_here

# Ollama Configuration (Local AI - Optional)
OLLAMA_URL=http://localhost:11434
```

**Create `dashboard/.env.example`:**

```env
# Dashboard Configuration
NEXT_PUBLIC_BACKEND_WS=wss://your-backend-url.com
```

---

## 🛠️ Code Improvements (30 minutes)

### 4. Add Error Boundaries to Dashboard

**Issue:** Unhandled errors crash the entire app  
**Impact:** Poor user experience  
**Time:** 15 minutes

**Create `dashboard/components/ErrorBoundary.tsx`:**

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-white/60 mb-8">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update `dashboard/app/layout.tsx`:**

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

### 5. Add Connection Status Indicator

**Issue:** Users don't know if WebSocket is connected  
**Impact:** Confusion when commands don't work  
**Time:** 15 minutes

**Add to `dashboard/app/dashboard/page.tsx`:**

```typescript
const [wsConnected, setWsConnected] = useState(false);

// In WebSocket connection code:
ws.onopen = () => {
  setWsConnected(true);
  console.log("Connected to backend");
};

ws.onclose = () => {
  setWsConnected(false);
  console.log("Disconnected from backend");
};

// Add indicator to UI:
<div className="fixed top-4 right-4 z-50">
  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
    wsConnected
      ? 'bg-emerald-600/20 border border-emerald-600/30'
      : 'bg-red-600/20 border border-red-600/30'
  }`}>
    <div className={`w-2 h-2 rounded-full ${
      wsConnected ? 'bg-emerald-400' : 'bg-red-400'
    } ${wsConnected ? 'animate-pulse' : ''}`} />
    <span className="text-xs">
      {wsConnected ? 'Connected' : 'Disconnected'}
    </span>
  </div>
</div>
```

---

## 📝 Documentation Improvements (20 minutes)

### 6. Add Troubleshooting Section to README

**Issue:** Users don't know how to fix common issues  
**Time:** 10 minutes

**Add to `README.md`:**

```markdown
## 🔧 Troubleshooting

### Agent Won't Connect

**Symptoms:** Agent shows "Connection refused" or "ECONNREFUSED"

**Solutions:**

1. Check internet connection
2. Verify backend URL is correct
3. Check firewall settings
4. Try restarting the agent: `vortix start`

### Commands Not Executing

**Symptoms:** Commands sent but nothing happens

**Solutions:**

1. Verify device is authenticated (green status)
2. Check agent logs for errors
3. Try a simple command first: `echo test`
4. Restart the agent

### Dashboard Shows "Disconnected"

**Symptoms:** Red indicator in top-right corner

**Solutions:**

1. Check backend is running: https://vortix.onrender.com/health
2. Check browser console for errors
3. Try refreshing the page
4. Check your internet connection

### Screen Sharing Not Working

**Windows:**

- Run agent as Administrator
- Check antivirus settings

**macOS:**

- Grant Screen Recording permission
- System Preferences → Security & Privacy → Privacy → Screen Recording

**Linux:**

- Install scrot: `sudo apt-get install scrot`
- Check X11 is running: `echo $DISPLAY`

### Need More Help?

- Check [documentation](https://vortixai.vercel.app/setup)
- Open an [issue](https://github.com/Vaibhav262610/vortix/issues)
- Email: vaibhavrajpoot2626@gmail.com
```

---

### 7. Add Security Best Practices

**Issue:** Users don't know how to use Vortix securely  
**Time:** 10 minutes

**Create `SECURITY_BEST_PRACTICES.md`:**

````markdown
# Vortix Security Best Practices

## Password Security

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Don't reuse passwords

2. **Change Passwords Regularly**
   ```bash
   vortix login  # Set new password
   ```
````

3. **Don't Share Passwords**
   - Each device should have unique password
   - Don't share passwords via email/chat

## Command Safety

1. **Review Commands Before Execution**
   - Always read AI-generated commands
   - Understand what each command does
   - Use dry-run mode when available

2. **Avoid Dangerous Commands**
   - Don't run `rm -rf /` or similar
   - Don't format drives remotely
   - Be careful with shutdown commands

3. **Use Command Approval**
   - Enable approval for dangerous commands
   - Review before executing

## Network Security

1. **Use Secure Connections**
   - Always use WSS (not WS)
   - Verify SSL certificates
   - Don't disable HTTPS

2. **Firewall Configuration**
   - Only allow necessary ports
   - Use VPN when possible
   - Monitor network traffic

## Device Security

1. **Keep Software Updated**

   ```bash
   npm update -g vortix
   ```

2. **Monitor Device Activity**
   - Check audit logs regularly
   - Review command history
   - Watch for suspicious activity

3. **Limit Access**
   - Only install on trusted devices
   - Don't run on public computers
   - Use device groups for organization

## Compliance

1. **Audit Logging**
   - Enable audit logs
   - Review logs regularly
   - Export logs for compliance

2. **Access Control**
   - Use role-based access
   - Limit permissions
   - Review user access regularly

## Incident Response

1. **If Compromised**
   - Change all passwords immediately
   - Disconnect affected devices
   - Review audit logs
   - Contact support

2. **Report Security Issues**
   - Email: vaibhavrajpoot2626@gmail.com
   - Include details but not sensitive data
   - Wait for response before public disclosure

````

---

## 🎨 UI/UX Improvements (30 minutes)

### 8. Add Loading States
**Issue:** No feedback during operations
**Time:** 15 minutes

**Add to dashboard:**
```typescript
const [isExecuting, setIsExecuting] = useState(false);

const executeCommand = async () => {
  setIsExecuting(true);
  try {
    // Execute command
  } finally {
    setIsExecuting(false);
  }
};

// In UI:
<button
  onClick={executeCommand}
  disabled={isExecuting}
  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
>
  {isExecuting ? (
    <>
      <span className="animate-spin mr-2">⏳</span>
      Executing...
    </>
  ) : (
    'Execute'
  )}
</button>
````

---

### 9. Add Toast Notifications

**Issue:** No feedback for success/error  
**Time:** 15 minutes

**Install library:**

```bash
cd dashboard
npm install react-hot-toast
```

**Add to `dashboard/app/layout.tsx`:**

```typescript
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </body>
    </html>
  );
}
```

**Use in components:**

```typescript
import toast from "react-hot-toast";

// Success
toast.success("Command executed successfully");

// Error
toast.error("Failed to execute command");

// Loading
const toastId = toast.loading("Executing command...");
// Later:
toast.success("Done!", { id: toastId });
```

---

## 🧪 Testing Improvements (30 minutes)

### 10. Add Basic Health Check Script

**Issue:** No automated way to verify system health  
**Time:** 15 minutes

**Create `scripts/health-check.js`:**

```javascript
#!/usr/bin/env node

const axios = require("axios");
const WebSocket = require("ws");

const BACKEND_URL = "https://vortix.onrender.com";
const WS_URL = "wss://vortix.onrender.com";

async function checkBackendHealth() {
	try {
		const response = await axios.get(`${BACKEND_URL}/health`, {
			timeout: 5000,
		});
		console.log("✅ Backend health check passed");
		console.log("   Status:", response.data.status);
		console.log("   Devices:", response.data.devices);
		console.log("   Dashboards:", response.data.dashboards);
		return true;
	} catch (error) {
		console.error("❌ Backend health check failed:", error.message);
		return false;
	}
}

async function checkWebSocketConnection() {
	return new Promise((resolve) => {
		try {
			const ws = new WebSocket(`${WS_URL}?token=health-check&type=dashboard`);

			ws.on("open", () => {
				console.log("✅ WebSocket connection successful");
				ws.close();
				resolve(true);
			});

			ws.on("error", (error) => {
				console.error("❌ WebSocket connection failed:", error.message);
				resolve(false);
			});

			setTimeout(() => {
				ws.close();
				console.error("❌ WebSocket connection timeout");
				resolve(false);
			}, 5000);
		} catch (error) {
			console.error("❌ WebSocket connection failed:", error.message);
			resolve(false);
		}
	});
}

async function main() {
	console.log("🔍 Running Vortix Health Check...\n");

	const backendOk = await checkBackendHealth();
	const wsOk = await checkWebSocketConnection();

	console.log("\n📊 Summary:");
	console.log(`   Backend: ${backendOk ? "✅" : "❌"}`);
	console.log(`   WebSocket: ${wsOk ? "✅" : "❌"}`);

	if (backendOk && wsOk) {
		console.log("\n✅ All systems operational!");
		process.exit(0);
	} else {
		console.log("\n❌ Some systems are down!");
		process.exit(1);
	}
}

main();
```

**Add to `package.json`:**

```json
{
	"scripts": {
		"health-check": "node scripts/health-check.js"
	}
}
```

**Run:**

```bash
npm run health-check
```

---

### 11. Add Pre-commit Hook

**Issue:** No code quality checks before commit  
**Time:** 15 minutes

**Install husky:**

```bash
npm install --save-dev husky
npx husky install
```

**Create `.husky/pre-commit`:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Check for console.logs in production code
if git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -n "console.log" > /dev/null; then
  echo "⚠️  Warning: console.log found in staged files"
fi

# Run health check
npm run health-check

echo "✅ Pre-commit checks passed!"
```

---

## 📊 Monitoring Improvements (20 minutes)

### 12. Add Simple Analytics

**Issue:** No visibility into usage  
**Time:** 10 minutes

**Add to `backend/server.js`:**

```javascript
const stats = {
	totalCommands: 0,
	totalConnections: 0,
	startTime: Date.now(),
};

// Track commands
function trackCommand() {
	stats.totalCommands++;
}

// Track connections
wss.on("connection", () => {
	stats.totalConnections++;
});

// Add stats endpoint
server.on("request", (req, res) => {
	if (req.url === "/stats") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(
			JSON.stringify({
				...stats,
				uptime: Math.floor((Date.now() - stats.startTime) / 1000),
				devices: devices.size,
				dashboards: dashboardClients.size,
			}),
		);
	}
});
```

---

### 13. Add Error Tracking

**Issue:** Errors are lost in logs  
**Time:** 10 minutes

**Create `backend/error-logger.js`:**

```javascript
const fs = require("fs");
const path = require("path");

const ERROR_LOG = path.join(__dirname, "errors.log");

function logError(error, context = {}) {
	const entry = {
		timestamp: new Date().toISOString(),
		error: {
			message: error.message,
			stack: error.stack,
		},
		context,
	};

	fs.appendFileSync(ERROR_LOG, JSON.stringify(entry) + "\n");
	console.error("Error logged:", entry);
}

module.exports = { logError };
```

**Use in code:**

```javascript
const { logError } = require("./error-logger");

try {
	// Some operation
} catch (error) {
	logError(error, { deviceId, command });
}
```

---

## ✅ Checklist

- [ ] Fix WebSocket URL in .env.local
- [ ] Remove unused dependencies
- [ ] Add .env.example files
- [ ] Add error boundaries
- [ ] Add connection status indicator
- [ ] Add troubleshooting to README
- [ ] Create security best practices doc
- [ ] Add loading states
- [ ] Add toast notifications
- [ ] Create health check script
- [ ] Add pre-commit hooks
- [ ] Add simple analytics
- [ ] Add error tracking

---

## 🎯 Expected Results

After implementing these fixes:

1. **Better Reliability**
   - Correct WebSocket connections
   - Proper error handling
   - Health monitoring

2. **Better User Experience**
   - Loading indicators
   - Toast notifications
   - Connection status

3. **Better Developer Experience**
   - Example environment files
   - Pre-commit hooks
   - Health check script

4. **Better Security**
   - Security best practices
   - Error logging
   - Monitoring

---

## 📝 Next Steps

After completing these quick fixes:

1. Test all changes thoroughly
2. Deploy to production
3. Monitor for issues
4. Move on to Phase 1 of Feature Roadmap
5. Gather user feedback

---

**Total Time:** ~2-3 hours  
**Impact:** High  
**Difficulty:** Low

**Priority Order:**

1. Fix WebSocket URL (Critical)
2. Remove unused dependencies (Critical)
3. Add error boundaries (High)
4. Add connection indicator (High)
5. Add toast notifications (Medium)
6. Everything else (Low)
