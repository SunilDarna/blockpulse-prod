import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import communityReducer from './features/community/communitySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    community: communityReducer,
  },
});
