@echo off
title CS2 Assistant Launcher
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Iniciando CS2 Assistant...
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0"
