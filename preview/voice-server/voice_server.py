from __future__ import annotations

import hashlib
import os
from pathlib import Path
from threading import Lock

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from TTS.api import TTS

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / "cache"
CACHE.mkdir(exist_ok=True)
REFERENCE = Path(os.getenv("XTTS_REFERENCE", str(ROOT / "reference.wav"))).expanduser().resolve()
MODEL_NAME = os.getenv("XTTS_MODEL", "tts_models/multilingual/multi-dataset/xtts_v2")

app = FastAPI(title="English Collocations Local Voice Clone")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
_model_device = None
_lock = Lock()

class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)


def pick_device() -> str:
    forced = os.getenv("XTTS_DEVICE", "").strip().lower()
    if forced:
        return forced
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def get_model():
    global _model, _model_device
    if _model is not None:
        return _model
    with _lock:
        if _model is not None:
            return _model
        device = pick_device()
        try:
            model = TTS(MODEL_NAME).to(device)
            _model = model
            _model_device = device
        except Exception:
            if device != "cpu":
                model = TTS(MODEL_NAME).to("cpu")
                _model = model
                _model_device = "cpu"
            else:
                raise
    return _model


@app.get("/health")
def health():
    return {
        "ok": True,
        "reference_exists": REFERENCE.exists(),
        "device": _model_device or pick_device(),
        "model": MODEL_NAME,
    }


@app.post("/tts")
def tts(req: TTSRequest):
    if not REFERENCE.exists():
        raise HTTPException(
            status_code=400,
            detail=f"Reference voice not found: {REFERENCE}. Put your sample voice there or set XTTS_REFERENCE.",
        )

    text = " ".join(req.text.strip().split())
    reference_tag = f"{REFERENCE}:{REFERENCE.stat().st_mtime_ns}"
    key = hashlib.sha256(f"{MODEL_NAME}|{reference_tag}|{text}".encode("utf-8")).hexdigest()
    output = CACHE / f"{key}.wav"

    if not output.exists():
        with _lock:
            if not output.exists():
                model = get_model()
                model.tts_to_file(
                    text=text,
                    file_path=str(output),
                    speaker_wav=[str(REFERENCE)],
                    language="en",
                    split_sentences=True,
                )

    return FileResponse(output, media_type="audio/wav", filename=output.name)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("voice_server:app", host="127.0.0.1", port=8765, reload=False)
