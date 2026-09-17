# Code Slim memory measurement - all processes, three metrics.
# "PrivWS" (专用工作集) matches Windows Task Manager's "Memory" column.
#
# Usage: powershell -File scripts\slim-memory-measure.ps1 [marker]
#   No marker = measure ALL Code Slim.exe processes on the machine.
#   With marker = only processes whose command line contains it.

param(
	[Parameter(Mandatory = $false)][string]$Marker
)

$all = Get-CimInstance Win32_Process -Filter "Name='Code Slim.exe'"
$mine = @($all)
if ($Marker) { $mine = @($all | Where-Object { $_.CommandLine -like "*$Marker*" }) }
if (-not $mine) { Write-Error "No matching Code Slim.exe processes."; exit 1 }

# Private working set per PID from the perf counters (Task Manager's metric)
$perf = @{}
Get-CimInstance Win32_PerfFormattedData_PerfProc_Process -Filter "Name like 'Code Slim%'" | ForEach-Object { $perf[[uint32]$_.IDProcess] = [int64]$_.WorkingSetPrivate }

$rows = foreach ($p in $mine) {
	$sub = '?'
	if ($p.CommandLine -match '--utility-sub-type=([^\s"]+)') { $sub = $Matches[1] }
	elseif ($p.CommandLine -match '--type=([a-zA-Z-]+)') { $sub = $Matches[1] }
	$ws = 0; $pv = 0; $pws = 0
	$gp = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
	if ($gp) { $ws = [math]::Round($gp.WorkingSet64 / 1MB, 1); $pv = [math]::Round($gp.PrivateMemorySize64 / 1MB, 1) }
	if ($perf.ContainsKey([uint32]$p.ProcessId)) { $pws = [math]::Round($perf[[uint32]$p.ProcessId] / 1MB, 1) }
	[pscustomobject]@{ PID = $p.ProcessId; PPID = $p.ParentProcessId; Type = $sub; TaskMgr_MB = $pws; WS_MB = $ws; Private_MB = $pv }
}

$rows | Sort-Object TaskMgr_MB -Descending | Format-Table -AutoSize
$t = ($rows | Measure-Object TaskMgr_MB -Sum).Sum
$w = ($rows | Measure-Object WS_MB -Sum).Sum
$p = ($rows | Measure-Object Private_MB -Sum).Sum
"PROCS=$($rows.Count) TASKMGR_TOTAL_MB=$([math]::Round($t, 1)) WS_TOTAL_MB=$([math]::Round($w, 1)) PRIVATE_TOTAL_MB=$([math]::Round($p, 1))"
