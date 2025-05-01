import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Divider
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import AnnouncementIcon from '@mui/icons-material/Announcement';

/**
 * Reusable component for displaying a community card
 * @param {Object} props
 * @param {Object} props.community - The community data
 */
const CommunityCard = ({ community }) => {
  const navigate = useNavigate();

  const handleCommunityClick = () => {
    navigate(`/communities/${community.communityId}`);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)'
        }
      }}
      onClick={handleCommunityClick}
      component="div"
      role="button"
      tabIndex={0}
      data-testid="community-item"
      data-community-id={community.communityId}
      aria-label={`Select ${community.name} community`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCommunityClick();
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              color: '#1976d2',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleCommunityClick();
            }}
          >
            {community.name}
          </Typography>
          <Chip
            label={community.userRole}
            color={community.userRole === 'admin' ? 'primary' : 'default'}
            size="small"
            variant={community.userRole === 'admin' ? 'filled' : 'outlined'}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {community.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {community.tags && community.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" />
          ))}
        </Box>

        <Typography variant="body2">
          <strong>{community.memberCount || 0}</strong> members
        </Typography>
      </CardContent>

      <Divider />

      <CardActions onClick={(e) => e.stopPropagation()}>
        <Button
          size="small"
          startIcon={<GroupIcon />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/communities/${community.communityId}/members`);
          }}
        >
          Members
        </Button>
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
  );
};

export default CommunityCard;
