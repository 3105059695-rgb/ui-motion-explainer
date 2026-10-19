"""Delegate fusion export to the preserved original portable MP4 renderer."""
from pathlib import Path
import argparse
import runpy
import sys

if __name__=='__main__':
    parser=argparse.ArgumentParser(add_help=False)
    parser.add_argument('--base',type=Path,default=Path(__file__).resolve().parents[1]/'assets/base-skill')
    options,forward=parser.parse_known_args()
    renderer=options.base/'scripts/render_portable.py'
    if not renderer.is_file():parser.error('Selected base renderer missing')
    sys.argv=[str(renderer),*forward]
    runpy.run_path(str(renderer),run_name='__main__')
