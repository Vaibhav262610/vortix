$ErrorActionPreference = 'Stop'
$packageRoot = Split-Path -Parent $PSScriptRoot
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $compiler)) { throw 'The .NET Framework C# compiler is required to build the Windows tray app.' }
$source = Join-Path $packageRoot 'tray\VortixTray.cs'
$output = Join-Path $packageRoot 'tray\VortixTray.exe'
$iconPath = Join-Path $packageRoot 'tray\VortixTray.ico'
Add-Type -AssemblyName System.Drawing
$bitmap = [System.Drawing.Bitmap]::new(32, 32)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
try {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(12, 25, 22))
  $outline = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(80, 220, 160), 2)
  $mark = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(80, 220, 160), 4)
  try {
    $graphics.FillEllipse($background, 1, 1, 30, 30)
    $graphics.DrawEllipse($outline, 2, 2, 28, 28)
    $points = [System.Drawing.Point[]]@([System.Drawing.Point]::new(8, 10), [System.Drawing.Point]::new(16, 23), [System.Drawing.Point]::new(24, 10))
    $graphics.DrawLines($mark, $points)
    $icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
    $stream = [System.IO.File]::Create($iconPath)
    try { $icon.Save($stream) } finally { $stream.Dispose(); $icon.Dispose() }
  } finally { $background.Dispose(); $outline.Dispose(); $mark.Dispose() }
} finally { $graphics.Dispose(); $bitmap.Dispose() }
& $compiler /nologo /target:winexe /platform:anycpu /optimize+ "/out:$output" "/win32icon:$iconPath" /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.dll $source
if ($LASTEXITCODE -ne 0) { throw "Tray build failed with exit code $LASTEXITCODE" }
Write-Output $output
