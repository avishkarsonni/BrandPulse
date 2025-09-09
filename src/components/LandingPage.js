import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Analytics,
  Timeline,
  Topic,
  Settings,
  TrendingUp,
  SentimentSatisfied,
  Speed,
  Security,
  Search as SearchIcon,
  PhoneAndroid,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../contexts/ProductContext';
import { apiService } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const { updateProduct } = useProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Smartphone products for search
  const smartphoneProducts = [
    { name: 'iPhone 15 Pro', brand: 'Apple', category: 'Smartphones' },
    { name: 'iPhone 15', brand: 'Apple', category: 'Smartphones' },
    { name: 'iPhone 14 Pro', brand: 'Apple', category: 'Smartphones' },
    { name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Smartphones' },
    { name: 'Samsung Galaxy S23', brand: 'Samsung', category: 'Smartphones' },
    { name: 'Google Pixel 8', brand: 'Google', category: 'Smartphones' },
    { name: 'Google Pixel 7', brand: 'Google', category: 'Smartphones' },
    { name: 'OnePlus 12', brand: 'OnePlus', category: 'Smartphones' },
    { name: 'Xiaomi 14', brand: 'Xiaomi', category: 'Smartphones' },
    { name: 'Huawei P60', brand: 'Huawei', category: 'Smartphones' },
  ];

  const handleSearch = async (productName) => {
    if (!productName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Find the product in our smartphone list
      const product = smartphoneProducts.find(p => 
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
      
      if (product) {
        // Get product data from API
        const searchResults = await apiService.searchProducts(productName, { category: 'Smartphones' });
        const productData = searchResults.results?.[0];
        
        if (productData) {
          // Update the global product context
          updateProduct(productData, productData);
          
          // Navigate to dashboard with the selected product
          navigate('/dashboard');
        } else {
          setError('Product not found. Please try a different search term.');
        }
      } else {
        setError('Please select a smartphone from the suggestions.');
      }
    } catch (err) {
      setError('Failed to load product data. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setSearchQuery(newInputValue);
    if (newInputValue.length > 1) {
      const filtered = smartphoneProducts.filter(product =>
        product.name.toLowerCase().includes(newInputValue.toLowerCase()) ||
        product.brand.toLowerCase().includes(newInputValue.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const features = [
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Real-time Analytics',
      description: 'Monitor sentiment trends and patterns with live data updates and interactive visualizations.',
      color: '#4caf50',
    },
    {
      icon: <Timeline sx={{ fontSize: 40 }} />,
      title: 'Timeline Analysis',
      description: 'Track sentiment changes over time with detailed timeline views and trend analysis.',
      color: '#2196f3',
    },
    {
      icon: <Topic sx={{ fontSize: 40 }} />,
      title: 'Topic Extraction',
      description: 'AI-powered topic detection and sentiment mapping for deeper insights.',
      color: '#ff9800',
    },
    {
      icon: <Settings sx={{ fontSize: 40 }} />,
      title: 'Customizable Settings',
      description: 'Configure alerts, themes, and data sources to match your needs.',
      color: '#9c27b0',
    },
  ];

  const stats = [
    { label: 'Total Reviews Analyzed', value: '15,847', icon: <TrendingUp /> },
    { label: 'Positive Sentiment', value: '68.2%', icon: <SentimentSatisfied /> },
    { label: 'Processing Speed', value: '< 1s', icon: <Speed /> },
    { label: 'Data Security', value: '100%', icon: <Security /> },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 8,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{
              background: [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
            }}
          />
          <Container maxWidth="lg">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Sentiment Analysis Dashboard
              </Typography>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Transform customer feedback into actionable insights with AI-powered sentiment analysis
              </Typography>
            </motion.div>

            {/* Smartphone Search Section */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                  <PhoneAndroid sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Search for a Smartphone to Analyze
                </Typography>
                
                <Autocomplete
                  freeSolo
                  options={suggestions}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  inputValue={searchQuery}
                  onInputChange={handleInputChange}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      handleSearch(typeof newValue === 'string' ? newValue : newValue.name);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search smartphones (e.g., iPhone 15 Pro, Samsung Galaxy S24...)"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />,
                        endAdornment: loading ? <CircularProgress size={20} color="inherit" /> : null,
                        sx: {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                          },
                          '& input': {
                            color: 'white',
                            '&::placeholder': {
                              color: 'rgba(255,255,255,0.7)',
                            },
                          },
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <PhoneAndroid sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.brand} • {option.category}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  sx={{
                    '& .MuiAutocomplete-popper': {
                      '& .MuiPaper-root': {
                        backgroundColor: 'white',
                        color: 'black',
                      },
                    },
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                    {error}
                  </Alert>
                )}

                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', opacity: 0.8 }}>
                  Try searching for: iPhone, Samsung, Google Pixel, OnePlus, or Xiaomi
                </Typography>
              </Box>
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ 
                      backgroundColor: 'white', 
                      color: '#667eea',
                      px: 4,
                      py: 1.5,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                    onClick={() => navigate('/dashboard')}
                  >
                    Get Started
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                    onClick={() => navigate('/analytics')}
                  >
                    View Analytics
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Container>
        </Box>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants}>
        <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      sx={{ 
                        textAlign: 'center', 
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ color: 'primary.main', mb: 2 }}>
                          {stat.icon}
                        </Box>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        >
                          <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
                            {stat.value}
                          </Typography>
                        </motion.div>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </motion.div>

      {/* Features Section */}
      <motion.div variants={itemVariants}>
        <Box sx={{ py: 8 }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
                Powerful Features
              </Typography>
              <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
                Everything you need to analyze and understand customer sentiment
              </Typography>
            </motion.div>
            
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ color: feature.color, mb: 2 }}>
                          {feature.icon}
                        </Box>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        >
                          <Typography variant="h5" component="h3" gutterBottom>
                            {feature.title}
                          </Typography>
                        </motion.div>
                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </motion.div>

      {/* Technology Stack */}
      <motion.div variants={itemVariants}>
        <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
                Built with Modern Technology
              </Typography>
              <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
                Leveraging the latest tools and frameworks for optimal performance
              </Typography>
            </motion.div>
            
            <Grid container spacing={2} justifyContent="center">
              {['React 18', 'Material-UI', 'Chart.js', 'FastAPI', 'Machine Learning', 'Real-time Data'].map((tech, index) => (
                <Grid item key={tech}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Chip
                      label={tech}
                      variant="outlined"
                      sx={{ 
                        fontSize: '1rem',
                        height: 40,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          backgroundColor: 'primary.main', 
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </motion.div>

      {/* CTA Section */}
      <motion.div variants={itemVariants}>
        <Box sx={{ py: 8 }}>
          <Container maxWidth="md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <Paper 
                sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Typography variant="h4" component="h2" gutterBottom>
                    Ready to Get Started?
                  </Typography>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    Start analyzing your customer sentiment data today and make data-driven decisions.
                  </Typography>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Launch Dashboard
                  </Button>
                </motion.div>
              </Paper>
            </motion.div>
          </Container>
        </Box>
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;
