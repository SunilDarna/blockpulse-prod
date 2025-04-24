import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { fetchCommunityById } from '../features/community/communitySlice';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`community-tabpanel-${index}`}
      aria-labelledby={`community-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCommunity, loading, error } = useSelector((state) => state.community);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityById(communityId));
    }
  }, [dispatch, communityId]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/communities')}
        >
          Back to Communities
        </Button>
      </Container>
    );
  }
  
  if (!currentCommunity) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          Community not found or still loading...
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/communities')}
          sx={{ mt: 2 }}
        >
          Back to Communities
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/communities')}
        sx={{ mb: 3 }}
      >
        Back to Communities
      </Button>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {currentCommunity.name}
          </Typography>
          {currentCommunity.userRole && (
            <Chip 
              label={currentCommunity.userRole} 
              color={currentCommunity.userRole === 'admin' ? 'primary' : 'default'} 
              variant={currentCommunity.userRole === 'admin' ? 'filled' : 'outlined'}
            />
          )}
        </Box>
        
        <Typography variant="body1" paragraph>
          {currentCommunity.description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {currentCommunity.tags && currentCommunity.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" />
          ))}
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  {currentCommunity.memberCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  {currentCommunity.joinType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join Type
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  {new Date(currentCommunity.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created On
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="community tabs">
            <Tab icon={<GroupIcon />} label="Members" />
            <Tab icon={<ChatIcon />} label="Chat" />
            <Tab icon={<AnnouncementIcon />} label="Announcements" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              component={RouterLink}
              to={`/communities/${communityId}/members`}
            >
              View All Members
            </Button>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Recent Members
          </Typography>
          
          <List>
            {/* This would be populated with actual member data */}
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Member Name" 
                secondary="Joined on April 20, 2025" 
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Another Member" 
                secondary="Joined on April 18, 2025" 
              />
            </ListItem>
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Community Chat
            </Typography>
            <Typography variant="body1" paragraph>
              Join the conversation with other community members.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<ChatIcon />}
              component={RouterLink}
              to={`/communities/${communityId}/chat`}
            >
              Open Chat
            </Button>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Community Announcements
            </Typography>
            <Typography variant="body1" paragraph>
              Stay updated with the latest announcements from community admins.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AnnouncementIcon />}
              component={RouterLink}
              to={`/communities/${communityId}/announcements`}
            >
              View Announcements
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default CommunityDetail;
