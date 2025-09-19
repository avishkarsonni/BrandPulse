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
      // Use dummy data directly for now
      console.log('Using dummy data for Analytics');
      setAnalyticsData(null); // This will trigger the dummy data fallback
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const data = analyticsData || {
    channelBreakdown: [
      { channel: 'Twitter', positive: 45, negative: 30, neutral: 25, total: 1000, engagement: 8.5 },
      { channel: 'Facebook', positive: 60, negative: 20, neutral: 20, total: 800, engagement: 12.3 },
      { channel: 'Instagram', positive: 70, negative: 15, neutral: 15, total: 600, engagement: 15.7 },
      { channel: 'Reviews', positive: 55, negative: 25, neutral: 20, total: 1200, engagement: 6.2 },
      { channel: 'YouTube', positive: 65, negative: 20, neutral: 15, total: 400, engagement: 18.9 },
      { channel: 'Reddit', positive: 40, negative: 35, neutral: 25, total: 300, engagement: 22.1 },
    ],
    recentReviews: [
      { id: 1, text: 'Great product, highly recommend! The quality exceeded my expectations.', sentiment: 'positive', channel: 'Twitter', timestamp: '2024-01-15 10:30', score: 0.95 },
      { id: 2, text: 'Not satisfied with the quality. Expected better for the price.', sentiment: 'negative', channel: 'Facebook', timestamp: '2024-01-15 09:15', score: 0.15 },
      { id: 3, text: 'Average experience, nothing special but gets the job done.', sentiment: 'neutral', channel: 'Reviews', timestamp: '2024-01-15 08:45', score: 0.52 },
      { id: 4, text: 'Amazing service and fast delivery! Customer support was excellent.', sentiment: 'positive', channel: 'Instagram', timestamp: '2024-01-15 07:20', score: 0.89 },
      { id: 5, text: 'Could be better, had some issues with the interface.', sentiment: 'negative', channel: 'Twitter', timestamp: '2024-01-15 06:10', score: 0.25 },
      { id: 6, text: 'Love the new features! This update is exactly what I needed.', sentiment: 'positive', channel: 'YouTube', timestamp: '2024-01-15 05:30', score: 0.92 },
      { id: 7, text: 'Decent product but the pricing could be more competitive.', sentiment: 'neutral', channel: 'Reddit', timestamp: '2024-01-15 04:45', score: 0.48 },
      { id: 8, text: 'Terrible customer service. Waited 2 hours for a response.', sentiment: 'negative', channel: 'Facebook', timestamp: '2024-01-15 03:20', score: 0.08 },
      { id: 9, text: 'Outstanding quality! Will definitely buy again.', sentiment: 'positive', channel: 'Reviews', timestamp: '2024-01-15 02:15', score: 0.97 },
      { id: 10, text: 'Good product overall, minor issues with delivery.', sentiment: 'neutral', channel: 'Instagram', timestamp: '2024-01-15 01:30', score: 0.61 },
    ],
    hourlyTrend: [
      { hour: '00:00', positive: 45, negative: 30, neutral: 25 },
      { hour: '02:00', positive: 42, negative: 32, neutral: 26 },
      { hour: '04:00', positive: 40, negative: 35, neutral: 25 },
      { hour: '06:00', positive: 48, negative: 28, neutral: 24 },
      { hour: '08:00', positive: 55, negative: 25, neutral: 20 },
      { hour: '10:00', positive: 62, negative: 22, neutral: 16 },
      { hour: '12:00', positive: 68, negative: 18, neutral: 14 },
      { hour: '14:00', positive: 72, negative: 15, neutral: 13 },
      { hour: '16:00', positive: 70, negative: 17, neutral: 13 },
      { hour: '18:00', positive: 65, negative: 20, neutral: 15 },
      { hour: '20:00', positive: 58, negative: 25, neutral: 17 },
      { hour: '22:00', positive: 52, negative: 28, neutral: 20 },
    ],
    topKeywords: [
      { word: 'quality', count: 1250, sentiment: 'positive' },
      { word: 'price', count: 980, sentiment: 'negative' },
      { word: 'delivery', count: 850, sentiment: 'positive' },
      { word: 'support', count: 720, sentiment: 'mixed' },
      { word: 'interface', count: 680, sentiment: 'negative' },
      { word: 'features', count: 620, sentiment: 'positive' },
      { word: 'bug', count: 580, sentiment: 'negative' },
      { word: 'recommend', count: 520, sentiment: 'positive' },
    ],
  };

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
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Channel breakdown chart will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Hourly Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Hourly Sentiment Trend
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Hourly trend chart will be displayed here
              </Typography>
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
                      {channel.total} reviews • {channel.engagement}% engagement
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
            </Box>
          </Paper>
        </Grid>

        {/* Recent Reviews Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reviews
            </Typography>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;