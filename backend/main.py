import hashlib
import itertools
import json
import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

import cv2
from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

from auth import create_token, get_current_user, hash_password, verify_password
from database import Base, engine, get_db
from models import AnalysisSession, Event, User
from schemas import (Credentials, TextAnalysisOut, TextRequest, TokenOut, VideoAnalysisOut)

# ---------- limits (from the API contract) ----------
ALLOWED_EXT = {".mp4", ".webm", ".mov"}
MAX_VIDEO_BYTES = 30 * 1024 * 1024    # 30 MB
MAX_VIDEO_SECONDS = 60
MIN_WORDS = 8                          # shorter answers are skipped in text analysis


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)   # create tables on startup if they do not exist
    yield


app = FastAPI(title="ExamGuard API", version="0.1.0-dummy", lifespan=lifespan)


# ---------- consistent error format: {error, detail} ----------
ERROR_NAMES = {400: "bad_request", 401: "unauthorized", 403: "forbidden", 404: "not_found",
               409: "conflict", 413: "file_too_large", 415: "unsupported_media_type", 422: "invalid_input"}


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code,
                        content={"error": ERROR_NAMES.get(exc.status_code, "error"), "detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    msgs = [f"{'.'.join(str(p) for p in e['loc'])}: {e['msg']}" for e in jsonable_encoder(exc.errors())]
    return JSONResponse(status_code=422, content={"error": "invalid_input", "detail": "; ".join(msgs)})


@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, exc: Exception):
    print("Unhandled error:", repr(exc))
    return JSONResponse(status_code=500, content={"error": "server_error",
                                                  "detail": "Something went wrong on our side. Please try again."})


# ---------- health ----------
@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}


# ---------- auth ----------
@app.post("/register", response_model=TokenOut, status_code=201, tags=["auth"])
def register(body: Credentials, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="This email is already registered.")
    user = User(email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=create_token(user.id))


@app.post("/login", response_model=TokenOut, tags=["auth"])
def login(body: Credentials, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.strip().lower()).first()
    # same message for "no such user" and "wrong password" so attackers cannot probe for emails
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    return TokenOut(access_token=create_token(user.id))


# ---------- video helpers ----------
def video_duration_s(path: str) -> Optional[float]:
    """Return clip length in seconds, or None if OpenCV cannot read the file."""
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return None
    fps = cap.get(cv2.CAP_PROP_FPS) or 0
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    if fps > 0 and frames > 0:
        cap.release()
        return frames / fps
    # some webm files have no frame count: count frames by reading (stop early if too long)
    n = 0
    while cap.grab():
        n += 1
        if fps > 0 and n / fps > MAX_VIDEO_SECONDS + 1:
            break
    cap.release()
    return (n / fps) if (fps > 0 and n > 0) else None


async def save_upload_to_temp(file: UploadFile) -> str:
    """Stream the upload to a temp file, enforcing the size limit while reading."""
    suffix = Path(file.filename or "").suffix.lower()
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    size = 0
    try:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_VIDEO_BYTES:
                raise HTTPException(status_code=413, detail="Video is larger than 30 MB. Please upload a shorter clip.")
            tmp.write(chunk)
    except Exception:
        tmp.close()
        os.remove(tmp.name)
        raise
    tmp.close()
    return tmp.name


def merge_events(timeline: List[dict], min_len_s: int = 2):
    """Merge consecutive seconds with the same non-normal label into events.
    This is REAL logic we will reuse on Day 2 with the real model's timeline."""
    events, cur = [], None
    for p in timeline + [{"t": None, "label": "normal", "confidence": 0.0}]:   # sentinel flushes the last run
        if cur and p["label"] == cur["label"] and p["t"] == cur["last_t"] + 1:
            cur["last_t"] = p["t"]
            cur["confs"].append(p["confidence"])
            continue
        if cur and (cur["last_t"] + 1 - cur["start"]) >= min_len_s:
            avg = sum(cur["confs"]) / len(cur["confs"])
            events.append({"label": cur["label"], "start_s": float(cur["start"]),
                           "end_s": float(cur["last_t"] + 1), "confidence": round(avg, 3),
                           "risk": "high" if avg >= 0.85 else "medium"})
        cur = None
        if p["label"] != "normal":
            cur = {"label": p["label"], "start": p["t"], "last_t": p["t"], "confs": [p["confidence"]]}
    return events


def fake_timeline(duration_s: float) -> List[dict]:
    """DUMMY: pretend a model looked at 1 frame per second. Replaced by the real model on Day 2."""
    n = max(int(duration_s), 1)
    tl = []
    for t in range(n):
        label, conf = "normal", 0.93
        if 0.25 * n <= t < 0.25 * n + 3:
            label, conf = "looking_sideways", 0.88
        elif 0.70 * n <= t < 0.70 * n + 3:
            label, conf = "phone_use", 0.91
        tl.append({"t": t, "label": label, "confidence": conf})
    return tl


# ---------- analyze video (dummy model) ----------
@app.post("/analyze-video", response_model=VideoAnalysisOut, tags=["video"])
async def analyze_video(file: UploadFile = File(...), user: User = Depends(get_current_user),
                        db: Session = Depends(get_db)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=415, detail="Unsupported file type. Upload an mp4, webm or mov video.")
    path = None
    try:
        path = await save_upload_to_temp(file)
        duration = video_duration_s(path)
        if duration is None:
            raise HTTPException(status_code=422, detail="Could not read this video. The file may be corrupt.")
        if duration > MAX_VIDEO_SECONDS:
            raise HTTPException(status_code=422, detail=f"Video is longer than {MAX_VIDEO_SECONDS} seconds.")

        timeline = fake_timeline(duration)
        events = merge_events(timeline)
        normal_pct = round(100 * sum(p["label"] == "normal" for p in timeline) / len(timeline), 1)
        summary = {"normal_pct": normal_pct, "n_events": len(events)}

        # save ONLY labels and timestamps, never the video (privacy promise)
        sess = AnalysisSession(user_id=user.id, kind="video", title=file.filename,
                               summary_json=json.dumps({**summary, "duration_s": round(duration, 1)}))
        db.add(sess)
        db.flush()
        rows = []
        for e in events:
            row = Event(session_id=sess.id, kind="video", label=e["label"], start_s=e["start_s"],
                        end_s=e["end_s"], score=e["confidence"], detail_json=json.dumps({"risk": e["risk"]}))
            db.add(row)
            rows.append((row, e))
        db.commit()
        out_events = [{"id": r.id, **e} for r, e in rows]
        return {"session_id": sess.id, "duration_s": round(duration, 1), "frames_analyzed": len(timeline),
                "timeline": timeline, "events": out_events, "summary": summary}
    finally:
        if path and os.path.exists(path):
            os.remove(path)          # always delete the uploaded video


# ---------- analyze text (dummy model) ----------
def fake_similarity(a: str, b: str) -> float:
    """DUMMY: a repeatable pseudo-score between 0.30 and 0.95. Replaced by MiniLM on Day 2."""
    h = hashlib.md5("|".join(sorted([a, b])).encode()).hexdigest()
    return round(0.30 + (int(h[:6], 16) / 0xFFFFFF) * 0.65, 3)


def risk_level(sim: float) -> str:
    return "high" if sim >= 0.85 else "medium" if sim >= 0.70 else "low"


@app.post("/analyze-text", response_model=TextAnalysisOut, tags=["text"])
def analyze_text(body: TextRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    usable, skipped = [], []
    for s in body.submissions:
        (usable if len(s.answer.split()) >= MIN_WORDS else skipped).append(s)
    if len(usable) < 2:
        raise HTTPException(status_code=422,
                            detail=f"Need at least 2 answers with {MIN_WORDS}+ words. Short answers are skipped.")

    pairs = []
    for a, b in itertools.combinations(usable, 2):
        sim = fake_similarity(a.answer, b.answer)
        pairs.append({"student_a": a.student_id, "student_b": b.student_id, "similarity": sim,
                      "risk": risk_level(sim),
                      "matches": [{"a_sentence": a.answer.split(".")[0].strip(),
                                   "b_sentence": b.answer.split(".")[0].strip(), "score": sim}]})
    pairs.sort(key=lambda p: p["similarity"], reverse=True)
    pairs = pairs[:20]       # keep the response small

    sess = AnalysisSession(user_id=user.id, kind="text", title=body.title or "Text analysis",
                           summary_json=json.dumps({"n_answers": len(usable), "n_skipped": len(skipped)}))
    db.add(sess)
    db.flush()
    for p in pairs:
        db.add(Event(session_id=sess.id, kind="text", label="similar_pair", score=p["similarity"],
                     detail_json=json.dumps({"student_a": p["student_a"], "student_b": p["student_b"],
                                             "risk": p["risk"]})))
    db.commit()
    return {"session_id": sess.id, "pairs": pairs, "skipped": [s.student_id for s in skipped]}
