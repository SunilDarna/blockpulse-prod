import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  Divider,
} from '@mui/material';

const Footer = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              MyBlockPulse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect, collaborate, and communicate with communities that matter to you.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link component={RouterLink} to="/communities" color="inherit" display="block" sx={{ mb: 1 }}>
                  My Communities
                </Link>
                <Link component={RouterLink} to="/messages" color="inherit" display="block" sx={{ mb: 1 }}>
                  Messages
                </Link>
                <Link component={RouterLink} to="/announcements" color="inherit" display="block" sx={{ mb: 1 }}>
                  Announcements
                </Link>
              </>
            ) : (
              <>
                <Link component={RouterLink} to="/login" color="inherit" display="block" sx={{ mb: 1 }}>
                  Sign In
                </Link>
                <Link component={RouterLink} to="/register" color="inherit" display="block" sx={{ mb: 1 }}>
                  Create Account
                </Link>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link component={RouterLink} to="/privacy" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} MyBlockPulse. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
