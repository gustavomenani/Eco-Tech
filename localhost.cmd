@echo off
setlocal

set "PORT=%~1"
if "%PORT%"=="" set "PORT=5500"

cd /d "%~dp0"
echo EcoTech disponivel em http://127.0.0.1:%PORT%/
echo Pressione Ctrl+C para encerrar o servidor.

set "PYTHON_CMD=python"
where py >nul 2>nul && set "PYTHON_CMD=py"

%PYTHON_CMD% scripts\build_site.py
if errorlevel 1 exit /b %errorlevel%
cd /d "%~dp0dist"
%PYTHON_CMD% -m http.server %PORT% --bind 127.0.0.1
