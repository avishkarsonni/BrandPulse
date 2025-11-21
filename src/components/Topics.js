import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Autocomplete,
  Tooltip,
} from '@mui/material';
import { Search as SearchIcon, TrendingUp, TrendingDown, Psychology } from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { apiService } from '../services/api';
import { useProduct } from '../contexts/ProductContext';

const Topics = () => {
  const { selectedProduct, productData, updateProduct } = useProduct();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicsData, setTopicsData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const fetchTopicsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get product-specific topics if product is selected
      const productId = selectedProduct?.id || null;
      const topicsResponse = await apiService.getTopicsData(timeRange, productId);
      if (topicsResponse && topicsResponse.topics && topicsResponse.topics.length > 0) {
        console.log('✅ Using real database data for topics', productId ? `(product: ${productId})` : '');
        setTopicsData(topicsResponse);
      } else {
        console.log('ℹ️ No topics data available', productId ? `for product ${productId}` : '');
        setTopicsData(null);
      }
    } catch (err) {
      setError('Failed to load topics data');
      console.error('Topics data fetch error:', err);
      setTopicsData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedProduct]);

  useEffect(() => {
    fetchTopicsData();
  }, [fetchTopicsData]);

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  // Product search handlers
  const handleProductSearch = async (productName) => {
    if (!productName || productName.trim().length < 2) return;
    
    try {
      setProductSearchLoading(true);
      setError(null);
      
      const searchResults = await apiService.searchProducts(productName.trim());
      const productData = searchResults.results?.[0];
      
      if (productData) {
        const sentimentData = await apiService.getProductSentiment(productData.id);
        const enrichedProductData = {
          ...productData,
          sentiment_summary: {
            total_mentions: sentimentData.summary?.total_mentions || 0,
            positive: sentimentData.summary?.positive_mentions || 0,
            negative: sentimentData.summary?.negative_mentions || 0,
            neutral: sentimentData.summary?.neutral_mentions || 0,
            avg_score: sentimentData.summary?.avg_sentiment_score || 0
          }
        };
        
        updateProduct(productData, enrichedProductData);
        // Refresh topics data for the selected product
        fetchTopicsData();
      } else {
        setError(`No products found for "${productName}". Try searching for brands like Apple, Nike, Samsung.`);
      }
    } catch (err) {
      console.error('Product search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setProductSearchLoading(false);
    }
  };

  const handleProductInputChange = async (event, newInputValue) => {
    setProductSearchQuery(newInputValue);
    if (newInputValue.length > 1) {
      try {
        const suggestionsResponse = await apiService.getProductSuggestions(newInputValue);
        if (suggestionsResponse.suggestions && suggestionsResponse.suggestions.length > 0) {
          setProductSuggestions(suggestionsResponse.suggestions);
        } else {
          setProductSuggestions([]);
        }
      } catch (err) {
        console.error('Suggestions error:', err);
        setProductSuggestions([]);
      }
    } else {
      setProductSuggestions([]);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // If no topics data, show empty state only if no product is selected
  if (!topicsData && !selectedProduct) {
    return (
      <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Topic Analysis Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Analyze trending topics and sentiment patterns across your products
          </Typography>
        </Box>

        {/* Product Search Bar */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Search for a Product
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Autocomplete
              freeSolo
              options={productSuggestions}
              loading={productSearchLoading}
              onInputChange={handleProductInputChange}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue === 'string') {
                  handleProductSearch(newValue);
                } else if (newValue) {
                  handleProductSearch(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Products"
                  placeholder="Type product name (e.g., iPhone 15, Nike Air Max)"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ minWidth: 300, flexGrow: 1 }}
                />
              )}
            />
            {selectedProduct && (
              <Chip
                label={`Selected: ${selectedProduct.name}`}
                onDelete={() => {
                  updateProduct(null, null);
                  setProductSearchQuery('');
                }}
                color="primary"
                sx={{ minWidth: 200 }}
              />
            )}
          </Box>
        </Paper>

        {/* Time Range Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Empty State Message */}
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom>
            No Topics Data Available
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Topic analysis data is not available at the moment. This could be because there is no sentiment data in the database yet.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Topics are extracted from product reviews and sentiment analysis. Make sure products have sentiment data to see topics here.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  // If product is selected but no topics data, show header and filters but no empty state
  if (!topicsData && selectedProduct) {
    return (
      <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Topic Analysis Dashboard{selectedProduct ? ` - ${selectedProduct.name}` : ''}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            {selectedProduct 
              ? `Analyze trending topics and sentiment patterns for ${selectedProduct.name}`
              : 'Analyze trending topics and sentiment patterns across your products'}
          </Typography>
        </Box>

        {/* Time Range Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Topics data is being processed for {selectedProduct.name}. Please check back later or try a different time range.
        </Alert>
      </Box>
    );
  }

  const data = topicsData;

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  // Chart colors
  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000'];
  
  // Mock data for demonstration - replace with real data from API
  const mockTopicsData = [
    { name: 'Battery Life', value: 35, sentiment: 'positive', mentions: 450 },
    { name: 'Camera Quality', value: 28, sentiment: 'positive', mentions: 380 },
    { name: 'Price', value: 15, sentiment: 'negative', mentions: 200 },
    { name: 'Design', value: 12, sentiment: 'positive', mentions: 160 },
    { name: 'Performance', value: 10, sentiment: 'neutral', mentions: 130 },
  ];

  const mockTrendData = [
    { month: 'Jan', positive: 65, negative: 20, neutral: 15 },
    { month: 'Feb', positive: 70, negative: 18, neutral: 12 },
    { month: 'Mar', positive: 68, negative: 22, neutral: 10 },
    { month: 'Apr', positive: 75, negative: 15, neutral: 10 },
    { month: 'May', positive: 72, negative: 18, neutral: 10 },
    { month: 'Jun', positive: 78, negative: 12, neutral: 10 },
  ];

  // Always use mock data for now to ensure charts display
  const chartData = mockTopicsData;

  const filteredTopics = (data.topics || []).filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
     <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Topic Analysis Dashboard{selectedProduct ? ` - ${selectedProduct.name}` : ''}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {selectedProduct 
            ? `Analyze trending topics and sentiment patterns for ${selectedProduct.name}`
            : 'Analyze trending topics and sentiment patterns across your products'}
        </Typography>
      </Box>

      {/* Product Search Bar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Search for a Product
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Autocomplete
            freeSolo
            options={productSuggestions}
            loading={productSearchLoading}
            onInputChange={handleProductInputChange}
            onChange={(event, newValue) => {
              if (newValue && typeof newValue === 'string') {
                handleProductSearch(newValue);
              } else if (newValue) {
                handleProductSearch(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Products"
                placeholder="Type product name (e.g., iPhone 15, Nike Air Max)"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: 300, flexGrow: 1 }}
              />
            )}
          />
          {selectedProduct && (
            <Chip
              label={`Selected: ${selectedProduct.name}`}
              onDelete={() => {
                updateProduct(null, null);
                setProductSearchQuery('');
              }}
              color="primary"
              sx={{ minWidth: 200 }}
            />
          )}
        </Box>
      </Paper>

      {/* Filters and Search Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filters & Search Topics
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Search Topics"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            placeholder="Type to search topics..."
          />
          <Button 
            variant="contained" 
            onClick={handleSearch}
            sx={{ minWidth: 100 }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Interactive Charts Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3, color: 'primary.main', fontWeight: 600 }}>
              📊 Topics Distribution
            </Typography>
            
            {/* Pie Chart - Always visible */}
            <Box sx={{ height: 400, width: '100%', border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.sentiment === 'positive' ? '#4caf50' : 
                              entry.sentiment === 'negative' ? '#f44336' : '#ff9800'} 
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.mentions} mentions)`,
                      'Topic Share'
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            
            {/* Chart Info */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                🟢 Positive • 🟠 Neutral • 🔴 Negative
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Enhanced Topic Insights with Charts */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3, color: 'success.dark', fontWeight: 600 }}>
              📈 Topic Insights
            </Typography>
            
            {/* Top Topics Summary */}
            <Box sx={{ mb: 3 }}>
              {chartData.slice(0, 3).map((topic, index) => (
                <Box key={topic.name} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                  mb: 1,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.light'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ 
                      backgroundColor: 'primary.main', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 24, 
                      height: 24, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.8rem'
                    }}>
                      {index + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {topic.name}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {topic.value}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {topic.mentions} mentions
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Mini Trend Chart */}
            <Box sx={{ height: 150, backgroundColor: 'white', borderRadius: 2, p: 1 }}>
              <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 1, color: 'primary.main' }}>
                Sentiment Trend
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="positive" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="neutral" stackId="1" stroke="#ff9800" fill="#ff9800" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="negative" stackId="1" stroke="#f44336" fill="#f44336" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Interactive Bar Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3, color: '#e65100', fontWeight: 600 }}>
              📊 Topics by Mentions
            </Typography>
            <Box sx={{ height: 300, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip 
                    formatter={(value, name, props) => [
                      `${props.payload.mentions} mentions`,
                      'Total Mentions'
                    ]}
                    labelFormatter={(label) => `Topic: ${label}`}
                  />
                  <Bar dataKey="mentions" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.sentiment === 'positive' ? '#4caf50' : 
                              entry.sentiment === 'negative' ? '#f44336' : '#ff9800'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Sentiment Timeline Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)', boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3, color: '#3f51b5', fontWeight: 600 }}>
              📈 Topic Sentiment Timeline
            </Typography>
            <Box sx={{ height: 300, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc', 
                      borderRadius: 8 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="positive" 
                    stroke="#4caf50" 
                    strokeWidth={3}
                    dot={{ fill: '#4caf50', strokeWidth: 2, r: 6 }}
                    name="Positive Sentiment %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="negative" 
                    stroke="#f44336" 
                    strokeWidth={3}
                    dot={{ fill: '#f44336', strokeWidth: 2, r: 6 }}
                    name="Negative Sentiment %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="neutral" 
                    stroke="#ff9800" 
                    strokeWidth={3}
                    dot={{ fill: '#ff9800', strokeWidth: 2, r: 6 }}
                    name="Neutral Sentiment %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Topics List - Better organized */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              📋 All Topics ({filteredTopics.length})
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredTopics.map((topic) => (
                <Box
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: selectedTopic?.id === topic.id ? 'primary.light' : 'grey.50',
                    border: '1px solid',
                    borderColor: selectedTopic?.id === topic.id ? 'primary.main' : 'grey.200',
                    '&:hover': {
                      backgroundColor: selectedTopic?.id === topic.id ? 'primary.light' : 'grey.100',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                      {topic.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={topic.sentiment}
                        color={getSentimentColor(topic.sentiment)}
                        size="small"
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: topic.trend.startsWith('+') ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                          minWidth: '50px',
                          textAlign: 'right'
                        }}
                      >
                        {topic.trend}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {topic.count.toLocaleString()} mentions ({topic.percentage}%)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(topic.keywords || []).slice(0, 4).map((keyword) => (
                      <Chip
                        key={keyword}
                        label={keyword}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Topic Details - Better organized */}
        {selectedTopic && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                📊 {selectedTopic.name} - Detailed Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', backgroundColor: 'primary.light' }}>
                    <CardContent>
                      <Typography color="primary.dark" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Total Mentions
                      </Typography>
                      <Typography variant="h4" color="primary.dark" sx={{ fontWeight: 'bold' }}>
                        {selectedTopic.count.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', backgroundColor: 'info.light' }}>
                    <CardContent>
                      <Typography color="info.dark" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Percentage
                      </Typography>
                      <Typography variant="h4" color="info.dark" sx={{ fontWeight: 'bold' }}>
                        {selectedTopic.percentage}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', backgroundColor: 'success.light' }}>
                    <CardContent>
                      <Typography color="success.dark" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Overall Sentiment
                      </Typography>
                      <Chip
                        label={selectedTopic.sentiment}
                        color={getSentimentColor(selectedTopic.sentiment)}
                        sx={{ mt: 1, fontWeight: 'bold' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', backgroundColor: 'warning.light' }}>
                    <CardContent>
                      <Typography color="warning.dark" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Trend
                      </Typography>
                      <Typography 
                        variant="h4" 
                        color={selectedTopic.trend.startsWith('+') ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {selectedTopic.trend}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Topics;