# BrandPulse System Architecture & UML Diagrams

## Overview
BrandPulse is a comprehensive brand analytics platform that combines AI-powered sentiment analysis, web scraping, and real-time monitoring to provide insights into product perception across multiple channels.

## Table of Contents
- [System Architecture](#system-architecture)
- [Component Overview](#component-overview)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [Web Scraping Pipeline](#web-scraping-pipeline)
- [Data Flow Architecture](#data-flow-architecture)
- [DevOps Pipeline](#devops-pipeline)
- [Infrastructure Architecture](#infrastructure-architecture)
- [UML Class Diagrams](#uml-class-diagrams)
- [Sequence Diagrams](#sequence-diagrams)
- [Deployment Architecture](#deployment-architecture)
- [Technology Stack](#technology-stack)

---

## BrandPulse Complete System Architecture

### High-Level System Architecture
```mermaid
graph TB
    %% External Users and Systems
    subgraph "External Systems"
        USERS[👥 Users<br/>Analysts, Managers, Executives]
        ADMIN[👨‍💼 Administrators<br/>System Management]
    end
    
    subgraph "Data Sources"
        AMAZON[🛒 Amazon<br/>Product Reviews]
        TWITTER[🐦 Twitter<br/>Social Mentions]
        REDDIT[🤖 Reddit<br/>Community Discussions]
        YOUTUBE[📺 YouTube<br/>Video Reviews]
        INSTAGRAM[📸 Instagram<br/>Visual Content]
        GOOGLE[🔍 Google<br/>Shopping Reviews]
        TIKTOK[🎵 TikTok<br/>Short Videos]
        LINKEDIN[💼 LinkedIn<br/>Professional Reviews]
    end
    
    %% Infrastructure Layer
    subgraph "Infrastructure Layer"
        NGINX[🌐 Nginx<br/>Reverse Proxy & Load Balancer<br/>Port: 3000]
        DOCKER[🐳 Docker<br/>Container Orchestration]
        NETWORK[🔗 Docker Network<br/>brandpulse-network]
    end
    
    %% Application Layer
    subgraph "Application Layer"
        subgraph "Frontend Services"
            REACT[⚛️ React Frontend<br/>Material-UI Components<br/>Port: 3000]
        end
        
        subgraph "Backend Services"
            FASTAPI[🚀 FastAPI Backend<br/>Main Application<br/>Port: 8000]
            DBAPI[🗄️ Database API<br/>MySQL Interface<br/>Port: 8001]
        end
        
        subgraph "AI Services"
            GEMINI[🤖 Google Gemini<br/>AI Analysis Engine]
            ADK[🧠 Google ADK<br/>Agent Development Kit]
        end
    end
    
    %% Data Layer
    subgraph "Data Layer"
        subgraph "Database Services"
            MYSQL[🗃️ MySQL Database<br/>Primary Data Storage<br/>Port: 3306]
        end
        
        subgraph "Data Processing"
            CRAWLERS[🕷️ Web Crawlers<br/>Data Collection Engine]
            SENTIMENT[📊 Sentiment Analysis<br/>AI Processing Pipeline]
            ANALYTICS[📈 Analytics Engine<br/>Data Aggregation]
        end
    end
    
    %% Operations Layer
    subgraph "Operations Layer"
        MONITORING[📊 Monitoring<br/>Health Checks & Metrics]
        LOGGING[📝 Logging<br/>Centralized Log Management]
        SECURITY[🔒 Security<br/>Authentication & Authorization]
    end
    
    %% User Interactions
    USERS -->|Web Interface| NGINX
    ADMIN -->|Management| NGINX
    
    %% Data Collection Flow
    CRAWLERS -->|Collect Data| AMAZON
    CRAWLERS -->|Collect Data| TWITTER
    CRAWLERS -->|Collect Data| REDDIT
    CRAWLERS -->|Collect Data| YOUTUBE
    CRAWLERS -->|Collect Data| INSTAGRAM
    CRAWLERS -->|Collect Data| GOOGLE
    CRAWLERS -->|Collect Data| TIKTOK
    CRAWLERS -->|Collect Data| LINKEDIN
    
    %% Infrastructure Flow
    NGINX -->|Proxy Requests| REACT
    NGINX -->|API Requests| FASTAPI
    NGINX -->|DB Requests| DBAPI
    
    %% Application Flow
    REACT -->|API Calls| FASTAPI
    REACT -->|Data Queries| DBAPI
    FASTAPI -->|AI Processing| GEMINI
    FASTAPI -->|Agent Tasks| ADK
    DBAPI -->|Database Operations| MYSQL
    
    %% Data Processing Flow
    CRAWLERS -->|Raw Data| SENTIMENT
    SENTIMENT -->|Processed Data| MYSQL
    ANALYTICS -->|Aggregated Data| MYSQL
    
    %% Operations Flow
    MONITORING -.->|Monitor| FASTAPI
    MONITORING -.->|Monitor| DBAPI
    MONITORING -.->|Monitor| MYSQL
    LOGGING -.->|Collect Logs| FASTAPI
    LOGGING -.->|Collect Logs| DBAPI
    SECURITY -.->|Secure| NGINX
    
    %% Docker Network
    DOCKER -->|Orchestrate| REACT
    DOCKER -->|Orchestrate| FASTAPI
    DOCKER -->|Orchestrate| DBAPI
    DOCKER -->|Orchestrate| MYSQL
    NETWORK -->|Connect| REACT
    NETWORK -->|Connect| FASTAPI
    NETWORK -->|Connect| DBAPI
    NETWORK -->|Connect| MYSQL
    
    %% Styling
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef sourceClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef infraClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef appClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dataClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef opsClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class USERS,ADMIN userClass
    class AMAZON,TWITTER,REDDIT,YOUTUBE,INSTAGRAM,GOOGLE,TIKTOK,LINKEDIN sourceClass
    class NGINX,DOCKER,NETWORK infraClass
    class REACT,FASTAPI,DBAPI,GEMINI,ADK appClass
    class MYSQL,CRAWLERS,SENTIMENT,ANALYTICS dataClass
    class MONITORING,LOGGING,SECURITY opsClass
```

### Detailed Component Architecture
```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend Layer (React + Material-UI)"
        DASHBOARD[📊 Dashboard<br/>Overview & KPIs]
        ANALYTICS[📈 Analytics<br/>Sentiment Analysis]
        SEARCH[🔍 Product Search<br/>Search & Filter]
        CRAWLERS[🕷️ Web Crawlers<br/>Management Interface]
        TIMELINE[⏰ Timeline<br/>Historical Data]
        TOPICS[🏷️ Topics<br/>Trending Topics]
        CHAT[💬 Chat<br/>AI Assistant]
        SETTINGS[⚙️ Settings<br/>Configuration]
    end
    
    %% Backend Services
    subgraph "Backend Services (FastAPI)"
        subgraph "Main API (Port 8000)"
            CHAT_API[💬 Chat API<br/>AI Conversations]
            ANALYTICS_API[📊 Analytics API<br/>Sentiment Data]
            PRODUCT_API[🛍️ Product API<br/>Product Management]
            DASHBOARD_API[📈 Dashboard API<br/>Overview Data]
        end
        
        subgraph "Database API (Port 8001)"
            SEARCH_API[🔍 Search API<br/>Product Search]
            SENTIMENT_API[📊 Sentiment API<br/>Review Data]
            CRAWLER_API[🕷️ Crawler API<br/>Data Collection]
        end
    end
    
    %% AI Services
    subgraph "AI Processing Layer"
        GEMINI_AI[🤖 Google Gemini<br/>Text Analysis]
        ADK_AGENTS[🧠 ADK Agents<br/>Task Automation]
        SENTIMENT_ENGINE[📊 Sentiment Engine<br/>Score Calculation]
    end
    
    %% Database Layer
    subgraph "Database Layer (MySQL)"
        PRODUCTS_TABLE[📦 Products Table<br/>Product Information]
        REVIEWS_TABLE[📝 Reviews Table<br/>User Reviews]
        SENTIMENT_TABLE[📊 Sentiment Table<br/>Analysis Results]
        CRAWLER_TABLE[🕷️ Crawler Table<br/>Collection Status]
        ANALYTICS_TABLE[📈 Analytics Table<br/>Aggregated Data]
    end
    
    %% External Integrations
    subgraph "External APIs"
        AMAZON_API[🛒 Amazon API<br/>Product Reviews]
        TWITTER_API[🐦 Twitter API<br/>Social Data]
        REDDIT_API[🤖 Reddit API<br/>Community Data]
        YOUTUBE_API[📺 YouTube API<br/>Video Data]
    end
    
    %% Frontend to Backend
    DASHBOARD -->|API Calls| DASHBOARD_API
    ANALYTICS -->|API Calls| ANALYTICS_API
    SEARCH -->|API Calls| SEARCH_API
    CRAWLERS -->|API Calls| CRAWLER_API
    CHAT -->|API Calls| CHAT_API
    
    %% Backend to Database
    DASHBOARD_API -->|Query| ANALYTICS_TABLE
    ANALYTICS_API -->|Query| SENTIMENT_TABLE
    SEARCH_API -->|Query| PRODUCTS_TABLE
    SENTIMENT_API -->|Query| REVIEWS_TABLE
    CRAWLER_API -->|Query| CRAWLER_TABLE
    
    %% AI Processing
    CHAT_API -->|Process| GEMINI_AI
    ANALYTICS_API -->|Process| SENTIMENT_ENGINE
    CRAWLER_API -->|Process| ADK_AGENTS
    
    %% External Data Collection
    CRAWLER_API -->|Collect| AMAZON_API
    CRAWLER_API -->|Collect| TWITTER_API
    CRAWLER_API -->|Collect| REDDIT_API
    CRAWLER_API -->|Collect| YOUTUBE_API
    
    %% Data Flow
    AMAZON_API -->|Store| REVIEWS_TABLE
    TWITTER_API -->|Store| REVIEWS_TABLE
    REDDIT_API -->|Store| REVIEWS_TABLE
    YOUTUBE_API -->|Store| REVIEWS_TABLE
    
    REVIEWS_TABLE -->|Process| SENTIMENT_ENGINE
    SENTIMENT_ENGINE -->|Store| SENTIMENT_TABLE
    
    %% Styling
    classDef frontendClass fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef backendClass fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef aiClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef dbClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef externalClass fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class DASHBOARD,ANALYTICS,SEARCH,CRAWLERS,TIMELINE,TOPICS,CHAT,SETTINGS frontendClass
    class CHAT_API,ANALYTICS_API,PRODUCT_API,DASHBOARD_API,SEARCH_API,SENTIMENT_API,CRAWLER_API backendClass
    class GEMINI_AI,ADK_AGENTS,SENTIMENT_ENGINE aiClass
    class PRODUCTS_TABLE,REVIEWS_TABLE,SENTIMENT_TABLE,CRAWLER_TABLE,ANALYTICS_TABLE dbClass
    class AMAZON_API,TWITTER_API,REDDIT_API,YOUTUBE_API externalClass
```

### Data Flow Architecture
```mermaid
sequenceDiagram
    participant U as 👥 User
    participant F as ⚛️ Frontend
    participant N as 🌐 Nginx
    participant B as 🚀 Backend API
    participant D as 🗄️ Database API
    participant DB as 🗃️ MySQL
    participant AI as 🤖 AI Services
    participant C as 🕷️ Crawlers
    participant E as 🌍 External APIs
    
    %% User Request Flow
    U->>F: Access Dashboard
    F->>N: HTTP Request
    N->>B: Proxy to Backend
    B->>D: Database Query
    D->>DB: SQL Query
    DB-->>D: Data Response
    D-->>B: API Response
    B-->>N: JSON Response
    N-->>F: HTTP Response
    F-->>U: Render Dashboard
    
    %% AI Chat Flow
    U->>F: Send Chat Message
    F->>N: Chat API Request
    N->>B: Proxy to Chat API
    B->>AI: Process with Gemini
    AI-->>B: AI Response
    B-->>N: Chat Response
    N-->>F: HTTP Response
    F-->>U: Display AI Reply
    
    %% Data Collection Flow
    C->>E: Collect Reviews
    E-->>C: Raw Data
    C->>D: Store Raw Data
    D->>DB: Insert Reviews
    C->>AI: Analyze Sentiment
    AI-->>C: Sentiment Scores
    C->>D: Store Analysis
    D->>DB: Update Sentiment Table
    
    %% Analytics Flow
    U->>F: Request Analytics
    F->>N: Analytics API Request
    N->>B: Proxy to Analytics API
    B->>D: Query Sentiment Data
    D->>DB: Aggregate Query
    DB-->>D: Aggregated Data
    D-->>B: Analytics Response
    B-->>N: JSON Response
    N-->>F: HTTP Response
    F-->>U: Display Analytics
```

### Web Crawler Architecture
```mermaid
graph TB
    subgraph "Web Crawler Management System"
        CRAWLER_UI[🕷️ Crawler Management UI<br/>Configuration & Monitoring]
        
        subgraph "Crawler Services"
            AMAZON_CRAWLER[🛒 Amazon Crawler<br/>Product Reviews]
            TWITTER_CRAWLER[🐦 Twitter Crawler<br/>Social Mentions]
            REDDIT_CRAWLER[🤖 Reddit Crawler<br/>Community Posts]
            YOUTUBE_CRAWLER[📺 YouTube Crawler<br/>Video Comments]
            INSTAGRAM_CRAWLER[📸 Instagram Crawler<br/>Post Analysis]
            GOOGLE_CRAWLER[🔍 Google Crawler<br/>Shopping Reviews]
            TIKTOK_CRAWLER[🎵 TikTok Crawler<br/>Video Content]
            LINKEDIN_CRAWLER[💼 LinkedIn Crawler<br/>Professional Reviews]
        end
        
        subgraph "Data Processing Pipeline"
            COLLECTOR[📥 Data Collector<br/>Raw Data Ingestion]
            PARSER[🔍 Data Parser<br/>Content Extraction]
            FILTER[🔧 Data Filter<br/>Quality Control]
            VALIDATOR[✅ Data Validator<br/>Format Validation]
            ENRICHER[🎯 Data Enricher<br/>Metadata Addition]
        end
        
        subgraph "Storage Layer"
            RAW_STORAGE[🗄️ Raw Data Storage<br/>Unprocessed Content]
            PROCESSED_STORAGE[📊 Processed Storage<br/>Structured Data]
            ANALYTICS_STORAGE[📈 Analytics Storage<br/>Aggregated Metrics]
        end
        
        subgraph "API Management"
            TOKEN_MANAGER[🔑 API Token Manager<br/>Authentication]
            RATE_LIMITER[⏱️ Rate Limiter<br/>Request Throttling]
            ERROR_HANDLER[⚠️ Error Handler<br/>Failure Management]
        end
    end
    
    %% External Data Sources
    subgraph "External Platforms"
        AMAZON_API[🛒 Amazon API]
        TWITTER_API[🐦 Twitter API]
        REDDIT_API[🤖 Reddit API]
        YOUTUBE_API[📺 YouTube API]
        INSTAGRAM_API[📸 Instagram API]
        GOOGLE_API[🔍 Google API]
        TIKTOK_API[🎵 TikTok API]
        LINKEDIN_API[💼 LinkedIn API]
    end
    
    %% User Interface
    CRAWLER_UI -->|Configure| AMAZON_CRAWLER
    CRAWLER_UI -->|Configure| TWITTER_CRAWLER
    CRAWLER_UI -->|Configure| REDDIT_CRAWLER
    CRAWLER_UI -->|Configure| YOUTUBE_CRAWLER
    CRAWLER_UI -->|Configure| INSTAGRAM_CRAWLER
    CRAWLER_UI -->|Configure| GOOGLE_CRAWLER
    CRAWLER_UI -->|Configure| TIKTOK_CRAWLER
    CRAWLER_UI -->|Configure| LINKEDIN_CRAWLER
    
    %% Crawler Operations
    AMAZON_CRAWLER -->|Collect| AMAZON_API
    TWITTER_CRAWLER -->|Collect| TWITTER_API
    REDDIT_CRAWLER -->|Collect| REDDIT_API
    YOUTUBE_CRAWLER -->|Collect| YOUTUBE_API
    INSTAGRAM_CRAWLER -->|Collect| INSTAGRAM_API
    GOOGLE_CRAWLER -->|Collect| GOOGLE_API
    TIKTOK_CRAWLER -->|Collect| TIKTOK_API
    LINKEDIN_CRAWLER -->|Collect| LINKEDIN_API
    
    %% Data Processing Flow
    AMAZON_CRAWLER -->|Raw Data| COLLECTOR
    TWITTER_CRAWLER -->|Raw Data| COLLECTOR
    REDDIT_CRAWLER -->|Raw Data| COLLECTOR
    YOUTUBE_CRAWLER -->|Raw Data| COLLECTOR
    INSTAGRAM_CRAWLER -->|Raw Data| COLLECTOR
    GOOGLE_CRAWLER -->|Raw Data| COLLECTOR
    TIKTOK_CRAWLER -->|Raw Data| COLLECTOR
    LINKEDIN_CRAWLER -->|Raw Data| COLLECTOR
    
    COLLECTOR -->|Extract| PARSER
    PARSER -->|Filter| FILTER
    FILTER -->|Validate| VALIDATOR
    VALIDATOR -->|Enrich| ENRICHER
    
    %% Storage Flow
    COLLECTOR -->|Store| RAW_STORAGE
    ENRICHER -->|Store| PROCESSED_STORAGE
    ENRICHER -->|Aggregate| ANALYTICS_STORAGE
    
    %% API Management
    TOKEN_MANAGER -.->|Authenticate| AMAZON_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| TWITTER_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| REDDIT_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| YOUTUBE_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| INSTAGRAM_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| GOOGLE_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| TIKTOK_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| LINKEDIN_CRAWLER
    
    RATE_LIMITER -.->|Throttle| AMAZON_CRAWLER
    RATE_LIMITER -.->|Throttle| TWITTER_CRAWLER
    RATE_LIMITER -.->|Throttle| REDDIT_CRAWLER
    RATE_LIMITER -.->|Throttle| YOUTUBE_CRAWLER
    RATE_LIMITER -.->|Throttle| INSTAGRAM_CRAWLER
    RATE_LIMITER -.->|Throttle| GOOGLE_CRAWLER
    RATE_LIMITER -.->|Throttle| TIKTOK_CRAWLER
    RATE_LIMITER -.->|Throttle| LINKEDIN_CRAWLER
    
    ERROR_HANDLER -.->|Handle| AMAZON_CRAWLER
    ERROR_HANDLER -.->|Handle| TWITTER_CRAWLER
    ERROR_HANDLER -.->|Handle| REDDIT_CRAWLER
    ERROR_HANDLER -.->|Handle| YOUTUBE_CRAWLER
    ERROR_HANDLER -.->|Handle| INSTAGRAM_CRAWLER
    ERROR_HANDLER -.->|Handle| GOOGLE_CRAWLER
    ERROR_HANDLER -.->|Handle| TIKTOK_CRAWLER
    ERROR_HANDLER -.->|Handle| LINKEDIN_CRAWLER
    
    %% Styling
    classDef uiClass fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef crawlerClass fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef processClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef storageClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef apiClass fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef externalClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class CRAWLER_UI uiClass
    class AMAZON_CRAWLER,TWITTER_CRAWLER,REDDIT_CRAWLER,YOUTUBE_CRAWLER,INSTAGRAM_CRAWLER,GOOGLE_CRAWLER,TIKTOK_CRAWLER,LINKEDIN_CRAWLER crawlerClass
    class COLLECTOR,PARSER,FILTER,VALIDATOR,ENRICHER processClass
    class RAW_STORAGE,PROCESSED_STORAGE,ANALYTICS_STORAGE storageClass
    class TOKEN_MANAGER,RATE_LIMITER,ERROR_HANDLER apiClass
    class AMAZON_API,TWITTER_API,REDDIT_API,YOUTUBE_API,INSTAGRAM_API,GOOGLE_API,TIKTOK_API,LINKEDIN_API externalClass
```

---

### High-Level System Overview
```mermaid
graph TB
    %% External Users and Systems
    subgraph "External Systems"
        USERS[👥 Users<br/>Analysts, Managers, Executives]
        ADMIN[👨‍💼 Administrators<br/>System Management]
    end
    
    subgraph "Data Sources"
        AMAZON[🛒 Amazon<br/>Product Reviews]
        TWITTER[🐦 Twitter<br/>Social Mentions]
        REDDIT[🤖 Reddit<br/>Community Discussions]
        YOUTUBE[📺 YouTube<br/>Video Reviews]
        INSTAGRAM[📸 Instagram<br/>Visual Content]
        GOOGLE[🔍 Google<br/>Shopping Reviews]
        TIKTOK[🎵 TikTok<br/>Short Videos]
        LINKEDIN[💼 LinkedIn<br/>Professional Reviews]
    end
    
    %% Infrastructure Layer
    subgraph "Infrastructure Layer"
        NGINX[🌐 Nginx<br/>Reverse Proxy & Load Balancer<br/>Port: 3000]
        DOCKER[🐳 Docker<br/>Container Orchestration]
        NETWORK[🔗 Docker Network<br/>brandpulse-network]
    end
    
    %% Application Layer
    subgraph "Application Layer"
        subgraph "Frontend Services"
            REACT[⚛️ React Frontend<br/>Material-UI Components<br/>Port: 3000]
        end
        
        subgraph "Backend Services"
            FASTAPI[🚀 FastAPI Backend<br/>Main Application<br/>Port: 8000]
            DBAPI[🗄️ Database API<br/>MySQL Interface<br/>Port: 8001]
        end
        
        subgraph "AI Services"
            GEMINI[🤖 Google Gemini<br/>AI Analysis Engine]
            ADK[🧠 Google ADK<br/>Agent Development Kit]
        end
    end
    
    %% Data Layer
    subgraph "Data Layer"
        subgraph "Database Services"
            MYSQL[🗃️ MySQL Database<br/>Primary Data Storage<br/>Port: 3306]
        end
        
        subgraph "Data Processing"
            CRAWLERS[🕷️ Web Crawlers<br/>Data Collection Engine]
            SENTIMENT[📊 Sentiment Analysis<br/>AI Processing Pipeline]
            ANALYTICS[📈 Analytics Engine<br/>Data Aggregation]
        end
    end
    
    %% Operations Layer
    subgraph "Operations Layer"
        MONITORING[📊 Monitoring<br/>Health Checks & Metrics]
        LOGGING[📝 Logging<br/>Centralized Log Management]
        SECURITY[🔒 Security<br/>Authentication & Authorization]
    end
    
    %% User Interactions
    USERS -->|Web Interface| NGINX
    ADMIN -->|Management| NGINX
    
    %% Data Collection Flow
    CRAWLERS -->|Collect Data| AMAZON
    CRAWLERS -->|Collect Data| TWITTER
    CRAWLERS -->|Collect Data| REDDIT
    CRAWLERS -->|Collect Data| YOUTUBE
    CRAWLERS -->|Collect Data| INSTAGRAM
    CRAWLERS -->|Collect Data| GOOGLE
    CRAWLERS -->|Collect Data| TIKTOK
    CRAWLERS -->|Collect Data| LINKEDIN
    
    %% Infrastructure Flow
    NGINX -->|Proxy Requests| REACT
    NGINX -->|API Requests| FASTAPI
    NGINX -->|DB Requests| DBAPI
    
    %% Application Flow
    REACT -->|API Calls| FASTAPI
    REACT -->|Data Queries| DBAPI
    FASTAPI -->|AI Processing| GEMINI
    FASTAPI -->|Agent Tasks| ADK
    DBAPI -->|Database Operations| MYSQL
    
    %% Data Processing Flow
    CRAWLERS -->|Raw Data| SENTIMENT
    SENTIMENT -->|Processed Data| MYSQL
    ANALYTICS -->|Aggregated Data| MYSQL
    
    %% Operations Flow
    MONITORING -.->|Monitor| FASTAPI
    MONITORING -.->|Monitor| DBAPI
    MONITORING -.->|Monitor| MYSQL
    LOGGING -.->|Collect Logs| FASTAPI
    LOGGING -.->|Collect Logs| DBAPI
    SECURITY -.->|Secure| NGINX
    
    %% Docker Network
    DOCKER -->|Orchestrate| REACT
    DOCKER -->|Orchestrate| FASTAPI
    DOCKER -->|Orchestrate| DBAPI
    DOCKER -->|Orchestrate| MYSQL
    NETWORK -->|Connect| REACT
    NETWORK -->|Connect| FASTAPI
    NETWORK -->|Connect| DBAPI
    NETWORK -->|Connect| MYSQL
    
    %% Styling
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef sourceClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef infraClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef appClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dataClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef opsClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class USERS,ADMIN userClass
    class AMAZON,TWITTER,REDDIT,YOUTUBE,INSTAGRAM,GOOGLE,TIKTOK,LINKEDIN sourceClass
    class NGINX,DOCKER,NETWORK infraClass
    class REACT,FASTAPI,DBAPI,GEMINI,ADK appClass
    class MYSQL,CRAWLERS,SENTIMENT,ANALYTICS dataClass
    class MONITORING,LOGGING,SECURITY opsClass
```

### Detailed Component Architecture
```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend Layer (React + Material-UI)"
        DASHBOARD[📊 Dashboard<br/>Overview & KPIs]
        ANALYTICS[📈 Analytics<br/>Sentiment Analysis]
        SEARCH[🔍 Product Search<br/>Search & Filter]
        CRAWLERS[🕷️ Web Crawlers<br/>Management Interface]
        TIMELINE[⏰ Timeline<br/>Historical Data]
        TOPICS[🏷️ Topics<br/>Trending Topics]
        CHAT[💬 Chat<br/>AI Assistant]
        SETTINGS[⚙️ Settings<br/>Configuration]
    end
    
    %% Backend Services
    subgraph "Backend Services (FastAPI)"
        subgraph "Main API (Port 8000)"
            CHAT_API[💬 Chat API<br/>AI Conversations]
            ANALYTICS_API[📊 Analytics API<br/>Sentiment Data]
            PRODUCT_API[🛍️ Product API<br/>Product Management]
            DASHBOARD_API[📈 Dashboard API<br/>Overview Data]
        end
        
        subgraph "Database API (Port 8001)"
            SEARCH_API[🔍 Search API<br/>Product Search]
            SENTIMENT_API[📊 Sentiment API<br/>Review Data]
            CRAWLER_API[🕷️ Crawler API<br/>Data Collection]
        end
    end
    
    %% AI Services
    subgraph "AI Processing Layer"
        GEMINI_AI[🤖 Google Gemini<br/>Text Analysis]
        ADK_AGENTS[🧠 ADK Agents<br/>Task Automation]
        SENTIMENT_ENGINE[📊 Sentiment Engine<br/>Score Calculation]
    end
    
    %% Database Layer
    subgraph "Database Layer (MySQL)"
        PRODUCTS_TABLE[📦 Products Table<br/>Product Information]
        REVIEWS_TABLE[📝 Reviews Table<br/>User Reviews]
        SENTIMENT_TABLE[📊 Sentiment Table<br/>Analysis Results]
        CRAWLER_TABLE[🕷️ Crawler Table<br/>Collection Status]
        ANALYTICS_TABLE[📈 Analytics Table<br/>Aggregated Data]
    end
    
    %% External Integrations
    subgraph "External APIs"
        AMAZON_API[🛒 Amazon API<br/>Product Reviews]
        TWITTER_API[🐦 Twitter API<br/>Social Data]
        REDDIT_API[🤖 Reddit API<br/>Community Data]
        YOUTUBE_API[📺 YouTube API<br/>Video Data]
    end
    
    %% Frontend to Backend
    DASHBOARD -->|API Calls| DASHBOARD_API
    ANALYTICS -->|API Calls| ANALYTICS_API
    SEARCH -->|API Calls| SEARCH_API
    CRAWLERS -->|API Calls| CRAWLER_API
    CHAT -->|API Calls| CHAT_API
    
    %% Backend to Database
    DASHBOARD_API -->|Query| ANALYTICS_TABLE
    ANALYTICS_API -->|Query| SENTIMENT_TABLE
    SEARCH_API -->|Query| PRODUCTS_TABLE
    SENTIMENT_API -->|Query| REVIEWS_TABLE
    CRAWLER_API -->|Query| CRAWLER_TABLE
    
    %% AI Processing
    CHAT_API -->|Process| GEMINI_AI
    ANALYTICS_API -->|Process| SENTIMENT_ENGINE
    CRAWLER_API -->|Process| ADK_AGENTS
    
    %% External Data Collection
    CRAWLER_API -->|Collect| AMAZON_API
    CRAWLER_API -->|Collect| TWITTER_API
    CRAWLER_API -->|Collect| REDDIT_API
    CRAWLER_API -->|Collect| YOUTUBE_API
    
    %% Data Flow
    AMAZON_API -->|Store| REVIEWS_TABLE
    TWITTER_API -->|Store| REVIEWS_TABLE
    REDDIT_API -->|Store| REVIEWS_TABLE
    YOUTUBE_API -->|Store| REVIEWS_TABLE
    
    REVIEWS_TABLE -->|Process| SENTIMENT_ENGINE
    SENTIMENT_ENGINE -->|Store| SENTIMENT_TABLE
    
    %% Styling
    classDef frontendClass fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef backendClass fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef aiClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef dbClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef externalClass fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class DASHBOARD,ANALYTICS,SEARCH,CRAWLERS,TIMELINE,TOPICS,CHAT,SETTINGS frontendClass
    class CHAT_API,ANALYTICS_API,PRODUCT_API,DASHBOARD_API,SEARCH_API,SENTIMENT_API,CRAWLER_API backendClass
    class GEMINI_AI,ADK_AGENTS,SENTIMENT_ENGINE aiClass
    class PRODUCTS_TABLE,REVIEWS_TABLE,SENTIMENT_TABLE,CRAWLER_TABLE,ANALYTICS_TABLE dbClass
    class AMAZON_API,TWITTER_API,REDDIT_API,YOUTUBE_API externalClass
```

### Data Flow Architecture
```mermaid
sequenceDiagram
    participant U as 👥 User
    participant F as ⚛️ Frontend
    participant N as 🌐 Nginx
    participant B as 🚀 Backend API
    participant D as 🗄️ Database API
    participant DB as 🗃️ MySQL
    participant AI as 🤖 AI Services
    participant C as 🕷️ Crawlers
    participant E as 🌍 External APIs
    
    %% User Request Flow
    U->>F: Access Dashboard
    F->>N: HTTP Request
    N->>B: Proxy to Backend
    B->>D: Database Query
    D->>DB: SQL Query
    DB-->>D: Data Response
    D-->>B: API Response
    B-->>N: JSON Response
    N-->>F: HTTP Response
    F-->>U: Render Dashboard
    
    %% AI Chat Flow
    U->>F: Send Chat Message
    F->>N: Chat API Request
    N->>B: Proxy to Chat API
    B->>AI: Process with Gemini
    AI-->>B: AI Response
    B-->>N: Chat Response
    N-->>F: HTTP Response
    F-->>U: Display AI Reply
    
    %% Data Collection Flow
    C->>E: Collect Reviews
    E-->>C: Raw Data
    C->>D: Store Raw Data
    D->>DB: Insert Reviews
    C->>AI: Analyze Sentiment
    AI-->>C: Sentiment Scores
    C->>D: Store Analysis
    D->>DB: Update Sentiment Table
    
    %% Analytics Flow
    U->>F: Request Analytics
    F->>N: Analytics API Request
    N->>B: Proxy to Analytics API
    B->>D: Query Sentiment Data
    D->>DB: Aggregate Query
    DB-->>D: Aggregated Data
    D-->>B: Analytics Response
    B-->>N: JSON Response
    N-->>F: HTTP Response
    F-->>U: Display Analytics
```

### Web Crawler Architecture
```mermaid
graph TB
    subgraph "Web Crawler Management System"
        CRAWLER_UI[🕷️ Crawler Management UI<br/>Configuration & Monitoring]
        
        subgraph "Crawler Services"
            AMAZON_CRAWLER[🛒 Amazon Crawler<br/>Product Reviews]
            TWITTER_CRAWLER[🐦 Twitter Crawler<br/>Social Mentions]
            REDDIT_CRAWLER[🤖 Reddit Crawler<br/>Community Posts]
            YOUTUBE_CRAWLER[📺 YouTube Crawler<br/>Video Comments]
            INSTAGRAM_CRAWLER[📸 Instagram Crawler<br/>Post Analysis]
            GOOGLE_CRAWLER[🔍 Google Crawler<br/>Shopping Reviews]
            TIKTOK_CRAWLER[🎵 TikTok Crawler<br/>Video Content]
            LINKEDIN_CRAWLER[💼 LinkedIn Crawler<br/>Professional Reviews]
        end
        
        subgraph "Data Processing Pipeline"
            COLLECTOR[📥 Data Collector<br/>Raw Data Ingestion]
            PARSER[🔍 Data Parser<br/>Content Extraction]
            FILTER[🔧 Data Filter<br/>Quality Control]
            VALIDATOR[✅ Data Validator<br/>Format Validation]
            ENRICHER[🎯 Data Enricher<br/>Metadata Addition]
        end
        
        subgraph "Storage Layer"
            RAW_STORAGE[🗄️ Raw Data Storage<br/>Unprocessed Content]
            PROCESSED_STORAGE[📊 Processed Storage<br/>Structured Data]
            ANALYTICS_STORAGE[📈 Analytics Storage<br/>Aggregated Metrics]
        end
        
        subgraph "API Management"
            TOKEN_MANAGER[🔑 API Token Manager<br/>Authentication]
            RATE_LIMITER[⏱️ Rate Limiter<br/>Request Throttling]
            ERROR_HANDLER[⚠️ Error Handler<br/>Failure Management]
        end
    end
    
    %% External Data Sources
    subgraph "External Platforms"
        AMAZON_API[🛒 Amazon API]
        TWITTER_API[🐦 Twitter API]
        REDDIT_API[🤖 Reddit API]
        YOUTUBE_API[📺 YouTube API]
        INSTAGRAM_API[📸 Instagram API]
        GOOGLE_API[🔍 Google API]
        TIKTOK_API[🎵 TikTok API]
        LINKEDIN_API[💼 LinkedIn API]
    end
    
    %% User Interface
    CRAWLER_UI -->|Configure| AMAZON_CRAWLER
    CRAWLER_UI -->|Configure| TWITTER_CRAWLER
    CRAWLER_UI -->|Configure| REDDIT_CRAWLER
    CRAWLER_UI -->|Configure| YOUTUBE_CRAWLER
    CRAWLER_UI -->|Configure| INSTAGRAM_CRAWLER
    CRAWLER_UI -->|Configure| GOOGLE_CRAWLER
    CRAWLER_UI -->|Configure| TIKTOK_CRAWLER
    CRAWLER_UI -->|Configure| LINKEDIN_CRAWLER
    
    %% Crawler Operations
    AMAZON_CRAWLER -->|Collect| AMAZON_API
    TWITTER_CRAWLER -->|Collect| TWITTER_API
    REDDIT_CRAWLER -->|Collect| REDDIT_API
    YOUTUBE_CRAWLER -->|Collect| YOUTUBE_API
    INSTAGRAM_CRAWLER -->|Collect| INSTAGRAM_API
    GOOGLE_CRAWLER -->|Collect| GOOGLE_API
    TIKTOK_CRAWLER -->|Collect| TIKTOK_API
    LINKEDIN_CRAWLER -->|Collect| LINKEDIN_API
    
    %% Data Processing Flow
    AMAZON_CRAWLER -->|Raw Data| COLLECTOR
    TWITTER_CRAWLER -->|Raw Data| COLLECTOR
    REDDIT_CRAWLER -->|Raw Data| COLLECTOR
    YOUTUBE_CRAWLER -->|Raw Data| COLLECTOR
    INSTAGRAM_CRAWLER -->|Raw Data| COLLECTOR
    GOOGLE_CRAWLER -->|Raw Data| COLLECTOR
    TIKTOK_CRAWLER -->|Raw Data| COLLECTOR
    LINKEDIN_CRAWLER -->|Raw Data| COLLECTOR
    
    COLLECTOR -->|Extract| PARSER
    PARSER -->|Filter| FILTER
    FILTER -->|Validate| VALIDATOR
    VALIDATOR -->|Enrich| ENRICHER
    
    %% Storage Flow
    COLLECTOR -->|Store| RAW_STORAGE
    ENRICHER -->|Store| PROCESSED_STORAGE
    ENRICHER -->|Aggregate| ANALYTICS_STORAGE
    
    %% API Management
    TOKEN_MANAGER -.->|Authenticate| AMAZON_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| TWITTER_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| REDDIT_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| YOUTUBE_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| INSTAGRAM_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| GOOGLE_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| TIKTOK_CRAWLER
    TOKEN_MANAGER -.->|Authenticate| LINKEDIN_CRAWLER
    
    RATE_LIMITER -.->|Throttle| AMAZON_CRAWLER
    RATE_LIMITER -.->|Throttle| TWITTER_CRAWLER
    RATE_LIMITER -.->|Throttle| REDDIT_CRAWLER
    RATE_LIMITER -.->|Throttle| YOUTUBE_CRAWLER
    RATE_LIMITER -.->|Throttle| INSTAGRAM_CRAWLER
    RATE_LIMITER -.->|Throttle| GOOGLE_CRAWLER
    RATE_LIMITER -.->|Throttle| TIKTOK_CRAWLER
    RATE_LIMITER -.->|Throttle| LINKEDIN_CRAWLER
    
    ERROR_HANDLER -.->|Handle| AMAZON_CRAWLER
    ERROR_HANDLER -.->|Handle| TWITTER_CRAWLER
    ERROR_HANDLER -.->|Handle| REDDIT_CRAWLER
    ERROR_HANDLER -.->|Handle| YOUTUBE_CRAWLER
    ERROR_HANDLER -.->|Handle| INSTAGRAM_CRAWLER
    ERROR_HANDLER -.->|Handle| GOOGLE_CRAWLER
    ERROR_HANDLER -.->|Handle| TIKTOK_CRAWLER
    ERROR_HANDLER -.->|Handle| LINKEDIN_CRAWLER
    
    %% Styling
    classDef uiClass fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef crawlerClass fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef processClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef storageClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef apiClass fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef externalClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class CRAWLER_UI uiClass
    class AMAZON_CRAWLER,TWITTER_CRAWLER,REDDIT_CRAWLER,YOUTUBE_CRAWLER,INSTAGRAM_CRAWLER,GOOGLE_CRAWLER,TIKTOK_CRAWLER,LINKEDIN_CRAWLER crawlerClass
    class COLLECTOR,PARSER,FILTER,VALIDATOR,ENRICHER processClass
    class RAW_STORAGE,PROCESSED_STORAGE,ANALYTICS_STORAGE storageClass
    class TOKEN_MANAGER,RATE_LIMITER,ERROR_HANDLER apiClass
    class AMAZON_API,TWITTER_API,REDDIT_API,YOUTUBE_API,INSTAGRAM_API,GOOGLE_API,TIKTOK_API,LINKEDIN_API externalClass
```

---

## BrandPulse Database Schema Design (UML)

### Entity Relationship Diagram - Actual Implementation
```mermaid
erDiagram
    PRODUCTS {
        int id PK
        varchar name
        varchar sku UK
        text description
        varchar category
        varchar brand
        decimal price
        varchar url
        varchar image_url
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_PAGES {
        int id PK
        int product_id FK
        varchar url
        varchar page_type
        varchar platform
        varchar title
        text meta_description
        text content_summary
        timestamp last_crawled
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    SENTIMENT_ANALYSIS {
        int id PK
        int product_id FK
        int page_id FK
        text text
        varchar sentiment
        float score
        float confidence
        varchar channel
        varchar platform_specific_id
        varchar user_id
        timestamp timestamp
        json topics
        json keywords
        json engagement_metrics
        json metadata
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_ANALYTICS {
        int id PK
        int product_id FK
        date date
        int total_mentions
        int positive_mentions
        int negative_mentions
        int neutral_mentions
        float avg_sentiment_score
        int total_engagement
        json channel_breakdown
        json topic_breakdown
        timestamp created_at
        timestamp updated_at
    }
    
    SEARCH_QUERIES {
        int id PK
        varchar query_text
        int results_count
        varchar user_session
        timestamp timestamp
        int execution_time_ms
        json filters_applied
    }
    
    PRODUCT_SEARCH_INDEX {
        int id PK
        int product_id FK
        text search_text
        timestamp created_at
        timestamp updated_at
    }
    
    %% Relationships
    PRODUCTS ||--o{ PRODUCT_PAGES : "has_pages"
    PRODUCTS ||--o{ SENTIMENT_ANALYSIS : "analyzed_in"
    PRODUCTS ||--o{ PRODUCT_ANALYTICS : "tracked_by"
    PRODUCTS ||--o{ PRODUCT_SEARCH_INDEX : "indexed_in"
    PRODUCT_PAGES ||--o{ SENTIMENT_ANALYSIS : "contains_reviews"
```

### Complete Database Schema - Unified View
```mermaid
erDiagram
    PRODUCTS {
        int id PK "Primary Key"
        varchar name "Product Name"
        varchar sku UK "Unique SKU"
        text description "Product Description"
        varchar category "Product Category"
        varchar brand "Brand Name"
        decimal price "Price"
        varchar url "Product URL"
        varchar image_url "Image URL"
        varchar status "Active/Inactive"
        timestamp created_at "Creation Time"
        timestamp updated_at "Last Update"
    }
    
    PRODUCT_PAGES {
        int id PK "Primary Key"
        int product_id FK "References PRODUCTS"
        varchar url "Page URL"
        varchar page_type "Type of Page"
        varchar platform "Platform Name"
        varchar title "Page Title"
        text meta_description "Meta Description"
        text content_summary "Content Summary"
        timestamp last_crawled "Last Crawl Time"
        varchar status "Page Status"
        timestamp created_at "Creation Time"
        timestamp updated_at "Last Update"
    }
    
    SENTIMENT_ANALYSIS {
        int id PK "Primary Key"
        int product_id FK "References PRODUCTS"
        int page_id FK "References PRODUCT_PAGES"
        text text "Review Text"
        varchar sentiment "Positive/Negative/Neutral"
        float score "Sentiment Score"
        float confidence "Confidence Level"
        varchar channel "Data Source Channel"
        varchar platform_specific_id "Platform ID"
        varchar user_id "User Identifier"
        timestamp timestamp "Review Timestamp"
        json topics "Extracted Topics"
        json keywords "Keywords Array"
        json engagement_metrics "Engagement Data"
        json metadata "Additional Metadata"
        timestamp created_at "Creation Time"
        timestamp updated_at "Last Update"
    }
    
    PRODUCT_ANALYTICS {
        int id PK "Primary Key"
        int product_id FK "References PRODUCTS"
        date date "Analytics Date"
        int total_mentions "Total Mentions"
        int positive_mentions "Positive Count"
        int negative_mentions "Negative Count"
        int neutral_mentions "Neutral Count"
        float avg_sentiment_score "Average Score"
        int total_engagement "Total Engagement"
        json channel_breakdown "Channel Statistics"
        json topic_breakdown "Topic Statistics"
        timestamp created_at "Creation Time"
        timestamp updated_at "Last Update"
    }
    
    SEARCH_QUERIES {
        int id PK "Primary Key"
        varchar query_text "Search Query"
        int results_count "Number of Results"
        varchar user_session "Session ID"
        timestamp timestamp "Search Time"
        int execution_time_ms "Query Execution Time"
        json filters_applied "Applied Filters"
    }
    
    PRODUCT_SEARCH_INDEX {
        int id PK "Primary Key"
        int product_id FK "References PRODUCTS"
        text search_text "Searchable Text"
        timestamp created_at "Creation Time"
        timestamp updated_at "Last Update"
    }
    
    %% Primary Relationships
    PRODUCTS ||--o{ PRODUCT_PAGES : "has_pages"
    PRODUCTS ||--o{ SENTIMENT_ANALYSIS : "analyzed_in"
    PRODUCTS ||--o{ PRODUCT_ANALYTICS : "tracked_by"
    PRODUCTS ||--o{ PRODUCT_SEARCH_INDEX : "indexed_in"
    
    %% Secondary Relationships
    PRODUCT_PAGES ||--o{ SENTIMENT_ANALYSIS : "contains_reviews"
    
    %% Data Flow Relationships
    SENTIMENT_ANALYSIS ||--o{ PRODUCT_ANALYTICS : "aggregated_into"
    PRODUCTS ||--o{ SEARCH_QUERIES : "found_in"
```

---

## BrandPulse Machine Learning Model Algorithm

### Sentiment Analysis Pipeline - Implementation Overview
```mermaid
flowchart TD
    subgraph "Data Collection & Preprocessing"
        A[📥 Raw Text Input<br/>Reviews, Comments, Social Posts]
        B[🔍 Text Preprocessing<br/>Clean, Tokenize, Normalize]
        C[📊 Feature Extraction<br/>Word Embeddings + Metadata]
    end
    
    subgraph "Model Processing"
        D[🧠 BiLSTM + Attention<br/>Neural Network Architecture]
        E[🎯 Sentiment Classification<br/>Positive/Negative/Neutral]
        F[📈 Confidence Scoring<br/>Probability Distribution]
    end
    
    subgraph "Data Storage & Analytics"
        G[💾 Store Results<br/>sentiment_analysis table]
        H[📊 Aggregate Analytics<br/>product_analytics table]
        I[🔄 Real-time Updates<br/>Dashboard Refresh]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    
    %% Styling
    classDef dataClass fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef modelClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef storageClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class A,B,C dataClass
    class D,E,F modelClass
    class G,H,I storageClass
```

### ML Algorithm Implementation Steps

#### **Phase 1: Data Collection & Preprocessing**
1. **Text Input Processing**
   - Collect reviews from multiple platforms (Amazon, Twitter, Reddit, YouTube, etc.)
   - Extract text content, user information, and metadata
   - Store raw data in `sentiment_analysis` table

2. **Text Cleaning & Normalization**
   - Remove HTML tags, URLs, special characters
   - Convert to lowercase, handle contractions
   - Tokenize text into words/phrases
   - Remove stop words and noise

3. **Feature Engineering**
   - Convert text to numerical vectors using Word2Vec/GloVe
   - Extract contextual features (product mentions, brand names)
   - Create sequence matrices for neural network input

#### **Phase 2: Model Architecture & Training**
4. **BiLSTM Neural Network**
   - Input Layer: Embedding layer (vocabulary_size × 128)
   - Hidden Layer 1: Bidirectional LSTM (128 units)
   - Hidden Layer 2: Bidirectional LSTM (64 units)
   - Attention Layer: Self-attention mechanism
   - Output Layer: Dense layer with softmax (3 classes)

5. **Training Configuration**
   - Loss Function: Categorical Cross-entropy
   - Optimizer: Adam (learning_rate=0.001)
   - Batch Size: 32 samples
   - Early Stopping: patience=10 epochs
   - Validation Split: 80% train, 20% validation

#### **Phase 3: Prediction & Storage**
6. **Real-time Sentiment Analysis**
   - Process incoming text through trained model
   - Generate sentiment classification (positive/negative/neutral)
   - Calculate confidence scores and probabilities
   - Extract keywords and topics

7. **Database Storage**
   - Store results in `sentiment_analysis` table
   - Include: text, sentiment, score, confidence, channel, keywords
   - Link to products via `product_id` and pages via `page_id`

#### **Phase 4: Analytics & Aggregation**
8. **Daily Analytics Aggregation**
   - Calculate daily metrics per product
   - Count mentions by sentiment type
   - Compute average sentiment scores
   - Track engagement metrics

9. **Dashboard Data Preparation**
   - Aggregate data for dashboard views
   - Calculate trends and patterns
   - Generate insights for product managers

### **Algorithm Pseudocode**
```python
def analyze_sentiment(text_input, product_id, page_id, channel):
    # Phase 1: Preprocessing
    cleaned_text = clean_text(text_input)
    tokens = tokenize(cleaned_text)
    vectorized_input = vectorize(tokens)
    
    # Phase 2: Model Prediction
    lstm_output = bilstm_model.predict(vectorized_input)
    attention_weights = calculate_attention(lstm_output)
    weighted_output = apply_attention(lstm_output, attention_weights)
    
    # Phase 3: Classification
    probabilities = softmax(dense_layer(weighted_output))
    sentiment = argmax(probabilities)
    confidence = max(probabilities)
    score = calculate_sentiment_score(probabilities)
    
    # Phase 4: Store Results
    store_sentiment_analysis({
        'product_id': product_id,
        'page_id': page_id,
        'text': text_input,
        'sentiment': sentiment,
        'score': score,
        'confidence': confidence,
        'channel': channel,
        'keywords': extract_keywords(tokens),
        'topics': extract_topics(tokens)
    })
    
    return sentiment, score, confidence
```

### **Performance Metrics & Targets**
- **Accuracy**: > 85% on test set
- **Precision/Recall**: > 80% per sentiment class
- **F1-Score**: > 82% weighted average
- **Processing Time**: < 100ms per review
- **Throughput**: > 1000 reviews/second
- **Database Storage**: Optimized for 1M+ reviews

### **Data Flow Integration**
```mermaid
sequenceDiagram
    participant C as 🕷️ Crawler
    participant ML as 🤖 ML Model
    participant DB as 🗃️ Database
    participant API as 🚀 API
    participant UI as ⚛️ Frontend
    
    C->>ML: Raw review text
    ML->>ML: Process & classify
    ML->>DB: Store sentiment_analysis
    DB->>API: Query aggregated data
    API->>UI: Display analytics
    UI->>API: User interactions
    API->>DB: Update product_analytics
```

---

## System Architecture

### Unified High-Level System Overview
```mermaid
flowchart TD
    USERS[Users]
    SOURCES[External Data Sources]
    
    INFRASTRUCTURE[Infrastructure Layer<br/>Security & Load Balancing]
    
    APPLICATION[Application Layer<br/>Frontend + Backend + AI]
    
    DATA[Data Layer<br/>Collection, Processing & Storage]
    
    OPERATIONS[Operations Layer<br/>CI/CD, Monitoring & Security]
    
    %% Main Flow
    USERS -->|Access| INFRASTRUCTURE
    SOURCES -->|Feed| DATA
    
    INFRASTRUCTURE --> APPLICATION
    APPLICATION --> DATA
    
    OPERATIONS -.->|Support| INFRASTRUCTURE
    OPERATIONS -.->|Support| APPLICATION
    OPERATIONS -.->|Support| DATA
    
    DATA -->|Insights| APPLICATION
    APPLICATION -->|Response| USERS
    
    %% Styling
    classDef userLayer fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000
    classDef infraLayer fill:#e3f2fd,stroke:#1565c0,stroke-width:3px,color:#000
    classDef appLayer fill:#fff3e0,stroke:#ef6c00,stroke-width:3px,color:#000
    classDef dataLayer fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000
    classDef opsLayer fill:#fce4ec,stroke:#c2185b,stroke-width:3px,color:#000
    
    class USERS,SOURCES userLayer
    class INFRASTRUCTURE infraLayer
    class APPLICATION appLayer
    class DATA dataLayer
    class OPERATIONS opsLayer
```

### High-Level Architecture
```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
    end
    
    subgraph "Frontend Layer"
        REACT[React Frontend<br/>Port 3000]
        NGINX[Nginx Load Balancer<br/>Port 80/443]
    end
    
    subgraph "API Layer"
        BACKEND[FastAPI Backend<br/>Port 8000]
        DBAPI[Database API v2<br/>Port 8002]
    end
    
    subgraph "AI/ML Layer"
        GEMINI[Google Gemini 2.0<br/>ADK Agent]
        MODEL[BiLSTM Sentiment<br/>Analysis Model]
        SCRAPER[Web Scraping<br/>Service]
    end
    
    subgraph "Data Layer"
        MYSQL[(MySQL Database<br/>Port 3307)]
        REDIS[(Redis Cache<br/>Port 6379)]
    end
    
    subgraph "External Services"
        GOOGLE[Google Cloud<br/>Services]
        SOCIAL[Social Media<br/>APIs]
        ECOMMERCE[E-commerce<br/>Platforms]
    end
    
    WEB --> NGINX
    MOBILE --> NGINX
    NGINX --> REACT
    REACT --> BACKEND
    REACT --> DBAPI
    BACKEND --> GEMINI
    BACKEND --> MODEL
    BACKEND --> SCRAPER
    DBAPI --> MYSQL
    BACKEND --> REDIS
    SCRAPER --> SOCIAL
    SCRAPER --> ECOMMERCE
    GEMINI --> GOOGLE
```

---

## Component Overview

### Frontend Components
```mermaid
graph LR
    subgraph "React Components"
        APP[App.js<br/>Main Application]
        DASH[Dashboard<br/>Analytics Overview]
        ANALYTICS[Analytics<br/>Detailed Metrics]
        CHAT[Chat<br/>AI Assistant]
        SEARCH[ProductSearch<br/>Product Discovery]
        TIMELINE[Timeline<br/>Historical Data]
        TOPICS[Topics<br/>Topic Analysis]
        SETTINGS[Settings<br/>Configuration]
    end
    
    subgraph "Context Providers"
        THEME[ThemeContext<br/>Dark/Light Mode]
        PRODUCT[ProductContext<br/>Product State]
    end
    
    APP --> DASH
    APP --> ANALYTICS
    APP --> CHAT
    APP --> SEARCH
    APP --> TIMELINE
    APP --> TOPICS
    APP --> SETTINGS
    APP --> THEME
    APP --> PRODUCT
```

### Backend Services
```mermaid
graph TB
    subgraph "FastAPI Backend"
        MAIN[main.py<br/>Chat API Service]
        AUTH[Authentication<br/>Google ADK]
        CHAT[Chat Endpoints<br/>AI Interaction]
        ANALYZE[Analysis Endpoints<br/>Product Analysis]
    end
    
    subgraph "Database API"
        DBMAIN[main.py<br/>Database Service]
        PRODUCTS[Product Endpoints<br/>CRUD Operations]
        ANALYTICS[Analytics Endpoints<br/>Data Aggregation]
        HEALTH[Health Checks<br/>Service Monitoring]
    end
    
    subgraph "ML Services"
        BILSTM[BiLSTM Model<br/>Sentiment Analysis]
        EMBEDDINGS[GloVe Embeddings<br/>Word Vectors]
        TOKENIZER[Text Tokenizer<br/>Text Processing]
    end
    
    MAIN --> AUTH
    MAIN --> CHAT
    MAIN --> ANALYZE
    DBMAIN --> PRODUCTS
    DBMAIN --> ANALYTICS
    DBMAIN --> HEALTH
    ANALYZE --> BILSTM
    BILSTM --> EMBEDDINGS
    BILSTM --> TOKENIZER
```

---

## Database Design

### Entity Relationship Diagram
```mermaid
erDiagram
    PRODUCTS {
        int id PK
        varchar name
        varchar sku UK
        text description
        varchar category
        varchar brand
        decimal price
        varchar url
        varchar image_url
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_PAGES {
        int id PK
        int product_id FK
        varchar url
        varchar page_type
        varchar platform
        varchar title
        text meta_description
        text content_summary
        timestamp last_crawled
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    SENTIMENT_ANALYSIS {
        int id PK
        int product_id FK
        int page_id FK
        text text
        varchar sentiment
        float score
        float confidence
        varchar channel
        varchar platform_specific_id
        varchar user_id
        timestamp timestamp
        json topics
        json keywords
        json engagement_metrics
        json metadata
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_ANALYTICS {
        int id PK
        int product_id FK
        date date
        int total_mentions
        int positive_mentions
        int negative_mentions
        int neutral_mentions
        float avg_sentiment_score
        int total_engagement
        json channel_breakdown
        json topic_breakdown
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_SEARCH_INDEX {
        int id PK
        int product_id FK
        text search_text
        timestamp created_at
        timestamp updated_at
    }
    
    SEARCH_QUERIES {
        int id PK
        varchar query_text
        int results_count
        varchar user_session
        timestamp timestamp
        int execution_time_ms
        json filters_applied
    }
    
    PRODUCTS ||--o{ PRODUCT_PAGES : "has"
    PRODUCTS ||--o{ SENTIMENT_ANALYSIS : "analyzed_by"
    PRODUCT_PAGES ||--o{ SENTIMENT_ANALYSIS : "contains"
    PRODUCTS ||--o{ PRODUCT_ANALYTICS : "tracked_by"
    PRODUCTS ||--|| PRODUCT_SEARCH_INDEX : "indexed_in"
```

---

## Authentication Flow

### Google ADK Authentication Sequence
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as Google ADK
    participant D as Database
    
    U->>F: Access Application
    F->>B: Check Authentication
    B->>D: Validate Session
    
    alt No Valid Session
        B->>F: Redirect to Login
        F->>U: Show Login Form
        U->>F: Enter Credentials
        F->>B: Submit Credentials
        B->>G: Authenticate with Google
        G->>B: Return Auth Token
        B->>D: Store Session
        B->>F: Return Success
        F->>U: Redirect to Dashboard
    else Valid Session
        B->>F: Return User Data
        F->>U: Show Dashboard
    end
    
    Note over U,D: Session Management
    U->>F: Make API Request
    F->>B: Include Auth Token
    B->>D: Validate Token
    D->>B: Token Valid
    B->>F: Return Data
    F->>U: Display Results
```

---

## Web Scraping Pipeline

### Data Collection Architecture
```mermaid
flowchart TD
    subgraph "1. Scheduling Layer"
        CRON[Cron Scheduler<br/>Every 15 minutes]
        QUEUE[Redis Queue<br/>Job Management]
    end
    
    subgraph "2. Data Sources"
        SOCIAL[Social Media<br/>Twitter, Facebook, Instagram]
        REVIEWS[Review Sites<br/>Amazon, Google Reviews]
        NEWS[News & Blogs<br/>Tech Blogs, News Sites]
        FORUMS[Forums<br/>Reddit, Stack Overflow]
    end
    
    subgraph "3. Scraping Workers"
        WORKER1[Worker 1<br/>Social Media]
        WORKER2[Worker 2<br/>E-commerce]
        WORKER3[Worker 3<br/>News & Blogs]
        WORKER4[Worker 4<br/>Forums]
    end
    
    subgraph "4. Data Processing"
        PARSER[Content Parser<br/>Extract Text & Metadata]
        CLEANER[Text Cleaner<br/>Remove Noise & Normalize]
        VALIDATOR[Content Validator<br/>Check Quality & Relevance]
    end
    
    subgraph "5. AI Analysis"
        SENTIMENT[Sentiment Analysis<br/>BiLSTM Model]
        TOPICS[Topic Extraction<br/>Keyword Analysis]
        SCORING[Confidence Scoring<br/>Quality Metrics]
    end
    
    subgraph "6. Data Storage"
        MYSQL[(MySQL Database<br/>Structured Data)]
        CACHE[(Redis Cache<br/>Fast Access)]
    end
    
    CRON --> QUEUE
    QUEUE --> WORKER1
    QUEUE --> WORKER2
    QUEUE --> WORKER3
    QUEUE --> WORKER4
    
    WORKER1 --> SOCIAL
    WORKER2 --> REVIEWS
    WORKER3 --> NEWS
    WORKER4 --> FORUMS
    
    SOCIAL --> PARSER
    REVIEWS --> PARSER
    NEWS --> PARSER
    FORUMS --> PARSER
    
    PARSER --> CLEANER
    CLEANER --> VALIDATOR
    VALIDATOR --> SENTIMENT
    SENTIMENT --> TOPICS
    TOPICS --> SCORING
    SCORING --> MYSQL
    SCORING --> CACHE
```

---

## Data Flow Architecture

### Complete Data Flow Diagram
```mermaid
flowchart TD
    %% Data Sources
    EXTERNAL[External Sources<br/>Social Media, Reviews, News]
    
    %% Data Processing Pipeline
    INGESTION[Data Ingestion<br/>Scraping & Collection]
    PROCESSING[Data Processing<br/>Cleaning & Validation]
    AI[AI Analysis<br/>Sentiment & Topics]
    
    %% Data Storage
    DATABASE[(Database<br/>MySQL + Redis)]
    
    %% Application Layer
    API[API Services<br/>FastAPI Backend]
    FRONTEND[Frontend<br/>React Dashboard]
    
    %% Users
    USER[End Users<br/>Web & Mobile]
    
    %% Main Data Flow - Left to Right
    EXTERNAL --> INGESTION
    INGESTION --> PROCESSING
    PROCESSING --> AI
    AI --> DATABASE
    
    %% User Interaction Flow - Right to Left
    DATABASE --> API
    API --> FRONTEND
    FRONTEND --> USER
    
    %% Real-time Updates - Bidirectional
    USER -.->|Requests| FRONTEND
    FRONTEND -.->|API Calls| API
    API -.->|Data Queries| DATABASE
    
    %% Styling for better visual hierarchy
    classDef dataSource fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef processing fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef storage fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef application fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef users fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    
    class EXTERNAL dataSource
    class INGESTION,PROCESSING,AI processing
    class DATABASE storage
    class API,FRONTEND application
    class USER users
```

### Data Flow Types

#### 1. **Batch Processing Flow**
```mermaid
flowchart LR
    SCHEDULE[Scheduler<br/>Every 15 min]
    COLLECT[Data Collection<br/>Multi-platform]
    PROCESS[Processing Pipeline<br/>Clean & Validate]
    STORE[Data Storage<br/>MySQL + Redis]
    
    SCHEDULE --> COLLECT
    COLLECT --> PROCESS
    PROCESS --> STORE
    
    %% Styling
    classDef scheduler fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef collection fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    classDef processing fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class SCHEDULE scheduler
    class COLLECT collection
    class PROCESS processing
    class STORE storage
```

#### 2. **Real-time Processing Flow**
```mermaid
flowchart LR
    USER[User Request<br/>Web/Mobile]
    API[API Gateway<br/>FastAPI]
    CACHE{Cache Check<br/>Redis}
    DB[Database Query<br/>MySQL]
    RESPONSE[Response<br/>JSON Data]
    
    USER --> API
    API --> CACHE
    CACHE -->|Hit| RESPONSE
    CACHE -->|Miss| DB
    DB --> RESPONSE
    RESPONSE --> USER
    
    %% Styling
    classDef user fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef api fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef cache fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef database fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef response fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    
    class USER user
    class API api
    class CACHE cache
    class DB database
    class RESPONSE response
```

#### 3. **AI Processing Flow**
```mermaid
flowchart LR
    TEXT[Raw Text Data<br/>Social Media Posts]
    PREPARE[Text Preparation<br/>Clean & Tokenize]
    ANALYZE[AI Analysis<br/>BiLSTM Model]
    RESULTS[Sentiment Results<br/>Scores & Topics]
    STORE[Store Data<br/>Database]
    
    TEXT --> PREPARE
    PREPARE --> ANALYZE
    ANALYZE --> RESULTS
    RESULTS --> STORE
    
    %% Styling
    classDef input fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef prepare fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef analyze fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef results fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef store fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class TEXT input
    class PREPARE prepare
    class ANALYZE analyze
    class RESULTS results
    class STORE store
```

### Data Flow Characteristics

#### **Data Volume & Velocity**
- **Batch Processing:** 10,000+ records every 15 minutes
- **Real-time Processing:** < 100ms response time
- **AI Processing:** 1,000+ texts per minute
- **Cache Hit Rate:** 85%+ for frequently accessed data

#### **Data Quality Pipeline**
1. **Validation:** Content relevance and quality checks
2. **Deduplication:** Remove duplicate entries
3. **Normalization:** Standardize text format
4. **Enrichment:** Add metadata and context
5. **Scoring:** Confidence and quality metrics

#### **Error Handling & Recovery**
- **Retry Logic:** Automatic retry for failed operations
- **Dead Letter Queue:** Handle failed messages
- **Circuit Breaker:** Prevent cascade failures
- **Monitoring:** Real-time error tracking and alerts

---

## DevOps Pipeline

### CI/CD Pipeline Architecture
```mermaid
flowchart LR
    DEV[Developer<br/>Push Code]
    GIT[Git Repository<br/>GitHub/GitLab]
    CI[CI Pipeline<br/>Build & Test]
    TEST[Automated Tests<br/>Unit & Integration]
    BUILD[Build Images<br/>Docker]
    REGISTRY[Container Registry<br/>Docker Hub]
    DEPLOY[Deploy<br/>Production]
    MONITOR[Monitor<br/>Health Check]
    
    DEV --> GIT
    GIT --> CI
    CI --> TEST
    TEST --> BUILD
    BUILD --> REGISTRY
    REGISTRY --> DEPLOY
    DEPLOY --> MONITOR
    MONITOR -.->|Alert| DEV
    
    %% Styling
    classDef developer fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef source fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef cicd fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef testing fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef deployment fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef monitoring fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    
    class DEV developer
    class GIT source
    class CI,BUILD cicd
    class TEST testing
    class REGISTRY,DEPLOY deployment
    class MONITOR monitoring
```

### DevOps Workflow
```mermaid
flowchart TD
    CODE[Code Commit<br/>Git Push]
    TRIGGER[Trigger CI/CD<br/>Webhook]
    
    subgraph "Build Stage"
        LINT[Code Linting<br/>ESLint, Pylint]
        UNIT[Unit Tests<br/>Jest, Pytest]
        BUILD_APP[Build Application<br/>npm build, pip install]
    end
    
    subgraph "Test Stage"
        INTEGRATION[Integration Tests<br/>API Tests]
        SECURITY[Security Scan<br/>Vulnerability Check]
        COVERAGE[Code Coverage<br/>Report]
    end
    
    subgraph "Deploy Stage"
        BUILD_DOCKER[Build Docker Images<br/>Multi-stage Build]
        PUSH_REGISTRY[Push to Registry<br/>Tag & Version]
        DEPLOY_PROD[Deploy Production<br/>Rolling Update]
    end
    
    subgraph "Monitor Stage"
        HEALTH[Health Checks<br/>Service Status]
        METRICS[Metrics Collection<br/>Prometheus]
        ALERTS[Alert System<br/>Slack/Email]
    end
    
    CODE --> TRIGGER
    TRIGGER --> LINT
    LINT --> UNIT
    UNIT --> BUILD_APP
    
    BUILD_APP --> INTEGRATION
    INTEGRATION --> SECURITY
    SECURITY --> COVERAGE
    
    COVERAGE --> BUILD_DOCKER
    BUILD_DOCKER --> PUSH_REGISTRY
    PUSH_REGISTRY --> DEPLOY_PROD
    
    DEPLOY_PROD --> HEALTH
    HEALTH --> METRICS
    METRICS --> ALERTS
    
    %% Styling
    classDef codeStage fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef buildStage fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef testStage fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef deployStage fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef monitorStage fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class CODE,TRIGGER codeStage
    class LINT,UNIT,BUILD_APP buildStage
    class INTEGRATION,SECURITY,COVERAGE testStage
    class BUILD_DOCKER,PUSH_REGISTRY,DEPLOY_PROD deployStage
    class HEALTH,METRICS,ALERTS monitorStage
```

### Container Orchestration
```mermaid
flowchart TD
    DOCKER[Docker Compose<br/>Orchestrator]
    
    subgraph "Frontend Services"
        REACT_CONT[React Container<br/>nginx:alpine]
        NGINX_CONT[Nginx Container<br/>Load Balancer]
    end
    
    subgraph "Backend Services"
        API_CONT[FastAPI Container<br/>Python 3.12]
        DBAPI_CONT[Database API<br/>Python 3.12]
    end
    
    subgraph "Data Services"
        MYSQL_CONT[MySQL Container<br/>mysql:8.0]
        REDIS_CONT[Redis Container<br/>redis:7-alpine]
    end
    
    subgraph "Monitoring Services"
        PROM_CONT[Prometheus<br/>Metrics]
        GRAF_CONT[Grafana<br/>Dashboards]
    end
    
    DOCKER --> REACT_CONT
    DOCKER --> NGINX_CONT
    DOCKER --> API_CONT
    DOCKER --> DBAPI_CONT
    DOCKER --> MYSQL_CONT
    DOCKER --> REDIS_CONT
    DOCKER --> PROM_CONT
    DOCKER --> GRAF_CONT
    
    %% Styling
    classDef orchestrator fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    classDef frontend fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef backend fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef data fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef monitoring fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class DOCKER orchestrator
    class REACT_CONT,NGINX_CONT frontend
    class API_CONT,DBAPI_CONT backend
    class MYSQL_CONT,REDIS_CONT data
    class PROM_CONT,GRAF_CONT monitoring
```

---

## Infrastructure Architecture

### Cloud Infrastructure Overview
```mermaid
flowchart TD
    INTERNET[Internet<br/>Public Access]
    
    subgraph "Edge Layer"
        CDN[CDN<br/>CloudFlare]
        WAF[Web Application Firewall<br/>Security]
    end
    
    subgraph "Load Balancer"
        LB[Nginx Load Balancer<br/>SSL Termination]
    end
    
    subgraph "Application Tier"
        APP1[App Server 1<br/>Docker Containers]
        APP2[App Server 2<br/>Docker Containers]
    end
    
    subgraph "Data Tier"
        DB_PRIMARY[(Primary Database<br/>MySQL Master)]
        DB_REPLICA[(Replica Database<br/>MySQL Slave)]
        CACHE[(Cache Layer<br/>Redis Cluster)]
    end
    
    subgraph "Storage & Backup"
        STORAGE[Object Storage<br/>Static Assets]
        BACKUP[Backup Service<br/>Automated Backups]
    end
    
    subgraph "Monitoring & Logging"
        MONITOR[Monitoring<br/>Prometheus + Grafana]
        LOGS[Logging<br/>ELK Stack]
    end
    
    INTERNET --> CDN
    CDN --> WAF
    WAF --> LB
    LB --> APP1
    LB --> APP2
    
    APP1 --> DB_PRIMARY
    APP2 --> DB_PRIMARY
    APP1 --> CACHE
    APP2 --> CACHE
    
    DB_PRIMARY -.->|Replication| DB_REPLICA
    
    APP1 --> STORAGE
    APP2 --> STORAGE
    DB_PRIMARY --> BACKUP
    
    APP1 -.->|Metrics| MONITOR
    APP2 -.->|Metrics| MONITOR
    APP1 -.->|Logs| LOGS
    APP2 -.->|Logs| LOGS
    
    %% Styling
    classDef internet fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    classDef edge fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef balancer fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef application fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef storage fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef monitoring fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    
    class INTERNET internet
    class CDN,WAF edge
    class LB balancer
    class APP1,APP2 application
    class DB_PRIMARY,DB_REPLICA,CACHE database
    class STORAGE,BACKUP storage
    class MONITOR,LOGS monitoring
```

### Network Architecture
```mermaid
flowchart LR
    subgraph "Public Subnet"
        WEB[Web Servers<br/>Public IP]
        LB_NET[Load Balancer<br/>Public Endpoint]
    end
    
    subgraph "Private Subnet"
        APP_NET[Application Servers<br/>Private IP]
        API_NET[API Services<br/>Private IP]
    end
    
    subgraph "Database Subnet"
        DB_NET[(Database Servers<br/>Isolated Network)]
        CACHE_NET[(Cache Servers<br/>Isolated Network)]
    end
    
    subgraph "Management Subnet"
        BASTION[Bastion Host<br/>SSH Gateway]
        MONITOR_NET[Monitoring Services<br/>Internal Only]
    end
    
    LB_NET --> WEB
    WEB --> APP_NET
    APP_NET --> API_NET
    API_NET --> DB_NET
    API_NET --> CACHE_NET
    
    BASTION -.->|SSH| APP_NET
    BASTION -.->|SSH| DB_NET
    MONITOR_NET -.->|Metrics| APP_NET
    MONITOR_NET -.->|Metrics| DB_NET
    
    %% Styling
    classDef publicNet fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef privateNet fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef databaseNet fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef managementNet fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    
    class WEB,LB_NET publicNet
    class APP_NET,API_NET privateNet
    class DB_NET,CACHE_NET databaseNet
    class BASTION,MONITOR_NET managementNet
```

### Security Architecture
```mermaid
flowchart TD
    USER_SEC[User Access<br/>HTTPS Only]
    
    subgraph "Security Layers"
        FIREWALL[Firewall<br/>Port Filtering]
        WAF_SEC[WAF<br/>SQL Injection, XSS Protection]
        DDOS[DDoS Protection<br/>Rate Limiting]
    end
    
    subgraph "Authentication & Authorization"
        AUTH[Authentication<br/>Google OAuth 2.0]
        JWT_AUTH[JWT Tokens<br/>Session Management]
        RBAC[Role-Based Access<br/>Permissions]
    end
    
    subgraph "Data Security"
        ENCRYPT[Encryption at Rest<br/>AES-256]
        SSL[Encryption in Transit<br/>TLS 1.3]
        BACKUP_SEC[Encrypted Backups<br/>Daily Snapshots]
    end
    
    subgraph "Monitoring & Compliance"
        AUDIT[Audit Logging<br/>All Access Logged]
        COMPLIANCE[Compliance<br/>GDPR, SOC2]
        ALERTS_SEC[Security Alerts<br/>Real-time Monitoring]
    end
    
    USER_SEC --> FIREWALL
    FIREWALL --> WAF_SEC
    WAF_SEC --> DDOS
    
    DDOS --> AUTH
    AUTH --> JWT_AUTH
    JWT_AUTH --> RBAC
    
    RBAC --> ENCRYPT
    ENCRYPT --> SSL
    SSL --> BACKUP_SEC
    
    BACKUP_SEC --> AUDIT
    AUDIT --> COMPLIANCE
    COMPLIANCE --> ALERTS_SEC
    
    %% Styling
    classDef userLayer fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef securityLayer fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef authLayer fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef dataLayer fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef complianceLayer fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class USER_SEC userLayer
    class FIREWALL,WAF_SEC,DDOS securityLayer
    class AUTH,JWT_AUTH,RBAC authLayer
    class ENCRYPT,SSL,BACKUP_SEC dataLayer
    class AUDIT,COMPLIANCE,ALERTS_SEC complianceLayer
```

---

## UML Class Diagrams

### Frontend Component Architecture
```mermaid
classDiagram
    class App {
        +state: object
        +darkMode: boolean
        +mobileOpen: boolean
        +handleDrawerToggle()
        +render()
    }
    
    class Dashboard {
        +data: object
        +loading: boolean
        +fetchData()
        +render()
    }
    
    class Analytics {
        +timeRange: string
        +channel: string
        +data: object
        +updateFilters()
        +render()
    }
    
    class Chat {
        +messages: array
        +input: string
        +sendMessage()
        +clearHistory()
        +render()
    }
    
    class ProductSearch {
        +query: string
        +results: array
        +filters: object
        +search()
        +applyFilters()
        +render()
    }
    
    class Timeline {
        +data: array
        +granularity: string
        +fetchData()
        +render()
    }
    
    class Topics {
        +topics: array
        +sentiment: object
        +fetchData()
        +render()
    }
    
    class Settings {
        +settings: object
        +updateSettings()
        +testConnection()
        +render()
    }
    
    App --> Dashboard
    App --> Analytics
    App --> Chat
    App --> ProductSearch
    App --> Timeline
    App --> Topics
    App --> Settings
```

### Backend API Architecture
```mermaid
classDiagram
    class FastAPIApp {
        +app: FastAPI
        +middleware: CORSMiddleware
        +lifespan()
        +startup()
        +shutdown()
    }
    
    class ChatAPI {
        +brand_pulse_agent: Agent
        +chat_sessions: dict
        +chat_with_agent()
        +analyze_product()
        +get_chat_history()
        +clear_chat_history()
    }
    
    class DatabaseAPI {
        +db_config: dict
        +connection: Connection
        +test_connection()
        +get_products()
        +get_analytics()
        +health_check()
    }
    
    class ProductModel {
        +id: int
        +name: str
        +sku: str
        +description: str
        +category: str
        +brand: str
        +price: float
        +url: str
        +image_url: str
        +status: str
        +created_at: datetime
        +updated_at: datetime
    }
    
    class SentimentModel {
        +id: int
        +product_id: int
        +text: str
        +sentiment: str
        +score: float
        +confidence: float
        +channel: str
        +timestamp: datetime
        +topics: json
        +keywords: json
    }
    
    class ChatMessage {
        +text: str
        +product_name: str
        +context: str
    }
    
    class ChatResponse {
        +response: str
        +timestamp: str
        +agent_name: str
    }
    
    FastAPIApp --> ChatAPI
    FastAPIApp --> DatabaseAPI
    DatabaseAPI --> ProductModel
    DatabaseAPI --> SentimentModel
    ChatAPI --> ChatMessage
    ChatAPI --> ChatResponse
```

### ML Model Architecture
```mermaid
classDiagram
    class BiLSTMWithEmbeddings {
        +vocab_size: int
        +max_length: int
        +embedding_dim: int
        +tokenizer: Tokenizer
        +model: Model
        +class_weights: dict
        +embedding_matrix: ndarray
        +download_glove_embeddings()
        +load_glove_embeddings()
        +create_embedding_matrix()
        +advanced_clean_tweet()
        +load_and_preprocess_data()
        +prepare_tokenizer_and_sequences()
        +compute_class_weights()
        +build_model_with_embeddings()
        +train_model()
        +evaluate_model()
        +predict_sentiment()
    }
    
    class TextProcessor {
        +clean_tweet()
        +remove_urls()
        +handle_contractions()
        +normalize_text()
    }
    
    class EmbeddingManager {
        +embeddings_index: dict
        +load_embeddings()
        +create_matrix()
        +get_word_vector()
    }
    
    class ModelTrainer {
        +callbacks: list
        +train()
        +validate()
        +save_model()
        +load_model()
    }
    
    class SentimentPredictor {
        +model: Model
        +tokenizer: Tokenizer
        +predict()
        +batch_predict()
        +get_confidence()
    }
    
    BiLSTMWithEmbeddings --> TextProcessor
    BiLSTMWithEmbeddings --> EmbeddingManager
    BiLSTMWithEmbeddings --> ModelTrainer
    BiLSTMWithEmbeddings --> SentimentPredictor
```

---

## Sequence Diagrams

### Product Analysis Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as Google ADK
    participant M as ML Model
    participant D as Database
    participant S as Scraper
    
    U->>F: Search Product
    F->>B: GET /api/products/search
    B->>D: Query Products
    D->>B: Return Results
    B->>F: Product List
    
    U->>F: Select Product
    F->>B: GET /api/products/{id}/sentiment
    B->>D: Query Sentiment Data
    D->>B: Return Sentiment
    B->>F: Sentiment Analysis
    
    U->>F: Request AI Analysis
    F->>B: POST /api/analyze/product
    B->>G: Send Product Info
    G->>B: AI Analysis
    B->>F: Analysis Results
    
    U->>F: Request Real-time Data
    F->>B: POST /api/scrape/update
    B->>S: Trigger Scraping
    S->>S: Scrape Social Media
    S->>M: Process Text
    M->>S: Sentiment Scores
    S->>D: Store Results
    D->>B: Updated Data
    B->>F: Fresh Analysis
    F->>U: Updated Dashboard
```

### Chat Interaction Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as Google ADK
    participant D as Database
    
    U->>F: Send Chat Message
    F->>B: POST /api/chat
    B->>G: Process with Gemini
    G->>B: AI Response
    B->>D: Store Chat History
    D->>B: Confirmation
    B->>F: Chat Response
    F->>U: Display Response
    
    U->>F: Request Product Analysis
    F->>B: POST /api/analyze/product
    B->>D: Get Product Data
    D->>B: Product Info
    B->>G: Analyze Product
    G->>B: Comprehensive Analysis
    B->>F: Analysis Results
    F->>U: Show Analysis
    
    U->>F: Clear Chat History
    F->>B: DELETE /api/chat/history
    B->>D: Clear Session
    D->>B: Confirmation
    B->>F: Success Response
    F->>U: Chat Cleared
```

---

## Deployment Architecture

### Production Environment
```mermaid
graph TD
    subgraph "Client Layer"
        USER[Users<br/>Web Browser<br/>Mobile App]
    end
    
    subgraph "Load Balancer Layer"
        LB[Nginx<br/>Port 80/443<br/>SSL & Load Balancing]
    end
    
    subgraph "Application Layer"
        FE[React Frontend<br/>Port 3000<br/>User Interface]
        API[FastAPI Backend<br/>Port 8000<br/>Chat & AI Services]
        DBAPI[Database API<br/>Port 8002<br/>Data Operations]
    end
    
    subgraph "AI Services Layer"
        AI[Google Gemini 2.0<br/>ADK Agent<br/>Natural Language]
        ML[BiLSTM Model<br/>Sentiment Analysis<br/>Real-time Processing]
    end
    
    subgraph "Data Layer"
        DB[(MySQL Database<br/>Port 3307<br/>Primary Data Store)]
        CACHE[(Redis Cache<br/>Port 6379<br/>Sessions & Cache)]
    end
    
    USER -->|HTTPS| LB
    LB -->|Static Files| FE
    FE -->|API Calls| API
    FE -->|Data Requests| DBAPI
    API -->|AI Requests| AI
    API -->|ML Processing| ML
    API -->|Cache Access| CACHE
    DBAPI -->|Queries| DB
    DBAPI -->|Cache Operations| CACHE
```

---

## Technology Stack

### Frontend Technologies
- **React 18** - Modern UI framework with hooks and concurrent features
- **Material-UI** - Comprehensive component library
- **Framer Motion** - Advanced animations and transitions
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side routing

### Backend Technologies
- **FastAPI** - Modern Python web framework with automatic API documentation
- **Pydantic** - Data validation and serialization
- **Uvicorn** - High-performance ASGI server
- **CORS** - Cross-origin resource sharing middleware

### Database Technologies
- **MySQL 8.0** - Primary relational database with JSON support
- **Redis** - In-memory data store for caching and sessions
- **PyMySQL/MySQL Connector** - Database drivers for Python

### AI/ML Technologies
- **Google ADK** - AI agent development framework
- **Gemini 2.0 Flash** - Large language model for natural language processing
- **TensorFlow/Keras** - Deep learning framework
- **BiLSTM** - Bidirectional LSTM for sentiment analysis
- **GloVe Embeddings** - Pre-trained word vector representations

### Infrastructure Technologies
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container application orchestration
- **Nginx** - Load balancer and reverse proxy
- **Linux** - Operating system
---

## Key Features

### 🔐 **Authentication & Security**
- Google ADK Agent authentication
- JWT token management
- OAuth 2.0 integration
- Multi-layer security architecture
- SSL/TLS encryption

### 🕷️ **Web Scraping Capabilities**
- Multi-platform scraping (Twitter, Facebook, Instagram, Amazon, etc.)
- Content parsing and cleaning pipeline
- Quality control and deduplication
- Real-time data processing
- Sentiment analysis integration

### 🤖 **AI/ML Components**
- Google Gemini 2.0 Flash integration
- BiLSTM sentiment analysis model
- GloVe embeddings
- Multi-task learning (sentiment + sarcasm detection)
- Real-time text processing

### 🏗️ **System Architecture**
- Microservices architecture
- Docker containerization
- Load balancing with Nginx
- MySQL primary/replica setup
- Redis caching layer
- Comprehensive monitoring stack

---

---

## System Flow Diagram

### Complete Data Flow & Process Architecture
```mermaid
flowchart TD
    subgraph "1. User Interface Layer"
        UI[User Interface<br/>React Frontend]
        DASH[Dashboard<br/>Analytics View]
        CHAT[Chat Interface<br/>AI Assistant]
        SEARCH[Product Search<br/>Discovery Tool]
    end
    
    subgraph "2. API Gateway Layer"
        NGINX[Nginx Load Balancer<br/>Port 80/443]
        AUTH[Authentication<br/>Google ADK]
        CORS[CORS Middleware<br/>Cross-Origin]
    end
    
    subgraph "3. Application Services Layer"
        CHATAPI[Chat API Service<br/>Port 8000]
        DBAPI[Database API Service<br/>Port 8002]
        SCRAPER[Web Scraping Service<br/>Background Jobs]
    end
    
    subgraph "4. AI/ML Processing Layer"
        GEMINI[Google Gemini 2.0<br/>ADK Agent]
        BILSTM[BiLSTM Model<br/>Sentiment Analysis]
        EMBEDDINGS[GloVe Embeddings<br/>Word Vectors]
        PROCESSOR[Text Processor<br/>Cleaning & Normalization]
    end
    
    subgraph "5. Data Sources Layer"
        SOCIAL[Social Media<br/>Twitter, Facebook, Instagram]
        REVIEWS[Review Platforms<br/>Amazon, Google Reviews]
        NEWS[News & Blogs<br/>Tech Sites, News]
        FORUMS[Forums<br/>Reddit, Stack Overflow]
    end
    
    subgraph "6. Data Storage Layer"
        MYSQL[(MySQL Database<br/>Port 3307<br/>Primary Storage)]
        REDIS[(Redis Cache<br/>Port 6379<br/>Sessions & Cache)]
        FILES[File Storage<br/>Models & Assets]
    end
    
    subgraph "7. External Services Layer"
        GOOGLE[Google Cloud<br/>Services & APIs]
        CDN[Content Delivery<br/>Network]
        MONITOR[Monitoring<br/>Health Checks]
    end
    
    %% User Interactions
    UI --> DASH
    UI --> CHAT
    UI --> SEARCH
    
    %% API Gateway Flow
    DASH --> NGINX
    CHAT --> NGINX
    SEARCH --> NGINX
    NGINX --> AUTH
    AUTH --> CORS
    
    %% Service Routing
    CORS --> CHATAPI
    CORS --> DBAPI
    
    %% Chat Service Flow
    CHATAPI --> GEMINI
    CHATAPI --> REDIS
    CHATAPI --> MYSQL
    
    %% Database Service Flow
    DBAPI --> MYSQL
    DBAPI --> REDIS
    DBAPI --> MONITOR
    
    %% Scraping Service Flow
    SCRAPER --> SOCIAL
    SCRAPER --> REVIEWS
    SCRAPER --> NEWS
    SCRAPER --> FORUMS
    
    %% AI/ML Processing Flow
    SOCIAL --> PROCESSOR
    REVIEWS --> PROCESSOR
    NEWS --> PROCESSOR
    FORUMS --> PROCESSOR
    
    PROCESSOR --> BILSTM
    BILSTM --> EMBEDDINGS
    BILSTM --> MYSQL
    
    %% External Service Integration
    GEMINI --> GOOGLE
    CHATAPI --> CDN
    DBAPI --> MONITOR
    
    %% Data Flow Styling
    classDef userLayer fill:#e1f5fe
    classDef apiLayer fill:#f3e5f5
    classDef serviceLayer fill:#e8f5e8
    classDef aiLayer fill:#fff3e0
    classDef dataLayer fill:#fce4ec
    classDef storageLayer fill:#f1f8e9
    classDef externalLayer fill:#e0f2f1
    
    class UI,DASH,CHAT,SEARCH userLayer
    class NGINX,AUTH,CORS apiLayer
    class CHATAPI,DBAPI,SCRAPER serviceLayer
    class GEMINI,BILSTM,EMBEDDINGS,PROCESSOR aiLayer
    class SOCIAL,REVIEWS,NEWS,FORUMS dataLayer
    class MYSQL,REDIS,FILES storageLayer
    class GOOGLE,CDN,MONITOR externalLayer
```

### Real-Time Data Processing Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant N as Nginx
    participant C as Chat API
    participant D as Database API
    participant G as Gemini AI
    participant S as Scraper
    participant M as ML Model
    participant DB as MySQL
    participant R as Redis
    
    Note over U,R: User Initiates Product Analysis
    
    U->>F: Search for Product
    F->>N: GET /api/products/search
    N->>D: Forward Request
    D->>R: Check Cache
    R->>D: Cache Miss
    D->>DB: Query Products
    DB->>D: Return Results
    D->>R: Cache Results
    D->>N: Product List
    N->>F: Response
    F->>U: Display Products
    
    Note over U,R: AI Analysis Request
    
    U->>F: Request AI Analysis
    F->>N: POST /api/analyze/product
    N->>C: Forward Request
    C->>G: Send Product Context
    G->>C: AI Analysis
    C->>DB: Store Analysis
    C->>N: Analysis Results
    N->>F: Response
    F->>U: Show Analysis
    
    Note over U,R: Real-Time Data Update
    
    U->>F: Request Fresh Data
    F->>N: POST /api/scrape/update
    N->>S: Trigger Scraping
    S->>S: Scrape Social Media
    S->>M: Process Text Data
    M->>S: Sentiment Scores
    S->>DB: Store Results
    S->>R: Update Cache
    DB->>D: Data Updated
    D->>N: Fresh Data
    N->>F: Updated Analysis
    F->>U: Real-Time Dashboard
```

### System Monitoring & Health Flow
```mermaid
flowchart LR
    subgraph "Health Monitoring"
        HEALTH[Health Check Service]
        METRICS[System Metrics]
        ALERTS[Alert System]
    end
    
    subgraph "Service Status"
        CHATSTATUS[Chat API Status]
        DBSTATUS[Database API Status]
        MLSTATUS[ML Model Status]
        SCRAPERSTATUS[Scraper Status]
    end
    
    subgraph "Performance Metrics"
        CPU[CPU Usage]
        MEMORY[Memory Usage]
        DISK[Disk Usage]
        NETWORK[Network I/O]
    end
    
    subgraph "External Monitoring"
        UPTIME[Uptime Monitoring]
        LOGS[Log Aggregation]
        DASHBOARD[Monitoring Dashboard]
    end
    
    HEALTH --> CHATSTATUS
    HEALTH --> DBSTATUS
    HEALTH --> MLSTATUS
    HEALTH --> SCRAPERSTATUS
    
    CHATSTATUS --> METRICS
    DBSTATUS --> METRICS
    MLSTATUS --> METRICS
    SCRAPERSTATUS --> METRICS
    
    METRICS --> CPU
    METRICS --> MEMORY
    METRICS --> DISK
    METRICS --> NETWORK
    
    CPU --> ALERTS
    MEMORY --> ALERTS
    DISK --> ALERTS
    NETWORK --> ALERTS
    
    ALERTS --> UPTIME
    ALERTS --> LOGS
    UPTIME --> DASHBOARD
    LOGS --> DASHBOARD
```

---

This architecture documentation provides a complete technical overview of the BrandPulse system, enabling developers, architects, and stakeholders to understand the system's structure, data flows, and capabilities.