# ExamGuard — Frontend Architectural Guide & Gate G2 Demonstration Script

**Author:** Shruthika (Frontend & Research Lead, ExamGuard Team)  
**Date:** November 2026  
**Version:** 1.0.0 (Day 1 Release)  

---

## 1. Architecture Overview

ExamGuard's frontend is an institutional SaaS interface designed specifically for academic examiners and examination integrity review boards. It is built strictly using **HTML5, Tailwind CSS (via CDN), and Vanilla JavaScript**, adhering strictly to the constraint of avoiding heavyweight frontend frameworks (no React, Next.js, Vue, or Vite).

### Directory Layout
```
examguard/
├── frontend/
│   ├── index.html              # Landing page explaining ExamGuard's non-accusatory philosophy
│   ├── login.html              # Examiner authentication with client validation and demo quick-fill
│   ├── register.html           # Institutional examiner onboarding
│   ├── dashboard.html          # Examiner oversight console (metrics, distribution, recent sessions)
│   ├── video-analysis.html     # CORE DAY 1 MODULE: Video upload, validation, timeline, review actions
│   ├── text-analysis.html      # Cohort subjective answer similarity comparison skeleton
│   ├── live-proctor.html       # Real-time webcam proctoring HUD & telemetry skeleton
│   ├── history.html            # Immutable audit trail & past assessment inspection
│   ├── css/
│   │   └── styles.css          # Custom global styling, glassmorphic accents, and timeline tracks
│   └── js/
│       ├── config.js           # API endpoints, limits, behavior mappings, and auth state helpers
│       ├── navbar.js           # Shared responsive navbar with active link highlight & mobile drawer
│       ├── auth.js             # Form validation, show/hide password, and token/demo mode handlers
│       └── video-analysis.js   # Video upload, 60s/30MB validation, Canvas clip generator, timeline, seeking
├── backend/                    # FastAPI backend (owned by teammate Vishaal)
├── docs/
│   ├── api-frontend-review.md  # Detailed OpenAPI contract review and recommendations for Vishaal
│   ├── frontend-guide.md       # This comprehensive demonstration guide
│   └── research/
│       ├── competitor-analysis.md       # 6 competitors (Proctorio, ExamSoft, Honorlock, Mettl, Turnitin, Copyleaks)
│       ├── india-academic-integrity.md  # UGC 2018, Public Exams Act 2024, NEET/UGC-NET, DPDP Act 2023 & Rules 2025
│       └── source-links.md              # Verified official vendor and legal citations
```

---

## 2. How to Run the Frontend

The frontend is completely zero-dependency and can be served using any local web server or opened directly in a browser.

### Option A: Python Built-In HTTP Server (Recommended)
From the root repository directory (`c:\Users\shrut\examguard`), run:
```powershell
python -m http.server 3000 --directory frontend
```
Then open your web browser to:
[http://localhost:3000](http://localhost:3000)

### Option B: Node / npx `serve`
```powershell
npx serve frontend -p 3000
```

### Option C: Direct File Opening
You can double-click `frontend/index.html` or `frontend/login.html` directly in your file explorer. All scripts and stylesheets are linked relatively, and the embedded sample clip generator uses HTML5 Canvas so video features work even over `file://`!

---

## 3. Gate G2 Demonstration Script (Step-by-Step for Shruthika)

When presenting the Day 1 deliverables to your evaluator or team lead, follow this 12-step demonstration flow:

### Step 1: Landing Page & Institutional Philosophy
* **URL:** `http://localhost:3000/index.html`
* **What to Show:**
  * Point out the institutional branding: deep navy backgrounds, emerald accents, and clear statement: *"ExamGuard assists examiners by flagging suspicious activities — it never automatically accuses students."*
  * Highlight the three core modules: Video Analysis, Text Analysis, and Live Proctoring.
  * Show the legal compliance badges at the bottom (UGC 2018, DPDP Act 2023).

### Step 2: Examiner Authentication (Login & Register)
* **URL:** `http://localhost:3000/login.html`
* **What to Show:**
  1. Click the eye icon next to the password input to demonstrate the **Show/Hide password toggle**.
  2. Click "Sign In" with empty fields to show client-side input validation and error feedback banners.
  3. Click **"Quick-fill credentials"** to instantly populate `shruthika@examguard.edu` and demo credentials.
  4. Point out the **"Use Day 1 Demo Mode"** toggle, which clearly distinguishes demo mode from backend token authorization.
  5. Click "Sign In to Examiner Console" to smoothly transition to `dashboard.html`.

### Step 3: Examiner Oversight Dashboard
* **URL:** `http://localhost:3000/dashboard.html`
* **What to Show:**
  * Walk through the 4 institutional metric cards: **Total Sessions (18)**, **Flagged Events (42)**, **Confirmed Malpractice (9)**, and **Dismissed / Benign (27)**.
  * Point out the **Examiner Due-Process ratio** (25% confirmed, 75% dismissed), demonstrating that ExamGuard's non-accusatory model prioritizes student fairness.
  * Point out the shared navigation bar: active link indicator, examiner badge ("Shruthika"), and "Demo Mode" status pill.
  * Click **"New Video Analysis"** in the top-right toolbar.

### Step 4: Video Upload & Client-Side Validation (Highest Priority)
* **URL:** `http://localhost:3000/video-analysis.html`
* **What to Show:**
  1. **Drag-and-Drop Zone:** Hover a file over the dotted upload box to show the active blue drag highlight.
  2. **Strict Client-Side Validation:**
     * Mention the 3 strict rules enforced in `video-analysis.js`:
       * Maximum File Size: **30 MB**.
       * Maximum Clip Duration: **60 seconds**.
       * Allowed Extensions: **MP4, WEBM, MOV**.
     * Explain that duration is probed using an offscreen HTML5 `<video>` element listening to the `loadedmetadata` event before allowing the upload to proceed.
  3. **Zero-File-Dependency Sample Generator:** Click the **"Load Sample Exam Clip (32s)"** button. ExamGuard uses an internal HTML5 Canvas stream recorder to synthesize a 32-second exam candidate clip in real time, guaranteeing you can demonstrate the full workflow even on a clean presentation laptop!

### Step 5: Video Preview Card
* **What to Show:**
  * Once the video is loaded, the preview card smoothly appears.
  * Point out the file information: `exam_hall_camera_candidate_04.webm` • `14.2 MB • 32.0s duration`.
  * Point out the "Remove Clip" button and the active green "Client-side checks passed" confirmation.
  * Click **"Analyse Video Footage"**.

### Step 6: Loading State & Non-Accusatory Analysis Simulation
* **What to Show:**
  * The button disables automatically to prevent repeated submissions.
  * A prominent loading spinner appears with sequential progress updates:
    * *"Decoding video stream & validating frames..."*
    * *"Sampling 1 frame per second for head pose and mobile devices..."*
    * *"Evaluating temporal behavioral anomalies (MobileNetV2 Simulation)..."*
  * Note the clear disclosure pill: *"Demo Simulation Active • MobileNetV2 Prototype"*.

### Step 7: Results KPI Summary
* **What to Show:**
  * After a 2.2-second realistic analysis delay, the page smoothly scrolls to the results section.
  * Show the yellow **MOCK DATA / DEMO MODE** institutional alert banner: *"These findings are synthesized for frontend and examiner workflow validation on Day 1. Actual MobileNetV2 inference will be wired during Day 2 backend integration."*
  * Review the 4 summary KPI cards:
    * **Frames Analysed:** 32 (sampled at 1 fps)
    * **Normal Behaviour:** 78.1%
    * **Flagged Events:** 2 (requiring examiner review)
    * **Clip Duration:** 32.0s

### Step 8: Interactive Coloured Timeline
* **What to Show:**
  * Point out the horizontal timeline bar divided into colored segments:
    * **Green:** Normal Candidate Behaviour
    * **Orange:** Looking Sideways (t=10s to 15s)
    * **Red:** Mobile Phone Usage (t=25s to 31s)
  * Hover over any colored block to reveal the tooltip displaying the behavior label, exact timestamp range, and model confidence score.
  * Click on the orange or red block: notice that the video player immediately seeks to that timestamp!

### Step 9: Clickable Flagged Events & Video Seeking (Mandatory Feature)
* **What to Show:**
  * Scroll down to the **Flagged Events for Examiner Audit** container.
  * Show Event #EVT-01:
    * Label: `Looking Sideways` (Amber badge)
    * Duration: `00:10 - 00:15 (5s duration)`
    * Confidence: `91.4%` | Risk: `Medium Risk`
    * Status: `Pending Examiner Review`
  * Show Event #EVT-02:
    * Label: `Phone Usage` (Rose badge)
    * Duration: `00:25 - 00:31 (6s duration)`
    * Confidence: `96.2%` | Risk: `High Risk`
  * **Click directly on Event #EVT-02:**
    * The card gains a blue highlight ring (`ring-2 ring-blue-500`).
    * The main video player automatically seeks to `00:25` and begins playing the exact moment where the phone reflection was detected!

### Step 10: Confirm and Dismiss Actions (Human-in-the-Loop)
* **What to Show:**
  1. On Event #EVT-01, click the **"Dismiss"** button:
     * The status badge updates to `✕ Dismissed (Benign)`.
     * An action toast notification pops up: *"Event #EVT-01 dismissed as false positive / benign movement."*
  2. On Event #EVT-02, click the **"Confirm"** button:
     * The status badge updates to `✓ Confirmed Malpractice`.
     * The button turns solid green.
     * An action toast notification pops up: *"Event #EVT-02 confirmed as examination malpractice. Audit log updated."*
  3. Reiterate that this completely satisfies the core ethos: AI surfaces candidate anomalies; the human examiner makes the final call.

### Step 11: Text Analysis & Live Proctoring Skeletons
* **What to Show:**
  * Navigate to `text-analysis.html`: Show the CSV upload area, click **"Load Sample Submissions"**, and click **"Run Semantic Cross-Comparison"** to demonstrate the pairwise similarity cards (Student S01 vs. S02 with 92.4% score).
  * Navigate to `live-proctor.html`: Click **"Start Live Monitoring"** to show camera initialization, proctoring HUD overlay, and live telemetry log.
  * Navigate to `history.html`: Show the historical audit log with session IDs, timestamps, and review statuses.

### Step 12: Mobile Responsiveness Verification
* **What to Show:**
  * Open browser Developer Tools (`F12`) and activate Device Mode.
  * Test at standard breakpoints:
    * **Desktop (1440px / 1280px):** Full multi-column grid, horizontal timeline bar, side-by-side preview.
    * **Tablet (768px):** 2-column cards, readable timeline, stacked actions.
    * **Mobile (390px iPhone 12/13/14 / 360px Android):** 
      * The top navigation collapses into a clean hamburger menu.
      * Tapping the hamburger opens the drawer with all module links.
      * Cards stack vertically without horizontal scrolling or clipping.
      * Video player scales smoothly within the screen viewport.

---

## 4. Mobile Breakpoint Verification Checklist

| Resolution | Device Class | Navbar | Video Player | Timeline Track | Event Cards | Horizontal Scroll? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1440px** | Large Desktop | Expanded | Max 768px centered | Full-width | Side-by-side buttons | **None (Pass)** |
| **1280px** | Laptop | Expanded | Max 768px centered | Full-width | Side-by-side buttons | **None (Pass)** |
| **768px** | Tablet (iPad) | Responsive icons | Scaled (aspect-video) | Full-width | Responsive flex | **None (Pass)** |
| **390px** | Standard Mobile | Collapsible Menu | Fluid (100% width) | Fluid with ticks | Stacked buttons | **None (Pass)** |
| **360px** | Small Mobile | Collapsible Menu | Fluid (100% width) | Fluid with ticks | Stacked buttons | **None (Pass)** |

---

## 5. Summary of Day 1 Accomplishments

* **Zero modifications to teammate folders:** `backend/` and `model/` were untouched.
* **Full institutional SaaS aesthetic:** Deep navy accents, crisp typography, clean cards, and non-accusatory academic language.
* **100% client-side validation:** Enforces 30MB and 60-second limits via HTML5 metadata.
* **Synchronized video scrub & playback:** Clicking events or timeline blocks seeks the video player instantly.
* **Exhaustive research & API review:** Delivered complete competitor benchmarking, Indian regulatory analysis (UGC 2018, Public Exams Act 2024, DPDP 2023), and an actionable API review for Vishaal.
