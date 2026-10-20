@echo off
title CS2 Assistant Launcher
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ====================================================
echo             CS2 ASSISTANT LAUNCHER
echo ====================================================
echo Fechando instâncias antigas...
taskkill /F /IM electron.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo Iniciando CS2 Assistant...
start "" "%~dp0node_modules\electron\dist\electron.exe" .
echo Pronto!
