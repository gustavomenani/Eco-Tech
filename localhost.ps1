param(
  [ValidateRange(1024, 65535)]
  [int]$Port = 5500
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
$pyLauncher = Get-Command py -ErrorAction SilentlyContinue

if (-not $pythonCommand -and -not $pyLauncher) {
  throw "Python não encontrado no PATH. Instale o Python ou ajuste o comando deste script."
}

$pythonExecutable = if ($pyLauncher) { $pyLauncher.Source } else { $pythonCommand.Source }

Write-Host "EcoTech disponível em http://127.0.0.1:$Port/"
Write-Host "Pressione Ctrl+C para encerrar o servidor."

Push-Location $projectRoot

try {
  & $pythonExecutable "scripts\build_site.py"
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao gerar o site antes de iniciar o servidor."
  }
  Push-Location (Join-Path $projectRoot "dist")
  try {
    & $pythonExecutable -m http.server $Port --bind 127.0.0.1
  } finally {
    Pop-Location
  }
} finally {
  Pop-Location
}
