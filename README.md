# KisanColdChain

KisanColdChain is a multi-service cold chain management application for farmers, transporters, cold stores, and administrators. It combines a React frontend, Express backend, Python AI service, and SMS notification support.

## Repository structure

```text
KisanColdChain - Copy/
├── ai-service/
│   ├── main.py
│   ├── models/
│   └── train/
│       └── train_model.py
├── backend/
│   ├── package.json
│   └── src/
│       ├── db.js
│       ├── index.js
│       ├── db/
│       │   └── init.js
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       │   ├── bookings.js
│       │   ├── coldstores.js
│       │   ├── farmers.js
│       │   ├── sms.js
│       │   └── transport.js
│       └── services/
│           ├── aiService.js
│           ├── cropCareService.js
│           ├── mandiService.js
│           ├── matchingService.js
│           ├── notificationService.js
│           ├── transportPooling.js
│           └── weatherService.js
├── clean_export/
│   ├── docker-compose.yml
│   ├── README.md
│   ├── ai-service/
│   └── backend/
├── frontend/
│   ├── package.json
│   ├── build/
│   └── src/
│       ├── App.js
│       ├── config.js
│       ├── index.js
│       ├── tokens.js
│       ├── components/
│       └── pages/
└── sms-bot/
```

> Note: `clean_export/` appears to be a copy of the main service folders, preserved for export or backup purposes.

## What is included

- `backend/`: Node.js Express API server, Postgres database integration, Twilio SMS support, weather and AI service integrations.
- `frontend/`: React web application for operators, transporters, and farmers.
- `ai-service/`: Python FastAPI service for AI model inference and training.
- `sms-bot/`: placeholder folder for SMS bot related resources.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ for the AI service
- Postgres database for backend storage
- Twilio account for SMS features
- `OPENWEATHER_API_KEY` for weather lookups

## Setup and run sequence

Follow these steps in order to run the full application locally.

### 1. Backend setup

1. Open a terminal.
2. Navigate to `backend/`:
   ```powershell
   cd backend
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Create a `.env` file in `backend/` with these values:
   - `DATABASE_URL` (Postgres connection string, e.g. `postgres://user:pass@host:5432/db`)
   - `PORT` (optional, default is `3001`)
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE`
   - `OPENWEATHER_API_KEY`
5. Start the backend:
   ```powershell
   npm start
   ```

### 2. AI service setup

1. Open a second terminal.
2. Navigate to `ai-service/`:
   ```powershell
   cd ai-service
   ```
3. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
4. Install Python dependencies:
   ```powershell
   pip install --upgrade pip
   pip install fastapi uvicorn joblib numpy pandas scikit-learn xgboost
   ```
5. Optionally train the model:
   ```powershell
   python train/train_model.py
   ```
6. Start the AI service:
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### 3. Frontend setup

1. Open a third terminal.
2. Navigate to `frontend/`:
   ```powershell
   cd frontend
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the frontend app:
   ```powershell
   npm start
   ```

## Service order

1. Backend server (`backend/`) should be running first.
2. AI service (`ai-service/`) should be running before frontend calls AI endpoints.
3. Frontend (`frontend/`) can then be launched to access the UI.

## Notes

- Do not commit `backend/.env` or any secret values.
- Use a tool like `ngrok` if you need a public webhook URL for Twilio callbacks during local development.
- If you do not have `backend/.env.example`, create one with placeholder values only.

## Helpful commands

From `backend/`:
```powershell
npm install
npm start
```

From `frontend/`:
```powershell
npm install
npm start
```

From `ai-service/`:
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt  # if you create this file
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Additional recommendations

- Add `backend/.env.example` with placeholder settings.
- Consider adding a `requirements.txt` file under `ai-service/` to make Python setup easier.
- Verify Postgres connectivity before starting the backend.
 

