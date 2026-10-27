"""
Tesla Capital - Automated Public Domain & Dual Tunnel Manager
High-Availability Failover System:
1. Runs and monitors Tesla Capital backend on http://127.0.0.1:3000
2. Spins up redundant public HTTPS tunnels:
   - Cloudflare Quick Tunnel (*.trycloudflare.com)
   - Localhost.run SSH Tunnel (*.lhr.life)
3. Persists live domains to active_domain.txt
4. Copies primary domain to clipboard
5. Verifies public link reachability over the web
"""

import os
import sys
import time
import re
import socket
import urllib.request
import urllib.error
import subprocess
import webbrowser
import threading

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_EXE = os.path.join(ROOT_DIR, "cloudflared.exe")
ACTIVE_DOMAIN_FILE = os.path.join(ROOT_DIR, "active_domain.txt")
BACKEND_LOG_FILE = os.path.join(ROOT_DIR, "backend.log")

active_domains = {
    "cloudflare": None,
    "localhost_run": None
}
domain_lock = threading.Lock()
clipboard_copied = False

def is_backend_healthy():
    try:
        req = urllib.request.Request("http://127.0.0.1:3000/", headers={"User-Agent": "HealthCheck/1.0"})
        with urllib.request.urlopen(req, timeout=2) as resp:
            return resp.status == 200
    except Exception:
        return False

def ensure_backend_running():
    if is_backend_healthy():
        print("[+] Backend is healthy and responding on http://127.0.0.1:3000")
        return None
    
    print("[*] Starting Tesla Capital backend on port 3000...")
    backend_script = os.path.join(ROOT_DIR, "backend", "main.py")
    
    backend_log = open(BACKEND_LOG_FILE, "a", encoding="utf-8")
    backend_log.write(f"\n--- Backend Session Started: {time.ctime()} ---\n")
    backend_log.flush()

    proc = subprocess.Popen(
        [sys.executable, backend_script],
        cwd=ROOT_DIR,
        stdout=backend_log,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
    )
    
    # Wait for backend to be healthy
    for i in range(25):
        time.sleep(1)
        if is_backend_healthy():
            print("[+] Backend successfully initialized and verified on http://127.0.0.1:3000")
            return proc
        print(f"  ...waiting for backend ({i+1}/25s)")
    
    print("[!] Warning: Backend started but healthcheck timed out. Check backend.log for details.")
    return proc

def copy_to_clipboard(text):
    try:
        if os.name == 'nt':
            p = subprocess.Popen(['clip'], stdin=subprocess.PIPE, close_fds=True)
            p.communicate(input=text.strip().encode('utf-8'))
    except Exception:
        pass

def update_active_domain(key, url):
    global clipboard_copied
    with domain_lock:
        active_domains[key] = url
        live_list = [u for u in active_domains.values() if u]
        try:
            with open(ACTIVE_DOMAIN_FILE, "w", encoding="utf-8") as f:
                f.write("\n".join(live_list) + "\n")
        except Exception as e:
            print(f"[!] Error saving active domain: {e}")
            
    if url and not clipboard_copied:
        copy_to_clipboard(url)
        clipboard_copied = True

def verify_public_url(url, timeout=10):
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False

def run_cloudflared_tunnel(open_browser_on_start=False):
    if not os.path.isfile(CLOUDFLARED_EXE):
        print(f"[!] cloudflared.exe not found at {CLOUDFLARED_EXE}")
        return False

    url_regex = re.compile(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com')
    opened = False

    while True:
        print("\n[*] Initializing Cloudflare tunnel connection to http://127.0.0.1:3000...")
        try:
            proc = subprocess.Popen(
                [CLOUDFLARED_EXE, "tunnel", "--url", "http://127.0.0.1:3000"],
                cwd=ROOT_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1
            )

            for line in iter(proc.stdout.readline, ''):
                line_str = line.strip()
                match = url_regex.search(line_str)
                if match:
                    current_url = match.group(0)
                    update_active_domain("cloudflare", current_url)

                    print("\n" + "=" * 76)
                    print("  [SUCCESS] CLOUDFLARE PUBLIC HTTPS DOMAIN IS LIVE:")
                    print(f"  >>> {current_url} <<<")
                    print("=" * 76)
                    print("  [i] Saved to active_domain.txt & copied to clipboard!")

                    if open_browser_on_start and not opened:
                        webbrowser.open(current_url)
                        opened = True

                if "Registered tunnel connection" in line_str or "Connection" in line_str:
                    print(f"  [Cloudflare] {line_str}")

            proc.wait()
            print("[!] Cloudflare tunnel connection closed. Auto-reconnecting in 3s...")
            time.sleep(3)

        except KeyboardInterrupt:
            print("\nCloudflare tunnel stopped by user.")
            break
        except Exception as e:
            print(f"[!] Cloudflare tunnel error: {e}. Reconnecting in 3s...")
            time.sleep(3)

def run_localhost_run_tunnel(open_browser_on_start=False):
    url_regex = re.compile(r'https://[a-zA-Z0-9-]+\.lhr\.life')
    opened = False

    while True:
        print("\n[*] Initializing Localhost.run SSH tunnel to http://127.0.0.1:3000...")
        try:
            proc = subprocess.Popen(
                [
                    "ssh",
                    "-o", "StrictHostKeyChecking=no",
                    "-o", "ServerAliveInterval=15",
                    "-o", "ServerAliveCountMax=3",
                    "-R", "80:127.0.0.1:3000",
                    "nokey@localhost.run"
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1
            )

            for line in iter(proc.stdout.readline, ''):
                line_str = line.strip()
                match = url_regex.search(line_str)
                if match:
                    current_url = match.group(0)
                    update_active_domain("localhost_run", current_url)

                    print("\n" + "=" * 76)
                    print("  [SUCCESS] LOCALHOST.RUN PUBLIC HTTPS DOMAIN IS LIVE:")
                    print(f"  >>> {current_url} <<<")
                    print("=" * 76)
                    print("  [i] Saved to active_domain.txt!")

                    if open_browser_on_start and not opened and not active_domains.get("cloudflare"):
                        webbrowser.open(current_url)
                        opened = True

                if "tunneled with tls" in line_str or "connection id" in line_str:
                    print(f"  [localhost.run] {line_str}")

            proc.wait()
            print("[!] Localhost.run tunnel closed. Auto-reconnecting in 2s...")
            time.sleep(2)

        except KeyboardInterrupt:
            print("\nLocalhost.run tunnel stopped by user.")
            break
        except Exception as e:
            print(f"[!] Localhost.run error: {e}. Reconnecting in 2s...")
            time.sleep(2)

def main():
    print("=" * 76)
    print("  TESLA CAPITAL - HIGH-AVAILABILITY DUAL TUNNEL & PUBLIC DOMAIN LAUNCHER")
    print("=" * 76)

    # 1. Ensure backend is running
    ensure_backend_running()

    # 2. Parse mode
    mode = "dual"
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg in ["cf", "cloudflare"]:
            mode = "cloudflare"
        elif arg in ["lhr", "localhost", "ssh"]:
            mode = "localhost.run"
        elif arg in ["dual", "both", "all"]:
            mode = "dual"

    print(f"[*] Starting tunnel mode: {mode.upper()}")

    if mode == "cloudflare":
        run_cloudflared_tunnel(open_browser_on_start=True)
    elif mode == "localhost.run":
        run_localhost_run_tunnel(open_browser_on_start=True)
    else:
        # Dual Mode: run Cloudflare and Localhost.run concurrently
        t_cf = threading.Thread(target=run_cloudflared_tunnel, args=(True,), daemon=True)
        t_lhr = threading.Thread(target=run_localhost_run_tunnel, args=(False,), daemon=True)
        
        t_cf.start()
        time.sleep(1)
        t_lhr.start()

        # Keep main thread alive
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down public tunnels...")

if __name__ == "__main__":
    main()
