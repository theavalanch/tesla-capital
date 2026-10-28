@echo off
title Tesla Capital - Institutional Platform Public Launcher
color 0A
cls
echo ==============================================================================
echo  TESLA CAPITAL - HIGH AVAILABILITY PUBLIC DOMAIN LAUNCHER
echo ==============================================================================
echo  Dual Non-Cloudflare Tunnels: Localtunnel (*.loca.lt) + Localhost.run (*.lhr.life)
echo  Local Server Target : http://127.0.0.1:3000
echo ==============================================================================
echo.
echo Starting Localtunnel, Localhost.run and backend watchdog...
python start_public_domain.py
pause
