$ErrorActionPreference = 'Stop'
$packageRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $packageRoot
$version = (Get-Content -Raw (Join-Path $packageRoot 'package.json') | ConvertFrom-Json).version
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $compiler)) { throw 'The .NET Framework C# compiler is required to build the installer.' }
$source = Join-Path $packageRoot 'installer\VortixSetup.cs'
if (-not ((Get-Content -Raw $source).Contains('private const string Version = "' + $version + '"'))) { throw 'Installer version does not match package.json.' }
$archive = Join-Path $packageRoot ('vortix-' + $version + '.tgz')
Push-Location $packageRoot
try { & npm.cmd pack --silent | Out-Null; if ($LASTEXITCODE -ne 0) { throw 'npm pack failed.' } }
finally { Pop-Location }
$icon = Join-Path $packageRoot 'tray\VortixTray.ico'
$outputFolder = Join-Path $repoRoot 'dashboard\public\downloads'
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
$output = Join-Path $outputFolder ('VortixSetup-' + $version + '.exe')
& $compiler /nologo /target:winexe /platform:anycpu /optimize+ "/out:$output" "/win32icon:$icon" "/resource:$archive,VortixPackage" "/resource:$icon,VortixIcon" /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.dll /r:System.Core.dll $source
if ($LASTEXITCODE -ne 0) { throw "Installer build failed with exit code $LASTEXITCODE" }
$checksum = (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath ($output + '.sha256') -Value ($checksum + '  ' + (Split-Path -Leaf $output)) -Encoding Ascii
Write-Output $output
