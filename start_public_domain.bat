@echo off
title Tesla Capital - Institutional Platform Public Launcher
color 0A
cls
echo ==============================================================================
echo  TESLA CAPITAL - HIGH AVAILABILITY PUBLIC DOMAIN LAUNCHER
echo ==============================================================================
echo  Triple-Redundant Automatic Failover & Watchdog Reconnect
echo  Local Server Target : http://127.0.0.1:3000
echo  Tunnels Active      : Cloudflare + Localtunnel + Localhost.run
echo ==============================================================================
echo.
echo Starting all tunnels and backend watchdog...
python start_public_domain.py
pause
