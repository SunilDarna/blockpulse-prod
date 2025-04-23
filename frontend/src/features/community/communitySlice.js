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
      const response = await communityService.getUserCommunities();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch communities');
    }
  }
);

export const fetchCommunityById = createAsyncThunk(
  'community/fetchCommunityById',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await communityService.getCommunityById(communityId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch community');
    }
  }
);

const initialState = {
  communities: [],
  currentCommunity: null,
  loading: false,
  error: null,
  success: false
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
    resetCommunityState: () => initialState
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
        state.communities.push(action.payload);
        state.currentCommunity = action.payload;
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
      });
  }
});

export const { clearCommunityError, clearCommunitySuccess, resetCommunityState } = communitySlice.actions;

export default communitySlice.reducer;
