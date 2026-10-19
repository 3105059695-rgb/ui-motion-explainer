"""Serve the skill's local galleries; Ctrl+C stops the server."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--port',type=int,default=8770)
    a=p.parse_args()
    root=Path(__file__).resolve().parents[1]
    with ThreadingHTTPServer(('127.0.0.1',a.port),partial(QuietHandler,directory=str(root))) as server:
        print(f'http://127.0.0.1:{server.server_port}/index.html',flush=True)
        try:server.serve_forever()
        except KeyboardInterrupt:pass

if __name__=='__main__':main()
