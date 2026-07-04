# AIMS (Aggregator Intelligence & Monitoring System)

A comprehensive, enterprise-grade operations dashboard for Lyca Mobile's telecom aggregator network. Built with modern technologies for real-time monitoring, fraud detection, and geospatial analytics.

## Prerequisites
- Python 3.11+ (recommended 3.11.16 or 3.12.x)
- PostgreSQL 15+ with PostGIS extension for geospatial support
- Node.js 18+
- AWS/GCP/Azure account for production deployment

### Windows-specific setup
- Install **Python 3.11.16** or **3.12.x** and create a fresh virtual environment.
- Run `python -m pip install --upgrade pip setuptools wheel` before installing packages.
- Install **Visual Studio Build Tools** with the **C++ build tools** option if you encounter wheel compilation issues.
- Avoid Python 3.14 on Windows for this repo because `pydantic-core` and other native dependencies may require a Windows linker (`link.exe`) that is not installed by default.

## Backend Deployment

### 1. Set Environment Variables
Create `.env` file:
```
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/aims
SECRET_KEY=your-super-secret-key-here
```

### 2. Install Dependencies
```bash
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For testing
```

### 3. Run Migrations
```bash
alembic upgrade head
```

### 4. Run Tests
```bash
pytest
```

### 5. Start Server
```bash
uvicorn app.main:socket_app --host 0.0.0.0 --port 8000
```

## Frontend Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Production
```bash
npm run build
```

### 3. Serve Static Files
Use nginx or similar to serve the `build` folder.

## Security Checklist
- Change SECRET_KEY in production
- Use HTTPS everywhere
- Restrict CORS origins
- Enable database backups
- Monitor logs for anomalies
- Use environment-specific configs

## Monitoring
- Set up logging to external service (e.g., ELK stack)
- Monitor API performance
- Alert on fraud detections