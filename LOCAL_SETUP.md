# BrandPulse Local Development Setup

This guide explains how to run BrandPulse services locally without Docker for better communication and debugging.

## Prerequisites

Before running the local setup, ensure you have the following installed:

### Required Software
- **MySQL 8.0+** - Database server
- **Python 3.8+** - For backend services
- **Node.js 16+** - For frontend
- **npm** - Node package manager
- **Redis** - Caching server (optional but recommended)

### Installation Commands

#### Ubuntu/Debian
```bash
# MySQL
sudo apt-get update
sudo apt-get install mysql-server

# Python (usually pre-installed)
sudo apt-get install python3 python3-pip python3-venv

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Redis
sudo apt-get install redis-server
```

#### CentOS/RHEL
```bash
# MySQL
sudo yum install mysql-server

# Python
sudo yum install python3 python3-pip

# Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Redis
sudo yum install redis
```

## Quick Start

1. **Setup Database**
   ```bash
   ./setup-database.sh
   ```

2. **Start All Services**
   ```bash
   ./run-local.sh start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database API: http://localhost:8001

## Service Management

### Start Services
```bash
./run-local.sh start
```

### Stop Services
```bash
./run-local.sh stop
```

### Restart Services
```bash
./run-local.sh restart
```

### Check Status
```bash
./run-local.sh status
```

### View Logs
```bash
# View all available logs
./run-local.sh logs

# View specific service logs
./run-local.sh logs backend
./run-local.sh logs database-api
./run-local.sh logs frontend
```

## Service Configuration

### Database Configuration
- **Host**: localhost
- **Port**: 3306
- **Database**: brandpulse
- **User**: brandpulse_user
- **Password**: brandpulse_password

### Service Ports
- **Frontend**: 3000
- **Backend API**: 8000
- **Database API**: 8001
- **Redis**: 6379

### Environment Variables
The services use the following environment variables (configured in `local-config.env`):

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=brandpulse_user
DB_PASSWORD=brandpulse_password
DB_NAME=brandpulse

# Service Ports
BACKEND_PORT=8000
DATABASE_API_PORT=8001
FRONTEND_PORT=3000
REDIS_PORT=6379

# API URLs
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DB_API_URL=http://localhost:8001
REACT_APP_WS_URL=ws://localhost:8000
```

## Manual Service Setup

If you prefer to run services manually:

### 1. Database Setup
```bash
# Start MySQL service
sudo systemctl start mysql

# Create database and user
mysql -u root -p
```

In MySQL console:
```sql
CREATE DATABASE brandpulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'brandpulse_user'@'localhost' IDENTIFIED BY 'brandpulse_password';
GRANT ALL PRIVILEGES ON brandpulse.* TO 'brandpulse_user'@'localhost';
FLUSH PRIVILEGES;
```

Import schema and data:
```bash
mysql -u brandpulse_user -pbrandpulse_password brandpulse < database/schema.sql
mysql -u brandpulse_user -pbrandpulse_password brandpulse < database/seed_data.sql
```

### 2. Backend Service
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=brandpulse_user
export DB_PASSWORD=brandpulse_password
export DB_NAME=brandpulse

# Start service
python main.py
```

### 3. Database API Service
```bash
cd database-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=brandpulse_user
export DB_PASSWORD=brandpulse_password
export DB_NAME=brandpulse
export API_PORT=8001

# Start service
python main.py
```

### 4. Frontend Service
```bash
# Install dependencies
npm install

# Set environment variables
export REACT_APP_API_URL=http://localhost:8000
export REACT_APP_DB_API_URL=http://localhost:8001
export REACT_APP_WS_URL=ws://localhost:8000

# Start service
npm start
```

### 5. Redis (Optional)
```bash
redis-server --port 6379
```

## Troubleshooting

### Common Issues

1. **MySQL Connection Failed**
   - Ensure MySQL service is running: `sudo systemctl status mysql`
   - Check if user exists: `mysql -u brandpulse_user -pbrandpulse_password`
   - Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

2. **Port Already in Use**
   - Check what's using the port: `lsof -i :8000`
   - Kill the process: `kill -9 <PID>`
   - Or use different ports by modifying the configuration

3. **Python Dependencies Issues**
   - Ensure virtual environment is activated: `source venv/bin/activate`
   - Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

4. **Node.js Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Logs Location
All service logs are stored in the `logs/` directory:
- `logs/backend.log` - Backend API logs
- `logs/database-api.log` - Database API logs
- `logs/frontend.log` - Frontend logs

### Process Management
The script creates PID files in the `logs/` directory to track running processes:
- `logs/backend.pid`
- `logs/database-api.pid`
- `logs/frontend.pid`

## Development Tips

1. **Hot Reloading**: The frontend supports hot reloading for development
2. **API Testing**: Use tools like Postman or curl to test API endpoints
3. **Database Access**: Connect to MySQL using any MySQL client with the credentials above
4. **Log Monitoring**: Use `tail -f logs/<service>.log` to monitor logs in real-time

## Production Considerations

This setup is designed for local development. For production deployment:
- Use proper process managers (PM2, systemd)
- Configure proper logging and monitoring
- Use environment-specific configuration files
- Implement proper security measures
- Use production-grade database and Redis configurations


















