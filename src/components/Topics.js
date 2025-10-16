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
} from '@mui/material';
import { apiService } from '../services/api';
import { useProduct } from '../contexts/ProductContext';

const Topics = () => {
  const { selectedProduct, productData } = useProduct();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicsData, setTopicsData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');

  const fetchTopicsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get real data from database API
      const topicsResponse = await apiService.getTopicsData(timeRange);
      if (topicsResponse && topicsResponse.topics && topicsResponse.topics.length > 0) {
        console.log('✅ Using real database data for topics');
        setTopicsData(topicsResponse);
      } else {
        console.log('ℹ️ No topics data available');
        setTopicsData(null);
      }
    } catch (err) {
      setError('Failed to load topics data');
      console.error('Topics data fetch error:', err);
      setTopicsData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchTopicsData();
  }, [fetchTopicsData]);

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
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

  // If no topics data, show empty state
  if (!topicsData) {
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

  const data = topicsData;

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  const filteredTopics = (data.topics || []).filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Filters and Search Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filters & Search
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
        {/* Top Row: Chart and Insights */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              Top Topics by Mentions
            </Typography>
            <Box sx={{ 
              height: 350, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'grey.50',
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'grey.300'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  📊 Topics Visualization
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interactive chart will be displayed here
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Topic Insights - Better organized */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              📈 Topic Insights
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              height: 'calc(100% - 60px)',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'success.light', 
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold' }}>
                  Most Positive
                </Typography>
                <Typography variant="h6" color="success.dark" sx={{ fontWeight: 'bold' }}>
                  {data.topicInsights?.mostPositive || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'error.light', 
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="error.dark" sx={{ fontWeight: 'bold' }}>
                  Most Negative
                </Typography>
                <Typography variant="h6" color="error.dark" sx={{ fontWeight: 'bold' }}>
                  {data.topicInsights?.mostNegative || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'info.light', 
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="info.dark" sx={{ fontWeight: 'bold' }}>
                  Fastest Growing
                </Typography>
                <Typography variant="h6" color="info.dark" sx={{ fontWeight: 'bold' }}>
                  {data.topicInsights?.fastestGrowing || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'warning.light', 
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 'bold' }}>
                  Most Discussed
                </Typography>
                <Typography variant="h6" color="warning.dark" sx={{ fontWeight: 'bold' }}>
                  {data.topicInsights?.mostDiscussed || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Trending Topics - Better positioned */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              🔥 Trending Topics
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(data.trendingTopics || []).map((topic, index) => (
                <Box 
                  key={topic.name} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                    {topic.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: topic.growth.startsWith('+') ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                        minWidth: '60px',
                        textAlign: 'right'
                      }}
                    >
                      {topic.growth}
                    </Typography>
                    <Chip
                      label={topic.sentiment}
                      color={getSentimentColor(topic.sentiment)}
                      size="small"
                      sx={{ minWidth: '80px' }}
                    />
                  </Box>
                </Box>
              ))}
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