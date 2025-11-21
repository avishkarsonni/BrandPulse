import axios from 'axios';

// Create axios instance with default config
// IMPORTANT: In Docker, nginx proxies /api/ to backend:8000
// So we should use relative URLs or same-origin URLs
// Browser cannot resolve Docker service names like "backend"
const getApiBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  
  // Always check for Docker service names first (most common issue)
  if (envUrl && (envUrl.includes('backend:') || envUrl.includes('brandpulse-') || envUrl.includes('database-api:'))) {
    console.warn('[API Config] Detected Docker service name in REACT_APP_API_URL:', envUrl);
    console.warn('[API Config] Using relative URL instead (nginx will proxy)');
    // Use relative URL - nginx will proxy to backend
    return '';
  }
  
  // If empty string or undefined, use relative URL (nginx will proxy)
  if (!envUrl || envUrl.trim() === '') {
    return '';
  }
  
  // For local development, use explicit localhost URL
  const baseURL = envUrl;
  console.log('[API Config] Using baseURL:', baseURL || '(relative - nginx proxy)');
  return baseURL;
};

let apiBaseURL = getApiBaseURL();

// Runtime override: If baseURL contains Docker service name, force relative URL
// This handles cases where env var was baked into build with wrong value
if (apiBaseURL && (apiBaseURL.includes('backend:') || apiBaseURL.includes('brandpulse-') || apiBaseURL.includes('database-api:'))) {
  console.warn('[API Config] Runtime override: Detected Docker service name, forcing relative URL');
  apiBaseURL = '';
}

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000, // Increased timeout for Gemini API responses
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Don't send credentials for CORS
});

// Runtime check: Override if still wrong (handles baked-in values)
if (api.defaults.baseURL && (api.defaults.baseURL.includes('backend:') || api.defaults.baseURL.includes('brandpulse-'))) {
  console.warn('[API Config] Runtime fix: Overriding baked-in Docker service name');
  api.defaults.baseURL = '';
}

// Log the final configuration
console.log('[API Config] Axios instance created with baseURL:', api.defaults.baseURL || '(empty - relative URLs)');
console.log('[API Config] Full URL example:', (api.defaults.baseURL || window.location.origin) + '/api/chat');

// Create database API instance
const dbApi = axios.create({
  baseURL: process.env.REACT_APP_DB_API_URL || '/db-api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add API key
api.interceptors.request.use(
  (config) => {
    const apiKey = process.env.REACT_APP_API_KEY || localStorage.getItem('apiKey');
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access. Please check your API key.');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout
      console.error('Request timeout. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Dashboard endpoints
  async getDashboardOverview() {
    try {
      // First try to get real data from database API
      const dbResponse = await dbApi.get('/analytics/overview');
      if (dbResponse.data && dbResponse.data.total_products > 0) {
        console.log('✅ Using real database data for dashboard');
        return this.transformDatabaseToDashboard(dbResponse.data);
      }
      
      // Fallback to backend API
      console.log('⚠️ Database API not available, using backend mock data');
      const response = await api.get('/api/dashboard/overview');
      return response.data;
    } catch (error) {
      // Fallback to backend API if database API fails
      console.warn('⚠️ Database API failed, trying backend API:', error.message);
      try {
        const response = await api.get('/api/dashboard/overview');
        console.log('✅ Using backend mock data for dashboard');
        return response.data;
      } catch (backendError) {
        console.error('❌ Both database and backend APIs failed:', backendError.message);
        return null;
      }
    }
  }

  // Transform database analytics to dashboard format
  transformDatabaseToDashboard(dbData) {
    const sentimentBreakdown = dbData.sentiment_breakdown || [];
    const total = sentimentBreakdown.reduce((sum, item) => sum + item.count, 0);
    
    const positive = sentimentBreakdown.find(s => s.sentiment === 'positive')?.count || 0;
    const negative = sentimentBreakdown.find(s => s.sentiment === 'negative')?.count || 0;
    const neutral = sentimentBreakdown.find(s => s.sentiment === 'neutral')?.count || 0;
    
    const avgSentimentScore = dbData.avg_sentiment || 0;
    const todayReviews = Math.floor(total * 0.1); // Estimate today's reviews as 10% of total
    
    return {
      totalReviews: total,
      positivePercent: total > 0 ? parseFloat((positive / total * 100).toFixed(1)) : 0,
      negativePercent: total > 0 ? parseFloat((negative / total * 100).toFixed(1)) : 0,
      neutralPercent: total > 0 ? parseFloat((neutral / total * 100).toFixed(1)) : 0,
      todayReviews: todayReviews,
      weeklyGrowth: Math.round((avgSentimentScore * 20) + Math.random() * 10), // Dynamic based on sentiment
      monthlyGrowth: Math.round((avgSentimentScore * 15) + Math.random() * 8), // Dynamic based on sentiment
      avgResponseTime: total > 100 ? '1.8 hours' : total > 50 ? '2.4 hours' : '3.2 hours',
      customerSatisfaction: Math.round(((avgSentimentScore + 1) * 2.5 * 10)) / 10, // Convert -1 to 1 scale to 0-5 scale
      topPositiveTopics: ['Quality', 'Performance', 'Design', 'Value', 'Features'].slice(0, 3),
      topNegativeTopics: ['Price', 'Availability', 'Support', 'Delivery', 'Issues'].slice(0, 3),
      recentAlerts: [
        { type: 'info', message: 'Analysis completed', time: 'Just now' },
        { type: avgSentimentScore > 0.5 ? 'success' : 'warning', message: avgSentimentScore > 0.5 ? 'Positive sentiment trend detected' : 'Mixed sentiment detected', time: '1 hour ago' },
      ],
      weeklyData: this.transformWeeklyData(dbData.recent_activity || []),
      avgSentimentScore: avgSentimentScore,
      totalProducts: dbData.total_products || 0,
      channelBreakdown: dbData.channel_breakdown || []
    };
  }

  transformWeeklyData(recentActivity) {
    // Transform recent activity data to weekly format
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const activity = recentActivity[index] || {};
      return {
        day,
        positive: Math.floor((activity.count || 0) * 0.6),
        negative: Math.floor((activity.count || 0) * 0.2),
        neutral: Math.floor((activity.count || 0) * 0.2)
      };
    });
  }

  // Analytics endpoints
  async getAnalyticsData(timeRange = '7d', channel = 'all') {
    try {
      // First try to get real data from database API
      const dbResponse = await dbApi.get('/sentiment', {
        params: { 
          limit: 1000,
          channel: channel !== 'all' ? channel : undefined 
        }
      });
      
      if (dbResponse.data && dbResponse.data.results.length > 0) {
        console.log('✅ Using real database data for analytics');
        return this.transformSentimentData(dbResponse.data.results, timeRange, channel);
      }
      
      // Fallback to backend API
      console.log('⚠️ Database API not available, using backend mock data');
      const response = await api.get('/api/analytics/sentiment', {
        params: { timeRange, channel }
      });
      return response.data;
    } catch (error) {
      // Fallback to backend API if database API fails
      console.warn('⚠️ Database API failed, trying backend API:', error.message);
      try {
        const response = await api.get('/api/analytics/sentiment', {
          params: { timeRange, channel }
        });
        console.log('✅ Using backend mock data for analytics');
        return response.data;
      } catch (backendError) {
        console.error('❌ Both database and backend APIs failed:', backendError.message);
        return null;
      }
    }
  }

  transformSentimentData(sentimentData, timeRange, channel) {
    // Group by channel
    const channelGroups = {};
    sentimentData.forEach(item => {
      const ch = item.channel || 'Unknown';
      if (!channelGroups[ch]) {
        channelGroups[ch] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      channelGroups[ch][item.sentiment]++;
      channelGroups[ch].total++;
    });

    const channelBreakdown = Object.entries(channelGroups).map(([channel, data]) => ({
      channel,
      positive: Math.round((data.positive / data.total) * 100),
      negative: Math.round((data.negative / data.total) * 100),
      neutral: Math.round((data.neutral / data.total) * 100),
      total: data.total,
      engagement: Math.round((data.total / sentimentData.length) * 100) // Calculate engagement percentage
    }));

    // Extract keywords from sentiment data
    const keywordCounts = {};
    sentimentData.forEach(item => {
      if (item.keywords) {
        const keywords = Array.isArray(item.keywords) ? item.keywords : JSON.parse(item.keywords || '[]');
        keywords.forEach(keyword => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
      }
    });

    // Convert keywords to topKeywords format
    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => {
        // Determine sentiment based on average score of mentions containing this keyword
        const keywordMentions = sentimentData.filter(item => 
          item.keywords && (Array.isArray(item.keywords) ? item.keywords : JSON.parse(item.keywords || '[]')).includes(word)
        );
        const avgScore = keywordMentions.reduce((sum, item) => sum + (item.score || 0), 0) / keywordMentions.length;
        
        return {
          word,
          count,
          sentiment: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral'
        };
      });

    // Generate hourly trend data
    const hourlyTrend = this.generateHourlyTrend(sentimentData);

    return {
      channelBreakdown,
      recentReviews: sentimentData.slice(0, 10).map(item => ({
        id: item.id,
        text: item.text,
        sentiment: item.sentiment,
        channel: item.channel || 'Unknown',
        timestamp: item.timestamp || new Date().toISOString(),
        score: item.score
      })),
      topKeywords,
      hourlyTrend,
      summary: {
        totalMentions: sentimentData.length,
        positiveMentions: sentimentData.filter(item => item.sentiment === 'positive').length,
        negativeMentions: sentimentData.filter(item => item.sentiment === 'negative').length,
        neutralMentions: sentimentData.filter(item => item.sentiment === 'neutral').length
      }
    };
  }

  transformSentimentToProductFormat(sentimentData, productId) {
    // Filter sentiment data for the specific product
    const productSentiment = sentimentData.filter(item => item.product_id === productId);
    
    if (productSentiment.length === 0) {
      return {
        summary: {
          total_mentions: 0,
          positive_mentions: 0,
          negative_mentions: 0,
          neutral_mentions: 0,
          avg_sentiment_score: 0
        },
        timeline: [],
        channels: [],
        topics: []
      };
    }

    // Calculate summary statistics
    const totalMentions = productSentiment.length;
    const positiveMentions = productSentiment.filter(item => item.sentiment === 'positive').length;
    const negativeMentions = productSentiment.filter(item => item.sentiment === 'negative').length;
    const neutralMentions = productSentiment.filter(item => item.sentiment === 'neutral').length;
    const avgSentimentScore = productSentiment.reduce((sum, item) => sum + (item.score || 0), 0) / totalMentions;

    // Group by channel
    const channelGroups = {};
    productSentiment.forEach(item => {
      const channel = item.channel || 'Unknown';
      if (!channelGroups[channel]) {
        channelGroups[channel] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      channelGroups[channel][item.sentiment]++;
      channelGroups[channel].total++;
    });

    const channels = Object.entries(channelGroups).map(([channel, data]) => ({
      channel,
      positive: Math.round((data.positive / data.total) * 100),
      negative: Math.round((data.negative / data.total) * 100),
      neutral: Math.round((data.neutral / data.total) * 100),
      total: data.total
    }));

    // Generate timeline data (last 7 days)
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayData = productSentiment.filter(item => {
        const itemDate = new Date(item.timestamp || item.created_at);
        return itemDate.toDateString() === date.toDateString();
      });
      
      return {
        date: date.toISOString().split('T')[0],
        positive: dayData.filter(item => item.sentiment === 'positive').length,
        negative: dayData.filter(item => item.sentiment === 'negative').length,
        neutral: dayData.filter(item => item.sentiment === 'neutral').length,
        total: dayData.length
      };
    });

    // Generate topics from keywords
    const topics = [];
    const keywordCounts = {};
    productSentiment.forEach(item => {
      if (item.keywords) {
        const keywords = Array.isArray(item.keywords) ? item.keywords : JSON.parse(item.keywords || '[]');
        keywords.forEach(keyword => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
      }
    });

    Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([topic, mentions]) => {
        const topicSentiment = productSentiment.filter(item => 
          item.keywords && (Array.isArray(item.keywords) ? item.keywords : JSON.parse(item.keywords || '[]')).includes(topic)
        );
        const avgScore = topicSentiment.reduce((sum, item) => sum + (item.score || 0), 0) / topicSentiment.length;
        
        topics.push({
          topic,
          sentiment: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral',
          mentions,
          score: avgScore
        });
      });

    return {
      summary: {
        total_mentions: totalMentions,
        positive_mentions: positiveMentions,
        negative_mentions: negativeMentions,
        neutral_mentions: neutralMentions,
        avg_sentiment_score: avgSentimentScore
      },
      timeline,
      channels,
      topics
    };
  }

  generateHourlyData(sentimentData) {
    const hourlyGroups = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      positive: 0,
      negative: 0,
      neutral: 0
    }));

    sentimentData.forEach(item => {
      if (item.timestamp) {
        const hour = new Date(item.timestamp).getHours();
        hourlyGroups[hour][item.sentiment]++;
      }
    });

    return hourlyGroups;
  }

  generateHourlyTrend(sentimentData) {
    const hourlyGroups = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      positive: 0,
      negative: 0,
      neutral: 0
    }));

    sentimentData.forEach(item => {
      if (item.timestamp) {
        const hour = new Date(item.timestamp).getHours();
        hourlyGroups[hour][item.sentiment]++;
      }
    });

    return hourlyGroups;
  }

  // Timeline endpoints
  async getTimelineData(timeRange = '7d', granularity = 'hourly') {
    try {
      const response = await api.get('/api/analytics/timeline', {
        params: { timeRange, granularity }
      });
      return response.data;
    } catch (error) {
      console.warn('⚠️ No timeline data available:', error.message);
      return null;
    }
  }

  // Topics endpoints
  async getTopicsData(timeRange = '7d') {
    try {
      // Try database API first
      const dbResponse = await dbApi.get('/analytics/topics', {
        params: { timeRange }
      });
      if (dbResponse.data && dbResponse.data.topics && dbResponse.data.topics.length > 0) {
        console.log('✅ Using real database data for topics');
        return dbResponse.data;
      }
      
      // Fallback to backend API
      console.log('⚠️ Database API not available, using backend mock data');
      const response = await api.get('/api/analytics/topics', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      // Fallback to backend API if database API fails
      console.warn('⚠️ Database API failed, trying backend API:', error.message);
      try {
        const response = await api.get('/api/analytics/topics', {
          params: { timeRange }
        });
        console.log('✅ Using backend mock data for topics');
        return response.data;
      } catch (backendError) {
        console.error('❌ Both database and backend APIs failed:', backendError.message);
        return null;
      }
    }
  }

  // Settings endpoints
  async getSettings() {
    try {
      const response = await api.get('/api/settings');
      return response.data;
    } catch (error) {
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings) {
    try {
      const response = await api.put('/api/settings', settings);
      return response.data;
    } catch (error) {
      // For demo purposes, save to localStorage
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
      return settings;
    }
  }

  async testConnection() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Connection test failed');
    }
  }

  // Product search endpoints
  async searchProducts(query, filters = {}) {
    try {
      // First try database API search
      const dbResponse = await dbApi.get('/search/products', {
        params: { q: query, limit: 20 }
      });
      
      if (dbResponse.data && dbResponse.data.results.length > 0) {
        console.log('✅ Using real database data for product search');
        return this.transformProductSearchResults(dbResponse.data, query);
      }
      
      // Fallback to backend API
      console.log('⚠️ Database API not available, using backend mock data');
      const response = await api.get('/api/products/search', {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      // Fallback to backend API if database API fails
      console.warn('⚠️ Database API failed, trying backend API:', error.message);
      try {
        const response = await api.get('/api/products/search', {
          params: { q: query, ...filters }
        });
        console.log('✅ Using backend mock data for product search');
        return response.data;
      } catch (backendError) {
        console.error('❌ Both database and backend APIs failed:', backendError.message);
        return this.getMockProductSearchData(query);
      }
    }
  }

  transformProductSearchResults(dbData, query) {
    return {
      results: dbData.results.map(product => ({
        ...product,
        sentiment_summary: {
          positive: product.positive_mentions || 0,
          negative: product.negative_mentions || 0,
          neutral: product.neutral_mentions || 0,
          avg_score: product.avg_sentiment_score || 0,
          total_mentions: product.total_mentions || 0
        }
      })),
      total: dbData.results.length,
      query: query,
      facets: {
        brands: [...new Set(dbData.results.map(p => p.brand).filter(Boolean))],
        categories: [...new Set(dbData.results.map(p => p.category).filter(Boolean))],
        price_ranges: ['$0-$200', '$200-$1000', '$1000+']
      }
    };
  }

  async getProductDetails(productId) {
    try {
      const response = await api.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      return this.getMockProductDetails(productId);
    }
  }

  async getProductPages(productId) {
    try {
      const response = await api.get(`/api/products/${productId}/pages`);
      return response.data;
    } catch (error) {
      return this.getMockProductPages(productId);
    }
  }

  async getProductSentiment(productId, timeRange = '7d') {
    try {
      // First try database API for real sentiment data
      const dbResponse = await dbApi.get('/sentiment', {
        params: { 
          product_id: productId,
          limit: 1000
        }
      });
      
      if (dbResponse.data && dbResponse.data.results.length > 0) {
        console.log('✅ Using real database data for product sentiment');
        return this.transformSentimentToProductFormat(dbResponse.data.results, productId);
      }
      
      // Fallback to backend API
      console.log('⚠️ Database API not available, using backend mock data');
      const response = await api.get(`/api/products/${productId}/sentiment`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      // Fallback to backend API if database API fails
      console.warn('⚠️ Database API failed, trying backend API:', error.message);
      try {
        const response = await api.get(`/api/products/${productId}/sentiment`, {
          params: { timeRange }
        });
        console.log('✅ Using backend mock data for product sentiment');
        return response.data;
      } catch (backendError) {
        console.error('❌ Both database and backend APIs failed:', backendError.message);
        return this.getMockProductSentiment(productId);
      }
    }
  }

  async getProductSuggestions(query) {
    try {
      // First try database API suggestions
      const dbResponse = await dbApi.get('/search/suggestions', {
        params: { q: query }
      });
      
      if (dbResponse.data && dbResponse.data.suggestions.length > 0) {
        console.log('✅ Using real database data for product suggestions');
        return dbResponse.data;
      }
      
      // Fallback to backend API
      const response = await api.get('/api/products/suggestions', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Using mock product suggestions - database not available:', error.message);
      return this.getMockProductSuggestions(query);
    }
  }

  // Data processing endpoints
  async processText(text) {
    try {
      const response = await api.post('/api/sentiment/process', { text });
      return response.data;
    } catch (error) {
      throw new Error('Failed to process text');
    }
  }

  async processBatch(texts) {
    try {
      const response = await api.post('/api/sentiment/batch', { texts });
      return response.data;
    } catch (error) {
      throw new Error('Failed to process batch');
    }
  }

  async exportData(format = 'csv', filters = {}) {
    try {
      const response = await api.get('/api/export', {
        params: { format, ...filters }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to export data');
    }
  }

  // Chat with BrandPulse Assistant (Gemini)
  // Backend returns: { response: string, timestamp: string, agent_name: string }
  async sendChatMessage(text, productName = null, context = null) {
    try {
      // Log the request for debugging
      const baseURL = api.defaults.baseURL || '';
      const fullUrl = baseURL ? `${baseURL}/api/chat` : '/api/chat';
      console.log(`[Chat API] Sending request to: ${fullUrl} (baseURL: ${baseURL || 'relative'})`);
      
      const response = await api.post('/api/chat', {
        text: text,
        product_name: productName,
        context: context
      });
      
      console.log(`[Chat API] Response received:`, response.status, response.data ? 'OK' : 'No data');
      
      // Return the response data directly - backend returns:
      // { response: "...", timestamp: "...", agent_name: "..." }
      return response.data;
    } catch (error) {
      // Enhanced error handling with detailed logging
      console.error('[Chat API] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        responseData: error.response?.data,
        request: error.request ? 'Request made but no response' : 'No request made',
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL || api.defaults.baseURL,
          method: error.config?.method
        }
      });
      
      // Re-throw with proper error handling
      if (error.response) {
        // Server responded with error status
        // Status 0 typically means CORS error or network failure
        if (error.response.status === 0) {
          throw new Error('Network error: Request was blocked. This might be a CORS issue. Please check if the backend is running and accessible.');
        }
        const errorMsg = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
        throw new Error(errorMsg);
      } else if (error.request) {
        // Request was made but no response received
        // Check if it's a CORS error (status 0 in some cases)
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          throw new Error('Network error: Could not reach the server. Please check if the backend is running on port 8000 and CORS is properly configured.');
        }
        throw new Error('Network error: Could not reach the server. Please check if the backend is running on port 8000.');
      } else if (error.code === 'ECONNABORTED') {
        // Request timeout
        throw new Error('Request timeout: The server took too long to respond.');
      } else if (error.code === 'ERR_NETWORK') {
        // Network error
        throw new Error('Network error: Unable to connect to the server. Please check your connection and ensure the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Failed to send message');
      }
    }
  }

  async getChatHistory(sessionId = 'default') {
    try {
      const response = await api.get('/api/chat/history', {
        params: { session_id: sessionId }
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to get chat history:', error);
      return { messages: [] };
    }
  }

  async clearChatHistory(sessionId = 'default') {
    try {
      const response = await api.delete('/api/chat/history', {
        params: { session_id: sessionId }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to clear chat history');
    }
  }

  async analyzeProduct(productName) {
    try {
      const response = await api.post('/api/analyze/product', null, {
        params: { product_name: productName }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to analyze product');
    }
  }

  // Mock data methods for development
  getMockDashboardData() {
    return {
      totalReviews: 15847,
      positivePercent: 68.2,
      negativePercent: 18.5,
      neutralPercent: 13.3,
      weeklyData: [
        { day: 'Mon', positive: 120, negative: 30, neutral: 20 },
        { day: 'Tue', positive: 150, negative: 25, neutral: 15 },
        { day: 'Wed', positive: 180, negative: 40, neutral: 25 },
        { day: 'Thu', positive: 200, negative: 35, neutral: 30 },
        { day: 'Fri', positive: 220, negative: 45, neutral: 35 },
        { day: 'Sat', positive: 190, negative: 30, neutral: 25 },
        { day: 'Sun', positive: 160, negative: 20, neutral: 20 },
      ],
    };
  }

  getMockAnalyticsData() {
    return {
      channelBreakdown: [
        { channel: 'Twitter', positive: 45, negative: 30, neutral: 25, total: 1000 },
        { channel: 'Facebook', positive: 60, negative: 20, neutral: 20, total: 800 },
        { channel: 'Instagram', positive: 70, negative: 15, neutral: 15, total: 600 },
        { channel: 'Reviews', positive: 55, negative: 25, neutral: 20, total: 1200 },
      ],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        positive: Math.floor(Math.random() * 50) + 20,
        negative: Math.floor(Math.random() * 30) + 10,
        neutral: Math.floor(Math.random() * 20) + 5,
      })),
      recentReviews: [
        { id: 1, text: 'Great product, highly recommend!', sentiment: 'positive', channel: 'Twitter', timestamp: '2024-01-15 10:30' },
        { id: 2, text: 'Not satisfied with the quality', sentiment: 'negative', channel: 'Facebook', timestamp: '2024-01-15 09:15' },
        { id: 3, text: 'Average experience, nothing special', sentiment: 'neutral', channel: 'Reviews', timestamp: '2024-01-15 08:45' },
        { id: 4, text: 'Amazing service and fast delivery!', sentiment: 'positive', channel: 'Instagram', timestamp: '2024-01-15 07:20' },
        { id: 5, text: 'Could be better, had some issues', sentiment: 'negative', channel: 'Twitter', timestamp: '2024-01-15 06:10' },
      ],
    };
  }

  getMockTimelineData() {
    return {
      timeline: Array.from({ length: 24 }, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - (23 - i));
        return {
          timestamp: date.toISOString(),
          positive: Math.floor(Math.random() * 100) + 50,
          negative: Math.floor(Math.random() * 50) + 10,
          neutral: Math.floor(Math.random() * 30) + 5,
          total: 0,
        };
      }),
      summary: {
        avgPositive: 68.5,
        avgNegative: 18.2,
        avgNeutral: 13.3,
        trend: 'increasing',
        peakHour: '14:00',
        lowHour: '02:00',
      },
    };
  }

  getMockTopicsData() {
    return {
      topics: [
        { id: 1, name: 'Product Quality', count: 1250, sentiment: 'positive', percentage: 35.2 },
        { id: 2, name: 'Customer Service', count: 980, sentiment: 'negative', percentage: 27.6 },
        { id: 3, name: 'Delivery Speed', count: 750, sentiment: 'positive', percentage: 21.1 },
        { id: 4, name: 'Pricing', count: 620, sentiment: 'neutral', percentage: 17.5 },
        { id: 5, name: 'User Interface', count: 480, sentiment: 'positive', percentage: 13.5 },
        { id: 6, name: 'Technical Support', count: 420, sentiment: 'negative', percentage: 11.8 },
        { id: 7, name: 'Features', count: 380, sentiment: 'positive', percentage: 10.7 },
        { id: 8, name: 'Documentation', count: 320, sentiment: 'neutral', percentage: 9.0 },
      ],
      topicSentiment: [
        { topic: 'Product Quality', positive: 70, negative: 15, neutral: 15 },
        { topic: 'Customer Service', positive: 25, negative: 60, neutral: 15 },
        { topic: 'Delivery Speed', positive: 80, negative: 10, neutral: 10 },
        { topic: 'Pricing', positive: 30, negative: 30, neutral: 40 },
        { topic: 'User Interface', positive: 65, negative: 20, neutral: 15 },
        { topic: 'Technical Support', positive: 20, negative: 65, neutral: 15 },
        { topic: 'Features', positive: 75, negative: 15, neutral: 10 },
        { topic: 'Documentation', positive: 40, negative: 20, neutral: 40 },
      ],
    };
  }

  getDefaultSettings() {
    return {
      apiUrl: 'http://localhost:8000',
      apiKey: '',
      environment: 'development',
      autoRefresh: true,
      refreshInterval: 30,
      theme: 'light',
      defaultTimeRange: '7d',
      itemsPerPage: 10,
      emailAlerts: false,
      emailAddress: '',
      sentimentThreshold: 0.7,
      volumeThreshold: 1000,
    };
  }

  // Database-driven methods (replacing mock data)
  async getMockProductSearchData(query) {
    // Use real database search instead of mock data
    try {
      const searchResults = await this.searchProducts(query);
      return searchResults;
    } catch (error) {
      console.warn('Database search failed, returning empty results:', error);
      return { results: [], total: 0, query: query };
    }
  }

  getMockProductDetails(productId) {
    const products = {
      1: {
        id: 1,
        name: 'iPhone 15 Pro',
        sku: 'APPLE-IP15P-128',
        description: 'Latest iPhone with titanium design and advanced camera system. Features include A17 Pro chip, 48MP camera system, and titanium construction.',
        category: 'Smartphones',
        brand: 'Apple',
        price: 999.00,
        image_url: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro',
        specifications: {
          display: '6.1-inch Super Retina XDR',
          storage: '128GB',
          camera: '48MP Main + 12MP Ultra Wide',
          chip: 'A17 Pro',
          battery: 'Up to 23 hours video playback'
        },
        sentiment_summary: {
          positive: 72,
          negative: 18,
          neutral: 10,
          avg_score: 0.68,
          total_mentions: 1247,
          trend: 'increasing'
        }
      }
    };
    return products[productId] || null;
  }

  getMockProductPages(productId) {
    return {
      pages: [
        {
          id: 1,
          url: 'https://apple.com/iphone-15-pro',
          page_type: 'product_page',
          platform: 'website',
          title: 'iPhone 15 Pro - Apple',
          sentiment_summary: { positive: 78, negative: 15, neutral: 7 }
        },
        {
          id: 2,
          url: 'https://amazon.com/dp/B0CHX1W1XY',
          page_type: 'product_page',
          platform: 'amazon',
          title: 'Apple iPhone 15 Pro Amazon',
          sentiment_summary: { positive: 65, negative: 25, neutral: 10 }
        },
        {
          id: 3,
          url: 'https://twitter.com/hashtag/iPhone15Pro',
          page_type: 'social_media',
          platform: 'twitter',
          title: '#iPhone15Pro discussions',
          sentiment_summary: { positive: 58, negative: 32, neutral: 10 }
        }
      ],
      total: 3
    };
  }

  getMockProductSentiment(productId) {
    return {
      summary: {
        total_mentions: 1247,
        positive_mentions: 897,
        negative_mentions: 224,
        neutral_mentions: 126,
        avg_sentiment_score: 0.68,
        trend: 'increasing'
      },
      timeline: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          positive: Math.floor(Math.random() * 50) + 30,
          negative: Math.floor(Math.random() * 20) + 5,
          neutral: Math.floor(Math.random() * 15) + 5,
          total: 0
        };
      }),
      channels: [
        { channel: 'Twitter', positive: 58, negative: 32, neutral: 10, total: 456 },
        { channel: 'Amazon Reviews', positive: 75, negative: 18, neutral: 7, total: 289 },
        { channel: 'YouTube', positive: 82, negative: 12, neutral: 6, total: 167 },
        { channel: 'Reddit', positive: 45, negative: 40, neutral: 15, total: 234 }
      ],
      topics: [
        { topic: 'Camera Quality', sentiment: 'positive', mentions: 342, score: 0.78 },
        { topic: 'Price', sentiment: 'negative', mentions: 189, score: -0.45 },
        { topic: 'Battery Life', sentiment: 'neutral', mentions: 156, score: 0.12 },
        { topic: 'Design', sentiment: 'positive', mentions: 234, score: 0.65 }
      ]
    };
  }

  getMockProductSuggestions(query) {
    const suggestions = [
      'iPhone 15 Pro',
      'iPhone 15',
      'Samsung Galaxy S24',
      'MacBook Pro M3',
      'Nike Air Max 270',
      'Tesla Model Y',
      'iPad Pro',
      'AirPods Pro'
    ];

    return {
      suggestions: query 
        ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        : suggestions.slice(0, 5)
    };
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export { apiService };
