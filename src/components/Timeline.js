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
} from '@mui/material';
import { apiService } from '../services/api';
import { useProduct } from '../contexts/ProductContext';

const Timeline = () => {
  const { selectedProduct, productData } = useProduct();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [granularity, setGranularity] = useState('hourly');

  const fetchTimelineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get real data from database API
      const timelineResponse = await apiService.getTimelineData(timeRange, granularity);
      if (timelineResponse && timelineResponse.timeline && timelineResponse.timeline.length > 0) {
        console.log('✅ Using real database data for timeline');
        setTimelineData(timelineResponse);
      } else {
        console.log('ℹ️ No timeline data available');
        setTimelineData(null);
      }
    } catch (err) {
      setError('Failed to load timeline data');
      console.error('Timeline data fetch error:', err);
      setTimelineData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange, granularity]);

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

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

  // If no timeline data, show empty state
  if (!timelineData) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Sentiment Timeline
        </Typography>

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
        Timeline Analysis
      </Typography>

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