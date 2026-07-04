# Installs the aims-api backend as a Windows service using NSSM.
# Run this script in an elevated PowerShell session.

$serviceName = 'aims-api'
$projectRoot = 'C:\Users\Paul.Mwanje\OneDrive - Lyca Group\Desktop\system'
$backendDir = Join-Path $projectRoot 'backend'
$pythonExe = Join-Path $projectRoot '.venv\Scripts\python.exe'
$nssmDir = Join-Path $projectRoot 'tools'
$nssmExe = Join-Path $nssmDir 'nssm.exe'
$logsDir = Join-Path $backendDir 'logs'
$stdoutLog = Join-Path $logsDir 'stdout.log'
$stderrLog = Join-Path $logsDir 'stderr.log'

function Assert-Administrator {
    $current = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($current)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Error 'This script must be run as administrator. Right-click PowerShell and choose "Run as administrator".'
        exit 1
    }
}

function Ensure-Nssm {
    if (-not (Test-Path $nssmExe)) {
        Write-Output "NSSM not found in $nssmExe. Downloading latest NSSM..."
        $zipUrl = 'https://nssm.cc/release/nssm-2.24.zip'
        $tempZip = Join-Path $env:TEMP 'nssm.zip'
        Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing -ErrorAction Stop
        Expand-Archive -LiteralPath $tempZip -DestinationPath $env:TEMP\nssm -Force
        $found = Get-ChildItem "$env:TEMP\nssm" -Recurse -Filter nssm.exe | Select-Object -First 1
        if (-not $found) {
            Write-Error 'Could not find nssm.exe inside downloaded archive.'
            exit 1
        }
        New-Item -ItemType Directory -Path $nssmDir -Force | Out-Null
        Copy-Item $found.FullName -Destination $nssmExe -Force
        Write-Output "Copied NSSM to $nssmExe"
    }
}

function Install-Service {
    if (-not (Test-Path $pythonExe)) {
        Write-Error "Python executable not found at $pythonExe"
        exit 1
    }
    if (-not (Test-Path $backendDir)) {
        Write-Error "Backend directory not found at $backendDir"
        exit 1
    }
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    }

    $args = @('install', $serviceName, $pythonExe, '-m', 'uvicorn', 'app.main:socket_app', '--host', '0.0.0.0', '--port', '8000')
    & $nssmExe @args

    & $nssmExe set $serviceName AppDirectory $backendDir
    & $nssmExe set $serviceName AppStdout $stdoutLog
    & $nssmExe set $serviceName AppStderr $stderrLog
    & $nssmExe set $serviceName AppRestartDelay 5000
    & $nssmExe set $serviceName AppRotateFiles 1
    & $nssmExe set $serviceName AppRotateOnline 1
    & $nssmExe set $serviceName AppRotateSeconds 86400

    Write-Output "Starting service $serviceName..."
    & $nssmExe start $serviceName
}

Assert-Administrator
Ensure-Nssm
Install-Service
Write-Output 'NSSM service setup complete.'
