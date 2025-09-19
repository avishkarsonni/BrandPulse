import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#2E7D32', // Changed to vibrant green
        light: darkMode ? '#90caf9' : '#4CAF50',
        dark: darkMode ? '#90caf9' : '#1B5E20',
        contrastText: darkMode ? '#000' : '#fff',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#FF6F00', // Changed to vibrant orange
        light: darkMode ? '#f48fb1' : '#FF9800',
        dark: darkMode ? '#f48fb1' : '#E65100',
        contrastText: darkMode ? '#000' : '#fff',
      },
      background: {
        default: darkMode ? '#121212' : '#F8F9FA', // Lighter, more modern background
        paper: darkMode ? '#1e1e1e' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#1A1A1A', // Darker text for better contrast
        secondary: darkMode ? '#b0b0b0' : '#424242',
      },
      success: {
        main: darkMode ? '#4caf50' : '#2E7D32',
        light: darkMode ? '#81c784' : '#4CAF50',
      },
      warning: {
        main: darkMode ? '#ff9800' : '#FF6F00',
        light: darkMode ? '#ffb74d' : '#FF9800',
      },
      error: {
        main: darkMode ? '#f44336' : '#D32F2F',
        light: darkMode ? '#e57373' : '#F44336',
      },
      info: {
        main: darkMode ? '#2196f3' : '#1976D2',
        light: darkMode ? '#64b5f6' : '#42A5F5',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: darkMode ? '2.5rem' : '3rem',
        fontWeight: 700,
        lineHeight: 1.2,
        color: darkMode ? '#ffffff' : '#1A1A1A',
      },
      h2: {
        fontSize: darkMode ? '2rem' : '2.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
        color: darkMode ? '#ffffff' : '#1A1A1A',
      },
      h3: {
        fontSize: darkMode ? '1.75rem' : '2rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: darkMode ? '#ffffff' : '#1A1A1A',
      },
      h4: {
        fontSize: darkMode ? '1.5rem' : '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: darkMode ? '#ffffff' : '#1A1A1A',
      },
      h5: {
        fontSize: darkMode ? '1.25rem' : '1.5rem',
        fontWeight: 600,
        lineHeight: 1.5,
        color: darkMode ? '#ffffff' : '#1A1A1A',
      },
      h6: {
        fontSize: darkMode ? '1rem' : '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
        color: darkMode ? '#ffffff' : '#1A1A1A',
      },
      body1: {
        fontSize: darkMode ? '0.875rem' : '1rem',
        lineHeight: 1.6,
        color: darkMode ? '#e0e0e0' : '#424242',
      },
      body2: {
        fontSize: darkMode ? '0.75rem' : '0.875rem',
        lineHeight: 1.6,
        color: darkMode ? '#b0b0b0' : '#666666',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e1e1e' : '#2E7D32',
            boxShadow: darkMode ? '0px 2px 4px rgba(0,0,0,0.3)' : '0px 4px 12px rgba(46, 125, 50, 0.15)',
            height: darkMode ? '64px' : '72px', // Taller header in light mode
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: darkMode ? '64px' : '72px',
            padding: darkMode ? '0 16px' : '0 24px',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#1e1e1e' : '#FFFFFF',
            borderRight: darkMode ? 'none' : '1px solid #E0E0E0',
            boxShadow: darkMode ? '2px 0 4px rgba(0,0,0,0.3)' : '2px 0 8px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            '&.MuiTypography-h1': {
              background: darkMode ? 'none' : 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
              WebkitBackgroundClip: darkMode ? 'none' : 'text',
              WebkitTextFillColor: darkMode ? 'inherit' : 'transparent',
              backgroundClip: darkMode ? 'none' : 'text',
            },
            '&.MuiTypography-h2': {
              background: darkMode ? 'none' : 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
              WebkitBackgroundClip: darkMode ? 'none' : 'text',
              WebkitTextFillColor: darkMode ? 'inherit' : 'transparent',
              backgroundClip: darkMode ? 'none' : 'text',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: darkMode ? '4px' : '8px',
            textTransform: 'none',
            fontWeight: 600,
            padding: darkMode ? '8px 16px' : '10px 20px',
            fontSize: darkMode ? '0.875rem' : '1rem',
          },
          contained: {
            boxShadow: darkMode ? '0px 2px 4px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.12)',
            '&:hover': {
              boxShadow: darkMode ? '0px 4px 8px rgba(0,0,0,0.4)' : '0px 6px 12px rgba(0,0,0,0.16)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: darkMode ? '8px' : '12px',
            boxShadow: darkMode ? '0px 2px 8px rgba(0,0,0,0.3)' : '0px 4px 16px rgba(0,0,0,0.08)',
            border: darkMode ? 'none' : '1px solid #F0F0F0',
          },
        },
      },
    },
  });

  const value = {
    darkMode,
    toggleDarkMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

