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
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to help you analyze sentiment data. What would you like to know?",
      sender: 'ai',
      timestamp: '10:30 AM',
      avatar: '🤖',
      name: 'AI Assistant',
    },
    {
      id: 2,
      text: "Hi! Can you show me the latest sentiment trends for our product?",
      sender: 'user',
      timestamp: '10:31 AM',
      avatar: '👤',
      name: 'You',
    },
    {
      id: 3,
      text: "Based on the latest data, your product sentiment is trending positively with 68.2% positive reviews. The main topics driving positive sentiment are 'Product Quality' and 'Fast Delivery'. Would you like me to dive deeper into any specific aspect?",
      sender: 'ai',
      timestamp: '10:32 AM',
      avatar: '🤖',
      name: 'AI Assistant',
    },
    {
      id: 4,
      text: "That's great! Can you also show me the negative sentiment breakdown?",
      sender: 'user',
      timestamp: '10:33 AM',
      avatar: '👤',
      name: 'You',
    },
    {
      id: 5,
      text: "Of course! The negative sentiment is at 18.5%, primarily driven by 'Customer Service' (27.6%) and 'Technical Support' (11.8%). The main concerns are response time and issue resolution. I recommend focusing on improving these areas to boost overall satisfaction.",
      sender: 'ai',
      timestamp: '10:34 AM',
      avatar: '🤖',
      name: 'AI Assistant',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '👤',
        name: 'You',
      };

      setMessages([...messages, userMessage]);
      setNewMessage('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponses = [
          "That's an interesting question! Let me analyze the data for you.",
          "Based on the current sentiment analysis, here's what I found...",
          "Great question! The data shows some interesting patterns.",
          "I can help you with that. Let me pull up the relevant information.",
          "That's a key insight! Here's what the sentiment data reveals...",
        ];
        
        const aiMessage = {
          id: messages.length + 2,
          text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '🤖',
          name: 'AI Assistant',
        };

        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'Show Sentiment Trends', icon: '📈' },
    { label: 'Analyze Topics', icon: '🏷️' },
    { label: 'Channel Performance', icon: '📊' },
    { label: 'Generate Report', icon: '📋' },
  ];

  const recentConversations = [
    { id: 1, title: 'Sentiment Analysis Discussion', preview: 'Latest trends and insights...', time: '2 min ago', unread: 0 },
    { id: 2, title: 'Topic Analysis Help', preview: 'Understanding customer feedback...', time: '1 hour ago', unread: 2 },
    { id: 3, title: 'Dashboard Configuration', preview: 'Setting up new widgets...', time: '3 hours ago', unread: 0 },
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
              <Typography variant="h6">AI Chat Assistant</Typography>
              <Typography variant="caption" color="textSecondary">
                Powered by Sentiment Analysis AI
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
          {/* Quick Actions */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Actions
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
                      <Typography variant="caption">
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
                        <Typography variant="body2">
                          {message.text}
                        </Typography>
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
                  disabled={!newMessage.trim()}
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
                  <SendIcon />
                </IconButton>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
