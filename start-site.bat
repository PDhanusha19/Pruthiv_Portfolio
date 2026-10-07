@echo off
REM Double-click this file to preview the website on your computer.
REM Keep this window open while you browse. Close it to stop the preview.
cd /d "%~dp0"
start "" http://localhost:8000/index.html
python -m http.server 8000 || py -m http.server 8000
pause
