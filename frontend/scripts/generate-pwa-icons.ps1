# Regenerates PWA icons in frontend/public (Windows + System.Drawing)
$ErrorActionPreference = 'Stop'
$publicDir = Join-Path (Join-Path $PSScriptRoot '..') 'public'
Set-Location $publicDir

Add-Type -AssemblyName System.Drawing

function New-CookEduIcon([int]$size, [string]$fileName) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.Clear([System.Drawing.Color]::FromArgb(255, 255, 140, 0))
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $fontSize = [int]($size * 0.28)
    $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold)
    $text = 'CE'
    $sf = $g.MeasureString($text, $font)
    $g.DrawString($text, $font, $brush, ($size - $sf.Width) / 2, ($size - $sf.Height) / 2)
    $g.Dispose()
    $bmp.Save((Join-Path $publicDir $fileName), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $fileName ($size x $size)"
}

New-CookEduIcon 192 'pwa-192x192.png'
New-CookEduIcon 512 'pwa-512x512.png'
New-CookEduIcon 180 'apple-touch-icon.png'
