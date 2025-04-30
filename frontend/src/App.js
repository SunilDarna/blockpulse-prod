import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Auth } from 'aws-amplify';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ConfirmRegistration from './pages/auth/ConfirmRegistration';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import CreateCommunity from './pages/CreateCommunity';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import CommunityMembers from './pages/CommunityMembers';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import SafeThemeProvider from './components/SafeThemeProvider';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Redux actions
import { setUser, clearUser } from './features/auth/authSlice';

// Define theme configuration - this will be passed to SafeThemeProvider
const themeConfig = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
  },
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        dispatch(setUser({
          username: user.username,
          email: user.attributes.email,
          firstName: user.attributes.given_name,
          lastName: user.attributes.family_name
        }));
      } catch (error) {
        dispatch(clearUser());
      }
    };

    checkAuthState();
  }, [dispatch]);

  // Create a safe theme instance
  const theme = React.useMemo(() => {
    try {
      return createTheme(themeConfig);
    } catch (error) {
      console.error('Failed to create theme:', error);
      // Return a minimal theme if creation fails
      return createTheme({
        palette: {
          primary: { main: '#1976d2' },
          secondary: { main: '#dc004e' }
        }
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <SafeThemeProvider theme={themeConfig}>
        <CssBaseline />
        <Router>
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
              <Route path="/confirm-registration" element={<ConfirmRegistration />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/" element={<Layout />}>
                <Route index element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="create-community" element={
                  <ProtectedRoute>
                    <CreateCommunity />
                  </ProtectedRoute>
                } />
                <Route path="communities" element={
                  <ProtectedRoute>
                    <Communities />
                  </ProtectedRoute>
                } />
                <Route path="communities/:communityId" element={
                  <ProtectedRoute>
                    <CommunityDetail />
                  </ProtectedRoute>
                } />
                <Route path="communities/:communityId/members" element={
                  <ProtectedRoute>
                    <CommunityMembers />
                  </ProtectedRoute>
                } />
                <Route path="communities/:communityId/announcements" element={
                  <ProtectedRoute>
                    <CommunityDetail />
                  </ProtectedRoute>
                } />
                <Route path="communities/:communityId/chat" element={
                  <ProtectedRoute>
                    <CommunityDetail />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </SafeThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
