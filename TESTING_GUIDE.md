# Vortix Enhanced Features - Testing Guide

## 🚀 Quick Start

### 1. Start All Services

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - Agent (as Administrator on Windows):**

```bash
# Windows: Right-click Command Prompt → Run as Administrator
cd agent
node agent.js start
```

**Terminal 3 - Dashboard:**

```bash
cd dashboard
npm run dev
```

### 2. Access Dashboard

Open browser: `http://localhost:3000/dashboard`

---

## ✅ Feature Testing Checklist

### 1. Theme Toggle

**Test Steps:**

1. Click sun/moon icon in header
2. Verify theme switches between dark/light
3. Refresh page
4. Verify theme persists

**Expected Result:**

- ✅ Theme switches smoothly
- ✅ All components update colors
- ✅ Theme persists after refresh

---

### 2. Multi-Device Command Execution

**Test Steps:**

1. Connect multiple agents (different PCs or same PC with different device
   names)
2. Authenticate all devices
3. Click "Multi-Device" button (needs to be added to UI)
4. Select 2+ devices
5. Enter command: `echo "Hello from Vortix"`
6. Click "Execute"

**Expected Result:**

- ✅ Command executes on all selected devices
- ✅ Logs show output from each device
- ✅ Can select/deselect devices
- ✅ "Select All" / "Deselect All" works

---

### 3. File Transfer - Upload

**Test Steps:**

1. Select a device
2. Click "Files" button (needs to be added to UI)
3. Click "Desktop" folder
4. Drag-and-drop a test file
5. Check Desktop on remote PC

**Expected Result:**

- ✅ File appears in upload area
- ✅ Progress bar shows 100%
- ✅ File exists on remote Desktop
- ✅ Success message in logs

---

### 4. File Transfer - Download

**Test Steps:**

1. Select a device
2. Click "Files" button
3. Click "Desktop" folder
4. Find a file
5. Click "Download" button
6. Check Downloads folder

**Expected Result:**

- ✅ File downloads to local machine
- ✅ File is not corrupted
- ✅ Filename is correct

---

### 5. File Transfer - Browse

**Test Steps:**

1. Click "Home" button
2. Verify files list
3. Click "Desktop" button
4. Verify Desktop files
5. Click "Downloads" button
6. Verify Downloads files
7. Click on a folder
8. Verify folder contents

**Expected Result:**

- ✅ All folders load correctly
- ✅ Files show name and size
- ✅ Directories show folder icon
- ✅ Can navigate folders

---

### 6. System Stats Widget

**Test Steps:**

1. Select a device
2. Observe System Stats widget
3. Wait 3 seconds
4. Verify stats update

**Expected Result:**

- ✅ CPU usage shows (0-100%)
- ✅ Memory usage shows (0-100%)
- ✅ Disk usage shows (0-100%)
- ✅ Stats update every 3 seconds
- ✅ Bars animate smoothly

---

### 7. Recent Commands Widget

**Test Steps:**

1. Execute 5 different commands
2. Observe Recent Commands widget
3. Click on a recent command

**Expected Result:**

- ✅ Shows last 5 commands
- ✅ Most recent at top
- ✅ Clicking re-executes command
- ✅ Updates after each command

---

### 8. Device Status Widget

**Test Steps:**

1. Connect 2+ devices
2. Observe Device Status widget
3. Disconnect one device
4. Observe changes

**Expected Result:**

- ✅ Shows online count
- ✅ Shows offline count
- ✅ Shows locked count
- ✅ Lists online devices
- ✅ Can click to select device
- ✅ Selected device highlighted

---

### 9. Auto-Start Feature

**Test Steps (Windows):**

1. Run Command Prompt as Administrator
2. `cd agent`
3. `node agent.js enable-autostart`
4. Restart computer
5. Check if agent starts automatically

**Expected Result:**

- ✅ Task created in Task Scheduler
- ✅ Agent starts on boot
- ✅ No console window visible
- ✅ Can disable with `node agent.js disable-autostart`

**Test Steps (macOS):**

1. `cd agent`
2. `node agent.js enable-autostart`
3. Restart computer
4. Check if agent starts

**Expected Result:**

- ✅ LaunchAgent created
- ✅ Agent starts on login
- ✅ Can disable with `node agent.js disable-autostart`

**Test Steps (Linux):**

1. `cd agent`
2. `node agent.js enable-autostart`
3. Restart computer
4. Check if agent starts

**Expected Result:**

- ✅ Systemd service created
- ✅ Agent starts on boot
- ✅ Can disable with `node agent.js disable-autostart`

---

### 10. Screen Sharing

**Test Steps:**

1. Select a device
2. Click "Screen Share" button
3. Observe screen stream
4. Press ESC to close

**Expected Result:**

- ✅ Screen appears in modal
- ✅ Updates every 1 second
- ✅ Image quality acceptable
- ✅ ESC closes modal
- ✅ Stream stops when closed

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to enable auto-start"

**Solution**: Run as Administrator (Windows) or with sudo (Linux/macOS)

### Issue: File upload fails

**Solution**: Check file permissions on target folder

### Issue: System stats show 0%

**Solution**: Wait 3 seconds for first update

### Issue: Theme doesn't persist

**Solution**: Check browser localStorage is enabled

### Issue: Multi-device execution doesn't work

**Solution**: Ensure all devices are authenticated

### Issue: Screen share shows black screen

**Solution**:

- Windows: Should work automatically
- macOS: Grant Screen Recording permission
- Linux: Install scrot (`sudo apt-get install scrot`)

---

## 📊 Performance Testing

### Test Load

1. Connect 5+ devices
2. Execute commands on all
3. Monitor CPU/RAM usage
4. Check for lag or delays

**Expected:**

- ✅ No significant lag
- ✅ All devices respond
- ✅ Logs update smoothly

### Test File Transfer

1. Upload 10MB file
2. Monitor progress
3. Verify file integrity

**Expected:**

- ✅ Upload completes
- ✅ Progress bar accurate
- ✅ File not corrupted

---

## 🔍 Debug Mode

### Enable Verbose Logging

**Backend:**

```javascript
// In server.js, add at top:
const DEBUG = true;

// Then add logging:
if (DEBUG) console.log("Message:", data);
```

**Agent:**

```javascript
// In agent.js, add at top:
const DEBUG = true;

// Then add logging:
if (DEBUG) console.log("Received:", data.type);
```

**Dashboard:**

```typescript
// In page.tsx, add:
console.log("WebSocket message:", data);
```

---

## ✅ Final Checklist

Before deploying to production:

- [ ] All features tested locally
- [ ] Auto-start works on all platforms
- [ ] File transfer works (upload/download)
- [ ] Multi-device execution works
- [ ] System stats accurate
- [ ] Theme toggle works
- [ ] All widgets functional
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] README updated with new features
- [ ] Screenshots/GIFs added

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________
Platform: Windows / macOS / Linux

Feature                    | Status | Notes
---------------------------|--------|-------
Theme Toggle               | ✅/❌  |
Multi-Device Execution     | ✅/❌  |
File Upload                | ✅/❌  |
File Download              | ✅/❌  |
File Browse                | ✅/❌  |
System Stats Widget        | ✅/❌  |
Recent Commands Widget     | ✅/❌  |
Device Status Widget       | ✅/❌  |
Auto-Start (Windows)       | ✅/❌  |
Auto-Start (macOS)         | ✅/❌  |
Auto-Start (Linux)         | ✅/❌  |
Screen Sharing             | ✅/❌  |

Overall Status: PASS / FAIL
```

---

## 🎯 Next Steps After Testing

1. Fix any bugs found
2. Optimize performance issues
3. Update documentation
4. Deploy to production
5. Monitor for issues
6. Gather user feedback

---

**Happy Testing!** 🚀
