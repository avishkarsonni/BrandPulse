import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const Chat = () => {
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "## Welcome to BrandPulse Assistant! 🧠\n\nI'm your AI assistant for analyzing products and their public perception.\n\n**What I can help you with:**\n- Analyze brand sentiment and market trends\n- Compare competitive positioning\n- Identify strengths and weaknesses\n- Provide actionable recommendations\n\n**Try asking:**\n- \"Analyze iPhone 15 Pro\"\n- \"What do people think about Tesla Model Y?\"\n- \"Compare Samsung Galaxy S24 with competitors\"",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check backend connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const health = await apiService.testConnection();
      setConnectionStatus(health?.status === 'healthy' ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const handleSendMessage = async () => {
    const messageText = inputMessage.trim();
    if (!messageText || isLoading) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Call backend API
      // Backend returns: { response: string, timestamp: string, agent_name: string }
      const apiResponse = await apiService.sendChatMessage(messageText, null, null);

      // Validate response
      if (!apiResponse || !apiResponse.response) {
        throw new Error('Invalid response from server');
      }

      // Create AI message from response
      const aiMessage = {
        id: Date.now() + 1,
        text: apiResponse.response,
        sender: 'ai',
        timestamp: apiResponse.timestamp
          ? new Date(apiResponse.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        code: error.code,
        stack: error.stack
      });
      
      // Don't set connection status to disconnected on chat errors
      // The health check might still be working
      
      // Extract error message - handle different error formats
      let errorMessage = 'Failed to get response';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        errorMessage = `Server error: ${error.response.status}`;
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        text: `## ⚠️ Error\n\nI encountered an issue: **${errorMessage}**\n\nPlease try again.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, errorResponse]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: darkMode ? '#00C8FF' : '#007BFF' }}>
              <ChatIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                BrandPulse Assistant
                <Chip
                  size="small"
                  label={
                    connectionStatus === 'connected' ? 'Connected' :
                    connectionStatus === 'disconnected' ? 'Offline' :
                    'Checking...'
                  }
                  color={connectionStatus === 'connected' ? 'success' : 'error'}
                  variant="outlined"
                />
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Powered by Gemini 2.0 Flash
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                maxWidth: '75%',
                display: 'flex',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: message.sender === 'user' 
                    ? (darkMode ? '#00C8FF' : '#007BFF')
                    : (darkMode ? '#808080' : '#E0E0E0'),
                }}
              >
                {message.sender === 'user' ? '👤' : '🧠'}
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  // User messages: Threat Sentinel theme colors
                  bgcolor: message.sender === 'user' 
                    ? (darkMode ? '#00C8FF' : '#007BFF')  // Cyan in dark mode, Blue in light mode
                    : (darkMode ? '#404040' : '#F8F9FA'), // Dark grey in dark mode, Light grey in light mode
                  // All text: Black in light mode, White in dark mode
                  color: darkMode ? '#FFFFFF' : '#1A1A1A',
                  borderRadius: 2,
                  maxWidth: '100%',
                  border: message.sender === 'user' 
                    ? 'none' 
                    : (darkMode ? '1px solid #808080' : '1px solid #E0E0E0'),
                }}
              >
                {message.sender === 'ai' ? (
                  <Box
                    sx={{
                      '& h2': {
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        mt: 0,
                        mb: 1,
                        color: 'inherit',
                      },
                      '& h3': {
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        mt: 1.5,
                        mb: 0.5,
                        color: 'inherit',
                      },
                      '& p': {
                        fontSize: '0.875rem',
                        mb: 1,
                        color: 'inherit',
                        lineHeight: 1.6,
                      },
                      '& ul, & ol': {
                        pl: 2,
                        mb: 1,
                        '& li': {
                          fontSize: '0.875rem',
                          mb: 0.5,
                          color: 'inherit',
                        },
                      },
                      '& strong': {
                        fontWeight: 'bold',
                        color: 'inherit',
                      },
                      '& code': {
                        bgcolor: darkMode 
                          ? (message.sender === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)')
                          : (message.sender === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'),
                        color: darkMode ? '#FFFFFF' : '#1A1A1A',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                      },
                      '& pre': {
                        bgcolor: darkMode 
                          ? (message.sender === 'user' ? 'rgba(255,255,255,0.15)' : '#1A1A1A')
                          : (message.sender === 'user' ? 'rgba(255,255,255,0.15)' : '#F0F0F0'),
                        color: darkMode ? '#FFFFFF' : '#1A1A1A',
                        p: 1,
                        borderRadius: 1,
                        overflow: 'auto',
                      },
                      '& pre code': {
                        bgcolor: 'transparent',
                        color: 'inherit',
                      },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </Box>
                ) : (
                  <Typography 
                    variant="body2"
                    sx={{
                      color: darkMode ? '#FFFFFF' : '#1A1A1A',
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    {message.text}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    color: darkMode ? 'rgba(255,255,255,0.7)' : '#808080',
                    fontSize: '0.7rem',
                    fontWeight: 400,
                  }}
                >
                  {message.timestamp}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 0, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: darkMode ? '#404040' : '#FFFFFF',
                color: darkMode ? '#FFFFFF' : '#1A1A1A',
                '& fieldset': {
                  borderColor: darkMode ? '#808080' : '#808080',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: darkMode ? '#00C8FF' : '#007BFF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkMode ? '#00C8FF' : '#007BFF',
                  borderWidth: 2,
                },
                '& input, & textarea': {
                  color: darkMode ? '#FFFFFF' : '#1A1A1A',
                  fontSize: '1rem',
                  fontWeight: 400,
                },
                '& input::placeholder, & textarea::placeholder': {
                  color: darkMode ? '#808080' : '#808080',
                  opacity: 1,
                },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              bgcolor: darkMode ? '#00C8FF' : '#007BFF',
              color: '#FFFFFF',
              minWidth: 48,
              minHeight: 48,
              '&:hover': {
                bgcolor: darkMode ? '#66D9FF' : '#0056B3',
              },
              '&:disabled': {
                bgcolor: '#808080',
                color: '#FFFFFF',
                opacity: 0.5,
              },
            }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;
