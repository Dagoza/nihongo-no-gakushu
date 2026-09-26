#!/usr/bin/env python3
"""
Nihongo Master - Local Dev & App Server
Supports HTTP Range requests for seamless PDF streaming and zero dependencies.
Run with: python3 server.py
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class RangeRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable Range requests and CORS for local testing
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RangeRequestHandler)
    print("=" * 60)
    print(f"🎌 Nihongo Master (日本語マスター) Servidor Iniciado")
    print(f"👉 Abre en tu navegador: http://localhost:{PORT}")
    print(f"📁 Directorio base: {DIRECTORY}")
    print("Presiona Ctrl+C para detener el servidor.")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
        sys.exit(0)

if __name__ == '__main__':
    run()
