const { execFile } = require('node:child_process');

const WINDOWS_API_SOURCE = `using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
public static class VortixDesktop {
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint processId);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out Rect r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint flags);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] static extern void mouse_event(uint flags, uint x, uint y, uint buttons, UIntPtr extra);
  [DllImport("user32.dll")] static extern void keybd_event(byte key, byte scan, uint flags, UIntPtr extra);
  [DllImport("user32.dll", SetLastError = true)] static extern uint SendInput(uint count, IntPtr input, int size);
  public static void Key(byte key) { keybd_event(key, 0, 0, UIntPtr.Zero); keybd_event(key, 0, 2, UIntPtr.Zero); }
  public static void Combo(byte modifier, byte key) {
    keybd_event(modifier, 0, 0, UIntPtr.Zero);
    Key(key);
    keybd_event(modifier, 0, 2, UIntPtr.Zero);
  }
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
  public static void Click(IntPtr window, int x, int y) {
    Move(window, x, y);
    mouse_event(2, 0, 0, 0, UIntPtr.Zero);
    mouse_event(4, 0, 0, 0, UIntPtr.Zero);
  }
  public static void Move(IntPtr window, int x, int y) {
    Rect r;
    if (!GetWindowRect(window, out r)) throw new Win32Exception(Marshal.GetLastWin32Error());
    int px = r.Left + (int)Math.Round((r.Right - r.Left) * x / 1000.0);
    int py = r.Top + (int)Math.Round((r.Bottom - r.Top) * y / 1000.0);
    if (!SetCursorPos(px, py)) throw new Win32Exception(Marshal.GetLastWin32Error());
  }
  public static void Wheel(int direction) { mouse_event(0x0800, 0, 0, unchecked((uint)(direction * 120)), UIntPtr.Zero); }
}`;

const WINDOWS_UIA_SOURCE = `
function Get-VortixControls($window, $processName, $title) {
  if ($processName -ne 'Notepad' -and $processName -ne 'CalculatorApp' -and
      -not ($processName -eq 'ApplicationFrameHost' -and $title -eq 'Calculator')) { return @() }
  try {
    Add-Type -AssemblyName UIAutomationClient
    Add-Type -AssemblyName UIAutomationTypes
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($window)
    $condition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::IsControlElementProperty, $true)
    $nodes = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condition)
    $controls = @()
    foreach ($node in $nodes) {
      try {
        $current = $node.Current
        $name = [string]$current.Name
        $kind = [string]$current.ControlType.ProgrammaticName
        $id = [string]$current.AutomationId
        $bounds = $current.BoundingRectangle
        $invokePattern = $null
        if ($current.IsEnabled -and -not $current.IsOffscreen -and $name.Length -gt 0 -and
            $name.Length -le 100 -and $id.Length -le 100 -and $name -notmatch '[\\x00-\\x1f]' -and
            $id -notmatch '[\\x00-\\x1f]' -and $bounds.Width -gt 0 -and $bounds.Height -gt 0 -and
            $kind -in @('ControlType.Button', 'ControlType.MenuItem', 'ControlType.TabItem', 'ControlType.Hyperlink') -and
            $node.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$invokePattern)) {
          $controls += @{ name = $name; id = $id; kind = $kind }
          if ($controls.Count -ge 32) { break }
        }
      } catch { }
    }
    return $controls
  } catch { return @() }
}
function Invoke-VortixControl($window, $name, $id, $kind) {
  Add-Type -AssemblyName UIAutomationClient
  Add-Type -AssemblyName UIAutomationTypes
  $root = [System.Windows.Automation.AutomationElement]::FromHandle($window)
  $condition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::IsControlElementProperty, $true)
  $nodes = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condition)
  $matches = @()
  foreach ($node in $nodes) {
    try {
      $current = $node.Current
      if ($current.Name -ceq $name -and $current.AutomationId -ceq $id -and
          $current.ControlType.ProgrammaticName -ceq $kind -and $current.IsEnabled -and -not $current.IsOffscreen) {
        $matches += $node
      }
    } catch { }
  }
  if ($matches.Count -ne 1) { throw 'The named control is no longer uniquely visible.' }
  $pattern = $null
  if (-not $matches[0].TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$pattern)) {
    throw 'The named control no longer supports a native action.'
  }
  ([System.Windows.Automation.InvokePattern]$pattern).Invoke()
}`;

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    const encoded = Buffer.from(script, 'utf16le').toString('base64');
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-STA', '-EncodedCommand', encoded],
      { windowsHide: true, timeout: 20000, maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) reject(new Error(desktopErrorMessage(stderr, error)));
        else resolve(stdout);
      });
  });
}

function desktopErrorMessage(stderr, error) {
  if (error.killed) return 'Desktop action timed out. Check that the app is visible and try again.';
  const marker = /VORTIX_DESKTOP_ERROR:([^<\r\n]+)/.exec(stderr || '');
  if (marker) return marker[1].replace(/_x[0-9a-f]{4}_/gi, ' ').replace(/&amp;/g, '&').slice(0, 300).trim();
  return 'Desktop automation failed. Check that the app is visible and try again.';
}

async function discordAction(action, value) {
  if (process.platform !== 'win32') throw new Error('Discord desktop actions currently require Windows.');
  if (!['find', 'open', 'select', 'draft', 'send', 'observe'].includes(action)) throw new Error('Invalid desktop action.');
  if ((['find', 'open'].includes(action) && !/^[a-z0-9_.]{2,32}$/i.test(value || '')) ||
      (action === 'draft' && (typeof value !== 'string' || !value.trim() || value.length > 1000))) {
    throw new Error('Invalid recipient or message.');
  }
  if (action === 'select' && (!value || !Number.isInteger(value.x) || !Number.isInteger(value.y) ||
      value.x < 30 || value.x > 970 || value.y < 40 || value.y > 990)) {
    throw new Error('Invalid Discord click location.');
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
[void][VortixDesktop]::ShowWindowAsync($discord.MainWindowHandle, 3)
Start-Sleep -Milliseconds 100
[void][VortixDesktop]::SetForegroundWindow($discord.MainWindowHandle)
if ([VortixDesktop]::GetForegroundWindow() -ne $discord.MainWindowHandle) {
  [VortixDesktop]::Key(0x12)
  [void][VortixDesktop]::SetForegroundWindow($discord.MainWindowHandle)
}
Start-Sleep -Milliseconds 250
if ([VortixDesktop]::GetForegroundWindow() -ne $discord.MainWindowHandle) { throw 'Discord lost focus. Open it on this desktop and retry.' }
${action === 'find' || action === 'open' ? '[VortixDesktop]::Key(0x1B)\nStart-Sleep -Milliseconds 150\n[VortixDesktop]::CtrlK()\nStart-Sleep -Milliseconds 350' : ''}
${text ? `[VortixDesktop]::Text('${text.replace(/'/g, "''")}')` : ''}
${action === 'find' ? 'Start-Sleep -Milliseconds 3000' : ''}
${action === 'open' ? 'Start-Sleep -Milliseconds 2500' : ''}
${action === 'select' ? `[VortixDesktop]::Click($discord.MainWindowHandle, ${value?.x}, ${value?.y})` : ''}
${action === 'open' || action === 'send' ? '[VortixDesktop]::Key(0x0D)' : ''}
Start-Sleep -Milliseconds 700
Add-Type -AssemblyName System.Drawing
$rect = New-Object VortixDesktop+Rect
if (-not [VortixDesktop]::GetWindowRect($discord.MainWindowHandle, [ref]$rect)) { throw 'Could not inspect the Discord window.' }
$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
if ($width -lt 400 -or $height -lt 300 -or $width -gt 6000 -or $height -gt 4000) { throw 'Discord window size is invalid.' }
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
try {
  $dc = $graphics.GetHdc()
  try {
    if (-not [VortixDesktop]::PrintWindow($discord.MainWindowHandle, $dc, 2)) { throw 'Could not capture the Discord window.' }
  } finally { $graphics.ReleaseHdc($dc) }
  $stream = New-Object System.IO.MemoryStream
  try {
    $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    [Console]::Out.Write('VORTIX_FRAME:' + [Convert]::ToBase64String($stream.ToArray()))
  } finally { $stream.Dispose() }
} finally { $graphics.Dispose(); $bitmap.Dispose() }
} catch {
  [Console]::Error.WriteLine('VORTIX_DESKTOP_ERROR:' + $_.Exception.Message)
  exit 1
}`;
  const output = await runPowerShell(script);
  const frame = /VORTIX_FRAME:([A-Za-z0-9+/=]+)/.exec(output || '')?.[1];
  if (!frame || frame.length > 11_200_000) throw new Error('Discord window screenshot is invalid.');
  return frame;
}

let activeDesktopPid = null;

async function desktopAction(action, value) {
  if (process.platform !== 'win32') throw new Error('Screen-aware control currently requires Windows.');
  if (!['reset', 'observe', 'launch', 'type', 'key', 'click', 'scroll', 'control'].includes(action)) throw new Error('Invalid desktop action.');
  if (action === 'reset') activeDesktopPid = null;
  if (action === 'launch' && (typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(value))) {
    throw new Error('Enter a program name without arguments to open an app.');
  }
  if (action === 'type' && (!value || typeof value.text !== 'string' || !value.text.trim() ||
      value.text.length > 500 || /[\r\n\x00-\x1f]/.test(value.text) || typeof value.submit !== 'boolean')) {
    throw new Error('Invalid desktop text action.');
  }
  const keys = { enter: 'Key(0x0D)', escape: 'Key(0x1B)', tab: 'Key(0x09)', up: 'Key(0x26)',
    down: 'Key(0x28)', left: 'Key(0x25)', right: 'Key(0x27)', backspace: 'Key(0x08)',
    'ctrl+l': 'Combo(0x11, 0x4C)', 'ctrl+k': 'Combo(0x11, 0x4B)', 'ctrl+c': 'Combo(0x11, 0x43)' };
  if (action === 'key' && !Object.hasOwn(keys, value)) throw new Error('Invalid desktop key.');
  if ((action === 'click' || action === 'scroll') && (!value || !Number.isInteger(value.x) ||
      !Number.isInteger(value.y) || value.x < 0 || value.x > 1000 || value.y < 0 || value.y > 1000)) {
    throw new Error('Invalid desktop position.');
  }
  if (action === 'scroll' && (!Number.isInteger(value.direction) || ![-1, 1].includes(value.direction))) {
    throw new Error('Invalid scroll direction.');
  }
  if (action === 'control' && (!value || !['ControlType.Button', 'ControlType.MenuItem',
    'ControlType.TabItem', 'ControlType.Hyperlink'].includes(value.kind) ||
    !['name', 'id'].every(field => typeof value[field] === 'string' && value[field].length <= 100 &&
      !/[\r\n\x00-\x1f]/.test(value[field])) || !value.name)) {
    throw new Error('Invalid named desktop control.');
  }
  const targetPid = activeDesktopPid || 0;
  const safeText = action === 'type' ? value.text.replace(/'/g, "''") : '';
  const safeControl = action === 'control' ? ['name', 'id', 'kind'].map(field => value[field].replace(/'/g, "''")) : [];
  const launchName = action === 'launch' ? value.replace(/\.exe$/i, '') : '';
  const actionCode = {
    reset: '', observe: '',
    launch: `$started = Start-Process -FilePath '${action === 'launch' ? value : ''}' -PassThru -ErrorAction Stop\n$targetProcessId = $started.Id\n$launchName = '${launchName}'\n$launchIsCalculator = $launchName -in @('calc', 'calculator')\n$launchCandidates = if ($launchIsCalculator) { @('CalculatorApp', 'ApplicationFrameHost') } else { @($launchName) }`,
    type: `[VortixDesktop]::Text('${safeText}')\n${action === 'type' && value.submit ? 'Start-Sleep -Milliseconds 450\n[VortixDesktop]::Key(0x0D)' : ''}`,
    key: action === 'key' ? `[VortixDesktop]::${keys[value]}` : '',
    click: action === 'click' ? `[VortixDesktop]::Click($window, ${value?.x}, ${value?.y})` : '',
    scroll: action === 'scroll' ? `[VortixDesktop]::Move($window, ${value?.x}, ${value?.y})\n[VortixDesktop]::Wheel(${value?.direction})` : '',
    control: action === 'control' ? `$controlPid = [uint32]0\n[void][VortixDesktop]::GetWindowThreadProcessId($window, [ref]$controlPid)\n$controlProcess = Get-Process -Id $controlPid -ErrorAction SilentlyContinue\nif (-not $controlProcess -or ($controlProcess.ProcessName -notin @('Notepad', 'CalculatorApp') -and -not ($controlProcess.ProcessName -eq 'ApplicationFrameHost' -and $controlProcess.MainWindowTitle -eq 'Calculator'))) { throw 'Named controls are available only for Notepad and Calculator.' }\nInvoke-VortixControl $window '${safeControl[0]}' '${safeControl[1]}' '${safeControl[2]}'` : '',
  }[action];
  const script = `$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'
try {
Add-Type -TypeDefinition @'
${WINDOWS_API_SOURCE}
'@
${WINDOWS_UIA_SOURCE}
$targetProcessId = ${targetPid}
${action === 'launch' ? actionCode : ''}
$window = [IntPtr]::Zero
for ($attempt = 0; $attempt -lt 12; $attempt++) {
  if ($targetProcessId -gt 0) {
    $targetProcess = Get-Process -Id $targetProcessId -ErrorAction SilentlyContinue
    if ($targetProcess -and $targetProcess.MainWindowHandle -ne 0) { $window = $targetProcess.MainWindowHandle }
  }
  ${action === 'launch' ? `if ($window -eq [IntPtr]::Zero) {
    $candidate = $launchCandidates | ForEach-Object { Get-Process -Name $_ -ErrorAction SilentlyContinue } |
      Where-Object { $_.MainWindowHandle -ne 0 -and (-not $launchIsCalculator -or
        $_.ProcessName -ne 'ApplicationFrameHost' -or $_.MainWindowTitle -eq 'Calculator') } |
      Sort-Object StartTime -Descending | Select-Object -First 1
    if ($candidate) { $window = $candidate.MainWindowHandle; $targetProcessId = $candidate.Id }
  }` : ''}
  if ($window -eq [IntPtr]::Zero -and $targetProcessId -eq 0) {
    $window = [VortixDesktop]::GetForegroundWindow()
  }
  if ($window -ne [IntPtr]::Zero) { break }
  Start-Sleep -Milliseconds 250
}
if ($window -eq [IntPtr]::Zero) { throw '${action === 'launch' ? 'The requested app did not open a visible window.' : 'No visible desktop window was found.'}' }
${action === 'control' ? '' : `[void][VortixDesktop]::SetForegroundWindow($window)
if ([VortixDesktop]::GetForegroundWindow() -ne $window) {
  [VortixDesktop]::Key(0x12)
  [void][VortixDesktop]::SetForegroundWindow($window)
}
Start-Sleep -Milliseconds 200
if ([VortixDesktop]::GetForegroundWindow() -ne $window -and -not (${action === 'launch' ? "$launchName -in @('notepad', 'calc', 'calculator')" : '$false'})) {
  throw 'The target window could not be focused.'
}`}
${action === 'launch' ? '' : actionCode}
Start-Sleep -Milliseconds ${action === 'type' && value.submit ? 1500 : 650}
$processIdValue = [uint32]0
[void][VortixDesktop]::GetWindowThreadProcessId($window, [ref]$processIdValue)
$windowProcess = Get-Process -Id $processIdValue -ErrorAction SilentlyContinue
$title = if ($windowProcess) { $windowProcess.MainWindowTitle } else { '' }
$processName = if ($windowProcess) { $windowProcess.ProcessName } else { '' }
$controls = @(Get-VortixControls $window $processName $title)
Add-Type -AssemblyName System.Drawing
$rect = New-Object VortixDesktop+Rect
if (-not [VortixDesktop]::GetWindowRect($window, [ref]$rect)) { throw 'Could not inspect the active window.' }
$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
if ($width -lt 200 -or $height -lt 100 -or $width -gt 6000 -or $height -gt 4000) { throw 'The active window size is invalid.' }
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
try {
  $dc = $graphics.GetHdc()
  try {
    if (-not [VortixDesktop]::PrintWindow($window, $dc, 2)) { throw 'Could not capture the active window.' }
  } finally { $graphics.ReleaseHdc($dc) }
  $stream = New-Object System.IO.MemoryStream
  try {
    $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    [Console]::Out.WriteLine('VORTIX_FRAME:' + [Convert]::ToBase64String($stream.ToArray()))
    [Console]::Out.WriteLine('VORTIX_META:' + (@{ pid = $processIdValue; title = $title; process = $processName; controls = $controls } | ConvertTo-Json -Compress -Depth 4))
  } finally { $stream.Dispose() }
} finally { $graphics.Dispose(); $bitmap.Dispose() }
} catch {
  [Console]::Error.WriteLine('VORTIX_DESKTOP_ERROR:' + $_.Exception.Message)
  exit 1
}`;
  const output = await runPowerShell(script);
  const frame = /VORTIX_FRAME:([A-Za-z0-9+/=]+)/.exec(output || '')?.[1];
  const meta = /VORTIX_META:(\{[^\r\n]+\})/.exec(output || '')?.[1];
  if (!frame || frame.length > 11_200_000 || !meta) throw new Error('The active window observation is invalid.');
  const parsed = JSON.parse(meta);
  if (typeof parsed.pid !== 'number' || typeof parsed.title !== 'string' || typeof parsed.process !== 'string') {
    throw new Error('The active window information is invalid.');
  }
  const controls = Array.isArray(parsed.controls) ? parsed.controls.filter(control =>
    control && typeof control.name === 'string' && typeof control.id === 'string' &&
    typeof control.kind === 'string').slice(0, 32) : [];
  activeDesktopPid = parsed.pid;
  return { frame, pid: parsed.pid, title: parsed.title.slice(0, 160), process: parsed.process.slice(0, 80), controls };
}

module.exports = { discordAction, desktopAction, desktopErrorMessage };
