$python = "C:\Users\Paul.Mwanje\OneDrive - Lyca Group\Desktop\system\.venv\Scripts\python.exe"
$workDir = "C:\Users\Paul.Mwanje\OneDrive - Lyca Group\Desktop\system\backend"
$log = Join-Path $workDir 'logs' 
if (-not (Test-Path $log)) { New-Item -ItemType Directory -Path $log | Out-Null }
$watchLog = Join-Path $log 'uvicorn-watch.log'
while ($true) {
  try {
    "$(Get-Date -Format o) - starting uvicorn" | Out-File $watchLog -Append
    Push-Location $workDir
    & $python -m uvicorn app.main:socket_app --host 0.0.0.0 --port 8000
    Pop-Location
    "$(Get-Date -Format o) - process exited with code $LASTEXITCODE" | Out-File $watchLog -Append
  } catch {
    "$(Get-Date -Format o) - error: $($_.Exception.Message)" | Out-File $watchLog -Append
  }
  Start-Sleep -Seconds 3
}
