# DocInsight AI

> **AI-powered document analysis platform** for automated risk assessment, classification, and intelligent Q&A of legal and business documents.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai)](https://openai.com/)

---

## Overview

**DocInsight AI** is a full-stack web application that leverages **OpenAI's GPT models** to provide intelligent document analysis, helping users quickly understand, classify, and assess risks in legal contracts, business documents, and formal agreements. Built with a **microservices architecture** using **.NET**, **FastAPI**, and **React**, the system demonstrates modern enterprise patterns including JWT authentication, Entity Framework Core ORM, and asynchronous AI processing.

### Key Features

- **AI-Powered Analysis**
  - Automated document summarization in Polish (5-sentence executive summary)
  - Intelligent document classification with category tagging
  - Risk assessment with severity scoring (low/medium/high) for legal clauses
  
- **Interactive Document Chat**
  - Ask questions about uploaded documents and get context-aware answers
  - Cites relevant fragments from the source text
  - Powered by OpenAI Chat Completions API

- **Advanced Metrics & Visualizations**
  - Keyword frequency analysis (legal risk indicators)
  - Readability metrics (word count, average sentence length)
  - Top word extraction and thematic analysis

- **Secure Authentication & Data Management**
  - JWT-based authentication with ASP.NET Identity
  - User-specific document storage with metadata tracking
  - Document upload and parsing (PDF support via PyMuPDF)

- **Performance Optimizations**
  - Response caching with SHA-256 hashing for repeat queries
  - Retry mechanism with exponential backoff for API reliability
  - Asynchronous processing throughout the stack

---

## Architecture

DocInsight AI follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                       │
│                      (Vite + React 19)                      │
│              UI Components, State Management                │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP/JSON
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    .NET Backend (API Gateway)               │
│                     ASP.NET Core 8.0                        │
│   • JWT Authentication   • Entity Framework Core            │
│   • SQL Server Database  • Swagger/OpenAPI                  │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP Proxy
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Python AI Microservice (FastAPI)               │
│   • OpenAI GPT Integration   • PDF Parsing (PyMuPDF)        │
│   • spaCy NLP (pl_core_news_sm)   • Custom Metrics          │
└─────────────────────────────────────────────────────────────┘
```

### Why This Stack?

- **.NET Backend**: Chosen for enterprise-grade authentication, ORM capabilities (Entity Framework Core), and robust API design with built-in Swagger documentation
- **FastAPI Microservice**: Optimal for AI/ML workloads with async support, minimal boilerplate, and excellent performance for Python-based OpenAI SDK integration
- **React Frontend**: Modern declarative UI with Vite for lightning-fast development experience and optimized production builds
- **SQL Server**: Relational database for structured user and document metadata with full ACID compliance

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI framework |
| Vite | 7.0.0 | Build tool & dev server |
| React Icons | 5.5.0 | Icon library |

### Backend (.NET)
| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 8.0 | Core framework |
| ASP.NET Core | 8.0 | Web API framework |
| Entity Framework Core | 9.0.9 | ORM & database migrations |
| SQL Server | - | Relational database |
| JWT Bearer | 8.0.16 | Token-based authentication |
| Swashbuckle | 6.6.2 | OpenAPI/Swagger documentation |

### AI Microservice (Python)
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.116.0 | Async web framework |
| OpenAI | 2.14.0 | GPT API client |
| PyMuPDF | 1.26.3 | PDF text extraction |
| spaCy | 3.8.7 | NLP for Polish language |
| Pydantic | 2.11.7 | Data validation |
| Uvicorn | 0.35.0 | ASGI server |

---

## Getting Started

### Quick Start Checklist

Before you begin, make sure you have:

- [ ] **Node.js** >= 18.x installed ([Download](https://nodejs.org/))
- [ ] **Python** >= 3.10 installed ([Download](https://www.python.org/downloads/))
- [ ] **.NET SDK** >= 8.0 installed ([Download](https://dotnet.microsoft.com/download))
- [ ] **Visual Studio 2022** (recommended) or VS Code with C# extension
- [ ] **SQL Server LocalDB** (included with VS 2022) or SQL Server Express
- [ ] **OpenAI API Key** ([Create account & get key](https://platform.openai.com/api-keys))
- [ ] **Git** for cloning the repository

---

### Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.10
- **.NET SDK** >= 8.0
- **Visual Studio 2022** (recommended) or Visual Studio Code
- **SQL Server** (LocalDB or full instance)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/DocInsightAI.git
cd DocInsightAI
```

#### 2. Backend Setup (.NET)

```bash
cd backend/DocInsightApi

# Restore dependencies
dotnet restore
```

##### 2.1. Configure Database Connection

The project uses **SQL Server LocalDB** by default. `appsettings.json` already contains:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=DocInsightDb;Trusted_Connection=True;MultipleActiveResultSets=true"
}
```

**Options:**

- **LocalDB (Recommended for development)**: Already configured, no changes needed
  - Installed with Visual Studio 2022
  - Verify it's running: `sqllocaldb info MSSQLLocalDB`
  
- **SQL Server Express/Full**: Update connection string in `appsettings.Development.json`:
  ```json
  {
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost;Database=DocInsightDb;User Id=your_user;Password=your_password;"
    }
  }
  ```

- **Azure SQL / Cloud**: Update accordingly with your cloud connection string

##### 2.2. Configure JWT Secret Key

**IMPORTANT**: `appsettings.json` in the repository contains a **placeholder** JWT key for security reasons.

Create `appsettings.Development.json` (already gitignored) with your **real secret key**:

```json
{
  "Jwt": {
    "Key": "your-super-secret-jwt-key-min-32-characters-long-for-security"
  }
}
```

**Generate a secure key** (PowerShell):
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Or (Bash/Linux):
```bash
openssl rand -base64 64
```

**Why?**
- `appsettings.json` is committed to Git (public)
- `appsettings.Development.json` overrides it locally (gitignored, private)
- In production, use **environment variables** or **Azure Key Vault**

##### 2.3. Configure Python Microservice URL (Optional)

Default is `http://127.0.0.1:8000`. If running Python service on a different port, update in `appsettings.Development.json`:

```json
{
  "PythonMicroserviceUrl": "http://localhost:8001"
}
```

##### 2.4. Apply Database Migrations

The project includes 3 migrations:
1. `InitDb` - Creates Documents table
2. `MakeUserIdNullable` - Allows documents without users (optional)
3. `AddIdentity` - Adds ASP.NET Identity tables (Users, Roles, Claims, etc.)

Run migrations to create the database:

```bash
# Install EF Core CLI tools (if not already installed)
dotnet tool install --global dotnet-ef

# Apply all migrations
dotnet ef database update

# Verify database was created
dotnet ef database list
```

**Expected output**: Database `DocInsightDb` created with tables:
- `AspNetUsers`, `AspNetRoles`, `AspNetUserClaims`, etc. (Identity)
- `Documents` (your app data)

**Troubleshooting migrations:**
```bash
# If migrations fail, check connection:
dotnet ef database drop     # Deletes DB ⚠️
dotnet ef database update   # Recreate

# View applied migrations:
dotnet ef migrations list
```

##### 2.5. Run the API

```bash
dotnet run
```

**Outputs:**
- API available at: `https://localhost:5001` or `http://localhost:5000`
- Swagger UI: `https://localhost:5001/swagger`

**First-time setup checklist:**
- SQL Server LocalDB running ✅
- `appsettings.Development.json` created with real JWT key ✅
- Migrations applied (`dotnet ef database update`) ✅
- Python microservice running on port 8000 ✅

#### 3. AI Microservice Setup (Python)

```bash
cd parser-AI-service

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

##### 3.1. Configure OpenAI API

Create a `.env` file in `parser-AI-service/` directory:

```bash
# Create .env file
touch .env  # Windows: type nul > .env
```

Add your OpenAI credentials:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```

**How to get your API key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key (keep it secret!)
3. Copy and paste into `.env`

**Model options:**
- `gpt-4o-mini` (Recommended) - Fast, cheap, excellent for Polish
- `gpt-4o` - More capable, 2-3x slower, higher cost
- `gpt-3.5-turbo` - Cheapest, but worse Polish support

**Cost awareness ⚠️:**
- gpt-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output
- First API call requires billing enabled in OpenAI account
- Monitor usage: https://platform.openai.com/usage

##### 3.2. Download spaCy Language Model

The service uses `pl_core_news_sm` for Polish NLP (keyword extraction, tokenization):

```bash
# Download Polish language model
python -m spacy download pl_core_news_sm

# Verify installation
python -c "import spacy; nlp = spacy.load('pl_core_news_sm'); print('spaCy model loaded ✅')"
```

**If download fails:**
```bash
# Install directly from URL (included in requirements.txt)
pip install https://github.com/explosion/spacy-models/releases/download/pl_core_news_sm-3.8.0/pl_core_news_sm-3.8.0-py3-none-any.whl
```

##### 3.3. Run the Service

```bash
uvicorn main:app --reload --port 8000
```

**Outputs:**
- Service available at: `http://localhost:8000`
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

**Verify it's working:**
```bash
# Health check
curl http://localhost:8000
# Expected: {"status":"ok","service":"parser-service"}
```

**Environment Variables Summary:**
| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `OPENAI_API_KEY` | Yes ✅ | - | `sk-proj-...` |
| `OPENAI_MODEL` | Yes ✅ | - | `gpt-4o-mini` |

#### 4. Frontend Setup (React)

```bash
cd frontend/docinsight-client

# Install dependencies
npm install

# Configure API endpoint if needed
# Update src/config.js or .env with your .NET API URL

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

### Verify Complete Setup

Once all three services are running, test the full stack:

#### 1. **Test Backend API** (Port 5001)
```bash
# Health check
curl https://localhost:5001/swagger

# Expected: Swagger UI opens in browser
```

#### 2. **Test Python AI Service** (Port 8000)
```bash
# Health check
curl http://localhost:8000

# Expected: {"status":"ok","service":"parser-service"}

# Test OpenAI connection
curl -X POST http://localhost:8000/analyze/summary \
  -H "Content-Type: application/json" \
  -d '{"text":"Test document", "max_length":100}'

# Expected: JSON response with summary (confirms OpenAI API works)
```

#### 3. **Test Frontend** (Port 5173)
- Open browser: http://localhost:5173
- Register new account
- Upload a PDF document
- View analysis results

**Success indicators:**
- Backend Swagger UI loads ✅
- Python service returns `{"status":"ok"}` ✅
- Frontend loads without console errors ✅
- Can register/login ✅
- Can upload and analyze documents ✅

---

### Security Notes for Production

**Never commit these files to Git:**
- `appsettings.Development.json` (contains real JWT key)
- `parser-AI-service/.env` (contains OpenAI API key)
- Connection strings with passwords

**Production recommendations:**
1. Use **Azure Key Vault**, **AWS Secrets Manager**, or **HashiCorp Vault** for secrets
2. Rotate JWT keys regularly
3. Use **managed identities** for database connections (Azure SQL, etc.)
4. Enable **rate limiting** on API endpoints
5. Add **API authentication** between .NET and Python services
6. Use **HTTPS everywhere** in production

---

## Project Structure

```
DocInsightAI/
├── backend/
│   └── DocInsightApi/              # .NET Web API
│       ├── Controllers/            # API endpoints (Auth, Analyze, Upload, Documents, Chat)
│       ├── Models/                 # Entity models (ApplicationUser, Document)
│       ├── Data/                   # DbContext and migrations
│       ├── DTOs/                   # Data Transfer Objects
│       ├── Program.cs              # Application entry point
│       ├── appsettings.json        # Configuration (DB, JWT, microservice URL)
│       └── DocInsightApi.csproj
│
├── parser-AI-service/              # FastAPI AI Microservice
│   ├── main.py                     # FastAPI app entry point
│   ├── analyzer.py                 # Core AI analysis logic (OpenAI integration)
│   ├── metrics.py                  # Text analysis metrics (word count, risk scoring)
│   ├── parsers/
│   │   └── pdf_parser.py           # PDF text extraction (PyMuPDF)
│   ├── requirements.txt
│   └── .env                        # OpenAI API key (gitignored)
│
├── frontend/
│   └── docinsight-client/          # React SPA
│       ├── src/
│       │   ├── components/
│       │   │   ├── auth/           # Login/Register components
│       │   │   ├── dashboard/      # Document list & management
│       │   │   ├── analysis/       # Upload, analysis report, chat UI
│       │   │   └── ui/             # Shared UI components
│       │   ├── App.jsx             # Main app component
│       │   └── main.jsx            # React entry point
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

---

## Configuration Files Reference

### appsettings.json (Backend - Already in Repo)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=DocInsightDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "ENTER_YOUR_32_CHARACTER_SECRET_KEY_HERE",  // Placeholder only ⚠️
    "Issuer": "DocInsight",
    "Audience": "DocInsightUsers",
    "ExpireHours": 12
  },
  "PythonMicroserviceUrl": "http://127.0.0.1:8000"
}
```

### appsettings.Development.json (Create Locally - Gitignored)

**Location:** `backend/DocInsightApi/appsettings.Development.json`

```json
{
  "Jwt": {
    "Key": "Zf8kP2mN7vQ1xR9sT4uW6yE3oI5aS7dG9hJ2kL4nM8pB1cV6xZ3rT5yU7iO0qW2e"
  }
}
```

> This file **overrides** values from `appsettings.json` in Development environment. 
> The JWT key above is an **example** - generate your own!

### .env (Python Service - Create Locally - Gitignored)

**Location:** `parser-AI-service/.env`

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini

# Optional: Custom timeout (default: 60s)
# OPENAI_TIMEOUT=90
```

### .env.example

**Location:** `parser-AI-service/.env.example`

```env
# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your_api_key_here

# Recommended models:
# - gpt-4o-mini (fast, cheap, good for Polish)
# - gpt-4o (most capable, slower, expensive)
# - gpt-3.5-turbo (cheapest, worse Polish support)
OPENAI_MODEL=gpt-4o-mini
```

---

## API Documentation

### .NET Backend Endpoints

#### Authentication
```http
POST /auth/register
POST /auth/login
```

#### Document Management
```http
GET    /documents              # Get user's documents
GET    /documents/{id}         # Get specific document
DELETE /documents/{id}         # Delete document
```

#### Document Upload & Parsing
```http
POST /upload                   # Upload PDF, returns parsed text
```

#### AI Analysis (Proxy to Python service)
```http
POST /analyze/summary          # Generate document summary
POST /analyze/classification   # Classify document type & categories
POST /analyze/risk            # Assess legal risks & score
```

#### Interactive Chat
```http
POST /chat                     # Ask questions about document
```

### Python AI Service Endpoints

```http
GET  /                         # Health check
POST /parse                    # Extract text from PDF
POST /analyze/summary          # AI-powered summarization
POST /analyze/classification   # AI-powered classification
POST /analyze/risk            # AI-powered risk analysis
POST /chat                     # Document Q&A
```

Full interactive API documentation available at:
- **.NET API**: `https://localhost:5001/swagger`
- **Python Service**: `http://localhost:8000/docs`

---

## Key Implementation Details

### AI Integration Strategy

The system uses **OpenAI's Chat Completions API** with carefully engineered prompts.

**Optimizations Applied:**
- Response caching with SHA-256 hash keys to reduce API costs
- JSON extraction with regex fallback for malformed responses
- Retry logic with exponential backoff (3 attempts, 5-15s delay)
- Context truncation (16,000 chars max) to fit token limits

### Security Best Practices

- **JWT tokens** with configurable expiry and signing keys
- **Password hashing** via ASP.NET Identity with PBKDF2
- **CORS configuration** to prevent unauthorized origins
- **Environment variables** for sensitive data (API keys, connection strings)
- **Input validation** with Pydantic models and .NET DTOs

### Database Schema

```sql
Users
  - Id (PK)
  - UserName, Email, PasswordHash
  - ... (ASP.NET Identity fields)

Documents
  - Id (PK)
  - Title, UploadedAt
  - TextContent, OriginalFileName, FilePath
  - UserId (FK -> Users)
```

*Migrations managed via Entity Framework Core*

---

## Features in Detail

### 1. Document Risk Assessment

The risk analysis module combines:
- **AI-driven analysis**: GPT identifies concerning clauses (e.g., unilateral termination, penalties)
- **Keyword frequency**: Tracks legal risk indicators (`wypowiedzenie`, `kara`, `zrzeczenie`)
- **Severity scoring**: Weighted calculation based on:
  - Number of high-severity risks × 3
  - Medium severity risks × 2
  - Keyword density relative to document length
  
**Output**: Risk score (0-100) + detailed breakdown with explanations

### 2. Document Classification

Uses **few-shot learning** via system prompts:
- Identifies document type (contract, invoice, legal notice, etc.)
- Extracts thematic categories (finance, real estate, employment, etc.)
- Detects document language

**Use Case**: Automatic routing in document management systems

### 3. Interactive Chat

Implements **retrieval-augmented generation (RAG)**:
- User uploads document → text extracted & stored
- User asks question → context + question sent to GPT
- Model cites specific fragments in response
- Supports follow-up questions with conversation context

---

## Contributing

This is a portfolio project, but feedback and suggestions are welcome!

---

## Troubleshooting

### Common Issues

**1. Database connection fails**

```
Microsoft.Data.SqlClient.SqlException: Cannot open database "DocInsightDb"
```

**Solutions:**
- Verify SQL Server LocalDB is installed: `sqllocaldb info`
- Start LocalDB instance: `sqllocaldb start MSSQLLocalDB`
- Check connection string in `appsettings.json` matches your SQL Server
- Ensure migrations were applied: `dotnet ef database update`
- For full SQL Server, update connection string with correct credentials

**2. JWT Authentication fails / "IDX10503: Signature validation failed"**

```
IDX10503: Signature validation failed. Keys tried: '[PII is hidden]'
```

**Cause:** JWT secret key mismatch or too short

**Solution:**
- Ensure `appsettings.Development.json` exists with a valid JWT key
- Key must be **at least 32 characters** (256 bits for HS256)
- Generate secure key:
  ```bash
  openssl rand -base64 64
  ```
- Restart the .NET application after changing the key

**3. OpenAI API errors**

**Error: `AuthenticationError: Incorrect API key provided`**
- Check `.env` file exists in `parser-AI-service/`
- Verify API key starts with `sk-proj-` or `sk-`
- Ensure no extra spaces or quotes in `.env` file
- Create new key at: https://platform.openai.com/api-keys

**Error: `RateLimitError: You exceeded your current quota`**
- Your OpenAI account has no credits
- Add payment method: https://platform.openai.com/account/billing
- Check usage: https://platform.openai.com/usage

**Error: `InvalidRequestError: The model 'gpt-4' does not exist`**
- Model name typo in `.env` file
- Check available models: https://platform.openai.com/docs/models
- Use `gpt-4o-mini` instead of `gpt-4` (different naming)

**4. CORS errors in browser**

```
Access to fetch at 'https://localhost:5001/api/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
- Verify `.NET backend is running` on port 5001
- Check `Program.cs` has `app.UseCors("AllowAll")`
- For production, restrict CORS to specific origins in `appsettings.json`

**5. Python dependencies installation fails**

**Error: `Failed building wheel for spacy`**

**Solutions:**
- **Windows:** Install [Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- **Linux:** Install build essentials: `sudo apt-get install build-essential python3-dev`
- **Mac:** Install Xcode Command Line Tools: `xcode-select --install`
- Use Python 3.10+ (spaCy 3.8 requirement)

**Error: `Can't find model 'pl_core_news_sm'`**

**Solution:**
```bash
# Download model manually
python -m spacy download pl_core_news_sm

# Or install from URL (already in requirements.txt)
pip install https://github.com/explosion/spacy-models/releases/download/pl_core_news_sm-3.8.0/pl_core_news_sm-3.8.0-py3-none-any.whl
```

**6. Migrations conflict after pulling updates**

**Error: `The migration '20250921142736_AddIdentity' has already been applied`**

**Solution:**
```bash
# Reset database (deletes all data ⚠️)
dotnet ef database drop --force
dotnet ef database update

# Or: Revert to specific migration
dotnet ef database update PreviousMigrationName
```

**7. Port already in use**

**Error: `Unable to bind to https://localhost:5001`**

**Solution:**
```bash
# Find process using the port (Windows)
netstat -ano | findstr :5001

# Kill process (replace PID)
taskkill /PID <process_id> /F

# Or change port in launchSettings.json
# backend/DocInsightApi/Properties/launchSettings.json
```

**8. Frontend can't connect to backend**

**Error in browser console:** `Failed to fetch`

**Checklist:**
1. Backend running? → `curl https://localhost:5001/swagger`
2. Python service running? → `curl http://localhost:8000`
3. Update frontend API URLs (check `src/config.js` or `src/services/api.js`)
4. HTTPS certificate trusted? (accept self-signed cert in browser)

---

### Environment-Specific Configuration

**Development (Default):**
- `appsettings.Development.json` overrides `appsettings.json`
- .NET automatically uses `Development` when running in Visual Studio

**Production:**
- Set environment variable: `ASPNETCORE_ENVIRONMENT=Production`
- Create `appsettings.Production.json` with production values
- Use environment variables for secrets (Azure App Service, Docker, etc.):
  ```bash
  export ConnectionStrings__DefaultConnection="Server=prod-server;..."
  export Jwt__Key="production-secret-key"
  ```

**Verify current environment:**
```bash
# In .NET app
dotenv --version
echo $ASPNETCORE_ENVIRONMENT   # Linux/Mac
echo %ASPNETCORE_ENVIRONMENT%  # Windows
```

---

## Author

**Your Name**
- GitHub: [@Adask3s](https://github.com/Adask3s)
- Email: adam.kopystecki@gmail.com

---
