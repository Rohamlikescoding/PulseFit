# Redis and PostgreSQL run inside WSL; this keeps WSL awake and waits for both.
# Run:   powershell -ExecutionPolicy Bypass -File scripts\start_services.ps1
# Stop:  wsl --terminate Ubuntu-24.04

$Distro = "Ubuntu-24.04"
$Ports = @{ "Redis" = 6379; "PostgreSQL" = 5434 }

function Test-Port($port) {
    Test-NetConnection 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
}

# WSL shuts down when no process is attached; a hidden "sleep" keeps it running.
if (-not (Get-CimInstance Win32_Process -Filter "Name='wsl.exe'" |
          Where-Object CommandLine -like "*sleep infinity*")) {
    Start-Process wsl -ArgumentList "-d", $Distro, "--exec", "sleep", "infinity" -WindowStyle Hidden
}

# Both services are enabled in systemd and start with WSL.
foreach ($name in $Ports.Keys) {
    $ok = $false
    foreach ($i in 1..30) {
        if (Test-Port $Ports[$name]) { $ok = $true; break }
        Start-Sleep -Milliseconds 500
    }
    if ($ok) { Write-Host "$name is running on 127.0.0.1:$($Ports[$name])" }
    else { Write-Error "$name did not start (wsl -d $Distro -u root -- systemctl status ...)"; exit 1 }
}
