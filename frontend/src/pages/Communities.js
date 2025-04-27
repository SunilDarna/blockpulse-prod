import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { fetchUserCommunities } from '../features/community/communitySlice';
import CommunityCard from '../components/CommunityCard';

const Communities = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { communities, loading, error } = useSelector((state) => state.community);
  const [searchTerm, setSearchTerm] = useState('');
  const [localError, setLocalError] = useState(null);
  
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLocalError(null);
        await dispatch(fetchUserCommunities()).unwrap();
      } catch (err) {
        console.error('Failed to fetch communities:', err);
        setLocalError(err || 'Failed to fetch communities. Please try again.');
      }
    };
    
    fetchCommunities();
    
    // Set up a refresh interval to periodically fetch communities
    const intervalId = setInterval(fetchCommunities, 30000); // Refresh every 30 seconds
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [dispatch]);
  
  const filteredCommunities = communities && communities.length > 0 
    ? communities.filter(community => 
        community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (community.description && community.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    : [];
    
  const handleCommunityClick = (communityId) => {
    console.log(`Navigating to community: ${communityId}`);
    navigate(`/communities/${communityId}`);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Communities
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/create-community"
        >
          Create Community
        </Button>
      </Box>
      
      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || localError}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search communities by name, description, or tags"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredCommunities.length > 0 ? (
        <Grid container spacing={3}>
          {filteredCommunities.map((community) => (
            <Grid item xs={12} md={6} key={community.communityId}>
              <CommunityCard community={community} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't joined any communities yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create a new community or join an existing one to get started.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/create-community"
            sx={{ mt: 2 }}
          >
            Create Community
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Communities;
