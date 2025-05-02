import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Default theme that will be used as a fallback if theme creation fails
const fallbackTheme = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
  },
};

/**
 * SafeThemeProvider is a wrapper around MUI's ThemeProvider that handles theme creation errors
 * and ensures the application doesn't crash due to theme-related issues.
 */
const SafeThemeProvider = ({ theme, children }) => {
  // Create a safe version of the theme
  const safeTheme = React.useMemo(() => {
    try {
      // If theme is already a Theme object, use it directly
      if (theme && theme.constructor && theme.constructor.name === 'Theme') {
        return theme;
      }
      
      // Otherwise, create a theme from the provided configuration
      return createTheme(theme || fallbackTheme);
    } catch (error) {
      console.error('Error creating theme:', error);
      // If theme creation fails, use the fallback theme
      return createTheme(fallbackTheme);
    }
  }, [theme]);

  // We don't need to modify Object.prototype, which is dangerous
  // Instead, we'll rely on the properly structured theme object

  return <ThemeProvider theme={safeTheme}>{children}</ThemeProvider>;
};

export default SafeThemeProvider;
