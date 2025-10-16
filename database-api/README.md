# BrandPulse Database API v2

## Overview
This is an improved version of the BrandPulse Database API with better error handling, connection management, and architecture.

## Key Improvements

### 1. **Robust Connection Management**
- Proper async connection pooling with configurable pool settings
- Automatic connection retry and error handling
- Connection health monitoring
- Graceful shutdown handling

### 2. **Enhanced Error Handling**
- Global exception handlers for SQLAlchemy errors
- Detailed error logging with context
- Proper HTTP status codes
- User-friendly error messages

### 3. **Better Architecture**
- Clean separation of concerns
- Dependency injection for database connections
- Proper async/await patterns throughout
- Type hints and Pydantic models for validation

### 4. **Production Ready Features**
- Comprehensive health checks
- Request/response logging
- Input validation with Pydantic
- Proper CORS configuration
- Security headers

### 5. **API Improvements**
- RESTful endpoint design
- Consistent response formats
- Pagination support
- Search functionality
- Analytics endpoints

## Environment Variables

```bash
DATABASE_URL=mysql+aiomysql://user:password@host:port/database
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

## Running the API

### Development
```bash
cd database-api-v2
pip install -r requirements.txt
python main.py
```

### Docker
```bash
docker build -t brandpulse-database-api-v2 .
docker run -p 8002:8002 brandpulse-database-api-v2
```

## API Endpoints

### Health Check
- `GET /health` - Comprehensive health check

### Products
- `GET /products` - List products with filtering
- `GET /products/{id}` - Get specific product
- `POST /products` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Soft delete product

### Product Pages
- `GET /products/{id}/pages` - Get product pages
- `POST /products/{id}/pages` - Create product page

### Sentiment Analysis
- `GET /sentiment` - Get sentiment data with filtering
- `POST /sentiment` - Create sentiment analysis

### Analytics
- `GET /analytics/products/{id}` - Product analytics
- `GET /analytics/overview` - Overall analytics

### Search
- `GET /search/products` - Full-text product search
- `GET /search/suggestions` - Search suggestions

### Utilities
- `POST /utils/refresh-analytics` - Refresh analytics data

## Differences from v1

1. **Port**: Runs on port 8002 instead of 8001
2. **Connection Management**: Uses proper async connection pooling
3. **Error Handling**: Comprehensive error handling and logging
4. **Validation**: Pydantic models with proper validation
5. **Architecture**: Cleaner separation of concerns
6. **Performance**: Better query optimization and caching
7. **Monitoring**: Enhanced health checks and metrics







