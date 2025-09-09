import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  CssBaseline,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Topic as TopicIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Home as HomeIcon,
  Chat as ChatIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './contexts/ThemeContext';
import { ProductProvider } from './contexts/ProductContext';

import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Timeline from './components/Timeline';
import Topics from './components/Topics';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import ProductSearch from './components/ProductSearch';

const drawerWidth = 240;

function App() {
  const { darkMode, toggleDarkMode } = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Product Search', icon: <SearchIcon />, path: '/search' },
    { text: 'Timeline', icon: <TimelineIcon />, path: '/timeline' },
    { text: 'Topics', icon: <TopicIcon />, path: '/topics' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ 
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        minHeight: '80px !important',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography 
          variant="h5" 
          noWrap 
          component="div"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(45deg, #ffffff 30%, #E8F5E8 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          BrandPulse
        </Typography>
      </Toolbar>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={item.text}
            component="a"
            href={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
                transform: 'translateX(4px)',
                transition: 'all 0.2s ease-in-out',
              },
              '&:hover .MuiListItemIcon-root': {
                color: 'white',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: 'primary.main',
              minWidth: 40,
              '&:hover': {
                color: 'white',
              }
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ProductProvider>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            background: darkMode 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
            boxShadow: darkMode 
              ? '0px 4px 12px rgba(0,0,0,0.4)'
              : '0px 6px 20px rgba(46, 125, 50, 0.25)',
          }}
        >
          <Toolbar sx={{ minHeight: '72px !important', px: 3 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h5" 
              noWrap 
              component="div"
              sx={{
                fontWeight: 700,
                background: darkMode 
                  ? 'linear-gradient(45deg, #ffffff 30%, #e0e0e0 90%)'
                  : 'linear-gradient(45deg, #ffffff 30%, #E8F5E8 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              BrandPulse Analytics
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton 
              color="inherit" 
              onClick={toggleDarkMode}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container 
          maxWidth="xl" 
          sx={{ 
            flexGrow: 1,
            py: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <LandingPage />
                </motion.div>
              } />
              <Route path="/dashboard" element={
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Dashboard />
                </motion.div>
              } />
              <Route path="/analytics" element={
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Analytics />
                </motion.div>
              } />
              <Route path="/search" element={
                <motion.div
                  key="search"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <ProductSearch />
                </motion.div>
              } />
              <Route path="/timeline" element={
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Timeline />
                </motion.div>
              } />
              <Route path="/topics" element={
                <motion.div
                  key="topics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Topics />
                </motion.div>
              } />
              <Route path="/chat" element={
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Chat />
                </motion.div>
              } />
              <Route path="/settings" element={
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Settings />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </Container>
        
        {/* Footer */}
        <Box
          component="footer"
          sx={{
            mt: 'auto',
            py: 3,
            px: 2,
            backgroundColor: darkMode ? '#1e1e1e' : '#F8F9FA',
            borderTop: darkMode ? '1px solid #333' : '1px solid #E0E0E0',
            background: darkMode 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #F8F9FA 0%, #E8F5E8 100%)',
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                © 2024 BrandPulse Analytics. All rights reserved.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '0.85rem' }}
                >
                  Powered by AI
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: darkMode ? '#4CAF50' : '#2E7D32',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
    </ProductProvider>
  );
}

export default App;
