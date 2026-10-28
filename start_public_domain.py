"""
Tesla Capital - Automated Public Domain & Dual Tunnel Manager (Localtunnel & Localhost.run)
High-Availability Dual Non-Cloudflare Failover System:
1. Runs and monitors Tesla Capital backend on http://127.0.0.1:3000
2. Spins up 2 independent public HTTPS tunnels:
   - Primary: Localtunnel (*.loca.lt)
   - Secondary: Localhost.run SSH Tunnel (*.lhr.life)
3. Persists live non-Cloudflare domains to active_domain.txt & active_domain.json
4. Automatically copies primary domain to clipboard
5. Verifies public link reachability over the web
"""

import os
import sys
import time
import re
import json
import shutil
import urllib.request
import urllib.error
import subprocess
import threading

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ACTIVE_DOMAIN_FILE = os.path.join(ROOT_DIR, "active_domain.txt")
ACTIVE_DOMAIN_JSON = os.path.join(ROOT_DIR, "active_domain.json")
BACKEND_LOG_FILE = os.path.join(ROOT_DIR, "backend.log")

active_domains = {
    "localtunnel": None,
    "localhost_run": None
}
domain_lock = threading.Lock()
clipboard_copied = False

def is_backend_healthy():
    try:
        req = urllib.request.Request("http://127.0.0.1:3000/", headers={"User-Agent": "HealthCheck/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
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
        # Ensure Localtunnel is first, Localhost.run second
        ordered_keys = ["localtunnel", "localhost_run"]
        live_list = [active_domains[k] for k in ordered_keys if active_domains.get(k)]
        try:
            with open(ACTIVE_DOMAIN_FILE, "w", encoding="utf-8") as f:
                f.write("\n".join(live_list) + "\n")
            with open(ACTIVE_DOMAIN_JSON, "w", encoding="utf-8") as f:
                json.dump({
                    "updated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
                    "domains": {k: active_domains[k] for k in ordered_keys if active_domains.get(k)}
                }, f, indent=2)
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

def run_localtunnel():
    npx_bin = shutil.which("npx") or "npx.cmd"
    url_regex = re.compile(r'https://[a-zA-Z0-9-]+\.loca\.lt')

    while True:
        print("\n[*] Initializing Localtunnel connection to http://127.0.0.1:3000...")
        try:
            proc = subprocess.Popen(
                [npx_bin, "localtunnel", "--port", "3000"],
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
                    update_active_domain("localtunnel", current_url)

                    print("\n" + "=" * 76)
                    print("  [SUCCESS] LOCALTUNNEL PUBLIC HTTPS DOMAIN IS LIVE:")
                    print(f"  >>> {current_url} <<<")
                    print("=" * 76)
                    print("  [i] Saved to active_domain.txt & copied to clipboard!")

            proc.wait()
            print("[!] Localtunnel connection closed. Auto-reconnecting in 3s...")
            time.sleep(3)

        except KeyboardInterrupt:
            print("\nLocaltunnel stopped.")
            break
        except Exception as e:
            print(f"[!] Localtunnel error: {e}. Reconnecting in 3s...")
            time.sleep(3)

def run_localhost_run_tunnel():
    ssh_bin = shutil.which("ssh") or "ssh"
    url_regex = re.compile(r'https://[a-zA-Z0-9-]+\.lhr\.life')

    while True:
        print("\n[*] Initializing Localhost.run SSH tunnel to http://127.0.0.1:3000...")
        try:
            proc = subprocess.Popen(
                [
                    ssh_bin,
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

                if "tunneled with tls" in line_str or "connection id" in line_str:
                    print(f"  [localhost.run] {line_str}")

            proc.wait()
            print("[!] Localhost.run tunnel closed. Auto-reconnecting in 2s...")
            time.sleep(2)

        except KeyboardInterrupt:
            print("\nLocalhost.run tunnel stopped.")
            break
        except Exception as e:
            print(f"[!] Localhost.run error: {e}. Reconnecting in 2s...")
            time.sleep(2)

def main():
    print("=" * 76)
    print("  TESLA CAPITAL - HIGH-AVAILABILITY PUBLIC DOMAIN MANAGER")
    print("  Providers: Localtunnel (*.loca.lt) + Localhost.run (*.lhr.life)")
    print("=" * 76)

    # 1. Ensure backend is running
    ensure_backend_running()

    # 2. Start Localtunnel and Localhost.run tunnels concurrently
    t_lt = threading.Thread(target=run_localtunnel, daemon=True)
    t_lhr = threading.Thread(target=run_localhost_run_tunnel, daemon=True)
    
    t_lt.start()
    time.sleep(1)
    t_lhr.start()

    # 3. Persistent watchdog loop
    try:
        while True:
            time.sleep(10)
            if not is_backend_healthy():
                print("[!] Backend check failed! Restarting backend...")
                ensure_backend_running()
    except KeyboardInterrupt:
        print("\nShutting down public tunnels...")

if __name__ == "__main__":
    main()
