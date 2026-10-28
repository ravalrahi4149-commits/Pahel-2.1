import os
import sys
import time
import subprocess
import signal
from pathlib import Path

# Ensure UTF-8 output on Windows terminal
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"

def run():
    print("=" * 65)
    print("  CRACKLIFE AI - UNIFIED FULL-STACK LAUNCHER")
    print("=" * 65)
    print("Initializing Flask REST backend & React Vite frontend...")

    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)
    env["PORT"] = "5000"
    env["HOST"] = "0.0.0.0"

    # 1. Start Python Backend
    python_exe = sys.executable
    backend_script = str(BACKEND_DIR / "run.py")
    print(f"\n[1/2] Starting Flask Backend on http://localhost:5000...")
    backend_proc = subprocess.Popen(
        [python_exe, backend_script],
        cwd=str(ROOT_DIR),
        env=env,
    )

    # 2. Wait for backend to be ready
    time.sleep(2)

    # 3. Start Frontend
    print(f"[2/2] Starting Vite React Frontend...")
    # On Windows npm is a cmd/bat
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(ROOT_DIR),
    )

    time.sleep(3)

    print("\n" + "=" * 65)
    print("  CRACKLIFE AI PLATFORM IS LIVE & READY!")
    print("=" * 65)
    print("  Frontend UI : http://localhost:8080")
    print("  Backend API : http://localhost:5000")
    print("  API Proxy   : http://localhost:8080/api -> http://localhost:5000/api")
    print("  Demo Login  : demo@cracklife.ai  /  CrackLife2026!")
    print("=" * 65)
    print("Press CTRL+C anytime to stop both servers.\n")

    def shutdown(sig, frame):
        print("\nStopping CrackLife AI servers...")
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        try:
            backend_proc.terminate()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGBREAK"):
        signal.signal(signal.SIGBREAK, shutdown)

    # Keep alive while both processes are running
    try:
        while True:
            b_poll = backend_proc.poll()
            f_poll = frontend_proc.poll()
            if b_poll is not None:
                print(f"[Notice] Backend exited with code {b_poll}")
                break
            if f_poll is not None:
                print(f"[Notice] Frontend exited with code {f_poll}")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown(None, None)

if __name__ == "__main__":
    run()
