import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  LinearProgress,
  Badge,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore,
  ExpandLess,
  OpenInNew,
  Psychology as Sentiment,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  Visibility,
  Share,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productPages, setProductPages] = useState([]);
  const [productSentiment, setProductSentiment] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    brand: 'all',
    priceRange: [0, 5000],
    sentiment: 'all'
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 0) {
        try {
          setLoading(true);
          const results = await apiService.searchProducts(query, filters);
          setSearchResults(results.results || []);
          setError(null);
        } catch (err) {
          setError('Failed to search products');
          console.error('Search error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    [filters, setLoading, setSearchResults, setError]
  );

  // Get suggestions for autocomplete
  const getSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length > 1) {
        try {
          const response = await apiService.getProductSuggestions(query);
          setSuggestions(response.suggestions || []);
        } catch (err) {
          console.error('Suggestions error:', err);
        }
      } else {
        setSuggestions([]);
      }
    }, 200),
    [setSuggestions]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
      getSuggestions(searchQuery);
    }
  }, [searchQuery, debouncedSearch, getSuggestions]);

  const handleExpandToggle = (product, event) => {
    // COMPLETELY PREVENT ANY NAVIGATION
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Simple toggle - NO API CALLS, NO ASYNC, NO NAVIGATION
    if (expandedProduct === product.id) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(product.id);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <SentimentSatisfied color="success" />;
      case 'negative': return <SentimentDissatisfied color="error" />;
      case 'neutral': return <SentimentNeutral color="warning" />;
      default: return <Sentiment />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Product Search & Analytics
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Search for products to view sentiment analysis across all related pages and platforms
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Autocomplete
          freeSolo
          options={suggestions}
          inputValue={searchQuery}
          onInputChange={(event, newInputValue) => {
            setSearchQuery(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              placeholder="Search for products (e.g., iPhone, Nike shoes, Tesla...)"
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                endAdornment: loading ? <CircularProgress size={20} /> : null,
              }}
            />
          )}
          sx={{ mb: 2 }}
        />

        {/* Filters */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Smartphones">Smartphones</MenuItem>
                <MenuItem value="Laptops">Laptops</MenuItem>
                <MenuItem value="Footwear">Footwear</MenuItem>
                <MenuItem value="Vehicles">Vehicles</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Brand</InputLabel>
              <Select
                value={filters.brand}
                label="Brand"
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              >
                <MenuItem value="all">All Brands</MenuItem>
                <MenuItem value="Apple">Apple</MenuItem>
                <MenuItem value="Samsung">Samsung</MenuItem>
                <MenuItem value="Nike">Nike</MenuItem>
                <MenuItem value="Tesla">Tesla</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sentiment</InputLabel>
              <Select
                value={filters.sentiment}
                label="Sentiment"
                onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
              >
                <MenuItem value="all">All Sentiment</MenuItem>
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ px: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(event, newValue) => setFilters({ ...filters, priceRange: newValue })}
                valueLabelDisplay="auto"
                min={0}
                max={5000}
                step={100}
                valueLabelFormat={(value) => formatPrice(value)}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 3,
              p: 2,
              backgroundColor: 'primary.light',
              borderRadius: 2,
              color: 'primary.contrastText'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                🎯 Search Results ({searchResults.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${searchResults.filter(p => p.sentiment_summary.avg_score > 0.5).length} Positive`}
                  size="small"
                  sx={{ backgroundColor: 'success.main', color: 'white' }}
                />
                <Chip 
                  label={`${searchResults.filter(p => p.sentiment_summary.avg_score < 0).length} Negative`}
                  size="small"
                  sx={{ backgroundColor: 'error.main', color: 'white' }}
                />
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              {searchResults.map((product) => (
                <Grid item xs={12} key={product.id}>
                  <Card 
                    sx={{ 
                      transition: 'all 0.3s ease-in-out',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 3,
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                        transform: 'translateY(-2px)',
                        borderColor: 'primary.light',
                      }
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={2}>
                          <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <CardMedia
                              component="img"
                              sx={{ 
                                width: 80, 
                                height: 80, 
                                borderRadius: 2, 
                                objectFit: 'cover', 
                                pointerEvents: 'none',
                                border: '2px solid',
                                borderColor: 'grey.200',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  transform: 'scale(1.05)',
                                }
                              }}
                              image={product.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x80/e3f2fd/1976d2?text=' + encodeURIComponent(product.name.charAt(0));
                              }}
                            />
                            <Badge
                              badgeContent={product.sentiment_summary.total_mentions > 1000 ? '1K+' : product.sentiment_summary.total_mentions}
                              color="primary"
                              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                '& .MuiBadge-badge': {
                                  fontSize: '0.6rem',
                                  minWidth: 16,
                                  height: 16,
                                }
                              }}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ pointerEvents: 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {product.name}
                              </Typography>
                              {product.sentiment_summary.avg_score > 0.7 && (
                                <Tooltip title="Highly Rated">
                                  <Star sx={{ color: 'gold', fontSize: 20 }} />
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                              {product.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                              <Chip 
                                label={product.category} 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                                sx={{ fontWeight: 500 }}
                              />
                              <Chip 
                                label={product.brand} 
                                size="small" 
                                variant="filled" 
                                color="secondary"
                                sx={{ fontWeight: 500 }}
                              />
                              <Chip 
                                label={formatPrice(product.price)} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'success.light',
                                  color: 'success.dark',
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                            {/* Sentiment Progress Bar */}
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                Overall Sentiment
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={(product.sentiment_summary.avg_score + 1) * 50}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    backgroundColor: product.sentiment_summary.avg_score > 0.3 ? 'success.main' : 
                                                   product.sentiment_summary.avg_score < -0.1 ? 'error.main' : 'warning.main'
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ pointerEvents: 'none' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: 'primary.light', borderRadius: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    {product.sentiment_summary.avg_score > 0.3 ? (
                                      <ThumbUp sx={{ fontSize: 16, color: 'success.main' }} />
                                    ) : product.sentiment_summary.avg_score < -0.1 ? (
                                      <ThumbDown sx={{ fontSize: 16, color: 'error.main' }} />
                                    ) : (
                                      <Sentiment sx={{ fontSize: 16, color: 'warning.main' }} />
                                    )}
                                    <Typography variant="caption" color="primary.dark" sx={{ fontWeight: 600 }}>
                                      Sentiment
                                    </Typography>
                                  </Box>
                                  <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 700 }}>
                                    {(product.sentiment_summary.avg_score * 100).toFixed(0)}%
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={6}>
                                <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: 'secondary.light', borderRadius: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Visibility sx={{ fontSize: 16, color: 'secondary.dark' }} />
                                    <Typography variant="caption" color="secondary.dark" sx={{ fontWeight: 600 }}>
                                      Mentions
                                    </Typography>
                                  </Box>
                                  <Typography variant="h6" color="secondary.dark" sx={{ fontWeight: 700 }}>
                                    {product.sentiment_summary.total_mentions > 1000 ? 
                                      `${(product.sentiment_summary.total_mentions / 1000).toFixed(1)}K` : 
                                      product.sentiment_summary.total_mentions.toLocaleString()}
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                            
                            {/* Trend Indicators */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                              <Chip
                                icon={product.sentiment_summary.positive > product.sentiment_summary.negative ? 
                                      <TrendingUp /> : <TrendingDown />}
                                label={product.sentiment_summary.positive > product.sentiment_summary.negative ? 
                                       'Trending Up' : 'Trending Down'}
                                size="small"
                                color={product.sentiment_summary.positive > product.sentiment_summary.negative ? 
                                       'success' : 'error'}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          </Box>
                          
                          <Box sx={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Tooltip title={expandedProduct === product.id ? "Hide Details" : "Show Details"}>
                              <IconButton
                                onClick={(e) => handleExpandToggle(product, e)}
                                aria-label="expand product details"
                                sx={{ 
                                  pointerEvents: 'auto',
                                  backgroundColor: 'primary.main',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: 'primary.dark',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                  boxShadow: 2
                                }}
                              >
                                {expandedProduct === product.id ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>

                    {/* Simple Expanded Content - NO API CALLS */}
                    <Collapse in={expandedProduct === product.id}>
                      <Divider sx={{ borderColor: 'primary.light' }} />
                      <CardContent sx={{ backgroundColor: 'grey.50', borderRadius: '0 0 12px 12px' }}>
                        <Grid container spacing={3}>
                          {/* Static Product Info */}
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                              <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 600 }}>
                                📊 Product Information
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {product.description}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={product.category} color="primary" size="small" />
                                <Chip label={product.brand} color="secondary" size="small" />
                                <Chip label={formatPrice(product.price)} color="success" size="small" />
                              </Box>
                            </Paper>
                          </Grid>

                          {/* Static Sentiment Info */}
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}>
                              <Typography variant="h6" gutterBottom sx={{ color: 'secondary.dark', fontWeight: 600 }}>
                                📈 Sentiment Summary
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center', p: 1 }}>
                                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                                      {product.sentiment_summary.positive}
                                    </Typography>
                                    <Typography variant="caption" color="success.main">Positive</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center', p: 1 }}>
                                    <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
                                      {product.sentiment_summary.negative}
                                    </Typography>
                                    <Typography variant="caption" color="error.main">Negative</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center', p: 1 }}>
                                    <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700 }}>
                                      {product.sentiment_summary.neutral}
                                    </Typography>
                                    <Typography variant="caption" color="warning.main">Neutral</Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {searchQuery && searchResults.length === 0 && !loading && (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
          border: '1px solid',
          borderColor: 'pink.200'
        }}>
          <Box sx={{ mb: 3 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
          </Box>
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
            No products found for "{searchQuery}"
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search terms or explore these suggestions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['iPhone 15', 'Nike Air Max', 'Tesla Model Y', 'MacBook Pro', 'Samsung Galaxy'].map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default ProductSearch;
