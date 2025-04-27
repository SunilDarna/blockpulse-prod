import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ChatIcon from '@mui/icons-material/Chat';
import { fetchUserCommunities } from '../features/community/communitySlice';
import CommunityListItem from '../components/CommunityListItem';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { communities, loading, error } = useSelector((state) => state.community);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    dispatch(fetchUserCommunities());
  }, [dispatch]);
  
  // Get the 3 most recent communities
  const recentCommunities = communities && communities.length > 0 
    ? [...communities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
    : [];
  
  // Mock data for demonstration - in a real app, this would come from the API
  const recentAnnouncements = [
    { id: 1, community: 'Tech Enthusiasts', title: 'New Meeting Schedule', date: '2025-04-22' },
    { id: 2, community: 'Book Club', title: 'May Book Selection', date: '2025-04-20' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName || user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening in your communities today.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/create-community"
                  sx={{ mb: 2 }}
                >
                  Create New Community
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<GroupIcon />}
                  component={RouterLink}
                  to="/join-community"
                  sx={{ mb: 2 }}
                >
                  Join Community
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AnnouncementIcon />}
                  component={RouterLink}
                  to="/create-announcement"
                >
                  Post Announcement
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* My Communities */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                My Communities
              </Typography>
              <Button 
                component={RouterLink} 
                to="/communities" 
                size="small"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : recentCommunities.length > 0 ? (
              <Grid container spacing={3}>
                {recentCommunities.map((community) => (
                  <Grid item xs={12} sm={6} key={community.communityId}>
                    <Card 
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => navigate(`/communities/${community.communityId}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            component="h3"
                            sx={{
                              color: '#1976d2',
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/communities/${community.communityId}`);
                            }}
                          >
                            {community.name}
                          </Typography>
                          <Chip 
                            label={community.userRole} 
                            size="small" 
                            color={community.userRole === 'admin' ? 'primary' : 'default'} 
                            variant={community.userRole === 'admin' ? 'filled' : 'outlined'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {community.memberCount || 0} members
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<ChatIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/communities/${community.communityId}/chat`);
                          }}
                        >
                          Chat
                        </Button>
                        <Button 
                          size="small"
                          startIcon={<AnnouncementIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/communities/${community.communityId}/announcements`);
                          }}
                        >
                          Announcements
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You haven't joined any communities yet.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/join-community"
                  startIcon={<GroupIcon />}
                  sx={{ mt: 2 }}
                >
                  Join a Community
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Recent Announcements
              </Typography>
              <Button 
                component={RouterLink} 
                to="/announcements" 
                size="small"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentAnnouncements.length > 0 ? (
              <List>
                {recentAnnouncements.map((announcement) => (
                  <ListItem 
                    key={announcement.id}
                    component={RouterLink}
                    to={`/announcements/${announcement.id}`}
                    sx={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AnnouncementIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={announcement.title} 
                      secondary={`${announcement.community} • ${announcement.date}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No recent announcements.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
