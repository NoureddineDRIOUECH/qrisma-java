# QRisma - Loyalty Rewards Platform

A modern, full-featured loyalty card management system with Google Wallet integration.

## 🎯 Features

- **Owner Dashboard**: Manage loyalty programs, customers, employees, and rewards
- **Employee POS**: Scan customer cards, add/redeem points
- **Customer Enrollment**: Public enrollment pages with Google Wallet integration
- **Multi-Tenancy**: Data isolation per store owner
- **Premium UI**: Beautiful, animated interface with Tailwind CSS
- **Google Wallet**: Automatic loyalty card creation and synchronization

## 🛠️ Tech Stack

**Backend:**

- Java 21
- Spring Boot 3.2.5
- PostgreSQL 18.1
- Flyway (Database migrations)
- Google Wallet API
- JWT Authentication

**Frontend:**

- React 18.2
- TypeScript
- Vite 5.1
- Tailwind CSS 3.3.2
- Lucide Icons

## 📋 Prerequisites

Before running the app, make sure you have:

- **Java 21** - [Download here](https://adoptium.net/)
- **Maven 3.9+** - [Download here](https://maven.apache.org/download.cgi)
- **Node.js 18+** and **npm** - [Download here](https://nodejs.org/)
- **PostgreSQL 18.1** - [Download here](https://www.postgresql.org/download/)
- **Google Cloud Account** (for Wallet integration)

## 🚀 Local Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE qrisma_java;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
\q
```

### 2. Google Wallet Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Wallet API**
4. Create a **Service Account**:
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Grant "Owner" role
   - Create and download JSON key
5. Create a **Wallet Issuer**:
   - Go to [Google Pay & Wallet Console](https://pay.google.com/business/console)
   - Create a new Issuer Account
   - Note your Issuer ID (format: `3388000000023004943`)

### 3. Backend Setup

```bash
cd backend

# Configure application.yml
# Edit src/main/resources/application.yml with your settings:
# - Database credentials (default: postgres/postgres)
# - JWT secret
# - Google Wallet issuer ID
# - Service account JSON path

# Install dependencies and run
mvn clean install -DskipTests
mvn spring-boot:run

# Backend will start on http://localhost:8080
```

**Environment Variables:**
Create `backend/.env` or set these variables:

```bash
DB_URL=jdbc:postgresql://localhost:5432/qrisma_java
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
GOOGLE_ISSUER_ID=your-issuer-id
GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/service-account.json
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE=http://localhost:8080" > .env

# Start development server
npm run dev

# Frontend will start on http://localhost:5173
```

## 🎮 Usage

### First Time Setup

1. **Register as Owner**:

   - Navigate to http://localhost:5173/register
   - Fill in account details (Step 1)
   - Fill in store details (Step 2)
   - You'll be automatically logged in

2. **Create a Loyalty Program**:

   - Go to Programs page
   - Click "Add Program"
   - Configure rewards, design, and terms
   - Download QR code for enrollment

3. **Enroll Customers**:

   - Share enrollment link: `http://localhost:5173/enroll?programId=YOUR_PROGRAM_ID`
   - Or scan QR code
   - Customers add card to Google Wallet

4. **Use Employee POS**:
   - Navigate to Point of Sale
   - Scan customer card ID
   - Add points or redeem rewards

## 📁 Project Structure

```
qrisma-java/
├── backend/
│   ├── src/main/java/com/qrisma/
│   │   ├── controller/         # REST API endpoints
│   │   ├── model/             # JPA entities
│   │   ├── repository/        # Data access layer
│   │   ├── service/           # Business logic
│   │   └── config/            # Security & CORS config
│   └── src/main/resources/
│       ├── application.yml    # Configuration
│       └── db/migration/      # Flyway SQL migrations
├── frontend/
│   ├── src/
│   │   ├── pages/            # Route components
│   │   ├── components/       # Reusable components
│   │   └── utils/            # API helpers
│   └── vite.config.ts
└── docker-compose.yml        # Optional Docker setup
```

## 🔑 API Endpoints

**Authentication:**

- `POST /api/auth/signup-owner` - Register new owner
- `POST /api/auth/login` - Login

**Programs:**

- `GET /api/programs` - List programs (filtered by owner)
- `POST /api/programs` - Create/update program
- `DELETE /api/programs/{id}` - Delete program
- `POST /api/programs/{id}/enroll` - Enroll customer

**Dashboard:**

- `GET /api/dashboard/stats` - Get analytics

**Employee POS:**

- `POST /api/scan/lookup` - Find customer by card ID
- `POST /api/scan/{customerId}/transactions` - Add/redeem points

## 🐳 Docker Setup (Alternative)

```bash
# Start entire stack with Docker
docker-compose up --build

# Backend: http://localhost:8080
# Frontend: http://localhost:5173
# Database: localhost:5432
```

## 🔧 Troubleshooting

**Database connection failed:**

- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep qrisma`
- Check credentials in `application.yml`

**Frontend can't connect to backend:**

- Verify backend is running on port 8080
- Check CORS settings in `SecurityConfig.java`
- Ensure `VITE_API_BASE` in `.env` is correct

**Google Wallet errors:**

- Verify service account JSON is valid
- Check Issuer ID matches your Google Wallet account
- Ensure Wallet API is enabled in Google Cloud Console

## 📝 Development

**Run backend tests:**

```bash
cd backend
mvn test
```

**Build for production:**

```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/qrisma-backend-0.1.0.jar

# Frontend
cd frontend
npm run build
npm run preview
```

## 🔐 Security Notes

- **Never commit** `service-account.json` or credentials to Git
- Change default JWT secret in production
- Use HTTPS in production
- Implement rate limiting for public endpoints
- Rotate secrets regularly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🆘 Support

For issues or questions:

- Check existing GitHub issues
- Create a new issue with detailed description
- Include error logs and environment details

---

**Built with ❤️ using Java, React, and Google Wallet**
