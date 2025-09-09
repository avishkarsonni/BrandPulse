import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 5000, // Reduced timeout for faster fallback to dummy data
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
      const response = await api.get('/api/dashboard/overview');
      return response.data;
    } catch (error) {
      // Return mock data if API is not available
      return this.getMockDashboardData();
    }
  }

  // Analytics endpoints
  async getAnalyticsData(timeRange = '7d', channel = 'all') {
    try {
      const response = await api.get('/api/analytics/sentiment', {
        params: { timeRange, channel }
      });
      return response.data;
    } catch (error) {
      return this.getMockAnalyticsData();
    }
  }

  // Timeline endpoints
  async getTimelineData(timeRange = '7d', granularity = 'hourly') {
    try {
      const response = await api.get('/api/analytics/timeline', {
        params: { timeRange, granularity }
      });
      return response.data;
    } catch (error) {
      return this.getMockTimelineData();
    }
  }

  // Topics endpoints
  async getTopicsData(timeRange = '7d') {
    try {
      const response = await api.get('/api/analytics/topics', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      return this.getMockTopicsData();
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
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw new Error('Connection test failed');
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
}

// Create and export singleton instance
const apiService = new ApiService();
export { apiService };
