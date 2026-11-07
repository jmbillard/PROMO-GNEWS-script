# Instala a extensão PROMO GNEWS no After Effects (Windows) para desenvolvimento.
# (para a equipe, use o 'INSTALAR PROMO GNEWS.jsx' direto da pasta na rede)
#
#   powershell -ExecutionPolicy Bypass -File install-win.ps1             copia a extensão + fontes (host/src)
#   powershell -ExecutionPolicy Bypass -File install-win.ps1 -Link       junção para a pasta do repositório
#   powershell -ExecutionPolicy Bypass -File install-win.ps1 -Uninstall  remove a extensão
#
# Extensões sem assinatura só carregam com o PlayerDebugMode ligado; o script liga para CSXS 7-13.
# (adaptado do O PADEIRO)
param([switch]$Uninstall, [switch]$Link)

$ErrorActionPreference = 'Stop'

$cep = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$repo = Split-Path $cep -Parent
$dest = Join-Path $env:APPDATA 'Adobe\CEP\extensions\com.promognews.cep'

function Remove-Dest {
	if (Test-Path $dest) {
		$item = Get-Item $dest -Force
		if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { $item.Delete() }
		else { Remove-Item $dest -Recurse -Force }
	}
}

if ($Uninstall) {
	Remove-Dest
	Write-Host "removido: $dest"
	exit 0
}

foreach ($v in 7..13) {
	$key = "HKCU:\Software\Adobe\CSXS.$v"
	if (-not (Test-Path $key)) { New-Item -Path $key -Force | Out-Null }
	New-ItemProperty -Path $key -Name PlayerDebugMode -Value '1' -PropertyType String -Force | Out-Null
}

New-Item -ItemType Directory -Path (Split-Path $dest) -Force | Out-Null
Remove-Dest

if ($Link) {
	# pela junção o host não enxerga ..\..\source: os fontes entram como host\src (ignorado pelo git)
	$src = Join-Path $cep 'host\src'
	if (Test-Path $src) { (Get-Item $src -Force).Delete() }
	New-Item -ItemType Junction -Path $src -Target (Join-Path $repo 'source') | Out-Null
	New-Item -ItemType Junction -Path $dest -Target $cep | Out-Null
	Write-Host "junção criada: $dest -> $cep"
} else {
	Copy-Item $cep $dest -Recurse
	Remove-Item (Join-Path $dest 'scripts') -Recurse -Force
	$hs = Join-Path $dest 'host\src'
	if (Test-Path $hs) { Remove-Item $hs -Recurse -Force }
	Copy-Item (Join-Path $repo 'source') $hs -Recurse
	Write-Host "copiado para: $dest"
}

Write-Host 'reinicie o After Effects e abra: Window > Extensions > PROMO GNEWS'
