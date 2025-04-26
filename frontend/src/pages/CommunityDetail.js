import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Tab,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { 
  fetchCommunityById, 
  fetchCommunityAnnouncements, 
  createAnnouncement,
  deleteCommunity 
} from '../features/community/communitySlice';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentCommunity, loading, error, announcements, announcementLoading, announcementError } = useSelector((state) => state.community);
  const [activeTab, setActiveTab] = useState(0);
  const [localError, setLocalError] = useState(null);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  // Add like functionality for announcements
  const [likedAnnouncements, setLikedAnnouncements] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleLikeAnnouncement = (announcementId) => {
    setLikedAnnouncements(prev => ({
      ...prev,
      [announcementId]: !prev[announcementId]
    }));
  };

  // Determine which tab to show based on URL
  useEffect(() => {
    if (location.pathname.includes('/announcements')) {
      setActiveTab(0);
    } else if (location.pathname.includes('/chat')) {
      setActiveTab(1);
    }
  }, [location.pathname]);

  useEffect(() => {
    const loadCommunity = async () => {
      try {
        setLocalError(null);
        console.log(`Loading community details for ID: ${communityId}`);
        await dispatch(fetchCommunityById(communityId)).unwrap();
        
        // Also fetch announcements
        try {
          await dispatch(fetchCommunityAnnouncements(communityId)).unwrap();
        } catch (err) {
          console.error('Failed to fetch announcements:', err);
          // Don't set an error state here, as we still want to show the community
        }
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
    if (newValue === 0) {
      navigate(`/communities/${communityId}/announcements`);
    } else if (newValue === 1) {
      navigate(`/communities/${communityId}/chat`);
    }
  };

  const handleBack = () => {
    navigate('/communities');
  };

  const handleDeleteCommunity = async () => {
    try {
      await dispatch(deleteCommunity(communityId)).unwrap();
      navigate('/communities');
    } catch (err) {
      console.error('Failed to delete community:', err);
      setLocalError(err || 'Failed to delete community. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleAnnouncementDialogOpen = () => {
    setAnnouncementDialogOpen(true);
  };

  const handleAnnouncementDialogClose = () => {
    setAnnouncementDialogOpen(false);
    setAnnouncementText('');
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementText.trim()) return;

    try {
      const announcementData = {
        content: announcementText,
        type: 'text'
      };
      
      console.log(`Creating announcement in community ${communityId}:`, announcementData);
      
      await dispatch(createAnnouncement({
        communityId,
        announcementData
      })).unwrap();
      
      // Refresh announcements
      dispatch(fetchCommunityAnnouncements(communityId));
      handleAnnouncementDialogClose();
    } catch (err) {
      console.error('Failed to create announcement:', err);
    }
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
                {currentCommunity.userRole === 'admin' && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Community
                  </Button>
                )}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Announcements
              </Typography>
              {currentCommunity.userRole === 'admin' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleAnnouncementDialogOpen}
                >
                  Create Announcement
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {announcementLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : announcementError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {announcementError}
              </Alert>
            ) : announcements && announcements.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {announcements.map((announcement) => (
                  <Card key={announcement.announcementId} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {announcement.createdBy}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(announcement.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {announcement.content}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          size="small" 
                          color={likedAnnouncements[announcement.announcementId] ? "primary" : "default"}
                          onClick={() => handleLikeAnnouncement(announcement.announcementId)}
                          startIcon={likedAnnouncements[announcement.announcementId] ? 
                            <span role="img" aria-label="liked">❤️</span> : 
                            <span role="img" aria-label="not liked">🤍</span>}
                        >
                          {likedAnnouncements[announcement.announcementId] ? 'Liked' : 'Like'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No announcements yet. Check back later or create one if you're an admin.
              </Typography>
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

      {/* Create Announcement Dialog */}
      <Dialog 
        open={announcementDialogOpen} 
        onClose={handleAnnouncementDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Create Announcement
          <IconButton
            aria-label="close"
            onClick={handleAnnouncementDialogClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create an announcement that will be visible to all community members.
          </DialogContentText>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            label="Announcement"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAnnouncementDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateAnnouncement}
            endIcon={<SendIcon />}
            disabled={!announcementText.trim()}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Community Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Community</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this community? This action cannot be undone.
            All community data, including announcements and member information, will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteCommunity} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommunityDetail;
