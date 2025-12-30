# QRisma - MVP scaffold

A minimal single-store loyalty card app:
- Backend: Spring Boot (Java 17), PostgreSQL, Flyway migrations, JWT auth
- Frontend: React + Vite + TypeScript, Tailwind CSS
- Google Wallet integration helper (server signs JWT for Save-to-Google-Wallet flow)

Important: You must configure a Google Cloud project + Wallet issuer and provide a service account JSON. See "Google Wallet" section below.

Quick start (requires Docker & Docker Compose):

1. Copy your Google service account JSON into a file, then export it (or point to its path). For local dev, you can mount it into the backend container or set GOOGLE_SERVICE_ACCOUNT_JSON environment variable. Example:
   - In this scaffold we expect the raw JSON text in env var GOOGLE_SERVICE_ACCOUNT_JSON (base64-encoded recommended). See backend/README_GOOGLE.md for details.

2. Start the stack:
   docker compose up --build

3. Backend: http://localhost:8080
   Frontend: http://localhost:5173

Default flows:
- Sign up the owner (one-off): POST /api/auth/signup-owner (or use default seeded owner via migration if configured)
- Owner creates a program via the owner dashboard (simple API available).
- Public Enroll page: http://localhost:5173/enroll?programId=<programId>
- Employee UI: http://localhost:5173/employee

Notes & next steps:
- Google Wallet: you need to create an issuer (issuerId), service account JSON and enable Wallet API. Follow Google Wallet docs for sandbox/testing. The backend contains a `GoogleWalletService` helper that constructs a signed JWT. You will need to configure issuer id and class template in the program creation flow.
- Secrets: Do NOT commit your service account JSON into source control. Use env vars or a secret manager.

Files included:
- docker-compose.yml
- backend/ (Spring Boot app)
- frontend/ (Vite + React app)

If you want, I can:
- Hook the Google Wallet class creation in the owner flow (automate creating class via API).
- Add unit & integration tests.
- Deploy a simple preview environment in your cloud.
