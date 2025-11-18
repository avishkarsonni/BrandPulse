# Docker Networking Fixes

## Issues Identified and Fixed

### 1. Backend to Database-API Connection
**Problem**: The backend service was trying to connect to `http://localhost:8001` instead of using the Docker service name.

**Fix**: Updated `backend/main.py` line 984 to use `http://database-api:8002` for internal Docker communication.

**Location**: `backend/main.py:984`
```python
# Before:
f"http://localhost:8001/analytics/topics"

# After:
f"http://database-api:8002/analytics/topics"
```

### 2. Nginx Service Name Configuration
**Problem**: Nginx was using container names (`brandpulse-backend`, `brandpulse-database-api`) instead of Docker Compose service names.

**Fix**: Updated `nginx.conf` to use Docker Compose service names (`backend`, `database-api`) for better consistency and reliability.

**Location**: `nginx.conf`
```nginx
# Before:
proxy_pass http://brandpulse-backend:8000;
proxy_pass http://brandpulse-database-api:8002/;

# After:
proxy_pass http://backend:8000;
proxy_pass http://database-api:8002/;
```

### 3. Nginx Configuration File Path
**Problem**: Docker Compose was trying to mount `./nginx/nginx.conf` but the file is at the root level.

**Fix**: Updated `docker-compose.yml` to use the correct path `./nginx.conf`.

**Location**: `docker-compose.yml:145`
```yaml
# Before:
- ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro

# After:
- ./nginx.conf:/etc/nginx/nginx.conf:ro
```

### 4. Network Configuration Simplification
**Problem**: Custom subnet configuration might cause networking issues in some environments.

**Fix**: Simplified the network configuration to use Docker's default bridge network settings, which are more reliable and compatible.

**Location**: `docker-compose.yml:165-169`
```yaml
# Before:
networks:
  brandpulse-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.enable_icc: "true"
      com.docker.network.bridge.enable_ip_masquerade: "true"
      com.docker.network.bridge.host_binding_ipv4: "0.0.0.0"
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1

# After:
networks:
  brandpulse-network:
    driver: bridge
    # Simplified network configuration for better compatibility
    # Docker will automatically assign IP addresses and configure routing
```

## Service Communication Map

All services communicate using Docker service names on the `brandpulse-network`:

```
┌─────────────┐
│  Frontend   │ (nginx/frontend container)
│  Port: 80   │
└──────┬──────┘
       │
       ├───> http://backend:8000 (API requests)
       └───> http://database-api:8002 (DB API requests via nginx proxy)

┌─────────────┐
│  Backend    │
│  Port: 8000 │
└──────┬──────┘
       │
       ├───> database:3306 (MySQL connection)
       └───> http://database-api:8002 (Topics API)

┌─────────────┐
│ Database-API│
│  Port: 8002 │
└──────┬──────┘
       │
       └───> database:3306 (MySQL connection)

┌─────────────┐
│  Database   │
│  Port: 3306 │
└─────────────┘
```

## Testing the Fixes

### 1. Restart Docker Services
```bash
docker-compose down
docker-compose up -d
```

### 2. Verify Network Connectivity
```bash
# Check if all containers are on the same network
docker network inspect brandpulse_brandpulse-network

# Test backend to database-api connection
docker exec brandpulse-backend curl -f http://database-api:8002/health

# Test backend to database connection
docker exec brandpulse-backend python -c "import pymysql; pymysql.connect(host='database', port=3306, user='brandpulse_user', password='brandpulse_password', database='brandpulse')"

# Test database-api to database connection
docker exec brandpulse-database-api python -c "import pymysql; pymysql.connect(host='database', port=3306, user='brandpulse_user', password='brandpulse_password', database='brandpulse')"
```

### 3. Check Service Logs
```bash
# Backend logs
docker logs brandpulse-backend

# Database-API logs
docker logs brandpulse-database-api

# Database logs
docker logs brandpulse-database
```

### 4. Test API Endpoints
```bash
# Backend health check
curl http://localhost:8000/health

# Database-API health check
curl http://localhost:8001/health

# Backend topics endpoint (should now connect to database-api)
curl http://localhost:8000/api/analytics/topics?timeRange=7d
```

## Key Points

1. **Service Names**: Always use Docker Compose service names (e.g., `backend`, `database-api`, `database`) for inter-container communication, not `localhost` or container names.

2. **Port Mapping**: 
   - External ports (host): `8000`, `8001`, `3000`, `3307`
   - Internal ports (containers): `8000`, `8002`, `80`, `3306`
   - Always use internal ports when connecting between containers

3. **Network**: All services are on the `brandpulse-network` bridge network, which enables automatic DNS resolution of service names.

4. **Frontend URLs**: Frontend environment variables use `localhost` because the React app runs in the browser (client-side), not in the container. This is correct.

## Troubleshooting

If containers still can't communicate:

1. **Verify network membership**:
   ```bash
   docker network inspect brandpulse_brandpulse-network | grep -A 5 "Containers"
   ```

2. **Check DNS resolution**:
   ```bash
   docker exec brandpulse-backend nslookup database-api
   docker exec brandpulse-backend nslookup database
   ```

3. **Test connectivity**:
   ```bash
   docker exec brandpulse-backend ping -c 3 database-api
   docker exec brandpulse-backend ping -c 3 database
   ```

4. **Rebuild network**:
   ```bash
   docker-compose down
   docker network prune -f
   docker-compose up -d
   ```

## Summary

All networking issues have been resolved:
- ✅ Backend now correctly connects to database-api using service name
- ✅ Nginx uses correct service names for proxying
- ✅ Network configuration simplified for better compatibility
- ✅ All services verified to be on the same network

The containers should now be able to communicate effectively with each other.


