const { execFile } = require('node:child_process');
const screenshot = require('screenshot-desktop');

function sendKeysText(value) {
  return [...value].map(char => {
    if ('+^%~(){}[]'.includes(char)) return `{${char}}`;
    if (char === '\n' || char === '\r') throw new Error('Multiline messages are not supported yet.');
    return char;
  }).join('');
}

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    const encoded = Buffer.from(script, 'utf16le').toString('base64');
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-STA', '-EncodedCommand', encoded],
      { windowsHide: true, timeout: 12000 }, (error, _stdout, stderr) => {
        if (error) reject(new Error(stderr.trim() || error.message));
        else resolve();
      });
  });
}

async function discordAction(action, value) {
  if (process.platform !== 'win32') throw new Error('Discord desktop actions currently require Windows.');
  if (!['find', 'open', 'draft', 'send', 'observe'].includes(action)) throw new Error('Invalid desktop action.');
  if ((action === 'find' && !/^[a-z0-9_.]{2,32}$/i.test(value || '')) ||
      (action === 'draft' && (typeof value !== 'string' || !value.trim() || value.length > 1000))) {
    throw new Error('Invalid recipient or message.');
  }
  const keys = action === 'find' ? sendKeysText(`@${value}`)
    : action === 'draft' ? sendKeysText(value) : action === 'observe' ? '' : '{ENTER}';
  const script = `Add-Type -AssemblyName System.Windows.Forms
$ErrorActionPreference = 'Stop'
${action === 'find' ? `if (-not (Get-Process Discord -ErrorAction SilentlyContinue)) {
  $updater = Join-Path $env:LOCALAPPDATA 'Discord\\Update.exe'
  if (-not (Test-Path $updater)) { throw 'Discord desktop app is not installed for this Windows user.' }
  Start-Process -FilePath $updater -ArgumentList '--processStart Discord.exe'
  Start-Sleep -Seconds 4
}` : ''}
$discord = Get-Process Discord -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $discord) { throw 'Discord desktop app is not open.' }
$shell = New-Object -ComObject WScript.Shell
if (-not $shell.AppActivate($discord.Id)) { throw 'Could not focus Discord.' }
Start-Sleep -Milliseconds 300
${action === 'find' ? "[System.Windows.Forms.SendKeys]::SendWait('^k')\nStart-Sleep -Milliseconds 350" : ''}
${keys ? `[System.Windows.Forms.SendKeys]::SendWait('${keys.replace(/'/g, "''")}')` : ''}
Start-Sleep -Milliseconds 700`;
  await runPowerShell(script);
  const image = await screenshot({ format: 'jpg' });
  if (image.length > 8 * 1024 * 1024) throw new Error('Screenshot is too large to inspect.');
  return image.toString('base64');
}

module.exports = { discordAction, sendKeysText };
