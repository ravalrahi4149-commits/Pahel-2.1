# CrackLife AI — AI-Powered Building Crack Detection & Monitoring Platform

> **"See Every Crack. Track Every Change."**  
> *Detect. Monitor. Protect.*

CrackLife AI is a production-oriented, AI-assisted civil engineering software platform designed for structural surface crack detection, computer vision segmentation, longitudinal growth tracking, and official PDF inspection reporting.

---

## 🏛️ System Architecture

### Frontend (React + TypeScript)
- **Framework:** React 19 with TypeScript & Vite
- **Routing & State:** TanStack Router & TanStack Query
- **Styling & UI:** Tailwind CSS, Radix UI accessible primitives, Lucide React icons
- **Visual Analytics:** Recharts area & distribution charts
- **Image Comparator:** Custom multi-mode viewer with curtain split slider, opacity blending, side-by-side mode, and binary mask overlay
- **Localization:** Bilingual **English** & **Gujarati (ગુજરાતી)** support with native typography

### Backend (Python Flask REST API)
- **Framework:** Python 3.11+ with Flask REST API & Flask-CORS
- **Database:** SQLAlchemy ORM with SQLite (development) and PostgreSQL readiness
- **Computer Vision Pipeline (Mode A):** High-performance CLAHE contrast enhancement, bilateral noise filtering, adaptive thresholding, and morphological opening/closing using NumPy & Pillow (with OpenCV acceleration)
- **Learned Segmentation Engine (Mode B):** Modular PyTorch U-Net architecture. Transparently and honestly falls back to Mode A when model weights are absent
- **Model Training Pipeline (Mode C):** `train_segmentation.py` with combined Dice-BCE loss, data augmentation, and IoU/Dice evaluation metrics
- **Reporting Engine:** ReportLab generating official PDF inspection dossiers with embedded figures, measurement tables, and civil engineering disclaimers
- **Testing:** Automated `pytest` suite verifying API endpoints, image processing, and mathematical growth deltas

---

## 🚀 Quick Launch Guide

### Option A: Unified 1-Command Launch (Recommended)

Run both the Python Flask backend and React Vite frontend together in a single merged process:

```bash
# Using npm
npm start

# Or using Python directly
python run_project.py

# Or on Windows, double-click:
start.bat
```

This automatically:
1. Boots the **Flask REST API** on `http://localhost:5000`
2. Initializes and seeds the SQLite database (`cracklife.db`)
3. Boots the **Vite React Frontend** on `http://localhost:8080`
4. Connects the frontend `/api` proxy directly to the backend with zero CORS issues!

---

### Option B: Individual Service Launch

**1. Backend Server**
```bash
$env:PYTHONPATH="backend"
python backend/run.py
```

**2. Frontend Server**
```bash
npm run dev
```

Visit **`http://localhost:5173`** (or the port displayed in your terminal) to access CrackLife AI.

---

## 🔑 Demo Inspector Credentials

For instant evaluation, you can log in directly using the 1-click demo button or with:
- **Email:** `demo@cracklife.ai`
- **Password:** `CrackLife2026!`
- **Role:** Lead Structural Diagnostics Inspector

---

## 🔬 Mathematical Formulas

### Longitudinal Percentage-Point Difference
$$\text{Percentage-Point Difference} = \text{Later Area \%} - \text{Earlier Area \%}$$

### Relative Percentage Change
$$\text{Relative Change \%} = \left(\frac{\text{Later Area \%} - \text{Earlier Area \%}}{\text{Earlier Area \%}}\right) \times 100$$
*(Calculated only when the earlier baseline reading is non-zero).*

### Image Registration Alignment Score
$$\text{Alignment Score} = \left(\frac{\text{Normalized Cross-Correlation} + 1.0}{2.0}\right) \times 100\%$$

---

## 🧪 Automated Testing

Run the full automated pytest suite:

```bash
# Set PYTHONPATH and run pytest
$env:PYTHONPATH="backend"; pytest backend/tests/test_backend.py -v
```

All 5 test suites verify:
1. `test_health_endpoint` — API readiness & health check
2. `test_cv_detection_pipeline` — Real contour segmentation & overlay generation
3. `test_comparison_mathematical_formulas` — Exact delta calculations & bounds
4. `test_auth_and_buildings_api` — Token authentication & building CRUD
5. `test_pdf_and_csv_reports` — ReportLab binary PDF & CSV generation

---

## 🐳 Docker Deployment

Run both frontend and backend in isolated containers:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 🌐 English & Gujarati (ગુજરાતી) Localization

CrackLife AI features global bilingual capability:
- Switch seamlessly between English and Gujarati via the globe icon in the navigation header.
- Centralized dictionary (`src/lib/i18n.ts`) translates navigation items, dashboard metrics, inspection forms, status badges, and engineering disclaimers.
- User preference is automatically persisted across browser sessions.

---

## ⚠️ Civil Engineering & Responsible AI Notice

CrackLife AI is an artificial intelligence-assisted surface inspection documentation and longitudinal monitoring platform. Computer vision measurements quantify visible surface pixel density and do **NOT** evaluate subsurface load-bearing capacity, internal reinforcement oxidation, or definitive structural collapse hazard. All critical structural safety verdicts must be confirmed by a certified civil/structural engineer.
