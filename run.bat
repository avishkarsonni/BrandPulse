@echo off
REM BrandPulse - Run All Services Script (Windows)
REM This script starts all services using Docker Compose

setlocal enabledelayedexpansion

REM Colors for output (Windows doesn't support colors in batch easily, so we'll use echo)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

echo.
echo 🔥 BrandPulse - Multi-Service Docker Management
echo ================================================

REM Function to check if Docker is running
echo %INFO% Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker is not running. Please start Docker and try again.
    exit /b 1
)
echo %SUCCESS% Docker is running

REM Function to check if docker-compose is available
echo %INFO% Checking Docker Compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo %ERROR% Docker Compose is not available. Please install Docker Compose.
        exit /b 1
    ) else (
        set "COMPOSE_CMD=docker compose"
    )
) else (
    set "COMPOSE_CMD=docker-compose"
)
echo %SUCCESS% Docker Compose is available

REM Function to check environment files
echo %INFO% Checking environment configuration...
if not exist .env (
    if exist backend\env_example.txt (
        echo %WARNING% .env file not found. Creating from example...
        copy backend\env_example.txt .env >nul
        echo %WARNING% Please edit .env file and add your GOOGLE_API_KEY
    ) else (
        echo %WARNING% Creating default .env file...
        (
            echo # BrandPulse Environment Configuration
            echo GOOGLE_API_KEY=your_google_api_key_here
            echo DATABASE_URL=postgresql://brandpulse_user:brandpulse_password@database:5432/brandpulse
            echo POSTGRES_DB=brandpulse
            echo POSTGRES_USER=brandpulse_user
            echo POSTGRES_PASSWORD=brandpulse_password
            echo REACT_APP_API_URL=http://localhost:8000
            echo NODE_ENV=production
            echo LOG_LEVEL=info
        ) > .env
        echo %WARNING% Please edit .env file and add your GOOGLE_API_KEY
    )
)

REM Check if Google API key is set
findstr /C:"your_google_api_key_here" .env >nul 2>&1
if not errorlevel 1 (
    echo %WARNING% GOOGLE_API_KEY not configured in .env file
    echo %WARNING% Get your API key from: https://aistudio.google.com/app/apikey
)

REM Check if service account file exists
if not exist backend\service_account.json (
    echo %WARNING% service_account.json not found in backend\ directory
    echo %WARNING% You can use either API key or service account authentication
)

REM Handle commands
set "command=%~1"
if "%command%"=="" set "command=start"

if "%command%"=="start" goto start
if "%command%"=="stop" goto stop
if "%command%"=="restart" goto restart
if "%command%"=="status" goto status
if "%command%"=="health" goto health
if "%command%"=="logs" goto logs
if "%command%"=="build" goto build
if "%command%"=="clean" goto clean
if "%command%"=="help" goto help
if "%command%"=="-h" goto help
if "%command%"=="--help" goto help

echo %ERROR% Unknown command: %command%
goto help

:start
echo %INFO% Building Docker images...
%COMPOSE_CMD% build --no-cache
if errorlevel 1 (
    echo %ERROR% Failed to build images
    exit /b 1
)
echo %SUCCESS% Docker images built successfully

echo %INFO% Starting BrandPulse services...

echo %INFO% Starting database...
%COMPOSE_CMD% up -d database
timeout /t 10 /nobreak >nul

echo %INFO% Starting database API...
%COMPOSE_CMD% up -d database-api
timeout /t 5 /nobreak >nul

echo %INFO% Starting backend...
%COMPOSE_CMD% up -d backend
timeout /t 5 /nobreak >nul

echo %INFO% Starting frontend...
%COMPOSE_CMD% up -d frontend

echo %INFO% Starting Redis cache...
%COMPOSE_CMD% up -d redis

echo %SUCCESS% All services started successfully!
goto status_display

:stop
echo %INFO% Stopping BrandPulse services...
%COMPOSE_CMD% down
echo %SUCCESS% All services stopped
goto end

:restart
echo %INFO% Restarting services...
%COMPOSE_CMD% down
timeout /t 2 /nobreak >nul
goto start

:status
:status_display
echo %INFO% Service Status:
%COMPOSE_CMD% ps
echo.
echo %INFO% Service URLs:
echo   🌐 Frontend:     http://localhost:3000
echo   🚀 Backend API:  http://localhost:8000
echo   🗄️  Database API: http://localhost:8001
echo   📊 API Docs:     http://localhost:8000/docs
echo   🔍 DB API Docs:  http://localhost:8001/docs
echo   🗃️  Database:     localhost:5432
echo   ⚡ Redis:        localhost:6379
goto end

:health
echo %INFO% Checking service health...
curl -s http://localhost:8001/health >nul 2>&1
if not errorlevel 1 (
    echo %SUCCESS% Database API is healthy
) else (
    echo %ERROR% Database API is not responding
)

curl -s http://localhost:8000/health >nul 2>&1
if not errorlevel 1 (
    echo %SUCCESS% Backend API is healthy
) else (
    echo %ERROR% Backend API is not responding
)

curl -s http://localhost:3000 >nul 2>&1
if not errorlevel 1 (
    echo %SUCCESS% Frontend is healthy
) else (
    echo %ERROR% Frontend is not responding
)
goto end

:logs
if not "%~2"=="" (
    echo %INFO% Showing logs for %~2...
    %COMPOSE_CMD% logs -f %~2
) else (
    echo %INFO% Showing logs for all services...
    %COMPOSE_CMD% logs -f
)
goto end

:build
echo %INFO% Building Docker images...
%COMPOSE_CMD% build --no-cache
echo %SUCCESS% Docker images built successfully
goto end

:clean
echo %INFO% Cleaning up Docker resources...
%COMPOSE_CMD% down -v --remove-orphans
docker system prune -f
echo %SUCCESS% Cleanup completed
goto end

:help
echo BrandPulse - Docker Management Script
echo.
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   start     Start all services (default)
echo   stop      Stop all services
echo   restart   Restart all services
echo   status    Show service status
echo   health    Check service health
echo   logs      Show logs for all services
echo   logs ^<service^>  Show logs for specific service
echo   build     Build Docker images
echo   clean     Stop services and clean up
echo   help      Show this help message
echo.
echo Examples:
echo   %~nx0                    # Start all services
echo   %~nx0 start              # Start all services
echo   %~nx0 logs backend       # Show backend logs
echo   %~nx0 clean              # Clean up everything
goto end

:end
echo.
if "%command%"=="start" (
    echo %SUCCESS% BrandPulse is now running!
    echo %INFO% Use '%~nx0 logs' to view logs
    echo %INFO% Use '%~nx0 stop' to stop all services
)
pause

