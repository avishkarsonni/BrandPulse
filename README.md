# 🎯 Sentiment Analysis Dashboard

A modern, responsive React dashboard for analyzing sentiment data with beautiful visualizations and AI-powered chat assistance.

## ✨ Features

- **📊 Dashboard Overview** - Key metrics and sentiment distribution
- **📈 Analytics** - Detailed sentiment analysis with charts and trends
- **⏰ Timeline** - Time-based sentiment tracking and patterns
- **🏷️ Topics** - Topic analysis and trending keywords
- **💬 AI Chat** - Interactive chat assistant for data insights
- **⚙️ Settings** - Customizable dashboard configuration

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix linting issues |

## 🛠️ Built With

- **React 18** - Frontend framework
- **Material-UI (MUI)** - UI components and theming
- **Framer Motion** - Smooth animations
- **React Router** - Navigation
- **Chart.js** - Data visualizations
- **Axios** - HTTP client

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard view
│   ├── Analytics.js     # Analytics and charts
│   ├── Timeline.js      # Timeline analysis
│   ├── Topics.js        # Topic analysis
│   ├── Chat.js          # AI chat interface
│   └── Settings.js      # Settings page
├── contexts/            # React contexts
├── services/            # API services
└── utils/               # Utility functions
```

## 🎨 Features Overview

### Dashboard
- Real-time sentiment metrics
- Interactive cards with animations
- Top positive/negative topics
- Recent alerts and notifications

### Analytics
- Channel performance breakdown
- Keyword analysis with sentiment
- Recent reviews table with pagination
- Filterable data by time range and channel

### Timeline
- Hourly, daily, and weekly trends
- Peak activity identification
- Response time tracking
- Satisfaction score monitoring

### Topics
- Trending topic analysis
- Keyword extraction and sentiment
- Topic insights and statistics
- Interactive topic selection

### Chat
- AI-powered data insights
- Quick action buttons
- Message history
- Real-time responses

## 🔧 Configuration

The dashboard uses dummy data by default. To connect to a real API:

1. Set up your backend API
2. Update the API URL in `src/services/api.js`
3. Configure environment variables if needed

## 📦 Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy analyzing! 🎉**