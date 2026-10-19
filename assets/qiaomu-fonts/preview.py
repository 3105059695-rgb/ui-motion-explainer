"""Preview the bundled type gallery on loopback; no dependencies or network downloads."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import argparse,webbrowser

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--no-open',action='store_true')
    args=parser.parse_args()
    root=Path(__file__).resolve().parent
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
    url=f'http://127.0.0.1:{server.server_port}/gallery.html'
    print(url,flush=True)
    if not args.no_open:webbrowser.open(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()

if __name__=='__main__':main()
