import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';

/**
 * GlobalErrorBoundary is a top-level error boundary that catches errors
 * in the entire application, including theme-related errors.
 */
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('Global error caught:', error, errorInfo);
    
    // Update state with error details and increment error count
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Report to monitoring service if available
    if (window.errorReportingService) {
      window.errorReportingService.report({
        error,
        errorInfo,
        location: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.handleReset();
    window.location.href = '/';
  };

  render() {
    // If there's an error, show the fallback UI
    if (this.state.hasError) {
      // If we've tried to recover multiple times but keep getting errors,
      // show a more permanent error message
      if (this.state.errorCount > 3) {
        return (
          <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" color="error" gutterBottom>
                Critical Error
              </Typography>
              <Typography variant="body1" paragraph>
                We're experiencing technical difficulties that prevent the application from loading correctly.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Our team has been notified and is working on a fix. Please try again later.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={this.handleReload}>
                  Try Again
                </Button>
              </Box>
            </Paper>
          </Container>
        );
      }

      // Standard error UI for first few errors
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          bgcolor: '#f5f5f5'
        }}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#d32f2f' }} gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              We're sorry, but there was an error loading the application.
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Error details: {this.state.error?.message || 'Unknown error'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={this.handleReset}
                sx={{ 
                  borderColor: '#1976d2', 
                  color: '#1976d2',
                  '&:hover': { borderColor: '#0f5baa', bgcolor: 'rgba(25, 118, 210, 0.04)' }
                }}
              >
                Try Again
              </Button>
              <Button 
                variant="contained" 
                onClick={this.handleReload}
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  '&:hover': { bgcolor: '#0f5baa' }
                }}
              >
                Reload Page
              </Button>
              <Button 
                variant="text" 
                onClick={this.handleGoHome}
                sx={{ 
                  color: '#1976d2',
                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
                }}
              >
                Go to Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
