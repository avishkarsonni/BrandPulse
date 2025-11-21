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

const Chat = () => {
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
            <Avatar sx={{ bgcolor: 'primary.main' }}>
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
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.300',
                }}
              >
                {message.sender === 'user' ? '👤' : '🧠'}
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                  color: message.sender === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  maxWidth: '100%',
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
                        bgcolor: 'rgba(0,0,0,0.1)',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                      },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </Box>
                ) : (
                  <Typography variant="body2">{message.text}</Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    opacity: 0.7,
                    fontSize: '0.7rem',
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
      <Paper elevation={3} sx={{ p: 2, borderRadius: 0 }}>
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
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'grey.300',
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
