// Manual Windows desktop benchmark. Run in a signed-in interactive session:
// node benchmarks/ui-controls-windows.js
const { execFileSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const { desktopAction } = require('../agent/desktop-control');

function calculatorDisplay() {
  const script = `$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName UIAutomationClient
$window = Get-Process ApplicationFrameHost -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowTitle -eq 'Calculator' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $window) { throw 'Calculator window is unavailable.' }
$root = [System.Windows.Automation.AutomationElement]::FromHandle($window.MainWindowHandle)
$condition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty, 'CalculatorResults')
$result = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $condition)
if (-not $result) { throw 'Calculator result is unavailable.' }
[Console]::Out.Write($result.Current.Name)`;
  const encoded = Buffer.from(script, 'utf16le').toString('base64');
  return execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded],
    { windowsHide: true, timeout: 10000, encoding: 'utf8' }).trim();
}

async function run() {
  if (process.platform !== 'win32') throw new Error('This benchmark requires Windows.');
  const notepadStart = performance.now();
  let observation = await desktopAction('launch', 'notepad');
  const file = observation.controls.find(control => control.name === 'File' && control.kind === 'ControlType.MenuItem');
  if (!file) throw new Error('Notepad File menu was not exposed through UI Automation.');
  if (observation.controls.some(control => control.name === 'New tab')) {
    observation = await desktopAction('control', file);
  }
  observation = await desktopAction('control', file);
  const notepad = { completed: observation.controls.some(control => control.name === 'New tab'),
    elapsedMs: Math.round(performance.now() - notepadStart) };

  const calculatorStart = performance.now();
  observation = await desktopAction('launch', 'calc');
  const two = observation.controls.find(control => control.name === 'Two' && control.kind === 'ControlType.Button');
  if (!two) throw new Error('Calculator Two button was not exposed through UI Automation.');
  await desktopAction('control', two);
  const calculator = { completed: /2$/.test(calculatorDisplay()),
    elapsedMs: Math.round(performance.now() - calculatorStart) };
  console.log(JSON.stringify({ notepad, calculator,
    note: 'Local app startup, PowerShell, and screenshot time are included. This is a native-control smoke benchmark, not a comparison with screenshot clicking.' }, null, 2));
  if (!notepad.completed || !calculator.completed) process.exitCode = 1;
}

run().catch(error => { console.error(error.message); process.exitCode = 1; });
