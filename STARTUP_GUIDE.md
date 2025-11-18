# BrandPulse Startup Guide

## Quick Start

Run the startup script to launch all services:

```bash
./start.sh
```

This script will:
- ✅ Check Docker daemon availability
- ✅ Set up Docker network
- ✅ Build and start all containers
- ✅ Wait for services to be healthy
- ✅ Display port mappings and service URLs
- ✅ Show network information

## What the Script Does

1. **Pre-flight Checks**: Verifies Docker and Docker Compose are available
2. **Container Management**: Stops existing containers if needed (with confirmation)
3. **Service Startup**: Builds and starts all services in the correct order
4. **Health Checks**: Waits for each service to be ready
5. **Information Display**: Shows comprehensive service information

## Service Port Mappings

After running the script, you'll see:

| Service | Host Port | Container Port | Access URL |
|---------|-----------|---------------|------------|
| **Frontend** | 3000 | 80 | http://localhost:3000 |
| **Backend API** | 8000 | 8000 | http://localhost:8000 |
| **Database API** | 8001 | 8002 | http://localhost:8001 |
| **MySQL Database** | 3307 | 3306 | localhost:3307 |
| **Redis** | - | 6379 | Internal only (redis:6379) |
| **Nginx** | 80, 443 | 80, 443 | http://localhost (production profile) |

## Quick Access Links

The script displays clickable URLs:

### Frontend Application
- **Main App**: http://localhost:3000

### Backend API
- **Base URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs

### Database API
- **Base URL**: http://localhost:8001
- **Health Check**: http://localhost:8001/health
- **API Documentation**: http://localhost:8001/docs

### Database
- **Host**: localhost
- **Port**: 3307
- **Database**: brandpulse
- **User**: brandpulse_user
- **Password**: brandpulse_password

## Useful Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database-api
```

### Stop Services
```bash
docker compose down
```

### Restart Services
```bash
docker compose restart
# Or use the script again
./start.sh
```

### Check Service Status
```bash
docker compose ps
```

### Access Container Shell
```bash
# Backend
docker exec -it brandpulse-backend bash

# Database
docker exec -it brandpulse-database mysql -u brandpulse_user -p brandpulse

# Database API
docker exec -it brandpulse-database-api bash
```

## Network Information

All services are connected to the `brandpulse_brandpulse-network` Docker network.

**Internal Service Names** (for container-to-container communication):
- `database` - MySQL database
- `backend` - FastAPI backend
- `database-api` - Database API service
- `frontend` - React frontend
- `redis` - Redis cache

## Troubleshooting

### Port Already in Use
If you see "address already in use" errors:
```bash
# Check what's using the port
lsof -i :PORT_NUMBER
# or
ss -tuln | grep PORT_NUMBER

# Stop the conflicting service or change the port in docker-compose.yml
```

### Services Not Starting
```bash
# Check logs
docker compose logs

# Check container status
docker compose ps

# Restart specific service
docker compose restart SERVICE_NAME
```

### Network Issues
```bash
# Recreate network
docker compose down
docker network prune -f
docker compose up -d
```

### Database Connection Issues
```bash
# Check database logs
docker compose logs database

# Test database connection
docker exec brandpulse-database mysqladmin ping -h localhost -u brandpulse_user -pbrandpulse_password
```

## Production Mode

To start with Nginx load balancer (production profile):
```bash
docker compose --profile production up -d
```

This will also start the Nginx service on ports 80 and 443.

## Environment Variables

The script automatically sets:
- `DOCKER_HOST=unix:///var/run/docker.sock` (uses system Docker socket)

Optional environment variables:
- `GOOGLE_API_KEY` - Google API key (optional, service_account.json is used by default)

## Next Steps

After services are running:
1. Open http://localhost:3000 in your browser
2. Check API documentation at http://localhost:8000/docs
3. Monitor logs with `docker compose logs -f`

Enjoy using BrandPulse! 🚀

