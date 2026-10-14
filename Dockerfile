# ==============================================================================
# CardioVision 3D - Multi-Stage Production Dockerfile
# Stage 1: Build modern React + Vite frontend
# Stage 2: Slim Python runtime serving ML models, SQLite/PostgreSQL DB, and static assets
# ==============================================================================

# STAGE 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# Install dependencies with lockfile caching
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build static distribution
COPY frontend/ ./
RUN npm run build

# STAGE 2: Python Production Application Server
FROM python:3.11-slim AS production-runtime

# Set environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend/src \
    PORT=8000 \
    ENVIRONMENT=production

# Install system dependencies (curl for healthcheck, build-essential for any compiled wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root system user for security compliance
RUN groupadd -r appgroup && useradd -r -g appgroup -d /app appuser

# Install Python requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application source and models
COPY backend/src /app/backend/src
COPY backend/models /app/backend/models
COPY backend/data /app/backend/data

# Copy built frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /build/dist /app/frontend/dist

# Ensure appuser owns the data and models directories for SQLite WAL file generation
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose default HTTP port
EXPOSE 8000

# Docker healthcheck pinging the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/api/health || exit 1

# Launch production server with Uvicorn
WORKDIR /app/backend/src
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
