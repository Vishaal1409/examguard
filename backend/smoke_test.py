"""Quick end-to-end check of the ExamGuard API.
Usage:  python smoke_test.py http://127.0.0.1:8000
        python smoke_test.py https://<your-space>.hf.space
Needs: pip install requests opencv-python-headless numpy
"""
import os
import random
import sys
import tempfile

import cv2
import numpy as np
import requests

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000").rstrip("/")
results = []


def check(name, cond, extra=""):
    results.append(cond)
    print(("PASS  " if cond else "FAIL  ") + name + (f"   ({extra})" if extra and not cond else ""))


def make_video(path, seconds=8, fps=10):
    w = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (64, 64))
    for i in range(seconds * fps):
        w.write(np.full((64, 64, 3), (i * 3) % 255, dtype=np.uint8))
    w.release()


email = f"test{random.randint(10000, 99999)}@example.com"
pw = "StrongPass123"

r = requests.get(f"{BASE}/health"); check("GET /health", r.status_code == 200 and r.json() == {"status": "ok"}, r.text)

r = requests.post(f"{BASE}/register", json={"email": email, "password": pw})
check("register new user", r.status_code == 201 and "access_token" in r.json(), r.text)

r = requests.post(f"{BASE}/register", json={"email": email, "password": pw})
check("duplicate email -> 409", r.status_code == 409 and r.json().get("error") == "conflict", r.text)

r = requests.post(f"{BASE}/login", json={"email": email, "password": "WrongPass999"})
check("wrong password -> 401", r.status_code == 401 and r.json().get("error") == "unauthorized", r.text)

r = requests.post(f"{BASE}/login", json={"email": email, "password": pw})
token = r.json().get("access_token", "")
check("login -> token", r.status_code == 200 and token != "", r.text)
H = {"Authorization": f"Bearer {token}"}

tmp = tempfile.mkdtemp()
vid = os.path.join(tmp, "clip.mp4")
make_video(vid)

with open(vid, "rb") as f:
    r = requests.post(f"{BASE}/analyze-video", files={"file": ("clip.mp4", f, "video/mp4")})
check("analyze-video without token -> 401", r.status_code == 401, r.text)

r = requests.post(f"{BASE}/analyze-video", headers=H, files={"file": ("notes.txt", b"hello", "text/plain")})
check("wrong file type -> 415", r.status_code == 415 and r.json().get("error") == "unsupported_media_type", r.text)

r = requests.post(f"{BASE}/analyze-video", headers=H, files={"file": ("bad.mp4", b"this is not a video" * 100, "video/mp4")})
check("corrupt video -> 422", r.status_code == 422, r.text)

with open(vid, "rb") as f:
    r = requests.post(f"{BASE}/analyze-video", headers=H, files={"file": ("clip.mp4", f, "video/mp4")})
j = r.json() if r.status_code == 200 else {}
check("valid video -> timeline + events", r.status_code == 200 and len(j.get("events", [])) >= 1
      and len(j.get("timeline", [])) >= 1, r.text[:200])
if j:
    print("      duration:", j["duration_s"], "| frames:", j["frames_analyzed"], "| events:",
          [(e["label"], e["start_s"], e["end_s"]) for e in j["events"]], "| summary:", j["summary"])

subs = [{"student_id": "S01", "answer": "A neural network is a model made of layers of connected nodes that learn patterns from data."},
        {"student_id": "S02", "answer": "A neural network is a model made of layers of connected nodes that learn patterns from data."},
        {"student_id": "S03", "answer": "Photosynthesis lets plants turn sunlight water and carbon dioxide into glucose and oxygen daily."},
        {"student_id": "S04", "answer": "Short one"}]
r = requests.post(f"{BASE}/analyze-text", headers=H, json={"title": "Quiz 1", "submissions": subs})
j = r.json() if r.status_code == 200 else {}
check("analyze-text -> pairs, short answer skipped", r.status_code == 200 and len(j.get("pairs", [])) == 3
      and j.get("skipped") == ["S04"], r.text[:200])

r = requests.post(f"{BASE}/analyze-text", headers=H, json={"submissions": subs[:1]})
check("only 1 submission -> 422", r.status_code == 422 and r.json().get("error") == "invalid_input", r.text)

r = requests.post(f"{BASE}/analyze-text", json={"submissions": subs})
check("analyze-text without token -> 401", r.status_code == 401, r.text)

print(f"\n{sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
