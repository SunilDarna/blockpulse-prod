import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { communityService } from '../../services/communityService';

// Async thunks
export const createCommunity = createAsyncThunk(
  'community/createCommunity',
  async (communityData, { rejectWithValue }) => {
    try {
      console.log('Creating community with data in thunk:', communityData);
      const response = await communityService.createCommunity(communityData);
      return response;
    } catch (error) {
      console.error('Error in createCommunity thunk:', error);
      return rejectWithValue(error.message || 'Failed to create community');
    }
  }
);

export const fetchUserCommunities = createAsyncThunk(
  'community/fetchUserCommunities',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching user communities...');
      const response = await communityService.getUserCommunities();
      console.log('User communities fetched successfully:', response);
      
      // Ensure we have an array even if the API returns null or undefined
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching user communities in thunk:', error);
      return rejectWithValue(error.message || 'Failed to fetch communities');
    }
  }
);

export const fetchCommunityById = createAsyncThunk(
  'community/fetchCommunityById',
  async (communityId, { rejectWithValue }) => {
    try {
      console.log(`Fetching community with ID: ${communityId}`);
      const response = await communityService.getCommunityById(communityId);
      console.log('Community fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching community ${communityId} in thunk:`, error);
      return rejectWithValue(error.message || 'Failed to fetch community');
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'community/createAnnouncement',
  async ({ communityId, announcementData }, { rejectWithValue }) => {
    try {
      const response = await communityService.createAnnouncement(communityId, announcementData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create announcement');
    }
  }
);

export const fetchCommunityAnnouncements = createAsyncThunk(
  'community/fetchCommunityAnnouncements',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await communityService.getCommunityAnnouncements(communityId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch announcements');
    }
  }
);

export const joinCommunity = createAsyncThunk(
  'community/joinCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      console.log(`Joining community with ID: ${communityId}`);
      const response = await communityService.joinCommunity(communityId);
      console.log('Community joined successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error joining community ${communityId} in thunk:`, error);
      return rejectWithValue(error.message || 'Failed to join community');
    }
  }
);

export const fetchPendingMembers = createAsyncThunk(
  'community/fetchPendingMembers',
  async (communityId, { rejectWithValue }) => {
    try {
      console.log(`Fetching pending members for community: ${communityId}`);
      const response = await communityService.getPendingMembers(communityId);
      console.log('Pending members fetched successfully:', response);
      return { communityId, pendingMembers: response };
    } catch (error) {
      console.error(`Error fetching pending members for ${communityId} in thunk:`, error);
      return rejectWithValue(error.message || 'Failed to fetch pending members');
    }
  }
);

export const approveMember = createAsyncThunk(
  'community/approveMember',
  async ({ communityId, userId }, { rejectWithValue }) => {
    try {
      console.log(`Approving member ${userId} for community: ${communityId}`);
      const response = await communityService.approveMember(communityId, userId);
      console.log('Member approved successfully:', response);
      return { communityId, userId, response };
    } catch (error) {
      console.error(`Error approving member ${userId} for ${communityId} in thunk:`, error);
      return rejectWithValue(error.message || 'Failed to approve member');
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'community/updateMemberRole',
  async ({ communityId, userId, role }, { rejectWithValue }) => {
    try {
      console.log(`Updating role for member ${userId} in community ${communityId} to ${role}`);
      const response = await communityService.updateMemberRole(communityId, userId, role);
      console.log('Member role updated successfully:', response);
      return { communityId, userId, role, response };
    } catch (error) {
      console.error(`Error updating role for member ${userId} in ${communityId} in thunk:`, error);
      return rejectWithValue(error.message || 'Failed to update member role');
    }
  }
);

export const deleteCommunity = createAsyncThunk(
  'community/deleteCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      console.log(`Deleting community with ID: ${communityId}`);
      await communityService.deleteCommunity(communityId);
      return communityId;
    } catch (error) {
      console.error(`Error deleting community ${communityId} in thunk:`, error);
      return rejectWithValue(error.message || 'Failed to delete community');
    }
  }
);

const initialState = {
  communities: [],
  currentCommunity: null,
  announcements: [],
  pendingMembers: {},
  loading: false,
  error: null,
  success: false,
  announcementLoading: false,
  announcementError: null,
  announcementSuccess: false,
  memberLoading: false,
  memberError: null,
  memberSuccess: false
};

export const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearCommunityError: (state) => {
      state.error = null;
    },
    clearCommunitySuccess: (state) => {
      state.success = false;
    },
    resetCommunityState: () => initialState,
    clearAnnouncementError: (state) => {
      state.announcementError = null;
    },
    clearAnnouncementSuccess: (state) => {
      state.announcementSuccess = false;
    },
    clearMemberError: (state) => {
      state.memberError = null;
    },
    clearMemberSuccess: (state) => {
      state.memberSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create community
      .addCase(createCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we're adding the complete community object to the communities array
        const newCommunity = {
          ...action.payload,
          userRole: 'admin', // Creator is always admin
          status: 'active'
        };
        state.communities.push(newCommunity);
        state.currentCommunity = newCommunity;
        state.success = true;
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user communities
      .addCase(fetchUserCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
        // Clear any previous errors
        state.error = null;
      })
      .addCase(fetchUserCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch community by ID
      .addCase(fetchCommunityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunityById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCommunity = action.payload;
      })
      .addCase(fetchCommunityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create announcement
      .addCase(createAnnouncement.pending, (state) => {
        state.announcementLoading = true;
        state.announcementError = null;
        state.announcementSuccess = false;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcementLoading = false;
        state.announcements.unshift(action.payload); // Add to beginning of array
        state.announcementSuccess = true;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.announcementLoading = false;
        state.announcementError = action.payload;
      })
      
      // Fetch community announcements
      .addCase(fetchCommunityAnnouncements.pending, (state) => {
        state.announcementLoading = true;
        state.announcementError = null;
      })
      .addCase(fetchCommunityAnnouncements.fulfilled, (state, action) => {
        state.announcementLoading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchCommunityAnnouncements.rejected, (state, action) => {
        state.announcementLoading = false;
        state.announcementError = action.payload;
      })
      
      // Join community
      .addCase(joinCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.loading = false;
        // Update the community in the communities array if it exists
        const communityIndex = state.communities.findIndex(
          c => c.communityId === action.payload.communityId
        );
        if (communityIndex >= 0) {
          state.communities[communityIndex] = {
            ...state.communities[communityIndex],
            ...action.payload,
            userRole: action.payload.userRole || 'member'
          };
        } else {
          // Add the community to the array if it doesn't exist
          state.communities.push({
            ...action.payload,
            userRole: action.payload.userRole || 'member'
          });
        }
        // Update current community if it matches
        if (state.currentCommunity && state.currentCommunity.communityId === action.payload.communityId) {
          state.currentCommunity = {
            ...state.currentCommunity,
            ...action.payload,
            userRole: action.payload.userRole || 'member'
          };
        }
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch pending members
      .addCase(fetchPendingMembers.pending, (state) => {
        state.memberLoading = true;
        state.memberError = null;
      })
      .addCase(fetchPendingMembers.fulfilled, (state, action) => {
        state.memberLoading = false;
        state.pendingMembers[action.payload.communityId] = action.payload.pendingMembers;
      })
      .addCase(fetchPendingMembers.rejected, (state, action) => {
        state.memberLoading = false;
        state.memberError = action.payload;
      })
      
      // Approve member
      .addCase(approveMember.pending, (state) => {
        state.memberLoading = true;
        state.memberError = null;
        state.memberSuccess = false;
      })
      .addCase(approveMember.fulfilled, (state, action) => {
        state.memberLoading = false;
        state.memberSuccess = true;
        
        // Remove the approved member from pending members
        if (state.pendingMembers[action.payload.communityId]) {
          state.pendingMembers[action.payload.communityId] = state.pendingMembers[action.payload.communityId]
            .filter(member => member.userId !== action.payload.userId);
        }
        
        // Update member count in the community
        const communityIndex = state.communities.findIndex(
          c => c.communityId === action.payload.communityId
        );
        if (communityIndex >= 0) {
          state.communities[communityIndex].memberCount = 
            (state.communities[communityIndex].memberCount || 0) + 1;
        }
        
        // Update current community if it matches
        if (state.currentCommunity && state.currentCommunity.communityId === action.payload.communityId) {
          state.currentCommunity.memberCount = (state.currentCommunity.memberCount || 0) + 1;
        }
      })
      .addCase(approveMember.rejected, (state, action) => {
        state.memberLoading = false;
        state.memberError = action.payload;
      })
      
      // Update member role
      .addCase(updateMemberRole.pending, (state) => {
        state.memberLoading = true;
        state.memberError = null;
        state.memberSuccess = false;
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.memberLoading = false;
        state.memberSuccess = true;
        
        // If the current user's role was updated in the current community
        if (state.currentCommunity && 
            state.currentCommunity.communityId === action.payload.communityId && 
            action.payload.response.isCurrentUser) {
          state.currentCommunity.userRole = action.payload.role;
          
          // Also update in communities array
          const communityIndex = state.communities.findIndex(
            c => c.communityId === action.payload.communityId
          );
          if (communityIndex >= 0) {
            state.communities[communityIndex].userRole = action.payload.role;
          }
        }
      })
      .addCase(updateMemberRole.rejected, (state, action) => {
        state.memberLoading = false;
        state.memberError = action.payload;
      })
      
      // Delete community
      .addCase(deleteCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = state.communities.filter(
          community => community.communityId !== action.payload
        );
        if (state.currentCommunity && state.currentCommunity.communityId === action.payload) {
          state.currentCommunity = null;
        }
        // Clean up any pending members data
        if (state.pendingMembers[action.payload]) {
          delete state.pendingMembers[action.payload];
        }
      })
      .addCase(deleteCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearCommunityError, 
  clearCommunitySuccess, 
  resetCommunityState,
  clearAnnouncementError,
  clearAnnouncementSuccess,
  clearMemberError,
  clearMemberSuccess
} = communitySlice.actions;

export default communitySlice.reducer;
