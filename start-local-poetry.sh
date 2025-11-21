#!/bin/bash

# BrandPulse - Local Development with Poetry
# This script starts services locally using Poetry for Python components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Function to print colored messages
print_header() {
    echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_service() {
    echo -e "${MAGENTA}🔹 $1${NC}"
}

# Function to check Poetry installation
check_poetry() {
    if ! command -v poetry &>/dev/null; then
        print_error "Poetry not found. Installing Poetry..."
        ./install-poetry-async.sh
    else
        print_success "Poetry is available"
    fi
}

# Function to setup Poetry environment
setup_poetry_env() {
    print_info "Setting up Poetry environment..."
    
    # Configure Poetry
    poetry config virtualenvs.create true
    poetry config virtualenvs.in-project true
    poetry config installer.parallel true
    
    # Install dependencies if not already installed
    if [ ! -d ".venv" ] || [ ! -f "poetry.lock" ]; then
        print_info "Installing dependencies with Poetry..."
        poetry install --extras "all"
    else
        print_success "Poetry environment already set up"
    fi
}

# Function to start database (Docker)
start_database() {
    print_service "Starting MySQL Database (Docker)"
    
    # Check if database container is running
    if docker ps | grep -q "brandpulse-database"; then
        print_success "Database already running"
    else
        print_info "Starting database container..."
        docker compose up -d database
        
        # Wait for database to be ready
        local max_attempts=30
        local attempt=0
        
        while [ $attempt -lt $max_attempts ]; do
            if docker compose exec -T database mysqladmin ping -h localhost -u brandpulse_user -pbrandpulse_password &>/dev/null; then
                print_success "Database is ready"
                break
            fi
            attempt=$((attempt + 1))
            echo -n "."
            sleep 2
        done
        echo ""
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start"
            exit 1
        fi
    fi
}

# Function to start Redis (Docker)
start_redis() {
    print_service "Starting Redis Cache (Docker)"
    
    if docker ps | grep -q "brandpulse-redis"; then
        print_success "Redis already running"
    else
        print_info "Starting Redis container..."
        docker compose up -d redis
        sleep 3
        print_success "Redis started"
    fi
}

# Function to start backend with Poetry
start_backend() {
    print_service "Starting Backend API (Poetry)"
    
    # Kill existing backend processes
    pkill -f "uvicorn.*backend.main" 2>/dev/null || true
    
    # Start backend with Poetry
    print_info "Starting backend with Poetry..."
    poetry run python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
    local backend_pid=$!
    
    # Wait for backend to start
    sleep 5
    
    if ps -p $backend_pid > /dev/null; then
        print_success "Backend started (PID: $backend_pid)"
        echo $backend_pid > /tmp/brandpulse-backend.pid
    else
        print_error "Failed to start backend"
        exit 1
    fi
}

# Function to start database API with Poetry
start_database_api() {
    print_service "Starting Database API (Poetry)"
    
    # Kill existing database API processes
    pkill -f "uvicorn.*database-api.main" 2>/dev/null || true
    
    # Start database API with Poetry
    print_info "Starting database API with Poetry..."
    cd database-api
    poetry run python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
    local db_api_pid=$!
    cd ..
    
    # Wait for database API to start
    sleep 5
    
    if ps -p $db_api_pid > /dev/null; then
        print_success "Database API started (PID: $db_api_pid)"
        echo $db_api_pid > /tmp/brandpulse-db-api.pid
    else
        print_error "Failed to start database API"
        exit 1
    fi
}

# Function to start frontend (npm)
start_frontend() {
    print_service "Starting Frontend (npm)"
    
    # Kill existing frontend processes
    pkill -f "react-scripts start" 2>/dev/null || true
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_info "Installing npm dependencies..."
        npm install
    fi
    
    # Start frontend
    print_info "Starting React frontend..."
    npm start &
    local frontend_pid=$!
    
    # Wait for frontend to start
    sleep 10
    
    if ps -p $frontend_pid > /dev/null; then
        print_success "Frontend started (PID: $frontend_pid)"
        echo $frontend_pid > /tmp/brandpulse-frontend.pid
    else
        print_error "Failed to start frontend"
        exit 1
    fi
}

# Function to check service health
check_services() {
    print_header "Service Health Check"
    
    # Check backend
    if curl -s http://localhost:8000/health &>/dev/null; then
        print_success "Backend API is healthy (http://localhost:8000)"
    else
        print_error "Backend API is not responding"
    fi
    
    # Check database API
    if curl -s http://localhost:8001/health &>/dev/null; then
        print_success "Database API is healthy (http://localhost:8001)"
    else
        print_error "Database API is not responding"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 &>/dev/null; then
        print_success "Frontend is healthy (http://localhost:3000)"
    else
        print_warning "Frontend may still be starting..."
    fi
}

# Function to display service URLs
display_urls() {
    print_header "Service URLs"
    
    echo -e "${BOLD}${GREEN}🌐 Frontend:${NC} http://localhost:3000"
    echo -e "${BOLD}${GREEN}🚀 Backend API:${NC} http://localhost:8000"
    echo -e "${BOLD}${GREEN}📊 Backend Docs:${NC} http://localhost:8000/docs"
    echo -e "${BOLD}${GREEN}🗄️  Database API:${NC} http://localhost:8001"
    echo -e "${BOLD}${GREEN}📋 DB API Docs:${NC} http://localhost:8001/docs"
    echo -e "${BOLD}${GREEN}🔍 Health Checks:${NC}"
    echo -e "   Backend: http://localhost:8000/health"
    echo -e "   DB API:  http://localhost:8001/health"
    echo ""
}

# Function to stop services
stop_services() {
    print_header "Stopping Services"
    
    # Stop Python services
    if [ -f /tmp/brandpulse-backend.pid ]; then
        local backend_pid=$(cat /tmp/brandpulse-backend.pid)
        kill $backend_pid 2>/dev/null || true
        rm -f /tmp/brandpulse-backend.pid
        print_info "Backend stopped"
    fi
    
    if [ -f /tmp/brandpulse-db-api.pid ]; then
        local db_api_pid=$(cat /tmp/brandpulse-db-api.pid)
        kill $db_api_pid 2>/dev/null || true
        rm -f /tmp/brandpulse-db-api.pid
        print_info "Database API stopped"
    fi
    
    if [ -f /tmp/brandpulse-frontend.pid ]; then
        local frontend_pid=$(cat /tmp/brandpulse-frontend.pid)
        kill $frontend_pid 2>/dev/null || true
        rm -f /tmp/brandpulse-frontend.pid
        print_info "Frontend stopped"
    fi
    
    # Kill any remaining processes
    pkill -f "uvicorn.*backend.main" 2>/dev/null || true
    pkill -f "uvicorn.*database-api.main" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    
    # Stop Docker services
    docker compose down
    
    print_success "All services stopped"
}

# Function to show help
show_help() {
    echo "BrandPulse - Local Development with Poetry"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services locally (default)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Check service status"
    echo "  logs      Show logs (not implemented for local)"
    echo "  help      Show this help message"
    echo ""
    echo "Features:"
    echo "  - Uses Poetry for Python dependency management"
    echo "  - Runs Python services with hot reload"
    echo "  - Uses Docker only for database and Redis"
    echo "  - Faster development iteration"
    echo ""
}

# Main function
main() {
    clear
    print_header "BrandPulse - Local Development with Poetry"
    
    case "${1:-start}" in
        "start")
            check_poetry
            setup_poetry_env
            start_database
            start_redis
            sleep 3
            start_backend
            start_database_api
            start_frontend
            sleep 5
            check_services
            display_urls
            
            print_header "Development Environment Ready!"
            print_success "All services are running in development mode"
            print_info "Python services will auto-reload on file changes"
            print_info "To stop services: $0 stop"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            main start
            ;;
        "status")
            check_services
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
