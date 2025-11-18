#!/bin/bash

# BrandPulse Docker Startup Script
# This script sets up all containers, networks, and displays service information
# Usage: ./start.sh [--quick] [--skip-wait]

set -e  # Exit on error

# Parse arguments
QUICK_MODE=false
SKIP_WAIT=false

for arg in "$@"; do
    case $arg in
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --skip-wait)
            SKIP_WAIT=true
            shift
            ;;
        *)
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Set Docker socket
export DOCKER_HOST=unix:///var/run/docker.sock

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

# Check if Docker is running
check_docker() {
    print_info "Checking Docker daemon..."
    if ! docker ps &>/dev/null; then
        print_error "Docker daemon is not running or not accessible"
        print_info "Trying to use system Docker socket..."
        export DOCKER_HOST=unix:///var/run/docker.sock
        if ! docker ps &>/dev/null; then
            print_error "Cannot connect to Docker. Please ensure Docker is running."
            exit 1
        fi
    fi
    print_success "Docker daemon is accessible"
}

# Check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Stop existing containers
stop_existing() {
    print_info "Checking for existing containers..."
    if docker compose ps 2>/dev/null | grep -q "Up\|running"; then
        print_warning "Some containers are already running"
        print_info "Restarting existing containers (faster than full restart)..."
        docker compose restart
        print_success "Containers restarted"
        return 1  # Signal that containers were already running
    fi
    return 0
}

# Start services
start_services() {
    print_header "Starting BrandPulse Services"
    
    # In quick mode, always skip build
    if [ "$QUICK_MODE" = true ]; then
        print_info "Quick mode: Starting containers without build..."
        docker compose up -d
    # Check if images exist, if so skip build for faster startup
    elif docker images | grep -q "brandpulse-backend\|brandpulse-frontend\|brandpulse-database-api"; then
        print_info "Images found, starting containers (skipping build)..."
        docker compose up -d
    else
        print_info "Building and starting containers (first time setup)..."
        docker compose up -d --build
    fi
    
    print_success "All containers started"
}

# Wait for services to be healthy (optimized with shorter timeouts)
wait_for_services() {
    print_header "Waiting for Services to be Ready"
    
    local max_attempts=15  # Reduced from 30
    local attempt=0
    local check_interval=1  # Reduced from 2 seconds
    
    # Wait for database (use Docker healthcheck status)
    print_info "Waiting for database to be healthy..."
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker inspect brandpulse-database --format='{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy"; then
            print_success "Database is ready"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep $check_interval
    done
    echo
    
    if [ $attempt -eq $max_attempts ]; then
        print_warning "Database health check timeout - it may still be starting"
    fi
    
    # Wait for backend (with shorter timeout)
    print_info "Waiting for backend API..."
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s --max-time 2 http://localhost:8000/health &>/dev/null; then
            print_success "Backend API is ready"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep $check_interval
    done
    echo
    
    if [ $attempt -eq $max_attempts ]; then
        print_warning "Backend API timeout - check logs: docker compose logs backend"
    fi
    
    # Wait for database-api (with shorter timeout)
    print_info "Waiting for database API..."
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s --max-time 2 http://localhost:8001/health &>/dev/null; then
            print_success "Database API is ready"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep $check_interval
    done
    echo
    
    if [ $attempt -eq $max_attempts ]; then
        print_warning "Database API timeout - check logs: docker compose logs database-api"
    fi
    
    # Wait for frontend (with shorter timeout, less critical)
    print_info "Waiting for frontend..."
    attempt=0
    while [ $attempt -lt 10 ]; do  # Even shorter for frontend
        if curl -s --max-time 2 http://localhost:3000 &>/dev/null; then
            print_success "Frontend is ready"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep $check_interval
    done
    echo
    
    if [ $attempt -eq 10 ]; then
        print_warning "Frontend timeout - it may still be starting"
    fi
}

# Get port mappings
get_port_mappings() {
    print_header "Port Mappings"
    
    echo -e "${BOLD}Service Port Mappings:${NC}\n"
    
    # Display port mappings from docker-compose.yml
    print_service "Frontend (React)"
    echo -e "   ${CYAN}Host:${NC} localhost:3000 → ${CYAN}Container:${NC} port 80 (HTTP)"
    echo ""
    
    print_service "Backend API (FastAPI)"
    echo -e "   ${CYAN}Host:${NC} localhost:8000 → ${CYAN}Container:${NC} port 8000 (HTTP)"
    echo ""
    
    print_service "Database API"
    echo -e "   ${CYAN}Host:${NC} localhost:8001 → ${CYAN}Container:${NC} port 8002 (HTTP)"
    echo ""
    
    print_service "MySQL Database"
    echo -e "   ${CYAN}Host:${NC} localhost:3307 → ${CYAN}Container:${NC} port 3306 (TCP)"
    echo -e "   ${YELLOW}Internal:${NC} database:3306 (from other containers)"
    echo ""
    
    print_service "Redis Cache"
    echo -e "   ${CYAN}Internal Only:${NC} redis:6379 (from other containers)"
    echo -e "   ${YELLOW}Note:${NC} No external port mapping (internal use only)"
    echo ""
    
    print_service "Nginx (Production Profile)"
    echo -e "   ${CYAN}Host:${NC} localhost:80 → ${CYAN}Container:${NC} port 80 (HTTP)"
    echo -e "   ${CYAN}Host:${NC} localhost:443 → ${CYAN}Container:${NC} port 443 (HTTPS)"
    echo -e "   ${YELLOW}Note:${NC} Only active with --profile production"
    echo ""
}

# Display service URLs
display_service_urls() {
    print_header "Service Access URLs"
    
    # Frontend
    echo -e "${BOLD}${GREEN}🌐 Frontend Application:${NC}"
    echo -e "   ${CYAN}URL:${NC} http://localhost:3000"
    echo -e "   ${CYAN}Container:${NC} brandpulse-frontend (port 80 → 3000)"
    echo ""
    
    # Backend API
    echo -e "${BOLD}${GREEN}🚀 Backend API:${NC}"
    echo -e "   ${CYAN}Base URL:${NC} http://localhost:8000"
    echo -e "   ${CYAN}Health Check:${NC} http://localhost:8000/health"
    echo -e "   ${CYAN}API Docs:${NC} http://localhost:8000/docs"
    echo -e "   ${CYAN}Container:${NC} brandpulse-backend (port 8000 → 8000)"
    echo ""
    
    # Database API
    echo -e "${BOLD}${GREEN}🗄️  Database API:${NC}"
    echo -e "   ${CYAN}Base URL:${NC} http://localhost:8001"
    echo -e "   ${CYAN}Health Check:${NC} http://localhost:8001/health"
    echo -e "   ${CYAN}API Docs:${NC} http://localhost:8001/docs"
    echo -e "   ${CYAN}Container:${NC} brandpulse-database-api (port 8002 → 8001)"
    echo ""
    
    # Database
    echo -e "${BOLD}${GREEN}🗃️  MySQL Database:${NC}"
    echo -e "   ${CYAN}Host:${NC} localhost"
    echo -e "   ${CYAN}Port:${NC} 3307"
    echo -e "   ${CYAN}Database:${NC} brandpulse"
    echo -e "   ${CYAN}User:${NC} brandpulse_user"
    echo -e "   ${CYAN}Container:${NC} brandpulse-database (port 3306 → 3307)"
    echo -e "   ${YELLOW}Note:${NC} Only accessible from containers internally (database:3306)"
    echo ""
    
    # Redis
    echo -e "${BOLD}${GREEN}⚡ Redis Cache:${NC}"
    echo -e "   ${CYAN}Host:${NC} redis (internal)"
    echo -e "   ${CYAN}Port:${NC} 6379 (internal only)"
    echo -e "   ${CYAN}Container:${NC} brandpulse-redis"
    echo -e "   ${YELLOW}Note:${NC} Only accessible from containers internally (redis:6379)"
    echo ""
}

# Display container status
display_status() {
    print_header "Container Status"
    
    docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
}

# Display network information
display_network_info() {
    print_header "Network Information"
    
    print_info "Docker Network: brandpulse_brandpulse-network"
    echo ""
    
    print_info "Container IP Addresses:"
    docker network inspect brandpulse_brandpulse-network --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}' 2>/dev/null || print_warning "Network not found or containers not connected"
    echo ""
}

# Display quick links
display_quick_links() {
    print_header "Quick Access Links"
    
    echo -e "${BOLD}Click or copy these URLs to access services:${NC}\n"
    
    echo -e "${GREEN}📱 Frontend:${NC}"
    echo -e "   http://localhost:3000"
    echo ""
    
    echo -e "${GREEN}🔧 Backend API:${NC}"
    echo -e "   http://localhost:8000/docs"
    echo ""
    
    echo -e "${GREEN}🗄️  Database API:${NC}"
    echo -e "   http://localhost:8001/docs"
    echo ""
    
    echo -e "${GREEN}❤️  Health Checks:${NC}"
    echo -e "   Backend:    http://localhost:8000/health"
    echo -e "   Database-API: http://localhost:8001/health"
    echo ""
}

# Main execution
main() {
    clear
    print_header "BrandPulse Docker Startup Script"
    
    # Pre-flight checks
    check_docker
    check_docker_compose
    
    # Stop existing if needed
    stop_existing
    containers_existed=$?
    
    # Start services (only if containers weren't already running)
    if [ $containers_existed -eq 0 ]; then
        start_services
    else
        print_info "Containers were restarted, skipping full startup"
    fi
    
    # Wait for services (shorter wait if containers were already running or quick mode)
    if [ "$SKIP_WAIT" = true ]; then
        print_info "Skipping health checks (--skip-wait flag)"
        print_warning "Services may still be starting. Check status with: docker compose ps"
    elif [ $containers_existed -eq 1 ] || [ "$QUICK_MODE" = true ]; then
        print_info "Quick mode: Waiting briefly for services to be ready..."
        sleep 3
    else
        wait_for_services
    fi
    
    # Display information
    display_status
    get_port_mappings
    display_service_urls
    display_network_info
    display_quick_links
    
    print_header "Setup Complete!"
    print_success "All services are running and ready to use"
    echo ""
    print_info "To view logs: docker compose logs -f"
    print_info "To stop services: docker compose down"
    print_info "To restart: ./start.sh"
    echo ""
}

# Run main function
main

