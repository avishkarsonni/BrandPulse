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

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    setExpandedProduct(product.id);
    
    try {
      setLoading(true);
      const [details, pages, sentiment] = await Promise.all([
        apiService.getProductDetails(product.id),
        apiService.getProductPages(product.id),
        apiService.getProductSentiment(product.id)
      ]);
      
      setProductPages(pages.pages || []);
      setProductSentiment(sentiment);
    } catch (err) {
      setError('Failed to load product details');
      console.error('Product details error:', err);
    } finally {
      setLoading(false);
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
            <Typography variant="h6" gutterBottom>
              Search Results ({searchResults.length})
            </Typography>
            
            <Grid container spacing={2}>
              {searchResults.map((product) => (
                <Grid item xs={12} key={product.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => handleProductClick(product)}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={2}>
                          <CardMedia
                            component="img"
                            sx={{ width: 80, height: 80, borderRadius: 1 }}
                            image={product.image_url}
                            alt={product.name}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" gutterBottom>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {product.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={product.category} size="small" variant="outlined" />
                            <Chip label={product.brand} size="small" variant="outlined" />
                            <Chip label={formatPrice(product.price)} size="small" />
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Sentiment Score
                              </Typography>
                              <Typography variant="h6" color={
                                product.sentiment_summary.avg_score > 0.5 ? 'success.main' : 
                                product.sentiment_summary.avg_score < -0.1 ? 'error.main' : 'warning.main'
                              }>
                                {(product.sentiment_summary.avg_score * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" color="text.secondary">
                                Total Mentions
                              </Typography>
                              <Typography variant="h6">
                                {product.sentiment_summary.total_mentions.toLocaleString()}
                              </Typography>
                            </Box>
                            <IconButton>
                              {expandedProduct === product.id ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>

                    {/* Expanded Product Details */}
                    <Collapse in={expandedProduct === product.id}>
                      <Divider />
                      <CardContent>
                        {loading && selectedProduct?.id === product.id ? (
                          <Box display="flex" justifyContent="center" p={2}>
                            <CircularProgress />
                          </Box>
                        ) : (
                          <Grid container spacing={3}>
                            {/* Sentiment Overview */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                Sentiment Overview
                              </Typography>
                              {productSentiment && (
                                <Box>
                                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" color="success.main">
                                        {productSentiment.summary.positive_mentions}
                                      </Typography>
                                      <Typography variant="caption">Positive</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" color="error.main">
                                        {productSentiment.summary.negative_mentions}
                                      </Typography>
                                      <Typography variant="caption">Negative</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" color="warning.main">
                                        {productSentiment.summary.neutral_mentions}
                                      </Typography>
                                      <Typography variant="caption">Neutral</Typography>
                                    </Box>
                                  </Box>

                                  <Typography variant="subtitle2" gutterBottom>
                                    Top Topics:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {productSentiment.topics.slice(0, 4).map((topic) => (
                                      <Chip
                                        key={topic.topic}
                                        label={`${topic.topic} (${topic.mentions})`}
                                        color={getSentimentColor(topic.sentiment)}
                                        size="small"
                                        icon={getSentimentIcon(topic.sentiment)}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Grid>

                            {/* Related Pages */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                Related Pages & Platforms
                              </Typography>
                              <List dense>
                                {productPages.slice(0, 5).map((page) => (
                                  <ListItem key={page.id} sx={{ px: 0 }}>
                                    <ListItemIcon>
                                      <OpenInNew fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={page.title}
                                      secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                          <Chip label={page.platform} size="small" variant="outlined" />
                                          <Typography variant="caption">
                                            {page.sentiment_summary.positive}% positive
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      href={page.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Visit
                                    </Button>
                                  </ListItem>
                                ))}
                              </List>
                            </Grid>
                          </Grid>
                        )}
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
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No products found for "{searchQuery}"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search terms or filters
          </Typography>
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
