import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

/**
 * ThemeButton is a custom Button component that handles theme-related issues
 * by providing fallback styling when theme context is missing or incomplete.
 */
const StyledButton = styled(Button)(({ theme, color = 'primary', variant = 'contained' }) => {
  // Default styles that don't depend on theme
  const baseStyles = {
    borderRadius: '8px',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: variant === 'contained' ? '0 3px 5px rgba(0,0,0,0.2)' : 'none',
  };

  // Fallback colors in case theme is missing
  const fallbackColors = {
    primary: {
      main: '#1976d2',
      dark: '#0f5baa',
      light: '#4791db',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      dark: '#b2003f',
      light: '#e33371',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336',
      dark: '#d32f2f',
      light: '#e57373',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      dark: '#f57c00',
      light: '#ffb74d',
      contrastText: '#000000',
    },
    success: {
      main: '#4caf50',
      dark: '#388e3c',
      light: '#81c784',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2196f3',
      dark: '#0b79d0',
      light: '#64b5f6',
      contrastText: '#ffffff',
    },
  };

  // Try to get colors from theme, fall back to defaults if not available
  let colorObj;
  try {
    colorObj = theme?.palette?.[color] || fallbackColors[color] || fallbackColors.primary;
  } catch (e) {
    console.warn('Error accessing theme colors, using fallback', e);
    colorObj = fallbackColors[color] || fallbackColors.primary;
  }

  // Variant-specific styles with fallbacks
  if (variant === 'contained') {
    return {
      ...baseStyles,
      backgroundColor: colorObj.main || '#1976d2',
      color: colorObj.contrastText || '#ffffff',
      '&:hover': {
        backgroundColor: colorObj.dark || '#0f5baa',
      },
    };
  } else if (variant === 'outlined') {
    return {
      ...baseStyles,
      backgroundColor: 'transparent',
      color: colorObj.main || '#1976d2',
      borderColor: colorObj.main || '#1976d2',
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
        borderColor: colorObj.dark || '#0f5baa',
      },
    };
  } else {
    // Text variant
    return {
      ...baseStyles,
      color: colorObj.main || '#1976d2',
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
      },
    };
  }
});

const ThemeButton = (props) => {
  return <StyledButton {...props} />;
};

export default ThemeButton;
