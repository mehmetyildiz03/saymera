@echo off
setlocal
cd /d %~dp0
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:4173/
  py -m http.server 4173
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:4173/
  python -m http.server 4173
  goto :eof
)
echo Python bulunamadi. Bu klasorde bir yerel HTTP sunucusu baslatin.
pause
