# 🎯 BrandPulse Analytics Platform

A comprehensive sentiment analysis and product analytics platform with AI-powered chat assistance, real-time data visualization, and multi-platform crawler integration.

## ✨ Features

- **📊 Analytics Dashboard** - Real-time sentiment metrics and product insights
- **🔍 Product Search** - Search and analyze products with detailed sentiment breakdowns
- **🕷️ Web Crawlers** - Multi-platform data collection with real-time status tracking
- **🏷️ Topics Analysis** - AI-powered topic detection with interactive visualizations
- **💬 AI Chat Assistant** - Interactive chat powered by Google Gemini 2.0 Flash
- **⚙️ Settings** - Customizable dashboard configuration and preferences

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Docker** (version 20.10 or higher)
   - [Install Docker](https://docs.docker.com/get-docker/)
   - [Install Docker Compose](https://docs.docker.com/compose/install/)

2. **Git** (for cloning the repository)
   - [Install Git](https://git-scm.com/downloads)

3. **Google Cloud API Key** (for AI chat functionality)
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Gemini API
   - Generate an API key

### System Requirements

- **Operating System**: Linux, macOS, or Windows (with WSL2 for Windows)
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 5GB free space
- **CPU**: 2+ cores recommended
- **Network**: Internet connection for downloading Docker images and API calls

### Port Requirements

Ensure the following ports are available:
- `3000` - Frontend web interface
- `8000` - Backend API
- `8001` - Database API
- `3307` - MySQL database (optional, for external access)
- `80` - Nginx (optional, for production)

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd BrandPulse
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory (optional, defaults are provided):

```bash
# Google Cloud API Key (required for AI chat)
GOOGLE_API_KEY=your_google_api_key_here

# Database Configuration (defaults provided)
DB_HOST=database
DB_PORT=3306
DB_USER=brandpulse_user
DB_PASSWORD=brandpulse_password
DB_NAME=brandpulse

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:80
```

### Step 3: Set Up Google Cloud Credentials (Optional)

If you have a service account JSON file:

1. Place your `service_account.json` file in the `backend/` directory
2. The file will be automatically mounted into the container

**Note**: The API key in `.env` is sufficient for basic functionality.

### Step 4: Start the Application

#### Option A: Using the Start Script (Recommended)

```bash
# Make the script executable (if not already)
chmod +x start.sh

# Start all services (rebuilds containers by default)
./start.sh

# Or use quick mode (skips rebuild for faster startup)
./start.sh --quick

# Skip health checks for faster startup
./start.sh --skip-wait
```

#### Option B: Using Docker Compose Directly

```bash
# Build and start all services
docker-compose up -d --build

# Or start without rebuilding
docker-compose up -d
```

### Step 5: Verify Installation

1. **Check container status:**
   ```bash
   docker-compose ps
   ```

2. **View logs (if needed):**
   ```bash
   docker-compose logs -f
   ```

3. **Access the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - Database API: [http://localhost:8001](http://localhost:8001)
   - API Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### Step 6: Seed the Database (Optional)

If you want to populate the database with sample data:

```bash
# Connect to the database container
docker-compose exec database mysql -u brandpulse_user -pbrandpulse_password brandpulse

# Or run SQL scripts directly
docker-compose exec -i database mysql -u brandpulse_user -pbrandpulse_password brandpulse < database/massive_seed_data.sql
```

## 📁 Project Structure

```
BrandPulse/
├── backend/                 # FastAPI backend service
│   ├── main.py             # Main API endpoints
│   ├── Dockerfile          # Backend container definition
│   └── requirements.txt    # Python dependencies
├── database-api/           # Database microservice
│   ├── main.py            # Database API endpoints
│   └── Dockerfile         # Database API container
├── database/              # Database scripts
│   ├── schema.sql         # Database schema
│   ├── seed_data.sql      # Initial seed data
│   └── massive_seed_data.sql  # Large dataset for testing
├── src/                   # React frontend
│   ├── components/        # React components
│   │   ├── Analytics.js   # Analytics dashboard
│   │   ├── ProductSearch.js  # Product search
│   │   ├── Topics.js      # Topics analysis
│   │   ├── Chat.js        # AI chat interface
│   │   └── WebCrawlers.js # Crawler management
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   └── App.js            # Main app component
├── docker-compose.yml     # Docker services configuration
├── start.sh              # Startup script
├── nginx.conf            # Nginx configuration (production)
└── README.md             # This file
```

## 🛠️ Available Commands

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Rebuild and start
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a specific service
docker-compose restart [service-name]

# Execute command in container
docker-compose exec [service-name] [command]
```

### Start Script Options

```bash
./start.sh              # Full rebuild and start (default)
./start.sh --quick      # Skip rebuild, start existing containers
./start.sh --skip-wait  # Skip health checks
./start.sh --quick --skip-wait  # Both options
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Cloud API key for Gemini | Required |
| `DB_HOST` | Database hostname | `database` |
| `DB_PORT` | Database port | `3306` |
| `DB_USER` | Database username | `brandpulse_user` |
| `DB_PASSWORD` | Database password | `brandpulse_password` |
| `DB_NAME` | Database name | `brandpulse` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

### Database Configuration

The database is automatically initialized with:
- Schema from `database/schema.sql`
- Seed data from `database/seed_data.sql` (if exists)

To add more data, place SQL files in the `database/` directory and restart the database container.

## 📊 Services Overview

### Frontend (React)
- **Port**: 3000
- **Technology**: React 18, Material-UI, Recharts
- **Features**: Responsive UI, real-time updates, interactive charts

### Backend (FastAPI)
- **Port**: 8000
- **Technology**: Python 3.11, FastAPI, Uvicorn
- **Features**: REST API, AI chat integration, sentiment analysis

### Database API (FastAPI)
- **Port**: 8001
- **Technology**: Python 3.11, FastAPI
- **Features**: Database operations, analytics endpoints

### Database (MySQL)
- **Port**: 3307 (external), 3306 (internal)
- **Version**: MySQL 8.0
- **Features**: Persistent storage, health checks

### Redis (Optional)
- **Port**: Internal only
- **Version**: Redis 7
- **Features**: Caching, session storage

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000  # or netstat -tulpn | grep 3000
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database Connection Failed**
   ```bash
   # Check database health
   docker-compose exec database mysqladmin ping -h localhost -u brandpulse_user -pbrandpulse_password
   
   # View database logs
   docker-compose logs database
   ```

3. **Frontend Not Loading**
   ```bash
   # Rebuild frontend
   docker-compose build --no-cache frontend
   docker-compose up -d frontend
   
   # Check frontend logs
   docker-compose logs frontend
   ```

4. **API Errors**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Verify API health
   curl http://localhost:8000/health
   ```

5. **Docker Permission Issues (Linux)**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Log out and back in
   ```

### Reset Everything

```bash
# Stop and remove all containers, volumes, and networks
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
./start.sh
```

## 🔐 Security Notes

- **Default passwords**: Change default database passwords in production
- **API keys**: Never commit API keys to version control
- **CORS**: Configure CORS origins appropriately for production
- **SSL/TLS**: Use HTTPS in production (configure in nginx.conf)

## 📈 Production Deployment

For production deployment:

1. **Update environment variables** with production values
2. **Configure SSL certificates** in `nginx/ssl/`
3. **Enable Nginx service** in docker-compose.yml:
   ```bash
   docker-compose --profile production up -d
   ```
4. **Set up backups** for the database volume
5. **Configure monitoring** and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review container logs: `docker-compose logs [service-name]`
- Check service health: `docker-compose ps`

---

**Happy analyzing! 🎉**
