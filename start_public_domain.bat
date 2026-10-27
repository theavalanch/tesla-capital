@echo off
title Tesla Capital - Institutional Platform Public Launcher
color 0A
cls
echo ==============================================================================
echo  TESLA CAPITAL - HIGH AVAILABILITY PUBLIC DOMAIN LAUNCHER
echo ==============================================================================
echo  Fixing "no tunnel" errors with dual automatic failover and reconnect.
echo  Local Server Target : http://127.0.0.1:3000
echo ==============================================================================
echo.
echo Select Public Tunnel Provider:
echo   [1] Dual Redundant Tunnels (Cloudflare + Localhost.run) [RECOMMENDED]
echo   [2] Cloudflare Quick Tunnel Only (*.trycloudflare.com)
echo   [3] Localhost.run SSH Tunnel Only (*.lhr.life)
echo.
choice /C 123 /N /T 3 /D 1 /M "Auto-starting [1] Dual Tunnels in 3 seconds (Press 1, 2, or 3): "

if errorlevel 3 goto LOCALHOST_RUN
if errorlevel 2 goto CLOUDFLARE
if errorlevel 1 goto DUAL_TUNNELS

:DUAL_TUNNELS
echo.
echo Starting Dual High-Availability Tunnels & Backend...
python start_public_domain.py dual
pause
goto EOF

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
