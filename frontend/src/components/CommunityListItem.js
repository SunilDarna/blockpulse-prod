import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Box
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';

/**
 * Component for displaying a community in a list format
 * @param {Object} props
 * @param {Object} props.community - The community data
 */
const CommunityListItem = ({ community }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/communities/${community.communityId}`);
  };

  return (
    <ListItem 
      alignItems="flex-start" 
      divider 
      button 
      onClick={handleClick}
      sx={{
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.08)'
        }
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: community.userRole === 'admin' ? 'primary.main' : 'grey.400' }}>
          <GroupIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography 
            variant="subtitle1" 
            component="span" 
            sx={{ 
              color: '#1976d2',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {community.name}
          </Typography>
        }
        secondary={
          <React.Fragment>
            <Typography
              variant="body2"
              color="text.primary"
              component="span"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {community.description?.substring(0, 100)}
              {community.description?.length > 100 ? '...' : ''}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {community.memberCount || 0} members
              </Typography>
              <Chip 
                label={community.userRole} 
                size="small" 
                color={community.userRole === 'admin' ? 'primary' : 'default'}
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

export default CommunityListItem;
