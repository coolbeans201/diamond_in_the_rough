# One-time setup: download portable Node if npm is not on PATH
$NodeDir = "$env:LOCALAPPDATA\node-portable"
$Version = "v22.16.0"
$Extracted = "$NodeDir\node-$Version-win-x64"

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "npm already available on PATH"
    Set-Location $PSScriptRoot
    npm install
    exit 0
}

if (-not (Test-Path "$Extracted\npm.cmd")) {
    Write-Host "Downloading portable Node.js $Version..."
    New-Item -ItemType Directory -Force -Path $NodeDir | Out-Null
    $zip = "$env:TEMP\node-portable.zip"
    $url = "https://nodejs.org/dist/$Version/node-$Version-win-x64.zip"
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath $NodeDir -Force
}

$env:PATH = "$Extracted;$env:PATH"
Set-Location $PSScriptRoot
npm install
Write-Host ""
Write-Host "Setup complete. Run: .\dev.ps1"
