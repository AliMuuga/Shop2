param(
    [int]$size = 20
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$inDir = $scriptDir
$outDir = Join-Path $inDir ("${size}x${size}")

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$exts = @("*.jpg","*.jpeg","*.png","*.gif","*.bmp")

Add-Type -AssemblyName System.Drawing

foreach ($ext in $exts) {
    Get-ChildItem -Path $inDir -Filter $ext -File | ForEach-Object {
        try {
            $srcPath = $_.FullName
            $img = [System.Drawing.Image]::FromFile($srcPath)
            $thumb = New-Object System.Drawing.Bitmap $size, $size
            $g = [System.Drawing.Graphics]::FromImage($thumb)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.DrawImage($img, 0, 0, $size, $size)
            $g.Dispose()
            $img.Dispose()

            $extLower = $_.Extension.ToLower()
            switch ($extLower) {
                ".png" { $format = [System.Drawing.Imaging.ImageFormat]::Png }
                ".gif" { $format = [System.Drawing.Imaging.ImageFormat]::Gif }
                ".bmp" { $format = [System.Drawing.Imaging.ImageFormat]::Bmp }
                default { $format = [System.Drawing.Imaging.ImageFormat]::Jpeg }
            }

            $outPath = Join-Path $outDir $_.Name
            $thumb.Save($outPath, $format)
            $thumb.Dispose()
            Write-Output "Saved: $outPath"
        }
        catch {
            Write-Warning "Failed to process $($_.Name): $_"
        }
    }
}

Write-Output "All done. Resized images are in: $outDir"