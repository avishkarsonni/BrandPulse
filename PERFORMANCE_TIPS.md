# Performance Optimization Tips

## Startup Time Issues

If startup is taking too long, here are the optimizations applied and additional tips:

## Optimizations Already Applied

1. **Skip Build on Subsequent Runs**: Images are only built if they don't exist
2. **Faster Health Checks**: Reduced wait times from 60s to 15s per service
3. **Shorter Check Intervals**: Reduced from 2s to 1s between checks
4. **Smart Restart**: If containers are already running, just restart them instead of full rebuild
5. **Quick Mode**: Use `--quick` flag to skip builds entirely

## Usage Options

### Standard Startup (Recommended)
```bash
./start.sh
```
- Checks health of all services
- Waits for services to be ready
- Shows comprehensive information

### Quick Startup (Fastest)
```bash
./start-quick.sh
# or
./start.sh --quick --skip-wait
```
- Skips health checks
- No waiting for services
- Starts containers immediately
- Use when you know services are working

### Skip Wait Only
```bash
./start.sh --skip-wait
```
- Starts containers normally
- Skips health check waiting
- Services may still be starting

## Common Slowdown Causes

### 1. Building Docker Images
**Problem**: First run or when images need rebuilding
**Solution**: 
- Images are cached after first build
- Use `--quick` flag to skip builds
- Only rebuild when code changes: `docker compose build`

### 2. Database Initialization
**Problem**: MySQL takes time to initialize on first run
**Solution**: 
- First run: ~30-60 seconds
- Subsequent runs: ~5-10 seconds
- Database data is persisted in volumes

### 3. Large Image Downloads
**Problem**: Downloading base images for the first time
**Solution**:
- One-time download, then cached
- Pre-pull images: `docker compose pull`

### 4. Health Check Timeouts
**Problem**: Services taking longer than expected
**Solution**:
- Use `--skip-wait` to start immediately
- Check logs: `docker compose logs SERVICE_NAME`
- Services may still work even if health check times out

## Performance Benchmarks

### First Run (Cold Start)
- Image builds: 2-5 minutes
- Database init: 30-60 seconds
- Service startup: 10-20 seconds
- **Total: ~3-7 minutes**

### Subsequent Runs (Warm Start)
- No builds: 0 seconds
- Database ready: 5-10 seconds
- Service startup: 5-10 seconds
- **Total: ~10-20 seconds**

### Quick Mode (Skip Checks)
- Container start: 2-5 seconds
- **Total: ~2-5 seconds**

## Tips for Faster Development

1. **Keep Containers Running**: Don't stop containers between development sessions
   ```bash
   # Just restart when needed
   docker compose restart
   ```

2. **Use Volume Mounts**: Code changes are reflected immediately (no rebuild needed)
   - Backend: `./backend:/app` (already configured)
   - Frontend: Rebuild only when dependencies change

3. **Skip Frontend Build**: For backend-only development
   ```bash
   docker compose up -d database backend database-api
   ```

4. **Parallel Startup**: Services start in parallel where possible
   - Database starts first (required)
   - Backend and Database-API start in parallel
   - Frontend starts last

5. **Monitor Startup**: Watch logs to see what's taking time
   ```bash
   docker compose logs -f
   ```

## Troubleshooting Slow Startup

### Check What's Taking Time
```bash
# Time the startup
time ./start.sh

# Check container startup times
docker compose ps

# Check logs for errors
docker compose logs | grep -i error
```

### Common Issues

1. **Port Conflicts**: Another service using the port
   ```bash
   lsof -i :8000  # Check what's using port 8000
   ```

2. **Disk Space**: Low disk space slows Docker
   ```bash
   docker system df  # Check Docker disk usage
   docker system prune  # Clean up (careful!)
   ```

3. **Resource Limits**: Docker not getting enough resources
   - Check Docker Desktop settings
   - Increase memory/CPU allocation

4. **Network Issues**: Slow network for image pulls
   - Use local registry
   - Pre-pull images during off-hours

## Quick Commands Reference

```bash
# Fastest startup (no checks, no builds)
./start-quick.sh

# Standard startup with health checks
./start.sh

# Just start, don't wait
./start.sh --skip-wait

# Restart existing containers (fastest)
docker compose restart

# Check what's running
docker compose ps

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

## Expected Startup Times

| Scenario | Time | Notes |
|----------|------|-------|
| First run (cold) | 3-7 min | Includes image builds |
| Subsequent runs | 10-20 sec | Images cached |
| Quick mode | 2-5 sec | No health checks |
| Restart existing | 2-3 sec | Containers already exist |

If startup is consistently slower than these benchmarks, check:
- Docker resource allocation
- Disk I/O performance
- Network speed (for image pulls)
- System resources (CPU/RAM)

