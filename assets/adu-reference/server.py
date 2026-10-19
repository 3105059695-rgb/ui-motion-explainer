from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import argparse
root=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8766);a=p.parse_args()
class Handler(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',a.port),partial(Handler,directory=str(root))).serve_forever()
