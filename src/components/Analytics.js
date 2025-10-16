import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Autocomplete,
  Button,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Search as SearchIcon, PhoneAndroid, Clear } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { useProduct } from '../contexts/ProductContext';

const Analytics = () => {
  const { selectedProduct: contextProduct, clearProduct } = useProduct();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [timeRange, setTimeRange] = useState('7d');
  const [channel, setChannel] = useState('all');
  const [productQuery, setProductQuery] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productAnalytics, setProductAnalytics] = useState(null);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Only fetch analytics data if there's a selected product
      if (contextProduct) {
        // Try to get real data from database API first
        const analyticsData = await apiService.getAnalyticsData(timeRange, channel);
        if (analyticsData && analyticsData.channelBreakdown && analyticsData.channelBreakdown.length > 0) {
          console.log('✅ Using real database data for analytics');
          setAnalyticsData(analyticsData);
        } else {
          console.log('⚠️ No real data available for selected product');
          setAnalyticsData(null);
        }
      } else {
        // No product selected - keep analytics empty
        console.log('ℹ️ No product selected - analytics will remain empty');
        setAnalyticsData(null);
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics data fetch error:', err);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange, channel, contextProduct]);

  const handleProductSearch = async (query) => {
    if (query.length > 1) {
      try {
        const suggestions = await apiService.getProductSuggestions(query);
        setProductSuggestions(suggestions.suggestions || []);
      } catch (err) {
        console.error('Product suggestions error:', err);
      }
    }
  };

  const handleProductSelect = async (productName) => {
    try {
      setLoading(true);
      const searchResults = await apiService.searchProducts(productName);
      if (searchResults.results && searchResults.results.length > 0) {
        const product = searchResults.results[0];
        setSelectedProduct(product);
        const analytics = await apiService.getProductSentiment(product.id);
        setProductAnalytics(analytics);
      }
    } catch (err) {
      setError('Failed to load product analytics');
      console.error('Product analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ marginLeft: 16 }}
        >
          <Typography variant="h6" color="text.secondary">
            Loading analytics data...
          </Typography>
        </motion.div>
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

  // If no analytics data, show empty state
  if (!analyticsData) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Detailed Analytics
          </Typography>
        </Box>

        {/* Product Search Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Product-Specific Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Search for a specific product to view its sentiment analysis across all platforms
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              options={productSuggestions}
              inputValue={productQuery}
              onInputChange={(event, newInputValue) => {
                setProductQuery(newInputValue);
                handleProductSearch(newInputValue);
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter' && productQuery) {
                  handleProductSelect(productQuery);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for a product (e.g., iPhone, Nike shoes, Tesla...)"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                />
              )}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
            <Button
              variant="contained"
              onClick={() => handleProductSelect(productQuery)}
              disabled={!productQuery}
            >
              Search
            </Button>
          </Box>

          {/* Product Analytics Results */}
          {selectedProduct && productAnalytics && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    {selectedProduct.name} - Sentiment Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {productAnalytics.summary.positive_mentions}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Positive Mentions
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="error.main">
                            {productAnalytics.summary.negative_mentions}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Negative Mentions
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="warning.main">
                            {productAnalytics.summary.neutral_mentions}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Neutral Mentions
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Platform Breakdown
                  </Typography>
                  {productAnalytics.channels.map((channel) => (
                    <Box key={channel.channel} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">{channel.channel}</Typography>
                        <Typography variant="body2">{channel.total} mentions</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', height: 8, borderRadius: 1, overflow: 'hidden', mt: 0.5 }}>
                        <Box sx={{ width: `${channel.positive}%`, backgroundColor: 'success.main' }} />
                        <Box sx={{ width: `${channel.negative}%`, backgroundColor: 'error.main' }} />
                        <Box sx={{ width: `${channel.neutral}%`, backgroundColor: 'warning.main' }} />
                      </Box>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Empty State Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2
            }}
          >
            <SearchIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" gutterBottom>
              No Analytics Data Available
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Search for a product above to view detailed sentiment analysis, channel breakdowns, and review insights.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Try searching for popular brands like Apple, Nike, Samsung, Sony, or product names like iPhone, MacBook, Air Max, etc.
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  const data = analyticsData;

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Detailed Analytics
        </Typography>
        {contextProduct && (
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearProduct}
            sx={{ ml: 2 }}
          >
            Clear Selection
          </Button>
        )}
      </Box>

      {contextProduct && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneAndroid sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h5" gutterBottom>
                  Analyzing: {contextProduct.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {contextProduct.brand} • {contextProduct.category} • ${contextProduct.price}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Product Search Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Product-Specific Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Search for a specific product to view its sentiment analysis across all platforms
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Autocomplete
            freeSolo
            options={productSuggestions}
            inputValue={productQuery}
            onInputChange={(event, newInputValue) => {
              setProductQuery(newInputValue);
              handleProductSearch(newInputValue);
            }}
            onKeyPress={(event) => {
              if (event.key === 'Enter' && productQuery) {
                handleProductSelect(productQuery);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search for a product (e.g., iPhone, Nike shoes, Tesla...)"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            )}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Button
            variant="contained"
            onClick={() => handleProductSelect(productQuery)}
            disabled={!productQuery}
          >
            Search
          </Button>
        </Box>

        {/* Product Analytics Results */}
        {selectedProduct && productAnalytics && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {selectedProduct.name} - Sentiment Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {productAnalytics.summary.positive_mentions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Positive Mentions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                          {productAnalytics.summary.negative_mentions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Negative Mentions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {productAnalytics.summary.neutral_mentions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Neutral Mentions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Platform Breakdown
                </Typography>
                {productAnalytics.channels.map((channel) => (
                  <Box key={channel.channel} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">{channel.channel}</Typography>
                      <Typography variant="body2">{channel.total} mentions</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', height: 8, borderRadius: 1, overflow: 'hidden', mt: 0.5 }}>
                      <Box sx={{ width: `${channel.positive}%`, backgroundColor: 'success.main' }} />
                      <Box sx={{ width: `${channel.negative}%`, backgroundColor: 'error.main' }} />
                      <Box sx={{ width: `${channel.neutral}%`, backgroundColor: 'warning.main' }} />
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
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

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Channel</InputLabel>
          <Select
            value={channel}
            label="Channel"
            onChange={(e) => setChannel(e.target.value)}
          >
            <MenuItem value="all">All Channels</MenuItem>
            <MenuItem value="twitter">Twitter</MenuItem>
            <MenuItem value="facebook">Facebook</MenuItem>
            <MenuItem value="instagram">Instagram</MenuItem>
            <MenuItem value="reviews">Reviews</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Channel Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sentiment by Channel
            </Typography>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              {(data.channelBreakdown || []).map((channel, index) => (
                <Box key={channel.channel} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">{channel.channel}</Typography>
                    <Typography variant="caption">
                      {channel.total} mentions
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', height: 20, borderRadius: 1, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${channel.positive}%`,
                        backgroundColor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                        {channel.positive}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: `${channel.negative}%`,
                        backgroundColor: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                        {channel.negative}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: `${channel.neutral}%`,
                        backgroundColor: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                        {channel.neutral}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              {(!data.channelBreakdown || data.channelBreakdown.length === 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="textSecondary">
                    No channel data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Hourly Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Hourly Sentiment Trend
            </Typography>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              {(data.hourlyTrend || []).map((hourData, index) => (
                <Box key={hourData.hour} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption">{hourData.hour}</Typography>
                    <Typography variant="caption">
                      {hourData.positive + hourData.negative + hourData.neutral} total
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', height: 12, borderRadius: 1, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${hourData.positive > 0 ? (hourData.positive / (hourData.positive + hourData.negative + hourData.neutral)) * 100 : 0}%`,
                        backgroundColor: 'success.main',
                      }}
                    />
                    <Box
                      sx={{
                        width: `${hourData.negative > 0 ? (hourData.negative / (hourData.positive + hourData.negative + hourData.neutral)) * 100 : 0}%`,
                        backgroundColor: 'error.main',
                      }}
                    />
                    <Box
                      sx={{
                        width: `${hourData.neutral > 0 ? (hourData.neutral / (hourData.positive + hourData.negative + hourData.neutral)) * 100 : 0}%`,
                        backgroundColor: 'warning.main',
                      }}
                    />
                  </Box>
                </Box>
              ))}
              {(!data.hourlyTrend || data.hourlyTrend.length === 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="textSecondary">
                    No hourly trend data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Top Keywords */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Keywords
            </Typography>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              {(data.topKeywords || []).map((keyword, index) => (
                <Box key={keyword.word} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 100 }}>
                    {keyword.word}
                  </Typography>
                  <Box sx={{ flexGrow: 1, mx: 1 }}>
                    <Box
                      sx={{
                        height: 8,
                        backgroundColor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(keyword.count / Math.max(...(data.topKeywords || []).map(k => k.count))) * 100}%`,
                          backgroundColor: keyword.sentiment === 'positive' ? 'success.main' : 
                                         keyword.sentiment === 'negative' ? 'error.main' : 'warning.main',
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ minWidth: 60 }}>
                    {keyword.count}
                  </Typography>
                  <Chip
                    label={keyword.sentiment}
                    color={getSentimentColor(keyword.sentiment)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              ))}
              {(!data.topKeywords || data.topKeywords.length === 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="textSecondary">
                    No keywords data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Channel Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Channel Performance
            </Typography>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              {(data.channelBreakdown || []).map((channel, index) => (
                <Box key={channel.channel} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">{channel.channel}</Typography>
                    <Typography variant="caption">
                      {channel.total} reviews • {channel.engagement || 0}% engagement
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', height: 20, borderRadius: 1, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${channel.positive}%`,
                        backgroundColor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                        {channel.positive}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: `${channel.negative}%`,
                        backgroundColor: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                        {channel.negative}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: `${channel.neutral}%`,
                        backgroundColor: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                        {channel.neutral}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              {(!data.channelBreakdown || data.channelBreakdown.length === 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="textSecondary">
                    No channel performance data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Reviews Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reviews
            </Typography>
            {(!data.recentReviews || data.recentReviews.length === 0) ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography variant="body2" color="textSecondary">
                  No recent reviews data available
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Review Text</TableCell>
                        <TableCell>Sentiment</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Channel</TableCell>
                        <TableCell>Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(data.recentReviews || [])
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((review) => (
                          <TableRow key={review.id}>
                            <TableCell sx={{ maxWidth: 400 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {review.text}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={review.sentiment}
                                color={getSentimentColor(review.sentiment)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {(review.score * 100).toFixed(0)}%
                              </Typography>
                            </TableCell>
                            <TableCell>{review.channel}</TableCell>
                            <TableCell>{review.timestamp}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={(data.recentReviews || []).length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;