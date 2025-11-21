import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Autocomplete,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { apiService } from '../services/api';
import { useProduct } from '../contexts/ProductContext';

const Timeline = () => {
  const { selectedProduct, productData, updateProduct } = useProduct();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [granularity, setGranularity] = useState('hourly');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const fetchTimelineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get product-specific timeline data if product is selected
      const productId = selectedProduct?.id || null;
      const timelineResponse = await apiService.getTimelineData(timeRange, granularity, productId);
      if (timelineResponse && timelineResponse.timeline && timelineResponse.timeline.length > 0) {
        console.log('✅ Using real database data for timeline', productId ? `(product: ${productId})` : '');
        setTimelineData(timelineResponse);
      } else {
        console.log('ℹ️ No timeline data available', productId ? `for product ${productId}` : '');
        setTimelineData(null);
      }
    } catch (err) {
      setError('Failed to load timeline data');
      console.error('Timeline data fetch error:', err);
      setTimelineData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange, granularity, selectedProduct]);

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

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
        // Refresh timeline data for the selected product
        fetchTimelineData();
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

  // If no timeline data, show empty state only if no product is selected
  if (!timelineData && !selectedProduct) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Sentiment Timeline
        </Typography>

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

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Granularity</InputLabel>
            <Select
              value={granularity}
              label="Granularity"
              onChange={(e) => setGranularity(e.target.value)}
            >
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
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
            No Timeline Data Available
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Timeline data is not available at the moment. This could be because there is no sentiment data in the database yet.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Timeline shows sentiment trends over time. Make sure products have sentiment data to see the timeline here.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  // If product is selected but no timeline data, show header and filters but no empty state
  if (!timelineData && selectedProduct) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Sentiment Timeline - {selectedProduct.name}
        </Typography>

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

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Granularity</InputLabel>
            <Select
              value={granularity}
              label="Granularity"
              onChange={(e) => setGranularity(e.target.value)}
            >
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Timeline data is being processed for {selectedProduct.name}. Please check back later or try a different time range.
        </Alert>
      </Box>
    );
  }

  const data = timelineData;

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'success';
      case 'decreasing': return 'error';
      case 'stable': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Timeline Analysis{selectedProduct ? ` - ${selectedProduct.name}` : ''}
      </Typography>

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
          <InputLabel>Granularity</InputLabel>
          <Select
            value={granularity}
            label="Granularity"
            onChange={(e) => setGranularity(e.target.value)}
          >
            <MenuItem value="hourly">Hourly</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Main Timeline Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sentiment Timeline
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Timeline chart will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Positive
              </Typography>
              <Typography variant="h4" color="success.main">
                {data.summary?.avgPositive || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Negative
              </Typography>
              <Typography variant="h4" color="error.main">
                {data.summary?.avgNegative || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Trend
              </Typography>
              <Chip
                label={data.summary?.trend || 'stable'}
                color={getTrendColor(data.summary?.trend || 'stable')}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Peak Activity
              </Typography>
              <Typography variant="h6">
                {data.summary?.peakHour || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Volume
              </Typography>
              <Typography variant="h4" color="primary.main">
                {(data.summary.totalVolume || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Peak Volume
              </Typography>
              <Typography variant="h4" color="info.main">
                {data.summary?.peakVolume || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Response Time
              </Typography>
              <Typography variant="h6" color="warning.main">
                {data.summary?.avgResponseTime || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Satisfaction Score
              </Typography>
              <Typography variant="h4" color="success.main">
                {data.summary?.satisfactionScore || 0}/5
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Timeline;