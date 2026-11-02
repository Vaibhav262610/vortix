const { execFile } = require('node:child_process');
const screenshot = require('screenshot-desktop');

const WINDOWS_API_SOURCE = `using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
public static class VortixDesktop {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern void keybd_event(byte key, byte scan, uint flags, UIntPtr extra);
  [DllImport("user32.dll", SetLastError = true)] static extern uint SendInput(uint count, IntPtr input, int size);
  public static void Key(byte key) { keybd_event(key, 0, 0, UIntPtr.Zero); keybd_event(key, 0, 2, UIntPtr.Zero); }
  public static void CtrlK() {
    keybd_event(0x11, 0, 0, UIntPtr.Zero);
    Key(0x4B);
    keybd_event(0x11, 0, 2, UIntPtr.Zero);
  }
  static void UnicodeChar(char c, uint flags) {
    int size = IntPtr.Size == 8 ? 40 : 28;
    int offset = IntPtr.Size == 8 ? 8 : 4;
    IntPtr input = Marshal.AllocHGlobal(size);
    try {
      for (int i = 0; i < size; i++) Marshal.WriteByte(input, i, 0);
      Marshal.WriteInt32(input, 0, 1);
      Marshal.WriteInt16(input, offset + 2, (short)c);
      Marshal.WriteInt32(input, offset + 4, (int)flags);
      if (SendInput(1, input, size) != 1) throw new Win32Exception(Marshal.GetLastWin32Error());
    } finally { Marshal.FreeHGlobal(input); }
  }
  public static void Text(string value) { foreach (char c in value) { UnicodeChar(c, 4); UnicodeChar(c, 6); } }
}`;

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    const encoded = Buffer.from(script, 'utf16le').toString('base64');
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-STA', '-EncodedCommand', encoded],
      { windowsHide: true, timeout: 20000 }, (error, _stdout, stderr) => {
        if (error) reject(new Error(desktopErrorMessage(stderr, error)));
        else resolve();
      });
  });
}

function desktopErrorMessage(stderr, error) {
  if (error.killed) return 'Discord took too long to open. Open it manually and try again.';
  const marker = /VORTIX_DESKTOP_ERROR:([^<\r\n]+)/.exec(stderr || '');
  if (marker) return marker[1].replace(/_x[0-9a-f]{4}_/gi, ' ').replace(/&amp;/g, '&').slice(0, 300).trim();
  return 'Desktop automation failed. Open Discord on this computer and try again.';
}

async function discordAction(action, value) {
  if (process.platform !== 'win32') throw new Error('Discord desktop actions currently require Windows.');
  if (!['find', 'open', 'draft', 'send', 'observe'].includes(action)) throw new Error('Invalid desktop action.');
  if ((['find', 'open'].includes(action) && !/^[a-z0-9_.]{2,32}$/i.test(value || '')) ||
      (action === 'draft' && (typeof value !== 'string' || !value.trim() || value.length > 1000))) {
    throw new Error('Invalid recipient or message.');
  }
  if (action === 'draft' && /[\r\n\x00-\x1f]/.test(value)) throw new Error('Multiline or control characters are not supported.');
  const text = action === 'find' || action === 'open' ? `@${value}` : action === 'draft' ? value : '';
  const script = `$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'
try {
Add-Type -TypeDefinition @'
${WINDOWS_API_SOURCE}
'@
${action === 'find' ? `try { Start-Process 'discord://' -ErrorAction Stop }
catch {
  $updater = Join-Path $env:LOCALAPPDATA 'Discord\\Update.exe'
  if (-not (Test-Path $updater)) { throw 'Discord desktop app is not installed for this Windows user.' }
  Start-Process -FilePath $updater -ArgumentList '--processStart Discord.exe'
}` : ''}
$discord = $null
for ($attempt = 0; $attempt -lt 20; $attempt++) {
  $discord = Get-Process Discord -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if ($discord) { break }
  Start-Sleep -Milliseconds 400
}
if (-not $discord) { throw 'Discord did not open a visible window. Open it manually and retry.' }
[void][VortixDesktop]::ShowWindowAsync($discord.MainWindowHandle, 9)
Start-Sleep -Milliseconds 100
if (-not [VortixDesktop]::SetForegroundWindow($discord.MainWindowHandle)) { throw 'Could not focus Discord.' }
Start-Sleep -Milliseconds 250
if ([VortixDesktop]::GetForegroundWindow() -ne $discord.MainWindowHandle) { throw 'Discord lost focus. Open it on this desktop and retry.' }
${action === 'find' || action === 'open' ? '[VortixDesktop]::Key(0x1B)\nStart-Sleep -Milliseconds 150\n[VortixDesktop]::CtrlK()\nStart-Sleep -Milliseconds 350' : ''}
${text ? `[VortixDesktop]::Text('${text.replace(/'/g, "''")}')` : ''}
${action === 'find' ? 'Start-Sleep -Milliseconds 1000' : ''}
${action === 'open' ? 'Start-Sleep -Milliseconds 2500' : ''}
${action === 'open' || action === 'send' ? '[VortixDesktop]::Key(0x0D)' : ''}
Start-Sleep -Milliseconds 700
} catch {
  [Console]::Error.WriteLine('VORTIX_DESKTOP_ERROR:' + $_.Exception.Message)
  exit 1
}`;
  await runPowerShell(script);
  const image = await screenshot({ format: 'jpg' });
  if (image.length > 8 * 1024 * 1024) throw new Error('Screenshot is too large to inspect.');
  return image.toString('base64');
}

module.exports = { discordAction, desktopErrorMessage };
