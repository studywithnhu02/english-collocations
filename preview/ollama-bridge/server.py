#!/usr/bin/env python3
"""Local bridge: GitHub Pages Preview -> Ollama.

Run: python3 server.py
Then Preview talks to http://127.0.0.1:8765, avoiding Ollama CORS setup.
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import json

HOST = "127.0.0.1"
PORT = 8765
OLLAMA = "http://127.0.0.1:11434"
ALLOWED_ORIGIN = "https://studywithnhu02.github.io"

class Handler(BaseHTTPRequestHandler):
    def cors(self):
        origin = self.headers.get("Origin", "")
        if origin == ALLOWED_ORIGIN:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def respond(self, code, payload):
        raw = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            try:
                with urlopen(OLLAMA + "/api/tags", timeout=5) as r:
                    data = json.loads(r.read().decode())
                self.respond(200, {"ok": True, "ollama": True, "models": data.get("models", [])})
            except Exception as e:
                self.respond(503, {"ok": False, "error": str(e)})
        else:
            self.respond(404, {"error": "Not found"})

    def do_POST(self):
        if self.path != "/api/chat":
            self.respond(404, {"error": "Not found"}); return
        try:
            n = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(n)
            req = Request(OLLAMA + "/api/chat", data=body, headers={"Content-Type":"application/json"}, method="POST")
            with urlopen(req, timeout=600) as r:
                raw = r.read()
            self.send_response(200); self.cors(); self.send_header("Content-Type", "application/x-ndjson"); self.send_header("Content-Length", str(len(raw))); self.end_headers(); self.wfile.write(raw)
        except HTTPError as e:
            detail = e.read().decode(errors="replace")
            self.respond(e.code, {"error": detail})
        except (URLError, Exception) as e:
            self.respond(502, {"error": str(e)})

if __name__ == "__main__":
    print(f"Ollama bridge running at http://{HOST}:{PORT}")
    print("Keep this Terminal window open while using the Preview AI Workspace.")
    HTTPServer((HOST, PORT), Handler).serve_forever()
