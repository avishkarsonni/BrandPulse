import { format, parseISO, isValid } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, formatStr) : '';
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

// Number formatting utilities
export const formatNumber = (num, decimals = 0) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercentage = (num, decimals = 1) => {
  if (typeof num !== 'number') return '0%';
  return `${num.toFixed(decimals)}%`;
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Text utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatSentiment = (sentiment) => {
  const sentimentMap = {
    positive: 'Positive',
    negative: 'Negative',
    neutral: 'Neutral',
  };
  return sentimentMap[sentiment] || capitalizeFirst(sentiment);
};

// Color utilities
export const getSentimentColor = (sentiment) => {
  const colorMap = {
    positive: '#4caf50',
    negative: '#f44336',
    neutral: '#ff9800',
  };
  return colorMap[sentiment] || '#757575';
};

export const getSentimentMuiColor = (sentiment) => {
  const colorMap = {
    positive: 'success',
    negative: 'error',
    neutral: 'warning',
  };
  return colorMap[sentiment] || 'default';
};

// Data processing utilities
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
};

export const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const sortByCount = (data, key = 'count') => {
  return [...data].sort((a, b) => b[key] - a[key]);
};

export const filterByTimeRange = (data, timeRange) => {
  if (!data || !Array.isArray(data)) return [];
  
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      return data;
  }
  
  return data.filter(item => {
    const itemDate = new Date(item.timestamp || item.date);
    return itemDate >= startDate;
  });
};

// Chart utilities
export const generateChartColors = (count) => {
  const colors = [
    '#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0',
    '#00bcd4', '#795548', '#607d8b', '#e91e63', '#3f51b5',
    '#009688', '#ff5722', '#673ab7', '#ffc107', '#cddc39'
  ];
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export const createChartDataset = (label, data, color, options = {}) => {
  return {
    label,
    data,
    backgroundColor: color,
    borderColor: color,
    borderWidth: 1,
    ...options,
  };
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidApiKey = (key) => {
  return key && key.length >= 10;
};

// Local storage utilities
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
};

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error: Unable to connect to server';
  } else {
    // Something else happened
    return `Error: ${error.message}`;
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
