# ASSERT – start website + CMS locally (PowerShell). Run:  powershell -ExecutionPolicy Bypass -File .\start-windows.ps1
Set-Location -Path $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not installed. Download the LTS version from https://nodejs.org" -ForegroundColor Red
  exit 1
}
if (-not (Test-Path "backend/node_modules") -or -not (Test-Path "frontend/node_modules")) {
  node scripts/setup.js
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
Start-Job -ScriptBlock { Start-Sleep 12; Start-Process "http://localhost:3100"; Start-Process "http://localhost:4000/admin" } | Out-Null
node scripts/dev.js
