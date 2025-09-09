import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { apiService } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    apiUrl: 'http://localhost:8000',
    apiKey: '',
    environment: 'development',
    autoRefresh: true,
    refreshInterval: 30,
    theme: 'light',
    defaultTimeRange: '7d',
    itemsPerPage: 10,
    emailAlerts: false,
    emailAddress: '',
    sentimentThreshold: 0.7,
    volumeThreshold: 1000,
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await apiService.getSettings();
      setSettings({ ...settings, ...savedSettings });
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiService.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Save settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      await apiService.testConnection();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Connection test failed');
      console.error('Connection test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* API Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API Configuration
              </Typography>
              <TextField
                fullWidth
                label="API Base URL"
                value={settings.apiUrl}
                onChange={handleChange('apiUrl')}
                margin="normal"
                helperText="Enter your backend API endpoint"
              />
              <TextField
                fullWidth
                label="API Key"
                type="password"
                value={settings.apiKey}
                onChange={handleChange('apiKey')}
                margin="normal"
                helperText="Enter your API authentication key"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Environment</InputLabel>
                <Select
                  value={settings.environment}
                  label="Environment"
                  onChange={handleChange('environment')}
                >
                  <MenuItem value="development">Development</MenuItem>
                  <MenuItem value="staging">Staging</MenuItem>
                  <MenuItem value="production">Production</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={loading}
              >
                Test Connection
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Dashboard Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dashboard Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoRefresh}
                    onChange={handleChange('autoRefresh')}
                  />
                }
                label="Auto Refresh"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Refresh Interval (seconds)</InputLabel>
                <Select
                  value={settings.refreshInterval}
                  label="Refresh Interval (seconds)"
                  onChange={handleChange('refreshInterval')}
                  disabled={!settings.autoRefresh}
                >
                  <MenuItem value={10}>10 seconds</MenuItem>
                  <MenuItem value={30}>30 seconds</MenuItem>
                  <MenuItem value={60}>1 minute</MenuItem>
                  <MenuItem value={300}>5 minutes</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={handleChange('theme')}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Default Time Range</InputLabel>
                <Select
                  value={settings.defaultTimeRange}
                  label="Default Time Range"
                  onChange={handleChange('defaultTimeRange')}
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Items Per Page"
                type="number"
                value={settings.itemsPerPage}
                onChange={handleChange('itemsPerPage')}
                margin="normal"
                inputProps={{ min: 5, max: 100 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailAlerts}
                    onChange={handleChange('emailAlerts')}
                  />
                }
                label="Email Alerts"
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={settings.emailAddress}
                onChange={handleChange('emailAddress')}
                margin="normal"
                disabled={!settings.emailAlerts}
                helperText="Enter email address for alerts"
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Alert Thresholds
              </Typography>
              <TextField
                fullWidth
                label="Sentiment Threshold"
                type="number"
                value={settings.sentimentThreshold}
                onChange={handleChange('sentimentThreshold')}
                margin="normal"
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                helperText="Alert when sentiment changes exceed this threshold"
              />
              <TextField
                fullWidth
                label="Volume Threshold"
                type="number"
                value={settings.volumeThreshold}
                onChange={handleChange('volumeThreshold')}
                margin="normal"
                inputProps={{ min: 0 }}
                helperText="Alert when daily volume exceeds this number"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Version: 1.0.0
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last Updated: {new Date().toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Environment: {settings.environment}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Data Export
              </Typography>
              <Button variant="outlined" sx={{ mr: 1 }}>
                Export Settings
              </Button>
              <Button variant="outlined">
                Import Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => loadSettings()}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Success/Error Messages */}
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Settings saved successfully!"
      />
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
