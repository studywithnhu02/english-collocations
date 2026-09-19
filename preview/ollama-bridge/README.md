# Ollama local bridge

This bridge lets the GitHub Pages Preview talk to Ollama without exposing Ollama directly to the public web origin.

## Mac

1. Install Ollama and make sure your model is available, e.g. `ollama pull llama3.2:3b`.
2. Open Terminal in this folder.
3. Run `python3 server.py`.
4. Keep that Terminal window open while using the Preview.
5. In Preview, use `http://127.0.0.1:8765` as the AI bridge URL.

The bridge only listens on `127.0.0.1` and only grants browser CORS to `https://studywithnhu02.github.io`. It forwards chat requests to Ollama at `127.0.0.1:11434`.
