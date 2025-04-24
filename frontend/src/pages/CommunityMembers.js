import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { API, Auth } from 'aws-amplify';

const CommunityMembers = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchCommunityMembers();
  }, [communityId]);
  
  const fetchCommunityMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.get('communityApi', `/communities/${communityId}/members`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      setCommunity(response.community);
      setMembers(response.members);
      setUserRole(response.userRole);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching community members:', err);
      setError(err.message || 'Failed to fetch community members');
      setLoading(false);
    }
  };
  
  const handleInviteOpen = () => {
    setInviteDialogOpen(true);
  };
  
  const handleInviteClose = () => {
    setInviteDialogOpen(false);
  };
  
  const filteredMembers = members.filter(member => 
    member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
          onClick={() => navigate(`/communities/${communityId}`)}
        >
          Back to Community
        </Button>
      </Container>
    );
  }
  
  if (!community) {
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
        onClick={() => navigate(`/communities/${communityId}`)}
        sx={{ mb: 3 }}
      >
        Back to Community
      </Button>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {community.name} - Members
          </Typography>
          
          {userRole === 'admin' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleInviteOpen}
            >
              Invite Members
            </Button>
          )}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search members by name, email, or role"
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
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                {userRole === 'admin' && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell>{member.displayName}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={member.role} 
                        color={member.role === 'admin' ? 'primary' : 'default'} 
                        size="small"
                        variant={member.role === 'admin' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={member.status} 
                        color={member.status === 'active' ? 'success' : 'warning'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    {userRole === 'admin' && (
                      <TableCell>
                        {member.role !== 'admin' && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          >
                            Make Admin
                          </Button>
                        )}
                        {member.userId !== Auth.user?.username && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            Remove
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={userRole === 'admin' ? 6 : 5} align="center">
                    No members found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Invite Members Dialog */}
      <Dialog open={inviteDialogOpen} onClose={handleInviteClose}>
        <DialogTitle>Invite Members</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter email addresses of people you want to invite to this community.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="emails"
            label="Email Addresses"
            type="email"
            fullWidth
            variant="outlined"
            placeholder="Enter multiple emails separated by commas"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInviteClose}>Cancel</Button>
          <Button onClick={handleInviteClose} variant="contained">Send Invites</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommunityMembers;
