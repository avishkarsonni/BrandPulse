#!/bin/bash

# BrandPulse Local Development Script
# This script runs all services locally without Docker for better communication

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
BACKEND_PORT="8000"
DATABASE_API_PORT="8002"
FRONTEND_PORT="3000"
REDIS_PORT="6379"

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready on $host:$port..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to setup MySQL
setup_mysql() {
    print_status "Setting up MySQL database..."
    
    # Check if MySQL is installed
    if ! command_exists mysql; then
        print_error "MySQL is not installed. Please install MySQL first."
        print_status "On Ubuntu/Debian: sudo apt-get install mysql-server"
        print_status "On CentOS/RHEL: sudo yum install mysql-server"
        exit 1
    fi
    
    # Check if MySQL service is running
    if ! systemctl is-active --quiet mysql 2>/dev/null && ! systemctl is-active --quiet mysqld 2>/dev/null; then
        print_warning "MySQL service is not running. Starting MySQL..."
        sudo systemctl start mysql 2>/dev/null || sudo systemctl start mysqld 2>/dev/null || {
            print_error "Failed to start MySQL service. Please start it manually."
            exit 1
        }
    fi
    
    # Create database and user
    print_status "Creating database and user..."
    sudo mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'localhost';
GRANT SUPER ON *.* TO '$MYSQL_USER'@'localhost';
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';
GRANT SUPER ON *.* TO '$MYSQL_USER'@'%';
FLUSH PRIVILEGES;
EOF
    
    # Import schema and seed data
    if [ -f "database/schema.sql" ]; then
        print_status "Importing database schema..."
        mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < database/schema.sql
    fi
    
    if [ -f "database/seed_data.sql" ]; then
        print_status "Importing seed data..."
        mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < database/seed_data.sql
    fi
    
    print_success "MySQL setup completed!"
}

# Function to setup Python virtual environment
setup_python_env() {
    local service_name=$1
    local service_path=$2
    
    print_status "Setting up Python environment for $service_name..."
    
    cd $service_path
    
    # Install dependencies globally (for testing)
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies globally..."
        pip3 install -r requirements.txt --break-system-packages
    fi
    
    cd - > /dev/null
}

# Function to start Redis
start_redis() {
    print_status "Starting Redis..."
    
    if ! command_exists redis-server; then
        print_error "Redis is not installed. Please install Redis first."
        print_status "On Ubuntu/Debian: sudo apt-get install redis-server"
        print_status "On CentOS/RHEL: sudo yum install redis"
        exit 1
    fi
    
    # Check if Redis is already running
    if port_in_use $REDIS_PORT; then
        print_warning "Redis is already running on port $REDIS_PORT"
    else
        # Start Redis in background
        redis-server --port $REDIS_PORT --daemonize yes
        print_success "Redis started on port $REDIS_PORT"
    fi
}

# Function to start Database API
start_database_api() {
    print_status "Starting Database API..."
    
    if port_in_use $DATABASE_API_PORT; then
        print_warning "Port $DATABASE_API_PORT is already in use. Database API may already be running."
        return 0
    fi
    
    setup_python_env "Database API" "database-api"
    
    cd database-api
    
    # Set environment variables
    export DB_HOST=$MYSQL_HOST
    export DB_PORT=$MYSQL_PORT
    export DB_USER=$MYSQL_USER
    export DB_PASSWORD=$MYSQL_PASSWORD
    export DB_NAME=$MYSQL_DATABASE
    export API_PORT=$DATABASE_API_PORT
    
    # Start the service in background
    nohup uvicorn main:app --host 0.0.0.0 --port $DATABASE_API_PORT > ../logs/database-api.log 2>&1 &
    echo $! > ../logs/database-api.pid
    
    cd - > /dev/null
    
    # Wait for service to be ready
    wait_for_service $MYSQL_HOST $DATABASE_API_PORT "Database API"
}

# Function to start Backend
start_backend() {
    print_status "Starting Backend API..."
    
    if port_in_use $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT is already in use. Backend may already be running."
        return 0
    fi
    
    setup_python_env "Backend" "backend"
    
    cd backend
    
    # Set environment variables
    export DB_HOST=$MYSQL_HOST
    export DB_PORT=$MYSQL_PORT
    export DB_USER=$MYSQL_USER
    export DB_PASSWORD=$MYSQL_PASSWORD
    export DB_NAME=$MYSQL_DATABASE
    export GOOGLE_API_KEY=${GOOGLE_API_KEY:-""}
    export CORS_ORIGINS="http://localhost:$FRONTEND_PORT,http://localhost:3001,http://localhost:3002"
    
    # Start the service in background
    nohup uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT > ../logs/backend.log 2>&1 &
    echo $! > ../logs/backend.pid
    
    cd - > /dev/null
    
    # Wait for service to be ready
    wait_for_service $MYSQL_HOST $BACKEND_PORT "Backend API"
}

# Function to start Frontend
start_frontend() {
    print_status "Starting Frontend..."
    
    if port_in_use $FRONTEND_PORT; then
        print_warning "Port $FRONTEND_PORT is already in use. Frontend may already be running."
        return 0
    fi
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        print_status "Visit: https://nodejs.org/en/download/"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        npm install
    fi
    
    # Set environment variables
    export REACT_APP_API_URL="http://localhost:$BACKEND_PORT"
    export REACT_APP_DB_API_URL="http://localhost:$DATABASE_API_PORT"
    export REACT_APP_WS_URL="ws://localhost:$BACKEND_PORT"
    export NODE_ENV="development"
    
    # Start the service in background
    nohup npm start > logs/frontend.log 2>&1 &
    echo $! > logs/frontend.pid
    
    # Wait for service to be ready
    wait_for_service $MYSQL_HOST $FRONTEND_PORT "Frontend"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    
    # Stop services by PID
    for pid_file in logs/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            service_name=$(basename "$pid_file" .pid)
            if kill -0 "$pid" 2>/dev/null; then
                print_status "Stopping $service_name (PID: $pid)..."
                kill "$pid"
                rm "$pid_file"
            fi
        fi
    done
    
    # Stop Redis if it was started by this script
    if pgrep -f "redis-server.*$REDIS_PORT" > /dev/null; then
        print_status "Stopping Redis..."
        pkill -f "redis-server.*$REDIS_PORT"
    fi
    
    print_success "All services stopped!"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo "=================="
    
    # Check MySQL
    if nc -z $MYSQL_HOST $MYSQL_PORT 2>/dev/null; then
        print_success "MySQL: Running on $MYSQL_HOST:$MYSQL_PORT"
    else
        print_error "MySQL: Not running"
    fi
    
    # Check Redis
    if nc -z $MYSQL_HOST $REDIS_PORT 2>/dev/null; then
        print_success "Redis: Running on $MYSQL_HOST:$REDIS_PORT"
    else
        print_error "Redis: Not running"
    fi
    
    # Check Database API
    if nc -z $MYSQL_HOST $DATABASE_API_PORT 2>/dev/null; then
        print_success "Database API: Running on $MYSQL_HOST:$DATABASE_API_PORT"
    else
        print_error "Database API: Not running"
    fi
    
    # Check Backend
    if nc -z $MYSQL_HOST $BACKEND_PORT 2>/dev/null; then
        print_success "Backend API: Running on $MYSQL_HOST:$BACKEND_PORT"
    else
        print_error "Backend API: Not running"
    fi
    
    # Check Frontend
    if nc -z $MYSQL_HOST $FRONTEND_PORT 2>/dev/null; then
        print_success "Frontend: Running on $MYSQL_HOST:$FRONTEND_PORT"
    else
        print_error "Frontend: Not running"
    fi
}

# Function to show logs
show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        print_status "Available log files:"
        ls -la logs/*.log 2>/dev/null || print_warning "No log files found"
        return
    fi
    
    if [ -f "logs/$service.log" ]; then
        print_status "Showing logs for $service:"
        echo "=================="
        tail -f "logs/$service.log"
    else
        print_error "Log file for $service not found"
    fi
}

# Main function
main() {
    # Create logs directory
    mkdir -p logs
    
    case "${1:-start}" in
        "start")
            print_status "Starting BrandPulse services locally..."
            echo "=========================================="
            
             # Setup MySQL (skipped - database already exists)
            print_status "Skipping MySQL setup - database already exists"
            
            # Start Redis
            start_redis
            
            # Start Database API
            start_database_api
            
            # Start Backend
            start_backend
            
            # Start Frontend
            start_frontend
            
            echo ""
            print_success "All services started successfully!"
            echo ""
            show_status
            echo ""
            print_status "Access URLs:"
            echo "  Frontend: http://localhost:$FRONTEND_PORT"
            echo "  Backend API: http://localhost:$BACKEND_PORT"
            echo "  Database API: http://localhost:$DATABASE_API_PORT"
            echo "  MySQL: localhost:$MYSQL_PORT"
            echo "  Redis: localhost:$REDIS_PORT"
            echo ""
            print_status "To stop services: $0 stop"
            print_status "To view logs: $0 logs [service_name]"
            print_status "To check status: $0 status"
            ;;
        "stop")
            stop_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "restart")
            stop_services
            sleep 2
            main start
            ;;
        *)
            echo "Usage: $0 {start|stop|status|logs|restart}"
            echo ""
            echo "Commands:"
            echo "  start   - Start all services (default)"
            echo "  stop    - Stop all services"
            echo "  status  - Show service status"
            echo "  logs    - Show logs for a service"
            echo "  restart - Restart all services"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 logs backend"
            echo "  $0 status"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
add the 