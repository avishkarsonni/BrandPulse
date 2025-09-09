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

  // Product search endpoints
  async searchProducts(query, filters = {}) {
    try {
      const response = await api.get('/api/products/search', {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      return this.getMockProductSearchData(query);
    }
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
      const response = await api.get(`/api/products/${productId}/sentiment`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      return this.getMockProductSentiment(productId);
    }
  }

  async getProductSuggestions(query) {
    try {
      const response = await api.get('/api/products/suggestions', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
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

  // Mock data methods for product search
  getMockProductSearchData(query) {
    const allProducts = [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        sku: 'APPLE-IP15P-128',
        description: 'Latest iPhone with titanium design and advanced camera system',
        category: 'Smartphones',
        brand: 'Apple',
        price: 999.00,
        image_url: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro',
        sentiment_summary: {
          positive: 72,
          negative: 18,
          neutral: 10,
          avg_score: 0.68,
          total_mentions: 1247
        }
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24',
        sku: 'SAMSUNG-GS24-256',
        description: 'Premium Android phone with AI-powered features',
        category: 'Smartphones',
        brand: 'Samsung',
        price: 899.00,
        image_url: 'https://via.placeholder.com/300x300/1F8EF1/FFFFFF?text=Galaxy+S24',
        sentiment_summary: {
          positive: 68,
          negative: 22,
          neutral: 10,
          avg_score: 0.62,
          total_mentions: 892
        }
      },
      {
        id: 3,
        name: 'Nike Air Max 270',
        sku: 'NIKE-AM270-BLK',
        description: 'Comfortable running shoes with visible Air cushioning',
        category: 'Footwear',
        brand: 'Nike',
        price: 150.00,
        image_url: 'https://via.placeholder.com/300x300/FE5F00/FFFFFF?text=Air+Max+270',
        sentiment_summary: {
          positive: 78,
          negative: 12,
          neutral: 10,
          avg_score: 0.74,
          total_mentions: 634
        }
      },
      {
        id: 4,
        name: 'MacBook Pro M3',
        sku: 'APPLE-MBP-M3-512',
        description: '16-inch MacBook Pro with M3 chip and 512GB storage',
        category: 'Laptops',
        brand: 'Apple',
        price: 2499.00,
        image_url: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=MacBook+Pro',
        sentiment_summary: {
          positive: 85,
          negative: 8,
          neutral: 7,
          avg_score: 0.82,
          total_mentions: 423
        }
      },
      {
        id: 5,
        name: 'Tesla Model Y',
        sku: 'TESLA-MY-LR',
        description: 'Electric SUV with autopilot and long range battery',
        category: 'Vehicles',
        brand: 'Tesla',
        price: 52990.00,
        image_url: 'https://via.placeholder.com/300x300/E31937/FFFFFF?text=Model+Y',
        sentiment_summary: {
          positive: 76,
          negative: 15,
          neutral: 9,
          avg_score: 0.71,
          total_mentions: 1856
        }
      }
    ];

    const filteredProducts = query 
      ? allProducts.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        )
      : allProducts;

    return {
      results: filteredProducts,
      total: filteredProducts.length,
      query: query,
      facets: {
        brands: ['Apple', 'Samsung', 'Nike', 'Tesla'],
        categories: ['Smartphones', 'Footwear', 'Laptops', 'Vehicles'],
        price_ranges: ['$0-$200', '$200-$1000', '$1000+']
      }
    };
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
