# Varit AI — Well-to-Surface Digital Twin for Heavy Oil Optimization

[![Python](https://img.shields.io/badge/Python-3.14+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**Varit AI** is an operational, full-stack AI Digital Twin designed for **Cyclic Steam Stimulation (CSS)** and **Sucker Rod Pump (SRP)** operations in heavy oil fields, tuned specifically for the **Baghewala Heavy Oil Field** (Bikaner-Nagaur Basin).

---

## 🌟 Key Features

1. **4-Layer Coupled Digital Twin Architecture**:
   - **Reservoir Twin**: Pressure, temperature evolution, thermal radius, and fluid mobility ($k/\mu$).
   - **Wellbore Twin**: Bottom-hole pressure (BHP), fluid temp, in-situ crude viscosity, and water cut.
   - **Fluid Coupling Model**: Beggs-Robinson non-Newtonian viscosity decay ($\mu(T)$) linked to SRP pump loading.
   - **SRP Mechanical Twin**: Polished rod stroke length, SPM, VFD frequency, pump fillage, peak rod load (PRL), minimum rod load (MRL), and rod floating risk.

2. **Light & Dark Theme Toggle**:
   - Seamless high-contrast theme switcher across all pages with frosted glassmorphism styling.

3. **AI & Physics-Inspired Machine Learning Models**:
   - **Production Predictor**: Gradient Boosting Regressor predicting daily oil production ($m^3/\text{day}$).
   - **Thermal Decay Predictor**: Predicts post-steam reservoir cooling over cycle horizon.
   - **Viscosity Predictor**: Calculates exponential crude oil viscosity drop from $6,500+\text{ cP}$ down to $15\text{ cP}$.
   - **Pump Efficiency Predictor**: Estimates volumetric fillage under high viscosity drag.
   - **Equipment Failure Risk Predictor**: Evaluates API Spec 11B Rod String fatigue & rod floating conditions.

4. **Multi-Module Optimization Engines**:
   - **CSS Optimization Module**: Enthalpy, steam volume, and soak duration optimization to minimize Steam-Oil Ratio (SOR).
   - **SRP Optimization Module**: VFD frequency, stroke length, and SPM tuning with real-time **Dynamometer Load Card** generation.
   - **Joint AI Constrained Optimizer**: SciPy `minimize` (SLSQP / L-BFGS-B) joint optimization balancing recovery against energy intensity and failure risk.
   - **What-If Simulator**: Interactive parameter sliders with 120-day side-by-side time series scenario projections.

5. **Real-Time Live Telemetry Streaming**:
   - WebSocket streaming endpoint (`/ws/live-stream/{well_id}`) emitting real-time physics-consistent sensor updates.

---

## 🏗 System Architecture

```
                                +-----------------------------------+
                                |     Varit AI React Frontend       |
                                |  (TypeScript, Vite, Recharts)     |
                                +-----------------+-----------------+
                                                  | REST API & WebSockets
                                                  v
                                +-----------------+-----------------+
                                |      FastAPI Backend Engine       |
                                |  (Python, Pydantic, SQLAlchemy)   |
                                +--------+----------------+---------+
                                         |                |
             +---------------------------+                +---------------------------+
             |                                                                        |
             v                                                                        v
+------------+------------+                                              +------------+------------+
|  SciPy / Optuna Engine  |                                              |   Scikit-Learn ML Layer   |
|  Joint CSS + SRP SLSQP  |                                              |  Trained Random Forest    |
|  Constrained Optimizer  |                                              |   & Gradient Boosting     |
+------------+------------+                                              +------------+------------+
             |                                                                        |
             +---------------------------+--------------------------------------------+
                                         |
                                         v
                        +----------------+----------------+
                        |  SQLite / PostgreSQL Database   |
                        |   (5 Wells, 24M Time-Series)    |
                        +---------------------------------+
```

---

## 📁 Project Structure

```
Pro3/
├── backend/
│   ├── app/
│   │   ├── api/                # REST API Endpoint Routers
│   │   ├── database/           # SQLAlchemy Session, Models & Seed Script
│   │   ├── ml/                 # Model Loader & Synthetic Training Script
│   │   ├── schemas/            # Pydantic Request/Response Schemas
│   │   ├── services/           # Optimization & Simulation Engines, WebSocket Manager
│   │   ├── utils/              # Physics Engine (Beggs-Robinson Viscosity, SRP Mechanics)
│   │   └── main.py             # FastAPI App Entrypoint & WebSocket Server
│   ├── requirements.txt
│   └── thermolift.db           # Seeded SQLite Database
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, KpiCard, AlertBanner, DynamometerChart
│   │   ├── context/            # WellContext (Global Well State, Theme & WebSocket Stream)
│   │   ├── pages/              # Dashboard, DigitalTwin, CSS, SRP, Integrated, What-If, Analytics
│   │   ├── services/           # Axios API Client
│   │   ├── types/              # TypeScript Interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css           # Glassmorphic CSS Styling (Light & Dark Themes)
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── data/                       # Generated Synthetic Training CSV & Well Logs
├── models/                     # Trained ML Models (.joblib)
├── .env.example
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm

---

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Create virtual environment & activate
python -m venv venv
.\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Train ML Models & Seed Database
python app\ml\train_models.py
python app\database\seed.py

# Start FastAPI Uvicorn Server on port 8005
python -m uvicorn app.main:app --host 127.0.0.1 --port 8005 --reload
```
> The API server will be available at: `http://127.0.0.1:8005`  
> Interactive OpenAPI documentation: `http://127.0.0.1:8005/docs`

---

### 2. Frontend Setup & Run

In a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server
npm run dev
```
> The web application will open at: `http://localhost:5173`

---

## 📄 License
MIT License. Developed for technical demonstration and operational petroleum digital twin optimization.
