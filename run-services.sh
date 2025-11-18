#!/bin/bash

# BrandPulse Services Runner
# Checks database status and starts services accordingly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_USER="brandpulse_user"
MYSQL_PASSWORD="brandpulse_password"
MYSQL_DATABASE="brandpulse"
BACKEND_PORT="8003"
DATABASE_API_PORT="8002"
FRONTEND_PORT="3000"

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

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to check if MySQL is running and accessible
check_database() {
    print_status "Checking database status..."
    
    # Check if MySQL service is running
    if ! systemctl is-active --quiet mysql && ! systemctl is-active --quiet mysqld; then
        print_error "MySQL service is not running. Please start MySQL first:"
        echo "  sudo systemctl start mysql"
        echo "  or"
        echo "  sudo systemctl start mysqld"
        return 1
    fi
    
    # Test database connection
    if mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1;" $MYSQL_DATABASE >/dev/null 2>&1; then
        print_success "Database is running and accessible"
        
        # Check if tables exist
        TABLE_COUNT=$(mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE';" $MYSQL_DATABASE 2>/dev/null | tail -1)
        
        if [ "$TABLE_COUNT" -gt 0 ]; then
            print_success "Database schema is present ($TABLE_COUNT tables)"
            return 0
        else
            print_warning "Database exists but no tables found. Schema may need to be imported."
            return 1
        fi
    else
        print_error "Cannot connect to database. Please check:"
        echo "  - MySQL service is running"
        echo "  - Database '$MYSQL_DATABASE' exists"
        echo "  - User '$MYSQL_USER' has proper permissions"
        echo "  - Password is correct"
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_port() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=0
    
    print_status "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -lt $max_attempts ]; do
        if port_in_use $port; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo ""
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to start Database API
start_database_api() {
    print_status "Starting Database API..."
    if port_in_use $DATABASE_API_PORT; then
        print_warning "Port $DATABASE_API_PORT is already in use. Database API may already be running."
        return 0
    fi

    cd database-api

    # Set environment variables for local MySQL
    export DB_HOST=$MYSQL_HOST
    export DB_PORT=$MYSQL_PORT
    export DB_USER=$MYSQL_USER
    export DB_PASSWORD=$MYSQL_PASSWORD
    export DB_NAME=$MYSQL_DATABASE

    # Start the service in background
    nohup uvicorn main:app --host 0.0.0.0 --port $DATABASE_API_PORT > ../logs/database-api.log 2>&1 &
    echo $! > ../logs/database-api.pid

    cd - > /dev/null

    # Wait for service to be ready
    wait_for_port $DATABASE_API_PORT "Database API"
}

# Function to start Backend
start_backend() {
    print_status "Starting Backend API..."
    if port_in_use $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT is already in use. Backend API may already be running."
        return 0
    fi

    cd backend

    # Set environment variables for local MySQL and ADK
    export DB_HOST=$MYSQL_HOST
    export DB_PORT=$MYSQL_PORT
    export DB_USER=$MYSQL_USER
    export DB_PASSWORD=$MYSQL_PASSWORD
    export DB_NAME=$MYSQL_DATABASE
    
    # Set Google ADK environment variables
    export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/service_account.json"
    export GOOGLE_PROJECT_ID="truxtsaas"
    export GOOGLE_CLIENT_EMAIL="adk-api-server@truxtsaas.iam.gserviceaccount.com"
    export AGENT_NAME="BrandPulse_Assistant"
    export AGENT_MODEL="gemini-2.0-flash-exp"

    # Start the service in background
    nohup uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT > ../logs/backend.log 2>&1 &
    echo $! > ../logs/backend.pid

    cd - > /dev/null

    # Wait for service to be ready
    wait_for_port $BACKEND_PORT "Backend API"
}

# Function to start Frontend
start_frontend() {
    print_status "Starting Frontend..."
    if port_in_use $FRONTEND_PORT; then
        print_warning "Port $FRONTEND_PORT is already in use. Frontend may already be running."
        return 0
    fi

    # Set environment variables for frontend
    export REACT_APP_API_URL=http://localhost:$BACKEND_PORT
    export REACT_APP_DB_API_URL=http://localhost:$DATABASE_API_PORT

    # Start the service in background
    nohup npm start > logs/frontend.log 2>&1 &
    echo $! > logs/frontend.pid

    # Wait for service to be ready
    wait_for_port $FRONTEND_PORT "Frontend"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    
    # Stop services by PID files
    for service in database-api backend frontend; do
        if [ -f "logs/$service.pid" ]; then
            local pid=$(cat logs/$service.pid)
            if kill -0 $pid 2>/dev/null; then
                print_status "Stopping $service (PID: $pid)..."
                kill $pid
                rm -f logs/$service.pid
            fi
        fi
    done
    
    # Also kill any remaining processes
    pkill -f "uvicorn.*main:app" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    
    print_success "All services stopped"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo "=================="
    
    # Check database
    if check_database >/dev/null 2>&1; then
        echo -e "Database: ${GREEN}✓ Running${NC}"
    else
        echo -e "Database: ${RED}✗ Not accessible${NC}"
    fi
    
    # Check services
    for service in "Database API:$DATABASE_API_PORT" "Backend API:$BACKEND_PORT" "Frontend:$FRONTEND_PORT"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        if port_in_use $port; then
            echo -e "$name: ${GREEN}✓ Running on port $port${NC}"
        else
            echo -e "$name: ${RED}✗ Not running${NC}"
        fi
    done
}

# Function to test API endpoints
test_apis() {
    print_status "Testing API endpoints..."
    
    # Test Database API
    if curl -s http://localhost:$DATABASE_API_PORT/health >/dev/null 2>&1; then
        print_success "Database API health check passed"
    else
        print_error "Database API health check failed"
    fi
    
    # Test Backend API
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        print_success "Backend API health check passed"
    else
        print_error "Backend API health check failed"
    fi
    
    # Test Frontend
    if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend is not accessible"
    fi
}

# Main function
main() {
    # Create logs directory
    mkdir -p logs
    
    case "${1:-start}" in
        "start")
            print_status "Starting BrandPulse services..."
            echo "======================================"
            
            # Check database first
            if ! check_database; then
                print_error "Database check failed. Please fix database issues before starting services."
                echo ""
                print_status "To set up the database, run:"
                echo "  ./setup-database.sh"
                exit 1
            fi
            
            echo ""
            
            # Start services
            start_database_api
            echo ""
            start_backend
            echo ""
            start_frontend
            echo ""
            
            print_success "All services started successfully!"
            echo ""
            show_status
            echo ""
            test_apis
            echo ""
            print_status "Access URLs:"
            echo "  Frontend: http://localhost:$FRONTEND_PORT"
            echo "  Backend API: http://localhost:$BACKEND_PORT"
            echo "  Database API: http://localhost:$DATABASE_API_PORT"
            echo ""
            print_status "To stop services: $0 stop"
            print_status "To check status: $0 status"
            ;;
        "stop")
            stop_services
            ;;
        "status")
            show_status
            echo ""
            test_apis
            ;;
        "restart")
            stop_services
            sleep 2
            main start
            ;;
        *)
            echo "Usage: $0 {start|stop|status|restart}"
            echo ""
            echo "Commands:"
            echo "  start   - Start all services (default)"
            echo "  stop    - Stop all services"
            echo "  status  - Show service status"
            echo "  restart - Restart all services"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 status"
            ;;
    esac
}

# Run main function with all arguments
main "$@"
