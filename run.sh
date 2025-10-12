#!/bin/bash

# BrandPulse - Run All Services Script
# This script starts all services using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_warning "Docker is not running. Attempting to start Docker..."
        
        # Try to start Docker on different systems
        if command -v systemctl > /dev/null 2>&1; then
            sudo systemctl start docker
            sleep 5
        elif command -v service > /dev/null 2>&1; then
            sudo service docker start
            sleep 5
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            open -a Docker
            print_status "Starting Docker Desktop on macOS..."
            sleep 10
        fi
        
        # Check again
        if ! docker info > /dev/null 2>&1; then
            print_error "Docker is not running and couldn't be started automatically."
            print_error "Please start Docker manually and try again."
            exit 1
        fi
    fi
    print_success "Docker is running"
}

# Function to install system dependencies
install_dependencies() {
    print_status "Checking system dependencies..."
    
    # Check if we're on a supported system
    if command -v apt-get > /dev/null 2>&1; then
        # Ubuntu/Debian
        print_status "Detected Ubuntu/Debian system"
        if ! command -v curl > /dev/null 2>&1; then
            print_status "Installing curl..."
            sudo apt-get update && sudo apt-get install -y curl
        fi
    elif command -v yum > /dev/null 2>&1; then
        # CentOS/RHEL
        print_status "Detected CentOS/RHEL system"
        if ! command -v curl > /dev/null 2>&1; then
            print_status "Installing curl..."
            sudo yum install -y curl
        fi
    elif command -v brew > /dev/null 2>&1; then
        # macOS
        print_status "Detected macOS system"
        if ! command -v curl > /dev/null 2>&1; then
            print_status "Installing curl..."
            brew install curl
        fi
    fi
    
    # Install Docker if not present
    if ! command -v docker > /dev/null 2>&1; then
        print_status "Docker not found. Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        sudo usermod -aG docker $USER
        print_warning "Docker installed. Please log out and back in, then run this script again."
        exit 0
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
        print_status "Docker Compose not found. Installing..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    print_success "All dependencies are ready"
}

# Function to detect installation type
detect_installation_type() {
    local has_containers=false
    local has_images=false
    local has_volumes=false
    
    # Check if containers exist
    if docker compose ps -q 2>/dev/null | grep -q .; then
        has_containers=true
        print_status "Found existing containers"
    fi
    
    # Check if images exist
    if docker images --format "table {{.Repository}}" | grep -q "brandpulse"; then
        has_images=true
        print_status "Found existing images"
    fi
    
    # Check if volumes exist
    if docker volume ls -q | grep -q "brandpulse"; then
        has_volumes=true
        print_status "Found existing volumes"
    fi
    
    if [ "$has_containers" = true ] || [ "$has_images" = true ] || [ "$has_volumes" = true ]; then
        INSTALLATION_TYPE="update"
        print_status "Detected existing installation - will update containers"
    else
        INSTALLATION_TYPE="fresh"
        print_status "Detected fresh installation - will build from scratch"
    fi
}
test_database_connectivity() {
    print_status "Testing database connectivity..."
    
    # Wait for database to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T database pg_isready -U brandpulse_user -d brandpulse > /dev/null 2>&1; then
            print_success "Database is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start after $max_attempts attempts"
            return 1
        fi
        
        print_status "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    # Test database API connectivity
    local db_api_attempts=15
    local db_api_attempt=1
    
    while [ $db_api_attempt -le $db_api_attempts ]; do
        if curl -s http://localhost:8001/health > /dev/null 2>&1; then
            print_success "Database API is ready"
            return 0
        fi
        
        if [ $db_api_attempt -eq $db_api_attempts ]; then
            print_warning "Database API failed to start after $db_api_attempts attempts"
            return 1
        fi
        
        print_status "Waiting for database API... (attempt $db_api_attempt/$db_api_attempts)"
        sleep 2
        db_api_attempt=$((db_api_attempt + 1))
    done
}
check_docker_compose() {
    # Force use of newer docker compose
    if docker compose version > /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
        print_success "Docker Compose is available (using docker compose)"
    elif command -v docker-compose > /dev/null 2>&1; then
        # Test if docker-compose works, if not use docker compose
        if docker-compose version > /dev/null 2>&1; then
            COMPOSE_CMD="docker-compose"
            print_success "Docker Compose is available (using docker-compose)"
        else
            COMPOSE_CMD="docker compose"
            print_success "Docker Compose is available (using docker compose)"
        fi
    else
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
}

# Function to check environment files
check_environment() {
    print_status "Checking environment configuration..."
    
    # Check if .env file exists, if not create from example
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating complete configuration..."
        cat > .env << 'EOF'
# BrandPulse Environment Configuration
GOOGLE_API_KEY=AIzaSyDummy_Key_Replace_With_Real_One
GOOGLE_APPLICATION_CREDENTIALS=/app/service_account.json

# Database Configuration
DATABASE_URL=postgresql://brandpulse_user:brandpulse_password@database:5432/brandpulse
POSTGRES_DB=brandpulse
POSTGRES_USER=brandpulse_user
POSTGRES_PASSWORD=brandpulse_password
POSTGRES_HOST_AUTH_METHOD=md5

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DB_API_URL=http://localhost:8001
REACT_APP_WS_URL=ws://localhost:8000
NODE_ENV=production

# Backend Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:80,http://frontend:80,http://127.0.0.1:3000
LOG_LEVEL=info
API_PORT=8000

# Database API Configuration
DB_API_PORT=8001

# Redis Configuration
REDIS_URL=redis://redis:6379

# Network Configuration
COMPOSE_PROJECT_NAME=brandpulse
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
EOF
        print_warning "Please edit .env file and add your GOOGLE_API_KEY"
        print_warning "Get your API key from: https://aistudio.google.com/app/apikey"
    fi
    
    # Check if Google API key is set
    if grep -q "AIzaSyDummy_Key_Replace_With_Real_One" .env 2>/dev/null; then
        print_warning "GOOGLE_API_KEY not configured in .env file"
        print_warning "The system will work with sample data, but AI features need a real API key"
        print_warning "Get your API key from: https://aistudio.google.com/app/apikey"
    elif [ -f backend/service_account.json ]; then
        print_success "Google Service Account authentication configured"
        print_success "Using service account: adk-api-server@truxtsaas.iam.gserviceaccount.com"
    else
        print_warning "Google authentication not properly configured"
    fi
    
    # Check if service account file exists
    if [ ! -f backend/service_account.json ]; then
        print_warning "service_account.json not found in backend/ directory"
        print_warning "Creating placeholder - you can use either API key or service account authentication"
        echo '{"type": "service_account", "project_id": "placeholder"}' > backend/service_account.json
    else
        print_success "Google Service Account file found and ready"
    fi
}

# Function to detect installation type
detect_installation_type() {
    local has_containers=false
    local has_images=false
    local has_volumes=false
    
    # Check if containers exist
    if docker compose ps -q 2>/dev/null | grep -q .; then
        has_containers=true
        print_status "Found existing containers"
    fi
    
    # Check if images exist
    if docker images --format "table {{.Repository}}" | grep -q "brandpulse"; then
        has_images=true
        print_status "Found existing images"
    fi
    
    # Check if volumes exist
    if docker volume ls -q | grep -q "brandpulse"; then
        has_volumes=true
        print_status "Found existing volumes"
    fi
    
    if [ "$has_containers" = true ] || [ "$has_images" = true ] || [ "$has_volumes" = true ]; then
        INSTALLATION_TYPE="update"
        print_status "Detected existing installation - will update containers"
    else
        INSTALLATION_TYPE="fresh"
        print_status "Detected fresh installation - will build from scratch"
    fi
}

# Function to build images intelligently
build_images() {
    print_status "Building Docker images..."
    
    if [ "$INSTALLATION_TYPE" = "fresh" ]; then
        print_status "Fresh installation: Building all images from scratch..."
        $COMPOSE_CMD build --no-cache
    else
        print_status "Update installation: Rebuilding only changed images..."
        # Pull latest base images first
        $COMPOSE_CMD pull --ignore-buildable || true
        
        # Build with cache for faster updates
        $COMPOSE_CMD build
        
        # Clean up unused images to save space
        docker image prune -f >/dev/null 2>&1 || true
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting BrandPulse services..."
    
    # Start database first
    print_status "Starting database..."
    $COMPOSE_CMD up -d database
    
    # Wait for database to be ready with better testing
    test_database_connectivity
    if [ $? -ne 0 ]; then
        print_error "Failed to start database properly"
        exit 1
    fi
    
    # Start database API
    print_status "Starting database API..."
    $COMPOSE_CMD up -d database-api
    
    # Wait for database API to be ready
    sleep 5
    
    # Start backend
    print_status "Starting backend..."
    $COMPOSE_CMD up -d backend
    
    # Wait for backend to be ready
    sleep 5
    
    # Start frontend
    print_status "Starting frontend..."
    $COMPOSE_CMD up -d frontend
    
    # Start optional services
    print_status "Starting Redis cache..."
    $COMPOSE_CMD up -d redis
    
    print_success "All services started successfully!"
    
    # Final connectivity test
    print_status "Performing final connectivity tests..."
    sleep 10
    check_health
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    $COMPOSE_CMD ps
    
    echo ""
    print_status "Service URLs:"
    echo "  🌐 Frontend:     http://localhost:3000"
    echo "  🚀 Backend API:  http://localhost:8000"
    echo "  🗄️  Database API: http://localhost:8001"
    echo "  📊 API Docs:     http://localhost:8000/docs"
    echo "  🔍 DB API Docs:  http://localhost:8001/docs"
    echo "  🗃️  Database:     localhost:5432"
    echo "  ⚡ Redis:        localhost:6379"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Check database
    if curl -s http://localhost:8001/health > /dev/null; then
        print_success "Database API is healthy"
        
        # Test actual database connection
        response=$(curl -s http://localhost:8001/analytics/overview)
        if echo "$response" | grep -q "total_products"; then
            print_success "Database contains real data - frontend will use live data"
        else
            print_warning "Database is empty - frontend will use sample data"
        fi
    else
        print_error "Database API is not responding"
    fi
    
    # Check backend
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Backend API is healthy"
    else
        print_error "Backend API is not responding"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping BrandPulse services..."
    $COMPOSE_CMD down
    print_success "All services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    $COMPOSE_CMD down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show logs
show_logs() {
    if [ -n "$1" ]; then
        print_status "Showing logs for $1..."
        $COMPOSE_CMD logs -f "$1"
    else
        print_status "Showing logs for all services..."
        $COMPOSE_CMD logs -f
    fi
}

# Function to restart specific service
restart_service() {
    if [ -n "$1" ]; then
        print_status "Restarting $1..."
        $COMPOSE_CMD restart "$1"
        print_success "$1 restarted"
    else
        print_error "Please specify a service name"
        echo "Available services: database, database-api, backend, frontend, redis"
    fi
}

# Function to show help
show_help() {
    echo "BrandPulse - Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services (default)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show service status"
    echo "  health    Check service health"
    echo "  logs      Show logs for all services"
    echo "  logs <service>  Show logs for specific service"
    echo "  build     Build Docker images"
    echo "  clean     Stop services and clean up"
    echo "  restart-service <name>  Restart specific service"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Start all services"
    echo "  $0 start              # Start all services"
    echo "  $0 logs backend       # Show backend logs"
    echo "  $0 restart-service frontend  # Restart frontend"
    echo "  $0 clean              # Clean up everything"
}

# Main script logic
main() {
    echo "🔥 BrandPulse - Multi-Service Docker Management"
    echo "================================================"
    
    # Check and install prerequisites
    install_dependencies
    check_docker
    check_docker_compose
    check_environment
    
    # Detect installation type for intelligent handling
    detect_installation_type
    
    # Handle commands
    case "${1:-start}" in
        "start")
            build_images
            start_services
            show_status
            echo ""
            print_success "🎉 BrandPulse is now running!"
            echo ""
            print_status "📊 Access your application:"
            echo "  🌐 Frontend:     http://localhost:3000"
            echo "  🚀 Backend API:  http://localhost:8000/docs"
            echo "  🗄️  Database API: http://localhost:8001/docs"
            echo "  🗃️  Database:     localhost:5433 (PostgreSQL)"
            echo ""
            print_status "📋 Management commands:"
            echo "  $0 logs      # View all logs"
            echo "  $0 health    # Check service health"
            echo "  $0 stop      # Stop all services"
            echo "  $0 update    # Update existing installation"
            echo "  $0 fresh     # Fresh install (removes all data)"
            ;;
        "update")
            INSTALLATION_TYPE="update"
            print_status "🔄 Updating existing BrandPulse installation..."
            build_images
            start_services
            show_status
            print_success "✅ BrandPulse updated successfully!"
            ;;
        "fresh")
            INSTALLATION_TYPE="fresh"
            print_status "🆕 Fresh BrandPulse installation..."
            clean_services
            build_images
            start_services
            show_status
            print_success "✅ BrandPulse installed fresh successfully!"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            start_services
            show_status
            ;;
        "status")
            show_status
            ;;
        "health")
            check_health
            ;;
        "logs")
            show_logs "$2"
            ;;
        "build")
            build_images
            ;;
        "clean")
            cleanup
            ;;
        "restart-service")
            restart_service "$2"
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
