# Перемотка в <video> в браузере требует, чтобы индекс MP4 (moov) был в начале файла.
# Запуск из корня репозитория (нужен ffmpeg в PATH):
#   powershell -File tools/remux-video-faststart.ps1

$ErrorActionPreference = "Stop"
$videoDir = Join-Path $PSScriptRoot "..\files\Presents\Video" | Resolve-Path
Get-ChildItem -LiteralPath $videoDir -Filter *.mp4 | ForEach-Object {
    $in = $_.FullName
    $tmp = Join-Path $videoDir ($_.BaseName + "-faststart-tmp.mp4")
    & ffmpeg -y -hide_banner -loglevel error -i $in -c copy -movflags +faststart $tmp
    if ($LASTEXITCODE -ne 0) {
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
        throw "ffmpeg failed: $($_.Name)"
    }
    Move-Item -LiteralPath $tmp -Destination $in -Force
    Write-Host "OK: $($_.Name)"
}
