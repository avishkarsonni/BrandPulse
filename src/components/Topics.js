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

const Topics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicsData, setTopicsData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');

  const fetchTopicsData = useCallback(async () => {
    try {
      setLoading(true);
      // Use dummy data directly for now
      console.log('Using dummy data for Topics');
      setTopicsData(null); // This will trigger the dummy data fallback
    } catch (err) {
      setError('Failed to load topics data');
      console.error('Topics data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const data = topicsData || {
    topics: [
      { id: 1, name: 'Product Quality', count: 1250, sentiment: 'positive', percentage: 35.2, trend: '+12.5%', keywords: ['quality', 'durable', 'reliable', 'excellent'] },
      { id: 2, name: 'Customer Service', count: 980, sentiment: 'negative', percentage: 27.6, trend: '-5.2%', keywords: ['support', 'help', 'response', 'assistance'] },
      { id: 3, name: 'Delivery Speed', count: 750, sentiment: 'positive', percentage: 21.1, trend: '+8.7%', keywords: ['fast', 'quick', 'shipping', 'delivery'] },
      { id: 4, name: 'Pricing', count: 620, sentiment: 'neutral', percentage: 17.5, trend: '+2.1%', keywords: ['price', 'cost', 'expensive', 'affordable'] },
      { id: 5, name: 'User Interface', count: 480, sentiment: 'positive', percentage: 13.5, trend: '+15.3%', keywords: ['interface', 'design', 'layout', 'navigation'] },
      { id: 6, name: 'Technical Support', count: 420, sentiment: 'negative', percentage: 11.8, trend: '-8.9%', keywords: ['technical', 'bug', 'issue', 'problem'] },
      { id: 7, name: 'Features', count: 380, sentiment: 'positive', percentage: 10.7, trend: '+22.1%', keywords: ['feature', 'functionality', 'capability', 'option'] },
      { id: 8, name: 'Documentation', count: 320, sentiment: 'neutral', percentage: 9.0, trend: '+3.4%', keywords: ['documentation', 'guide', 'manual', 'tutorial'] },
      { id: 9, name: 'Performance', count: 280, sentiment: 'positive', percentage: 7.9, trend: '+18.6%', keywords: ['performance', 'speed', 'efficient', 'fast'] },
      { id: 10, name: 'Security', count: 240, sentiment: 'positive', percentage: 6.8, trend: '+11.2%', keywords: ['security', 'safe', 'secure', 'privacy'] },
    ],
    trendingTopics: [
      { name: 'AI Features', growth: '+45.2%', sentiment: 'positive' },
      { name: 'Mobile App', growth: '+32.8%', sentiment: 'positive' },
      { name: 'Data Privacy', growth: '+28.5%', sentiment: 'neutral' },
      { name: 'Integration Issues', growth: '+15.7%', sentiment: 'negative' },
    ],
    topicInsights: {
      mostPositive: 'Product Quality',
      mostNegative: 'Customer Service',
      fastestGrowing: 'AI Features',
      mostDiscussed: 'Pricing',
    },
  };

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
    <Box>
      <Typography variant="h4" gutterBottom>
        Topic Analysis
      </Typography>

      {/* Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
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

        <TextField
          label="Search Topics"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Topics Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Topics by Mentions
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Topics chart will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Trending Topics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trending Topics
            </Typography>
            <Box sx={{ height: 200, overflow: 'auto' }}>
              {(data.trendingTopics || []).map((topic, index) => (
                <Box key={topic.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {topic.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: topic.growth.startsWith('+') ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                      mr: 1
                    }}
                  >
                    {topic.growth}
                  </Typography>
                  <Chip
                    label={topic.sentiment}
                    color={getSentimentColor(topic.sentiment)}
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Topic Insights */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Topic Insights
            </Typography>
            <Box sx={{ height: 200 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Most Positive
                </Typography>
                <Typography variant="h6" color="success.main">
                  {data.topicInsights?.mostPositive || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Most Negative
                </Typography>
                <Typography variant="h6" color="error.main">
                  {data.topicInsights?.mostNegative || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Fastest Growing
                </Typography>
                <Typography variant="h6" color="info.main">
                  {data.topicInsights?.fastestGrowing || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Most Discussed
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {data.topicInsights?.mostDiscussed || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Topics List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Topics
            </Typography>
            <List>
              {filteredTopics.map((topic) => (
                <ListItem
                  key={topic.id}
                  button
                  onClick={() => handleTopicClick(topic)}
                  selected={selectedTopic?.id === topic.id}
                >
                  <ListItemText
                    primary={topic.name}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {topic.count} mentions ({topic.percentage}%)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {(topic.keywords || []).slice(0, 3).map((keyword) => (
                            <Chip
                              key={keyword}
                              label={keyword}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Chip
                        label={topic.sentiment}
                        color={getSentimentColor(topic.sentiment)}
                        size="small"
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: topic.trend.startsWith('+') ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {topic.trend}
                      </Typography>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Topic Details */}
        {selectedTopic && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTopic.name} - Detailed Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Mentions
                      </Typography>
                      <Typography variant="h4">
                        {selectedTopic.count}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Percentage
                      </Typography>
                      <Typography variant="h4">
                        {selectedTopic.percentage}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Overall Sentiment
                      </Typography>
                      <Chip
                        label={selectedTopic.sentiment}
                        color={getSentimentColor(selectedTopic.sentiment)}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Trend
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        +12.5%
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