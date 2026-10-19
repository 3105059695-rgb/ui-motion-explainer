param([string]$Video = 'E:\ui\prompt-motion-references\twoclipping-221cab.mp4')
$ErrorActionPreference = 'Stop'
$assetDirectory = Join-Path $PSScriptRoot 'assets'
$frames = @(
  @{Name='reference-arch-day.jpg';Time=6.0;Filter='scale=1440:1440'},
  @{Name='reference-arch-golden.jpg';Time=10.0;Filter='split[full][fill];[full]crop=1440:1050:0:0[top];[fill]crop=1440:150:0:900,scale=1440:390[bottom];[top][bottom]vstack'},
  @{Name='reference-astronaut.jpg';Time=23.0;Filter='crop=380:562:530:410'},
  @{Name='reference-portal.jpg';Time=5.0;Filter='crop=280:280:580:580'},
  @{Name='reference-dunes.jpg';Time=5.0;Filter='crop=280:280:267:267'},
  @{Name='reference-space.jpg';Time=5.0;Filter='crop=280:280:580:267'},
  @{Name='reference-cyclist.jpg';Time=5.0;Filter='crop=280:280:895:267'},
  @{Name='reference-portrait.jpg';Time=5.0;Filter='crop=280:280:267:580'},
  @{Name='reference-nebula.jpg';Time=5.0;Filter='crop=280:280:267:895'},
  @{Name='reference-meadow.jpg';Time=5.0;Filter='crop=280:280:580:895'},
  @{Name='reference-eye.jpg';Time=5.0;Filter='crop=280:280:895:895'}
)
foreach ($frame in $frames) {
  $destination = Join-Path $assetDirectory $frame.Name
  & ffmpeg -hide_banner -loglevel error -ss $frame.Time -i $Video -frames:v 1 -vf $frame.Filter -q:v 2 $destination -y
  if ($LASTEXITCODE -ne 0) { throw "Frame extraction failed: $($frame.Name)" }
}
Write-Output "Extracted $($frames.Count) reference frames. Copyright remains with the source creator and original media owners."
