# Portable Node path (installed without admin when winget MSI was blocked)
$NodeRoot = "$env:LOCALAPPDATA\node-portable\node-v22.16.0-win-x64"

if (-not (Test-Path "$NodeRoot\npm.cmd")) {
    Write-Host "Node not found at $NodeRoot"
    Write-Host "Install Node.js LTS from https://nodejs.org/ or run setup.ps1"
    exit 1
}

$env:PATH = "$NodeRoot;$env:PATH"
Set-Location $PSScriptRoot

if ($args.Count -eq 0) {
    npm run dev
} else {
    npm @args
}
