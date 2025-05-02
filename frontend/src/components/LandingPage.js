import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Divider,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      title: 'Join Communities',
      description: 'Connect with like-minded individuals in communities that share your interests and goals.',
      icon: <GroupIcon fontSize="large" color="primary" />
    },
    {
      title: 'Stay Informed',
      description: 'Receive important announcements from community administrators and never miss an update.',
      icon: <AnnouncementIcon fontSize="large" color="primary" />
    },
    {
      title: 'Real-time Chat',
      description: 'Engage in meaningful conversations with community members through our real-time chat feature.',
      icon: <ChatIcon fontSize="large" color="primary" />
    },
    {
      title: 'Secure Access',
      description: 'Your data is protected with industry-standard security measures and token-based authorization.',
      icon: <SecurityIcon fontSize="large" color="primary" />
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          borderRadius: 0,
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                MyBlockPulse
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                Connect, Collaborate, and Communicate in Real-Time
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                MyBlockPulse is a powerful community management platform that enables users to create and join communities, 
                share announcements, and chat in real-time with other participants.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/register"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  component={RouterLink}
                  to="/login"
                >
                  Sign In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                component="img"
                src="/images/hero-image.svg"
                alt="Community Collaboration"
                sx={{ 
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="body1" align="center" paragraph sx={{ mb: 6 }}>
          Discover what makes MyBlockPulse the ideal platform for community management
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ backgroundColor: theme.palette.grey[100], py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="body1" align="center" paragraph sx={{ mb: 6 }}>
            Getting started with MyBlockPulse is easy
          </Typography>
          
          <Grid container spacing={isMobile ? 4 : 8}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="primary" sx={{ mb: 2 }}>1</Typography>
                <Typography variant="h6" gutterBottom>Create an Account</Typography>
                <Typography variant="body2">
                  Sign up with your email, verify your account with a one-time password, and you're ready to go.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="primary" sx={{ mb: 2 }}>2</Typography>
                <Typography variant="h6" gutterBottom>Join or Create Communities</Typography>
                <Typography variant="body2">
                  Browse existing communities or create your own to connect with others who share your interests.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="primary" sx={{ mb: 2 }}>3</Typography>
                <Typography variant="h6" gutterBottom>Engage and Collaborate</Typography>
                <Typography variant="body2">
                  Participate in discussions, receive announcements, and chat in real-time with community members.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to join the MyBlockPulse community?
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Create your account today and start connecting with communities that matter to you.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          component={RouterLink}
          to="/register"
          sx={{ px: 4, py: 1.5 }}
        >
          Sign Up Now
        </Button>
      </Container>
    </Box>
  );
};

export default LandingPage;
