#!/bin/bash

# Database Setup Script for Local Development
# This script sets up the MySQL database for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Configuration
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_USER="brandpulse_user"
MYSQL_PASSWORD="brandpulse_password"
MYSQL_DATABASE="brandpulse"

print_status "Setting up MySQL database for local development..."

# Check if MySQL is installed
if ! command -v mysql >/dev/null 2>&1; then
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
    print_success "Schema imported successfully!"
else
    print_warning "Schema file not found: database/schema.sql"
fi

if [ -f "database/seed_data.sql" ]; then
    print_status "Importing seed data..."
    mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < database/seed_data.sql
    print_success "Seed data imported successfully!"
else
    print_warning "Seed data file not found: database/seed_data.sql"
fi

print_success "Database setup completed!"
print_status "Database: $MYSQL_DATABASE"
print_status "User: $MYSQL_USER"
print_status "Host: $MYSQL_HOST:$MYSQL_PORT"
