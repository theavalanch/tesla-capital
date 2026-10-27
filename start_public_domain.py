"""
Tesla Capital - Automated Public Domain & Tunnel Manager
Prevents "no tunnel" errors by maintaining an active tunnel,
auto-reconnecting on disconnect, updating active_domain.txt,
and copying the live link to clipboard.
"""

import os
import sys
import time
import re
import socket
import subprocess
import webbrowser
import threading

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_EXE = os.path.join(ROOT_DIR, "cloudflared.exe")
ACTIVE_DOMAIN_FILE = os.path.join(ROOT_DIR, "active_domain.txt")

def is_port_in_use(port=3000, host="127.0.0.1"):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        return s.connect_ex((host, port)) == 0

def ensure_backend_running():
    if is_port_in_use(3000):
        print("[+] Backend is already running on http://127.0.0.1:3000")
        return None
    
    print("[*] Starting Tesla Capital backend on port 3000...")
    backend_script = os.path.join(ROOT_DIR, "backend", "main.py")
    proc = subprocess.Popen(
        [sys.executable, backend_script],
        cwd=ROOT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
    )
    
    # Wait for port 3000 to become available
    for _ in range(15):
        time.sleep(1)
        if is_port_in_use(3000):
            print("[+] Backend initialized successfully on http://127.0.0.1:3000")
            return proc
    
    print("[!] Warning: Backend took longer than expected to bind port 3000.")
    return proc

def copy_to_clipboard(text):
    try:
        if os.name == 'nt':
            p = subprocess.Popen(['clip'], stdin=subprocess.PIPE, close_fds=True)
            p.communicate(input=text.strip().encode('utf-8'))
    except Exception:
        pass

def save_active_domain(urls):
    try:
        content = "\n".join(urls) + "\n"
        with open(ACTIVE_DOMAIN_FILE, "w", encoding="utf-8") as f:
            f.write(content)
    except Exception as e:
        print(f"[!] Error saving active domain: {e}")

def run_cloudflared_tunnel():
    if not os.path.isfile(CLOUDFLARED_EXE):
        print(f"[!] cloudflared.exe not found at {CLOUDFLARED_EXE}")
        return False

    print("\n" + "=" * 70)
    print(" TESLA CAPITAL - LAUNCHING CLOUDFLARE HIGH-STABILITY TUNNEL")
    print(" (Zero config, no rate limits, ultra-low latency Anycast CDN)")
    print("=" * 70)

    url_regex = re.compile(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com')
    opened_browser = False

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
                errors="replace"
            )

            current_url = None
            for line in proc.stdout:
                line_str = line.strip()
                match = url_regex.search(line_str)
                if match:
                    current_url = match.group(0)
                    print("\n" + "#" * 70)
                    print("  [SUCCESS] PUBLIC HTTPS DOMAIN IS LIVE (ZERO 'NO TUNNEL' ERRORS):")
                    print(f"  --> {current_url}")
                    print("#" * 70 + "\n")
                    
                    save_active_domain([current_url])
                    copy_to_clipboard(current_url)
                    print("[i] URL saved to active_domain.txt and copied to your clipboard!")

                    if not opened_browser:
                        webbrowser.open(current_url)
                        opened_browser = True

                # Print normal connection logs
                if "Registered tunnel connection" in line_str or "Connection" in line_str:
                    print(f"  [Cloudflare] {line_str}")

            proc.wait()
            print("[!] Cloudflare tunnel connection closed. Auto-reconnecting in 3s...")
            time.sleep(3)

        except KeyboardInterrupt:
            print("\nTunnel stopped by user.")
            break
        except Exception as e:
            print(f"[!] Tunnel error: {e}. Reconnecting in 3s...")
            time.sleep(3)

def run_localhost_run_tunnel():
    print("\n" + "=" * 70)
    print(" TESLA CAPITAL - LAUNCHING LOCALHOST.RUN TUNNEL WITH AUTO-RECONNECT")
    print("=" * 70)

    url_regex = re.compile(r'https://[a-zA-Z0-9-]+\.lhr\.life')
    opened_browser = False

    while True:
        print("\n[*] Connecting SSH tunnel to nokey@localhost.run...")
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
                errors="replace"
            )

            for line in proc.stdout:
                line_str = line.strip()
                match = url_regex.search(line_str)
                if match:
                    current_url = match.group(0)
                    print("\n" + "#" * 70)
                    print("  [SUCCESS] LOCALHOST.RUN PUBLIC HTTPS DOMAIN IS LIVE:")
                    print(f"  --> {current_url}")
                    print("#" * 70 + "\n")

                    save_active_domain([current_url])
                    copy_to_clipboard(current_url)
                    print("[i] URL saved to active_domain.txt and copied to clipboard!")

                    if not opened_browser:
                        webbrowser.open(current_url)
                        opened_browser = True

                if "tunneled with tls" in line_str or "connection id" in line_str:
                    print(f"  [localhost.run] {line_str}")

            proc.wait()
            print("[!] Localhost.run tunnel closed. Auto-reconnecting immediately to prevent 'no tunnel'...")
            time.sleep(2)

        except KeyboardInterrupt:
            print("\nTunnel stopped by user.")
            break
        except Exception as e:
            print(f"[!] Error: {e}. Reconnecting in 2s...")
            time.sleep(2)

def main():
    print("=" * 70)
    print("  TESLA CAPITAL - HIGH-AVAILABILITY DOMAIN & TUNNEL LAUNCHER")
    print("=" * 70)

    # 1. Ensure backend is running
    ensure_backend_running()

    # 2. Check options or default to Cloudflare (most reliable, zero 502/no-tunnel errors)
    mode = "cloudflare"
    if len(sys.argv) > 1:
        if sys.argv[1].lower() in ["lhr", "localhost", "ssh"]:
            mode = "localhost.run"
        elif sys.argv[1].lower() in ["cf", "cloudflare"]:
            mode = "cloudflare"

    if mode == "cloudflare" and os.path.isfile(CLOUDFLARED_EXE):
        run_cloudflared_tunnel()
    else:
        run_localhost_run_tunnel()

if __name__ == "__main__":
    main()
