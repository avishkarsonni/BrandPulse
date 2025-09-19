import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Grid,
  Button,
  InputAdornment,
  Tooltip,
  Badge,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  SmartToy as SmartToyIcon,
  Analytics as AnalyticsIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiService } from '../services/api';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "## Welcome to BrandPulse Assistant! 🧠\n\nI'm your AI expert for analyzing products and their public perception. I can help you:\n\n- **Analyze brand sentiment** and market trends\n- **Compare competitive positioning** \n- **Identify strengths and weaknesses**\n- **Provide actionable recommendations**\n\n### What product would you like to discuss today?\n\n*Try asking about any product like iPhone 15, Tesla Model Y, or Samsung Galaxy S24!*",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '🧠',
      name: 'BrandPulse Assistant',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check backend connection on component mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await apiService.testConnection();
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('disconnected');
      console.warn('Backend not available:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '👤',
      name: 'You',
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Send message to Google ADK agent
      const response = await apiService.sendChatMessage(
        currentMessage, 
        productName || null, 
        `User is asking about product analysis and public perception.`
      );
      
      const aiMessage = {
        id: messages.length + 2,
        text: response.response,
        sender: 'ai',
        timestamp: response.timestamp ? new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '🧠',
        name: response.agent_name || 'BrandPulse Assistant',
      };

      setMessages(prev => [...prev, aiMessage]);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error sending message:', error);
      setConnectionStatus('disconnected');
      
      // Fallback response when backend is not available
      const fallbackMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I'm currently unable to connect to the analysis engine. Please make sure the backend server is running. In the meantime, I can help you understand that BrandPulse analyzes product sentiment, tracks public perception trends, and provides actionable insights for brand management.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '⚠️',
        name: 'BrandPulse Assistant (Offline)',
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      setError('Unable to connect to the analysis engine. Please check if the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    let prompt = '';
    switch (action) {
      case 'Analyze Product':
        if (!productName) {
          setShowProductDialog(true);
          return;
        }
        prompt = `Please provide a comprehensive analysis of the public perception for ${productName}. Include market sentiment, key strengths and weaknesses, competitive positioning, and recommendations.`;
        break;
      case 'Sentiment Trends':
        prompt = productName 
          ? `Show me the current sentiment trends for ${productName}. What are people saying about it recently?`
          : 'What are the current sentiment analysis trends and patterns you can identify?';
        break;
      case 'Competitive Analysis':
        prompt = productName
          ? `How does ${productName} compare to its competitors in terms of public perception and market sentiment?`
          : 'Can you help me understand competitive analysis for brand perception?';
        break;
      case 'Recommendations':
        prompt = productName
          ? `Based on current public perception, what recommendations do you have for improving ${productName}'s brand image?`
          : 'What are some best practices for improving brand perception and public sentiment?';
        break;
      default:
        prompt = action;
    }
    
    setNewMessage(prompt);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        text: "## Welcome to BrandPulse Assistant! 🧠\n\nI'm your AI expert for analyzing products and their public perception. I can help you:\n\n- **Analyze brand sentiment** and market trends\n- **Compare competitive positioning** \n- **Identify strengths and weaknesses**\n- **Provide actionable recommendations**\n\n### What product would you like to discuss today?\n\n*Try asking about any product like iPhone 15, Tesla Model Y, or Samsung Galaxy S24!*",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '🧠',
        name: 'BrandPulse Assistant',
      },
    ]);
    setError(null);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'Analyze Product', icon: '📊', description: 'Get comprehensive product analysis' },
    { label: 'Sentiment Trends', icon: '📈', description: 'Show current sentiment trends' },
    { label: 'Competitive Analysis', icon: '🏆', description: 'Compare with competitors' },
    { label: 'Recommendations', icon: '💡', description: 'Get improvement suggestions' },
  ];

  const recentConversations = [
    { id: 1, title: 'Product Analysis: iPhone 15', preview: 'Comprehensive market sentiment analysis...', time: '2 min ago', unread: 0 },
    { id: 2, title: 'Brand Perception Study', preview: 'Tesla vs competitors analysis...', time: '1 hour ago', unread: 0 },
    { id: 3, title: 'Sentiment Trends Review', preview: 'Nike quarterly perception trends...', time: '3 hours ago', unread: 0 },
  ];

  const filteredMessages = messages.filter(message =>
    message.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
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
                  label={connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Offline' : 'Checking...'}
                  color={connectionStatus === 'connected' ? 'success' : connectionStatus === 'disconnected' ? 'error' : 'default'}
                  variant="outlined"
                />
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Powered by Google ADK • Gemini 2.0 Flash • Product Analysis Expert
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Search Messages">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter">
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Paper sx={{ width: 300, borderRadius: 0, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {/* Product Input */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Product Focus
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter product name (optional)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SmartToyIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Quick Actions */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Quick Actions
              <IconButton size="small" onClick={handleClearChat} title="Clear Chat">
                <ClearIcon fontSize="small" />
              </IconButton>
            </Typography>
            <Grid container spacing={1}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} key={index}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => handleQuickAction(action.label)}
                      disabled={isLoading}
                      sx={{ 
                        p: 1, 
                        flexDirection: 'column',
                        fontSize: '0.7rem',
                        height: 'auto',
                        py: 1.5
                      }}
                    >
                      <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>
                        {action.icon}
                      </Typography>
                      <Typography variant="caption" sx={{ textAlign: 'center' }}>
                        {action.label}
                      </Typography>
                    </Button>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider />

          {/* Recent Conversations */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Recent Conversations
              </Typography>
              <List dense>
                {recentConversations.map((conversation) => (
                  <ListItem key={conversation.id} button>
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unread}
                        color="primary"
                        invisible={conversation.unread === 0}
                      >
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <ChatIcon fontSize="small" />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={conversation.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary" noWrap>
                            {conversation.preview}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {conversation.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Paper>

        {/* Main Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Search Bar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {message.avatar}
                      </Avatar>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                          position: 'relative',
                        }}
                      >
                        {message.sender === 'ai' ? (
                          <Box sx={{ 
                            '& h2': { 
                              fontSize: '1.1rem', 
                              fontWeight: 'bold', 
                              mt: 2, 
                              mb: 1, 
                              color: 'inherit',
                              borderBottom: '1px solid rgba(255,255,255,0.2)',
                              pb: 0.5
                            },
                            '& h3': { 
                              fontSize: '1rem', 
                              fontWeight: 'bold', 
                              mt: 1.5, 
                              mb: 0.5, 
                              color: 'inherit' 
                            },
                            '& p': { 
                              fontSize: '0.875rem', 
                              mb: 1, 
                              color: 'inherit',
                              lineHeight: 1.5
                            },
                            '& ul': { 
                              pl: 2, 
                              mb: 1,
                              '& li': {
                                fontSize: '0.875rem',
                                mb: 0.5,
                                color: 'inherit'
                              }
                            },
                            '& ol': { 
                              pl: 2, 
                              mb: 1,
                              '& li': {
                                fontSize: '0.875rem',
                                mb: 0.5,
                                color: 'inherit'
                              }
                            },
                            '& strong': { 
                              fontWeight: 'bold', 
                              color: 'inherit' 
                            },
                            '& em': { 
                              fontStyle: 'italic', 
                              color: 'inherit' 
                            },
                            '& code': {
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              fontSize: '0.8rem',
                              fontFamily: 'monospace'
                            }
                          }}>
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h2: ({children}) => <Typography variant="h6" component="h2">{children}</Typography>,
                                h3: ({children}) => <Typography variant="subtitle1" component="h3">{children}</Typography>,
                                p: ({children}) => <Typography variant="body2" component="p">{children}</Typography>,
                                ul: ({children}) => <Box component="ul">{children}</Box>,
                                ol: ({children}) => <Box component="ol">{children}</Box>,
                                li: ({children}) => <Typography component="li" variant="body2">{children}</Typography>,
                                strong: ({children}) => <Typography component="span" sx={{ fontWeight: 'bold' }}>{children}</Typography>,
                                em: ({children}) => <Typography component="span" sx={{ fontStyle: 'italic' }}>{children}</Typography>,
                                code: ({children}) => <Typography component="code" variant="body2">{children}</Typography>,
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {message.text}
                          </Typography>
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
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              <IconButton size="small">
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small">
                        <EmojiIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '&:disabled': {
                      backgroundColor: 'grey.300',
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                </IconButton>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Product Name Dialog */}
      <Dialog open={showProductDialog} onClose={() => setShowProductDialog(false)}>
        <DialogTitle>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon />
            Set Product for Analysis
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To provide more accurate analysis, please specify which product you'd like me to focus on.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            placeholder="e.g., iPhone 15, Tesla Model 3, Nike Air Max..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setShowProductDialog(false);
                handleQuickAction('Analyze Product');
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProductDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowProductDialog(false);
              handleQuickAction('Analyze Product');
            }}
            disabled={!productName.trim()}
          >
            Analyze Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat;
