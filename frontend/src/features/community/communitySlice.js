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
  loading: false,
  error: null,
  success: false,
  announcementLoading: false,
  announcementError: null,
  announcementSuccess: false
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
  clearAnnouncementSuccess
} = communitySlice.actions;

export default communitySlice.reducer;
