# BrandPulse - Containerized Multi-Service Application

This document provides comprehensive instructions for running BrandPulse with Docker containerization.

## 🏗️ Architecture Overview

BrandPulse consists of the following containerized services:

- **Frontend**: React application (Port 3000)
- **Backend**: FastAPI with Google ADK integration (Port 8000)
- **Database API**: Dedicated PostgreSQL API service (Port 8001)
- **Database**: PostgreSQL with full-text search (Port 5432)
- **Redis**: Caching layer (Port 6379)
- **Nginx**: Load balancer (Port 80/443) - Optional for production

## 🚀 Quick Start

### Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- 4GB+ RAM available for containers
- Google API Key (get from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone and Setup

```bash
git clone <repository-url>
cd BrandPulse
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your Google API key
nano .env  # or use your preferred editor
```

**Required Configuration:**
- Set `GOOGLE_API_KEY` with your actual Google API key
- Optionally place `service_account.json` in the `backend/` directory

### 3. Run All Services

**Linux/macOS:**
```bash
# Make script executable
chmod +x run.sh

# Start all services
./run.sh start

# Or simply
./run.sh
```

**Windows:**
```cmd
# Run the batch script
run.bat start

# Or simply
run.bat
```

### 4. Access Services

Once all services are running:

- 🌐 **Frontend**: http://localhost:3000
- 🚀 **Backend API**: http://localhost:8000
- 🗄️ **Database API**: http://localhost:8001
- 📊 **API Documentation**: http://localhost:8000/docs
- 🔍 **DB API Docs**: http://localhost:8001/docs

## 📋 Available Commands

### Using the Run Script

**Linux/macOS (`./run.sh`):**
```bash
./run.sh start          # Start all services
./run.sh stop           # Stop all services
./run.sh restart        # Restart all services
./run.sh status         # Show service status
./run.sh health         # Check service health
./run.sh logs           # Show all logs
./run.sh logs backend   # Show specific service logs
./run.sh build          # Rebuild Docker images
./run.sh clean          # Stop and cleanup everything
./run.sh help           # Show help
```

**Windows (`run.bat`):**
```cmd
run.bat start          # Start all services
run.bat stop           # Stop all services
run.bat restart        # Restart all services
run.bat status         # Show service status
run.bat health         # Check service health
run.bat logs           # Show all logs
run.bat build          # Rebuild Docker images
run.bat clean          # Stop and cleanup everything
run.bat help           # Show help
```

### Using Docker Compose Directly

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Scale specific services
docker-compose up -d --scale backend=2
```

## 🗄️ Database Features

### Automatic Data Management

The system automatically:

1. **Detects Real Data**: Checks if database contains actual product/sentiment data
2. **Falls Back to Mock Data**: Uses dummy data only when database is empty
3. **Seamless Transition**: Switches from mock to real data automatically
4. **Data Persistence**: Maintains data across container restarts

### Database Schema

The PostgreSQL database includes:

- **Products**: Product catalog with full-text search
- **Product Pages**: Related URLs and pages per product
- **Sentiment Analysis**: AI-powered sentiment data with topics/keywords
- **Analytics**: Pre-computed daily analytics for performance
- **Search Index**: Optimized full-text search capabilities

### Sample Data

The system comes with sample data including:
- iPhone 15 Pro, Samsung Galaxy S24, Nike Air Max 270
- MacBook Pro M3, Tesla Model Y, Google Pixel 8 Pro
- Sony WH-1000XM5, Adidas Ultraboost 22, iPad Pro
- Microsoft Surface Laptop 5

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# API Keys
GOOGLE_API_KEY=your_key_here

# Database
POSTGRES_USER=brandpulse_user
POSTGRES_PASSWORD=brandpulse_password
POSTGRES_DB=brandpulse

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DB_API_URL=http://localhost:8001

# Backend
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=info
```

### Service Ports

- **3000**: Frontend (React)
- **8000**: Backend API (FastAPI)
- **8001**: Database API (FastAPI)
- **5432**: PostgreSQL Database
- **6379**: Redis Cache
- **80/443**: Nginx (Production only)

## 🔍 Monitoring and Debugging

### Health Checks

All services include health checks:

```bash
# Check all services
./run.sh health

# Manual health checks
curl http://localhost:8000/health    # Backend
curl http://localhost:8001/health    # Database API
curl http://localhost:3000           # Frontend
```

### Viewing Logs

```bash
# All services
./run.sh logs

# Specific service
./run.sh logs backend
./run.sh logs database
./run.sh logs frontend
./run.sh logs database-api

# Follow logs in real-time
docker-compose logs -f backend
```

### Common Issues

**Service won't start:**
```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Restart with fresh build
./run.sh clean
./run.sh start
```

**Database connection issues:**
```bash
# Check database logs
./run.sh logs database

# Verify database is ready
docker-compose exec database pg_isready -U brandpulse_user

# Reset database
docker-compose down -v
./run.sh start
```

**Google API issues:**
```bash
# Verify API key in .env
grep GOOGLE_API_KEY .env

# Check backend logs for auth errors
./run.sh logs backend
```

## 🚀 Production Deployment

### Using Nginx Profile

```bash
# Start with nginx load balancer
docker-compose --profile production up -d

# Or specify nginx service
docker-compose up -d nginx
```

### SSL Configuration

1. Add SSL certificates to `nginx/ssl/`
2. Update `nginx/nginx.conf` with SSL settings
3. Set environment variables:
   ```bash
   SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
   SSL_KEY_PATH=/etc/nginx/ssl/key.pem
   DOMAIN=yourdomain.com
   ```

### Performance Tuning

**Database:**
```bash
# Increase shared buffers
echo "shared_buffers = 256MB" >> postgresql.conf
echo "effective_cache_size = 1GB" >> postgresql.conf
```

**Backend:**
```bash
# Scale backend instances
docker-compose up -d --scale backend=3
```

**Frontend:**
```bash
# Enable gzip in nginx.conf
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

## 🧪 Development Mode

### Hot Reloading

```bash
# Start with volume mounts for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Database Development

```bash
# Access database directly
docker-compose exec database psql -U brandpulse_user -d brandpulse

# Run migrations
docker-compose exec database-api python -c "import alembic; alembic.upgrade('head')"

# Backup data
docker-compose exec database pg_dump -U brandpulse_user brandpulse > backup.sql
```

## 📊 API Documentation

### Backend API (Port 8000)

- **Interactive Docs**: http://localhost:8000/docs
- **OpenAPI Spec**: http://localhost:8000/openapi.json
- **Health Check**: http://localhost:8000/health

**Key Endpoints:**
- `POST /api/chat` - Chat with AI agent
- `POST /api/analyze/product` - Analyze product sentiment
- `GET /api/chat/history` - Get chat history

### Database API (Port 8001)

- **Interactive Docs**: http://localhost:8001/docs
- **OpenAPI Spec**: http://localhost:8001/openapi.json
- **Health Check**: http://localhost:8001/health

**Key Endpoints:**
- `GET /products` - List products with sentiment
- `GET /sentiment` - Get sentiment analysis data
- `GET /analytics/overview` - Get analytics overview
- `GET /search/products` - Full-text product search

## 🔒 Security Considerations

### Production Security

1. **Change Default Passwords**:
   ```bash
   # Generate secure passwords
   POSTGRES_PASSWORD=$(openssl rand -base64 32)
   ```

2. **Use HTTPS**:
   - Configure SSL certificates
   - Redirect HTTP to HTTPS
   - Use secure headers

3. **Network Security**:
   - Use Docker networks
   - Limit exposed ports
   - Configure firewall rules

4. **API Security**:
   - Implement rate limiting
   - Use API keys for external access
   - Validate all inputs

### Data Privacy

- Sentiment data is stored locally in PostgreSQL
- Google API calls are made server-side only
- No user data is sent to external services without consent

## 🛠️ Troubleshooting

### Container Issues

```bash
# View container status
docker-compose ps

# Restart specific service
docker-compose restart backend

# View resource usage
docker stats

# Clean up unused resources
docker system prune -f
```

### Database Issues

```bash
# Reset database completely
docker-compose down -v
docker volume rm brandpulse_postgres_data
./run.sh start

# Check database connectivity
docker-compose exec backend python -c "
import asyncpg
import asyncio
async def test():
    conn = await asyncpg.connect('postgresql://brandpulse_user:brandpulse_password@database:5432/brandpulse')
    print('Connected successfully')
    await conn.close()
asyncio.run(test())
"
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Check logs for errors
./run.sh logs | grep ERROR

# Optimize database
docker-compose exec database psql -U brandpulse_user -d brandpulse -c "VACUUM ANALYZE;"
```

## 📞 Support

For issues and questions:

1. Check the logs: `./run.sh logs`
2. Verify configuration: `cat .env`
3. Test connectivity: `./run.sh health`
4. Review documentation: This file and API docs
5. Check Docker resources: `docker system df`

## 🎯 Next Steps

After successful deployment:

1. **Configure Google API Key** for full AI functionality
2. **Add Real Data** through the database API endpoints
3. **Set up Monitoring** with logs and health checks
4. **Configure SSL** for production deployment
5. **Scale Services** based on usage patterns

---

**BrandPulse** - Containerized Brand Sentiment Analysis Platform

