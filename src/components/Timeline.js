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

const Timeline = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [granularity, setGranularity] = useState('hourly');

  const fetchTimelineData = useCallback(async () => {
    try {
      setLoading(true);
      // Use dummy data directly for now
      console.log('Using dummy data for Timeline');
      setTimelineData(null); // This will trigger the dummy data fallback
    } catch (err) {
      setError('Failed to load timeline data');
      console.error('Timeline data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const data = timelineData || {
    summary: {
      avgPositive: 68.5,
      avgNegative: 18.2,
      avgNeutral: 13.3,
      trend: 'increasing',
      peakHour: '14:00',
      lowHour: '02:00',
      totalVolume: 15420,
      peakVolume: 1250,
      avgResponseTime: '2.3 hours',
      satisfactionScore: 4.2,
    },
    hourlyData: [
      { hour: '00:00', positive: 45, negative: 30, neutral: 25, volume: 120 },
      { hour: '02:00', positive: 42, negative: 32, neutral: 26, volume: 95 },
      { hour: '04:00', positive: 40, negative: 35, neutral: 25, volume: 80 },
      { hour: '06:00', positive: 48, negative: 28, neutral: 24, volume: 150 },
      { hour: '08:00', positive: 55, negative: 25, neutral: 20, volume: 280 },
      { hour: '10:00', positive: 62, negative: 22, neutral: 16, volume: 450 },
      { hour: '12:00', positive: 68, negative: 18, neutral: 14, volume: 680 },
      { hour: '14:00', positive: 72, negative: 15, neutral: 13, volume: 850 },
      { hour: '16:00', positive: 70, negative: 17, neutral: 13, volume: 750 },
      { hour: '18:00', positive: 65, negative: 20, neutral: 15, volume: 620 },
      { hour: '20:00', positive: 58, negative: 25, neutral: 17, volume: 480 },
      { hour: '22:00', positive: 52, negative: 28, neutral: 20, volume: 320 },
    ],
    dailyData: [
      { date: '2024-01-09', positive: 65, negative: 20, neutral: 15, volume: 1200 },
      { date: '2024-01-10', positive: 68, negative: 18, neutral: 14, volume: 1350 },
      { date: '2024-01-11', positive: 70, negative: 17, neutral: 13, volume: 1420 },
      { date: '2024-01-12', positive: 72, negative: 15, neutral: 13, volume: 1580 },
      { date: '2024-01-13', positive: 69, negative: 19, neutral: 12, volume: 1450 },
      { date: '2024-01-14', positive: 71, negative: 16, neutral: 13, volume: 1520 },
      { date: '2024-01-15', positive: 73, negative: 14, neutral: 13, volume: 1680 },
    ],
    weeklyData: [
      { week: 'Week 1', positive: 62, negative: 22, neutral: 16, volume: 8500 },
      { week: 'Week 2', positive: 65, negative: 20, neutral: 15, volume: 9200 },
      { week: 'Week 3', positive: 68, negative: 18, neutral: 14, volume: 9800 },
      { week: 'Week 4', positive: 71, negative: 16, neutral: 13, volume: 10500 },
    ],
  };

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