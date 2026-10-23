import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
if __name__ == '__main__':
    os.chdir(Path(__file__).parent / 'web')
    ThreadingHTTPServer(('0.0.0.0', int(os.environ.get('PORT', '3000'))), SimpleHTTPRequestHandler).serve_forever()
