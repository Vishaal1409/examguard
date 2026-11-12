# ExamGuard API Contract & Frontend Compatibility Review

**To:** Vishaal (Backend & Model Lead, ExamGuard)  
**From:** Shruthika (Frontend & Research Lead, ExamGuard)  
**Date:** November 2026  
**Subject:** Frontend Review of FastAPI Skeleton, OpenAPI Schema (`/openapi.json`), and Workplan Contract  
**Document Code:** EG-API-REV-01  

---

## Executive Summary

Hi Vishaal! I've completed a thorough inspection of the Day 1 backend codebase (`backend/main.py`, `backend/schemas.py`, `backend/models.py`, `backend/auth.py`, `backend/database.py`, and `backend/smoke_test.py`), successfully extracted the live OpenAPI 3.1.0 specification, and benchmarked it against our agreed workplan contract.

Overall, the foundation you've built is clean, well-structured, and the core authentication, dummy video processing, and dummy text comparison pipelines work smoothly in test isolation.

However, from the frontend integration perspective, there are **1 critical blocker (CORS)**, **6 missing endpoints from the workplan**, and **2 awkward schema discrepancies** (especially around `review_status` on video events and user `name`) that will break our frontend UI if not addressed before Day 2.

Here is the complete endpoint-by-endpoint review, technical analysis, and specific questions for you.

---

## 1. Critical System Blockers & Architecture Gaps

### A. CRITICAL: Missing CORS Middleware in FastAPI
* **Current State:** `backend/main.py` has no `CORSMiddleware` configured.
* **The Problem:** The frontend is served via a local static file server (e.g. `http://localhost:5500`, `http://localhost:3000`) or opened directly as `file://`. Any `fetch()` call to `http://127.0.0.1:8000` will be blocked by modern browser security policies with a `CORS Preflight / Origin Error`.
* **Recommended Fix:** Add `fastapi.middleware.cors.CORSMiddleware` to `backend/main.py`:
  ```python
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],  # or ["http://localhost:5500", "http://127.0.0.1:5500"]
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

### B. Accessing `/docs` & Server Boot
* **Observations:** When running locally on Windows, uvicorn must be launched with:
  ```powershell
  $env:PYTHONPATH="backend"
  uvicorn main:app --host 127.0.0.1 --port 8000 --reload
  ```
* If the uvicorn process is not running, browser navigation to `http://127.0.0.1:8000/docs` results in `ERR_CONNECTION_REFUSED`. For Day 1, our frontend operates seamlessly in a zero-crash **Demo Mode** with realistic mock fallbacks so evaluators can inspect the UI without requiring a live server process.

---

## 2. Endpoint-by-Endpoint Compatibility Matrix

| Endpoint | Method | Workplan Status | Implemented in `main.py`? | Frontend Compatibility | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | GET | Expected | **Yes** | Fully Compatible | Low |
| `/login` | POST | Expected | **Yes** | Fully Compatible | Low |
| `/register` | POST | Expected | **Yes** | Minor Discrepancy (Missing `name`) | Medium |
| `/analyze-video` | POST | Expected | **Yes** | **Bug: Missing `review_status`** | **High** |
| `/analyze-text` | POST | Expected | **Yes** | Fully Compatible | Low |
| `/sessions` | GET | Expected | **NO (Missing)** | Broken History Screen | **High** |
| `/sessions/{id}` | GET | Expected | **NO (Missing)** | Broken Deep Links | Medium |
| `/events/{id}` | PATCH | Expected | **NO (Missing)** | Cannot Persist Review Status | **High** |
| `/stats` | GET | Expected | **NO (Missing)** | Broken Dashboard Metrics | **High** |
| `/live-events` | POST / GET | Expected | **NO (Missing)** | Live Telemetry Unsaved | Medium |

---

## 3. Detailed Request / Response Shape Analysis

### 1. `POST /login`
* **Actual Request Shape:**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123"
  }
  ```
* **Actual Response Shape:**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer"
  }
  ```
* **Status Code:** `200 OK` (or `401 Unauthorized` with `{"error": "unauthorized", "detail": "Incorrect email or password."}`).
* **Frontend Compatibility:** **100% Compatible.** Exactly matches our `auth.js` implementation and standard OAuth2 Bearer token storage.

---

### 2. `POST /register`
* **Actual Request Shape:**
  ```json
  {
    "email": "examiner@university.edu",
    "password": "StrongPassword123"
  }
  ```
* **Actual Response Shape:**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer"
  }
  ```
* **Status Code:** `201 Created` (or `409 Conflict`, `422 Invalid Input`).
* **Frontend Compatibility / Awkwardness:**
  * In the frontend registration UI, we collect `name`, `email`, `password`, and `confirmPassword`.
  * The backend `Credentials` schema only accepts `email` and `password`. If extra fields like `name` are passed, Pydantic v2 might ignore them or fail depending on model configuration.
  * More importantly, the `User` model in `backend/models.py` does **not** have a `name` column:
    ```python
    class User(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True)
        email = Column(String, unique=True, index=True, nullable=False)
        password_hash = Column(String, nullable=False)
        created_at = Column(DateTime, default=utcnow)
    ```
* **Recommended Change:** Add `name = Column(String, nullable=True)` to `User` and update `Credentials` or create a `RegisterRequest(BaseModel)` schema containing `name: Optional[str]`. This allows the examiner's actual name to display on the dashboard navbar rather than just parsing their email address!

---

### 3. `POST /analyze-video`
* **Actual Request Shape:** `multipart/form-data` with form field name: `file`.
* **Limits Enforced:** Max 30 MB (`MAX_VIDEO_BYTES`), max 60 seconds (`MAX_VIDEO_SECONDS`), extensions: `.mp4`, `.webm`, `.mov`. (Matches client-side validation in `video-analysis.js` exactly!).
* **Actual Response Shape (`VideoAnalysisOut`):**
  ```json
  {
    "session_id": 1,
    "duration_s": 8.0,
    "frames_analyzed": 8,
    "timeline": [
      { "t": 0, "label": "normal", "confidence": 0.93 },
      { "t": 2, "label": "looking_sideways", "confidence": 0.88 }
    ],
    "events": [
      {
        "id": 1,
        "label": "looking_sideways",
        "start_s": 2.0,
        "end_s": 5.0,
        "confidence": 0.88,
        "risk": "high"
      }
    ],
    "summary": {
      "normal_pct": 62.5,
      "n_events": 1
    }
  }
  ```
* **Status Code:** `200 OK` (or `401 Unauthorized`, `413 File Too Large`, `415 Unsupported Media Type`, `422 Unprocessable Entity`).
* **MAJOR AWKWARD FIELD / BUG:**
  * Notice the `events` array items. Each event contains `id`, `label`, `start_s`, `end_s`, `confidence`, `risk` — **but omits `review_status`!**
  * In `backend/models.py`, line 44, your database model explicitly has:
    ```python
    review_status = Column(String, default="pending")
    ```
  * But in `backend/schemas.py`, lines 22–29:
    ```python
    class VideoEvent(BaseModel):
        id: int
        label: str
        start_s: float
        end_s: float
        confidence: float
        risk: str
        # review_status IS MISSING HERE!
    ```
  * When the frontend loads the events, it doesn't know whether the event is pending, confirmed, or dismissed.
* **Recommended Change:** Add `review_status: str = "pending"` to `VideoEvent` in `schemas.py`, and pass `r.review_status` when constructing `out_events` in `main.py`:
  ```python
  class VideoEvent(BaseModel):
      id: int
      label: str
      start_s: float
      end_s: float
      confidence: float
      risk: str
      review_status: str = "pending"
  ```

---

### 4. `POST /analyze-text`
* **Actual Request Shape (`TextRequest`):**
  ```json
  {
    "title": "CS101 Midterm Quiz",
    "submissions": [
      { "student_id": "S01", "answer": "A neural network is a model made of layers of connected nodes..." },
      { "student_id": "S02", "answer": "A neural network is a model made of layers of connected nodes..." }
    ]
  }
  ```
* **Actual Response Shape (`TextAnalysisOut`):**
  ```json
  {
    "session_id": 2,
    "pairs": [
      {
        "student_a": "S01",
        "student_b": "S02",
        "similarity": 0.924,
        "risk": "high",
        "matches": [
          {
            "a_sentence": "A neural network is a model made of layers of connected nodes",
            "b_sentence": "A neural network is a model made of layers of connected nodes",
            "score": 0.924
          }
        ]
      }
    ],
    "skipped": ["S04"]
  }
  ```
* **Frontend Compatibility:** **100% Compatible.** The shape matches our `text-analysis.html` score cards and pairwise collapse views cleanly.

---

### 5. MISSING: `GET /sessions` & `GET /sessions/{id}`
* **Current State:** Not implemented in `main.py`.
* **Frontend Impact:** The `history.html` page cannot fetch past sessions.
* **Proposed Response Shape Needed for Frontend:**
  ```json
  [
    {
      "id": 1042,
      "kind": "video",
      "title": "exam_hall_camera_candidate_04.mp4",
      "created_at": "2026-11-11T14:22:00Z",
      "n_events": 2,
      "status": "pending_review"
    }
  ]
  ```
* **Note on `summary_json` in DB:** In `models.py`, `AnalysisSession.summary_json` stores a raw JSON string. If the API returns it as an unparsed string, the frontend has to do `JSON.parse()` on every row. Please parse it to a dict before returning in Pydantic.

---

### 6. MISSING: `PATCH /events/{id}`
* **Current State:** Not implemented in `main.py`.
* **Frontend Impact:** When an examiner clicks **Confirm Malpractice** or **Dismiss (Benign)** on `video-analysis.html`, the status currently updates only in the client state. It cannot be persisted to SQLite.
* **Proposed Request Shape:**
  ```json
  {
    "review_status": "confirmed"  // or "dismissed"
  }
  ```
* **Proposed Response Shape:**
  ```json
  {
    "id": 1,
    "review_status": "confirmed",
    "updated_at": "2026-11-11T14:35:10Z"
  }
  ```

---

### 7. MISSING: `GET /stats` (Dashboard Metrics)
* **Current State:** Not implemented in `main.py`.
* **Frontend Impact:** `dashboard.html` currently shows hardcoded institutional demo figures (18 sessions, 42 flagged events, 9 confirmed, 27 dismissed).
* **Proposed Response Shape for Easy Frontend / Chart.js Consumption:**
  ```json
  {
    "total_sessions": 18,
    "total_events": 42,
    "confirmed_events": 9,
    "dismissed_events": 27,
    "pending_events": 6,
    "breakdown": {
      "video_sessions": 12,
      "text_sessions": 6
    },
    "recent_timeline": [
      { "date": "2026-11-09", "flagged": 4 },
      { "date": "2026-11-10", "flagged": 8 },
      { "date": "2026-11-11", "flagged": 2 }
    ]
  }
  ```

---

## 4. Header & Error Handling Audit

### Authorization Header
* Format required by `backend/auth.py`:
  ```http
  Authorization: Bearer <access_token>
  ```
* Consistent with standard JWT bearer practices. The frontend `config.js` and `video-analysis.js` use this exact header format.

### Custom Error Format
* The custom exception handlers in `backend/main.py` return a consistent dictionary:
  ```json
  {
    "error": "invalid_input",
    "detail": "Video is longer than 60 seconds."
  }
  ```
* **Frontend Compatibility:** Excellent! Having both a machine-readable `"error"` code and a human-readable `"detail"` string makes frontend alert banners easy to render.

---

## 5. Seven Questions for Vishaal to Answer Before Day 2

1. **CORS Middleware:** Can you add `CORSMiddleware` with `allow_origins=["*"]` to `main.py` as your first commit on Day 2 so browser fetch requests stop getting blocked?
2. **`review_status` in VideoEvent Schema:** Can you add `review_status: str = "pending"` to `VideoEvent` in `backend/schemas.py` and pass `row.review_status` in the return dictionary of `/analyze-video`?
3. **`name` attribute on User:** Would you be open to adding a `name` column to `models.User` so examiners can be addressed by their actual names on the dashboard rather than just their email prefix?
4. **Endpoint Priority for Day 2:** Could you implement `PATCH /events/{id}` and `GET /sessions` early on Day 2? Those are the two endpoints that connect the video review workflow and history audit trail directly to the database.
5. **Chart.js Consumption for `GET /stats`:** For `GET /stats`, can we agree on the dictionary structure proposed in Section 3.7 above so I can plug it directly into Chart.js datasets without complex client-side transformations?
6. **Live Proctor Webhook (`POST /live-events`):** For the live proctoring module on Day 2, do you want the webcam feed to stream frames via WebSocket or send periodic 1-second snapshots via HTTP POST?
7. **Production Secret Key:** In `backend/auth.py`, notice the fallback warning:
   `WARNING: SECRET_KEY not set, using an insecure dev key.`
   Do you have a `.env` template we should document in `docs/` so production deployments don't rely on the dev fallback key?

---

*This report is ready for our team sync ahead of Day 2 sprint planning.*
