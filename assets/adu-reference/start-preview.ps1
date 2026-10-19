$taskPreviewRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$taskPython = (Get-Command python -ErrorAction Stop).Source
$taskPort = 8766
$taskListener = Get-NetTCPConnection -LocalPort $taskPort -State Listen -ErrorAction SilentlyContinue
if (-not $taskListener) {
    Start-Process -FilePath $taskPython -ArgumentList @(('"' + (Join-Path $taskPreviewRoot 'server.py') + '"'),'--port',"$taskPort") -WorkingDirectory $taskPreviewRoot -WindowStyle Hidden
    Start-Sleep -Milliseconds 600
}
Start-Process "http://127.0.0.1:$taskPort/index.html"
