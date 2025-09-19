import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  PhoneAndroid,
  Clear,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useProduct } from '../contexts/ProductContext';

const Dashboard = () => {
  const { selectedProduct, productData, clearProduct } = useProduct();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedProduct, productData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (selectedProduct && productData) {
        // Use product-specific data
        setDashboardData({
          totalReviews: productData.sentiment_summary?.total_mentions || 0,
          positivePercent: productData.sentiment_summary?.positive || 0,
          negativePercent: productData.sentiment_summary?.negative || 0,
          neutralPercent: productData.sentiment_summary?.neutral || 0,
          todayReviews: Math.floor((productData.sentiment_summary?.total_mentions || 0) * 0.1),
          weeklyGrowth: 12.5,
          monthlyGrowth: 8.3,
          avgResponseTime: '2.4 hours',
          customerSatisfaction: 4.2,
          topPositiveTopics: ['Camera Quality', 'Performance', 'Design'],
          topNegativeTopics: ['Price', 'Battery Life', 'Availability'],
          recentAlerts: [
            { type: 'info', message: `Analysis for ${selectedProduct.name} completed`, time: 'Just now' },
            { type: 'success', message: 'Positive sentiment trend detected', time: '1 hour ago' },
          ],
        });
      } else {
        // Use general dummy data
        setDashboardData(null);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
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

  const data = dashboardData || {
    totalReviews: 15847,
    positivePercent: 68.2,
    negativePercent: 18.5,
    neutralPercent: 13.3,
    todayReviews: 342,
    weeklyGrowth: 12.5,
    monthlyGrowth: 8.3,
    avgResponseTime: '2.4 hours',
    customerSatisfaction: 4.2,
    topPositiveTopics: ['Product Quality', 'Fast Delivery', 'Great Support'],
    topNegativeTopics: ['Pricing', 'Website Issues', 'Slow Response'],
    recentAlerts: [
      { type: 'warning', message: 'Negative sentiment spike detected at 14:30', time: '2 hours ago' },
      { type: 'info', message: 'New positive trend in Product Quality mentions', time: '4 hours ago' },
    ],
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
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
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard Overview
          </Typography>
          {selectedProduct && (
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
        
        {selectedProduct && (
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
                    Analyzing: {selectedProduct.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedProduct.brand} • {selectedProduct.category} • ${selectedProduct.price}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </motion.div>
      
      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SentimentSatisfied color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Positive
                    </Typography>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Typography variant="h4">
                        {data.positivePercent}%
                      </Typography>
                    </motion.div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SentimentDissatisfied color="error" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Negative
                    </Typography>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <Typography variant="h4">
                        {data.negativePercent}%
                      </Typography>
                    </motion.div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SentimentNeutral color="warning" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Neutral
                    </Typography>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <Typography variant="h4">
                        {data.neutralPercent}%
                      </Typography>
                    </motion.div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Reviews
                    </Typography>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                    >
                      <Typography variant="h4">
                        {data.totalReviews.toLocaleString()}
                      </Typography>
                    </motion.div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Additional Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
                    📊
                  </Typography>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Today's Reviews
                    </Typography>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3, duration: 0.5 }}
                    >
                      <Typography variant="h4">
                        {data.todayReviews}
                      </Typography>
                    </motion.div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" color="success.main" sx={{ mr: 2 }}>
                    ⭐
                  </Typography>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Satisfaction
                    </Typography>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      <Typography variant="h4">
                        {data.customerSatisfaction}/5
                      </Typography>
                    </motion.div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" color="info.main" sx={{ mr: 2 }}>
                    📈
                  </Typography>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Weekly Growth
                    </Typography>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.7, duration: 0.5 }}
                    >
                      <Typography variant="h4" color="success.main">
                        +{data.weeklyGrowth}%
                      </Typography>
                    </motion.div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" color="warning.main" sx={{ mr: 2 }}>
                    ⏱️
                  </Typography>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Avg Response
                    </Typography>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.9, duration: 0.5 }}
                    >
                      <Typography variant="h6">
                        {data.avgResponseTime}
                      </Typography>
                    </motion.div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Topics */}
        <Grid item xs={12} md={6}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              sx={{ 
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Top Positive Topics
              </Typography>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.1, duration: 0.5 }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(data.topPositiveTopics || []).map((topic, index) => (
                    <motion.div
                      key={topic}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.3 + index * 0.1, duration: 0.3 }}
                    >
                      <Chip 
                        label={topic} 
                        color="success" 
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              sx={{ 
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Top Negative Topics
              </Typography>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.1, duration: 0.5 }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(data.topNegativeTopics || []).map((topic, index) => (
                    <motion.div
                      key={topic}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.3 + index * 0.1, duration: 0.3 }}
                    >
                      <Chip 
                        label={topic} 
                        color="error" 
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </Paper>
          </motion.div>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              sx={{ 
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Alerts
              </Typography>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.5 }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(data.recentAlerts || []).map((alert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.7 + index * 0.1, duration: 0.3 }}
                    >
                      <Alert severity={alert.type} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {alert.time}
                        </Typography>
                      </Alert>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </Paper>
          </motion.div>
        </Grid>

        {/* Simple Chart Placeholder */}
        <Grid item xs={12}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              sx={{ 
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Sentiment Distribution
              </Typography>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.9, duration: 0.5 }}
              >
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      Charts will be displayed here once Chart.js is properly configured
                    </Typography>
                  </motion.div>
                </Box>
              </motion.div>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default Dashboard;