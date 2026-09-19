# Local voice clone for English Collocations Preview

This server keeps voice cloning local. The GitHub Pages Preview sends the English sentence to `http://127.0.0.1:8765`; the local XTTS-v2 server generates WAV audio using your reference voice and caches it on disk.

## 1. Put your reference voice here

Copy your own sample voice into this folder as:

`reference.wav`

A short, clean sample is enough for XTTS-v2 voice cloning. If your sample is MP3, convert it to WAV first (for example with macOS QuickTime or `ffmpeg`). Do not commit the private voice sample to GitHub.

You can use another local path instead:

`XTTS_REFERENCE="/full/path/to/reference.wav"`

## 2. Create a Python environment

Python 3.10–3.13 is supported by the current `coqui-tts` package. The current maintained package is `coqui-tts`; it keeps the `from TTS.api import TTS` import path. citeturn2search5turn2search8

Example on macOS:

```bash
cd preview/voice-server
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## 3. Start the server

```bash
python voice_server.py
```

Then open:

`http://127.0.0.1:8765/health`

You should see `"ok": true` and `"reference_exists": true`.

## 4. Open the Preview

Open:

https://studywithnhu02.github.io/english-collocations/preview/

Press ▶ in **Câu giao tiếp ví dụ**. The Preview will try the local XTTS server first. If the server is not running, it falls back to the browser voice so the existing Preview still works.

The first XTTS request downloads/loads the model and can be slow. Later requests for the same sentence are served from the local `cache/` folder.

XTTS-v2 supports English and voice cloning from a single reference audio file. citeturn2search10

## Privacy / cost

The reference audio and generated cache stay on your machine. No ElevenLabs or other paid TTS API is used. Model download uses internet bandwidth once, but there is no per-sentence cloud TTS charge.

## Model license

XTTS-v2 is distributed under the Coqui Public Model License. Review that license before using the cloned voice or generated audio in a commercial product. citeturn2search10
