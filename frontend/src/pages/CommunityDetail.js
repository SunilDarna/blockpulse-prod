import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchCommunityById } from '../features/community/communitySlice';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCommunity, loading, error } = useSelector((state) => state.community);
  const [activeTab, setActiveTab] = useState(0);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const loadCommunity = async () => {
      try {
        setLocalError(null);
        await dispatch(fetchCommunityById(communityId)).unwrap();
      } catch (err) {
        console.error('Failed to fetch community details:', err);
        setLocalError(err || 'Failed to fetch community details. Please try again.');
      }
    };

    if (communityId) {
      loadCommunity();
    }
  }, [dispatch, communityId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    navigate('/communities');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || localError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Back to Communities
            </Button>
          }
        >
          {error || localError || 'Failed to load community details'}
        </Alert>
      </Container>
    );
  }

  if (!currentCommunity) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Back to Communities
            </Button>
          }
        >
          Community not found. It may have been deleted or you don't have access.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Back to Communities
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" component="h1">
                {currentCommunity.name}
              </Typography>
              <Chip 
                label={currentCommunity.userRole || 'Member'} 
                color={currentCommunity.userRole === 'admin' ? 'primary' : 'default'} 
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            <Typography variant="body1" paragraph>
              {currentCommunity.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {currentCommunity.tags && currentCommunity.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Community Info
                </Typography>
                <Typography variant="body2">
                  <strong>Members:</strong> {currentCommunity.memberCount || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Join Type:</strong> {currentCommunity.joinType === 'open' ? 'Open' : 'Invite Only'}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(currentCommunity.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<GroupIcon />}
                  onClick={() => navigate(`/communities/${communityId}/members`)}
                >
                  View Members
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="community sections"
        >
          <Tab icon={<AnnouncementIcon />} label="Announcements" />
          <Tab icon={<ChatIcon />} label="Chat" />
        </Tabs>
      </Box>

      <Box sx={{ p: 2 }}>
        {activeTab === 0 && (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Announcements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No announcements yet. Check back later or create one if you're an admin.
            </Typography>
            {currentCommunity.userRole === 'admin' && (
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
              >
                Create Announcement
              </Button>
            )}
          </Paper>
        )}
        
        {activeTab === 1 && (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Community Chat
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Chat functionality coming soon. Stay tuned!
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default CommunityDetail;
