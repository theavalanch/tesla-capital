@echo off
title Tesla Capital - Institutional Platform Public Launcher
color 0A
cls
echo ==============================================================================
echo  TESLA CAPITAL - HIGH AVAILABILITY PUBLIC DOMAIN LAUNCHER
echo ==============================================================================
echo  Fixing "no tunnel" errors with automatic failover and reconnect.
echo  Local Server Target : http://127.0.0.1:3000
echo ==============================================================================
echo.
echo Select Public Tunnel Provider:
echo   [1] Cloudflare Quick Tunnel (RECOMMENDED - Zero Drops, Ultra-Fast, HTTPS)
echo   [2] Localhost.run (SSH Auto-Reconnecting Tunnel)
echo.
choice /C 12 /N /T 5 /D 1 /M "Auto-starting [1] in 5 seconds (Press 1 or 2): "

if errorlevel 2 goto LOCALHOST_RUN
if errorlevel 1 goto CLOUDFLARE

:CLOUDFLARE
echo.
echo Starting Cloudflare Tunnel & Backend...
python start_public_domain.py cloudflare
pause
goto EOF

:LOCALHOST_RUN
echo.
echo Starting Localhost.run SSH Tunnel & Backend...
python start_public_domain.py lhr
pause
goto EOF

:EOF
