"""Serves a fresh copy of the site from a temp folder on a free localhost port, for the browser tests."""
import os, threading, functools, http.server, tempfile, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
def serve():
    site = tempfile.mkdtemp()
    shutil.copytree(ROOT, site, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.git', 'tests', 'docs'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(_Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/', site
