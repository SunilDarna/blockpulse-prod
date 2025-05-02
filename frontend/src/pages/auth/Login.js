import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Alert,
} from '@mui/material';
import { Auth } from 'aws-amplify';
import { setUser, setError } from '../../features/auth/authSlice';

const validationSchema = Yup.object({
  username: Yup.string().required('Username or email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError(null);
      // Use Amplify Auth directly
      const user = await Auth.signIn(values.username, values.password);
      
      // Store user data from response
      dispatch(setUser({
        username: user.username,
        email: user.attributes?.email,
        firstName: user.attributes?.given_name,
        lastName: user.attributes?.family_name,
      }));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'UserNotFoundException') {
        setLoginError('Account not found. Please check your email or username.');
      } else if (error.code === 'NotAuthorizedException') {
        setLoginError('Incorrect password. Please try again.');
      } else if (error.code === 'UserNotConfirmedException') {
        setLoginError('Please verify your account first.');
        navigate('/confirm-registration', { state: { username: values.username } });
      } else {
        setLoginError('Login failed. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in to MyBlockPulse
        </Typography>
        
        {loginError && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }} data-testid="login-error">
            {loginError}
          </Alert>
        )}
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form noValidate sx={{ mt: 1, width: '100%' }}>
              <Field
                as={TextField}
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username or Email"
                name="username"
                autoComplete="username email"
                inputProps={{
                  inputMode: "email"
                }}
                data-testid="username-input"
                autoFocus
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />
              <Field
                as={TextField}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
                data-testid="login-button"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link component={RouterLink} to="/forgot-password" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link component={RouterLink} to="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default Login;
