#!/usr/bin/env python3
"""Prepare a private Python/Chromium renderer; never edit global Python packages."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import venv

ROOT = Path(__file__).resolve().parents[1]

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--check', action='store_true')
    a = p.parse_args()
    if sys.version_info < (3, 10):
        p.error('Python 3.10 or newer is required.')
    env = ROOT/'.venv'
    py = env/('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    if not a.check:
        if not py.exists():
            venv.EnvBuilder(with_pip=True).create(env)
        subprocess.run([str(py), '-m', 'pip', 'install', '-r', str(ROOT/'requirements-render.txt')], check=True)
        check_browser = 'from playwright.sync_api import sync_playwright\nwith sync_playwright() as p:\n b=p.chromium.launch(headless=True)\n b.close()'
        ready = subprocess.run([str(py), '-c', check_browser], capture_output=True)
        if ready.returncode:
            subprocess.run([str(py), '-m', 'playwright', 'install', 'chromium'], check=True, timeout=600)
    if not py.exists():
        p.error('Runtime missing; run scripts/bootstrap.py without --check first.')
    probe = '''import json,shutil,imageio_ffmpeg
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 version=b.version
 b.close()
print(json.dumps({"chromium":version,"ffmpeg":shutil.which("ffmpeg") or imageio_ffmpeg.get_ffmpeg_exe(),"status":"ready"}))'''
    subprocess.run([str(py), '-c', probe], check=True)
    print(json.dumps({'python':str(py), 'render':str(ROOT/'scripts/render_portable.py')}, ensure_ascii=False))

if __name__ == '__main__':
    main()
