# Code Slim memory acceptance measurement.
#
# The acceptance budget (<500MB) is defined over the SUM of ALL processes of a
# running Code Slim instance (main + gpu + renderer + extension host + shared
# process + network + proxy_resolver + ...), never the main process alone.
#
# Usage:
#   Launch the app with a marker in --user-data-dir, e.g.
#     "Code Slim.exe" <folder> --user-data-dir="$env:TEMP\slim-meas\udd" ...
#   then after the instance settles (~2 min):
#     powershell -NoProfile -ExecutionPolicy Bypass -File scripts\slim-memory-measure.ps1 slim-meas
#
# Prints a per-process table (Working Set + Private Memory) and totals for both
# metrics. Private memory is the budget-relevant figure; working set double
# counts shared libraries across Electron processes.

param(
	[Parameter(Mandatory = $true)][string]$Marker
)

$all = Get-CimInstance Win32_Process -Filter "Name='Code Slim.exe'"
$mine = @($all | Where-Object { $_.CommandLine -like "*$Marker*" })
if (-not $mine) {
	Write-Error "No Code Slim.exe process found with marker '$Marker' in its command line."
	exit 1
}

$rows = foreach ($p in $mine) {
	$gp = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
	if ($gp) {
		$t = 'main'
		if ($p.CommandLine -match '--type=([a-zA-Z-]+)') { $t = $Matches[1] }
		[pscustomobject]@{
			PID        = $p.ProcessId
			PPID       = $p.ParentProcessId
			Type       = $t
			WS_MB      = [math]::Round($gp.WorkingSet64 / 1MB, 1)
			Private_MB = [math]::Round($gp.PrivateMemorySize64 / 1MB, 1)
		}
	}
}

$rows | Sort-Object Type, PID | Format-Table -AutoSize
$ws = ($rows | Measure-Object WS_MB -Sum).Sum
$pv = ($rows | Measure-Object Private_MB -Sum).Sum
"PROCS=$($rows.Count) WS_TOTAL_MB=$([math]::Round($ws, 1)) PRIVATE_TOTAL_MB=$([math]::Round($pv, 1)) BUDGET=500 (all processes, private memory)"
